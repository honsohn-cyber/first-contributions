"""Render-Kern fuer botanische Lehrtafel-Illustrationen.

Bietet schattierte Grundformen (Blatt, Bluetenblatt, Kugel, Stiel) mit
Farbverlauf, feiner Stippel-Textur und duennen Konturlinien.
"""
import math
import os

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

S = 3                                # Supersampling
W, H = 1500, 640
CW, CH = W * S, H * S

PAPER = (247, 243, 231)
INK = (44, 54, 42)                   # Konturfarbe (dunkles Graugruen)
OUTDIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "img")

_rng = np.random.default_rng(7)


# ------------------------------------------------------------ Hilfsfunktionen

def sc(v):
    return v * S


def _bbox(pts, pad):
    xs = [p[0] for p in pts]
    ys = [p[1] for p in pts]
    x0 = max(0, int(min(xs)) - pad)
    y0 = max(0, int(min(ys)) - pad)
    x1 = min(CW, int(max(xs)) + pad)
    y1 = min(CH, int(max(ys)) + pad)
    return x0, y0, max(x1, x0 + 2), max(y1, y0 + 2)


def _grain(shape, amount, seed_scale=1.0):
    """Feinkoernige multiplikative Textur (Stichel-/Stippel-Anmutung)."""
    h, w = shape
    fine = _rng.normal(0.0, 1.0, (h, w))
    coarse = _rng.normal(0.0, 1.0, (max(1, h // 6), max(1, w // 6)))
    coarse = np.asarray(
        Image.fromarray(((coarse * 40) + 128).clip(0, 255).astype(np.uint8)).resize(
            (w, h), Image.BILINEAR), dtype=np.float32)
    coarse = (coarse - 128.0) / 40.0
    return 1.0 + amount * (0.55 * fine + 0.85 * coarse * seed_scale)


def shade_polygon(im, pts, c_light, c_dark, angle, texture=0.05, cross=True):
    """Fuellt ein Polygon mit einem gerichteten Farbverlauf plus Textur."""
    x0, y0, x1, y1 = _bbox(pts, 2)
    w, h = x1 - x0, y1 - y0
    if w < 2 or h < 2:
        return
    mask = Image.new("L", (w, h), 0)
    ImageDraw.Draw(mask).polygon([(p[0] - x0, p[1] - y0) for p in pts], fill=255)

    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    d = xx * math.cos(angle) + yy * math.sin(angle)
    d -= d.min()
    rng = d.max() if d.max() > 0 else 1.0
    t = d / rng
    if cross:                       # hell in der Mitte, dunkel an den Raendern
        t = 1.0 - np.abs(2.0 * t - 1.0) ** 1.25
    t = t[..., None]

    c0 = np.array(c_dark, dtype=np.float32)
    c1 = np.array(c_light, dtype=np.float32)
    arr = c0 + (c1 - c0) * t
    if texture:
        arr *= _grain((h, w), texture)[..., None]
    arr = arr.clip(0, 255).astype(np.uint8)
    im.paste(Image.fromarray(arr), (x0, y0), mask)


def shade_sphere(im, cx, cy, r, c_light, c_dark, ry=None, texture=0.04,
                 light_dir=(-0.45, -0.55)):
    """Kugelige Form (Frucht, Beere) mit radialem Verlauf und Glanzpunkt."""
    ry = ry if ry else r
    x0, y0 = max(0, int(cx - r) - 2), max(0, int(cy - ry) - 2)
    x1, y1 = min(CW, int(cx + r) + 2), min(CH, int(cy + ry) + 2)
    w, h = x1 - x0, y1 - y0
    if w < 2 or h < 2:
        return
    mask = Image.new("L", (w, h), 0)
    ImageDraw.Draw(mask).ellipse([cx - r - x0, cy - ry - y0, cx + r - x0, cy + ry - y0], fill=255)

    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    nx = (xx - (cx - x0)) / max(r, 1)
    ny = (yy - (cy - y0)) / max(ry, 1)
    lx, ly = light_dir
    dist = np.sqrt((nx - lx) ** 2 + (ny - ly) ** 2) / 1.9
    t = (1.0 - dist).clip(0, 1) ** 1.15
    t = t[..., None]

    c0 = np.array(c_dark, dtype=np.float32)
    c1 = np.array(c_light, dtype=np.float32)
    arr = c0 + (c1 - c0) * t
    if texture:
        arr *= _grain((h, w), texture)[..., None]
    arr = arr.clip(0, 255).astype(np.uint8)
    im.paste(Image.fromarray(arr), (x0, y0), mask)


def outline(d, pts, color=INK, lw=None, close=True):
    lw = lw if lw else max(1, int(S * 0.9))
    p = list(pts) + ([pts[0]] if close else [])
    d.line(p, fill=color, width=lw, joint="curve")


# ------------------------------------------------------------ Grundformen

def leaf_pts(x, y, length, width, angle, curve=0.0, serrate=0, taper=0.9, n=56):
    a_side, b_side = [], []
    for i in range(n + 1):
        t = i / n
        a = angle + curve * t * t
        dd = t * length
        px = x + dd * math.cos(a)
        py = y + dd * math.sin(a)
        w = width * (math.sin(math.pi * t) ** taper) / 2
        if serrate:
            w *= 1 + 0.11 * math.sin(t * serrate * math.pi * 2)
        nx = math.cos(a + math.pi / 2) * w
        ny = math.sin(a + math.pi / 2) * w
        a_side.append((px + nx, py + ny))
        b_side.append((px - nx, py - ny))
    return a_side + b_side[::-1]


def midrib(x, y, length, angle, curve, n=24):
    out = []
    for i in range(n + 1):
        t = i / n
        a = angle + curve * t * t
        dd = t * length
        out.append((x + dd * math.cos(a), y + dd * math.sin(a)))
    return out


def leaf(im, d, x, y, length, width, angle, light, dark, curve=0.0, serrate=0,
         taper=0.9, veins=True, lw=None, ink=INK, texture=0.05):
    pts = leaf_pts(x, y, length, width, angle, curve, serrate, taper)
    shade_polygon(im, pts, light, dark, angle + math.pi / 2, texture=texture)
    outline(d, pts, ink, lw)
    if veins:
        rib = midrib(x, y, length, angle, curve)
        d.line(rib, fill=ink, width=max(1, int(S * 0.8)), joint="curve")
        vein_col = tuple(int(c * 0.72 + i * 0.28) for c, i in zip(dark, ink))
        for k in range(1, 8):
            t = k / 8.5
            a = angle + curve * t * t
            dd = t * length
            px, py = x + dd * math.cos(a), y + dd * math.sin(a)
            wv = width * (math.sin(math.pi * t) ** taper) / 2 * 0.78
            for sgn in (1, -1):
                ang = a + sgn * (0.95 + 0.25 * t)
                ex, ey = px + wv * math.cos(ang), py + wv * math.sin(ang)
                mx = (px + ex) / 2 + wv * 0.12 * math.cos(a)
                my = (py + ey) / 2 + wv * 0.12 * math.sin(a)
                d.line([(px, py), (mx, my), (ex, ey)], fill=vein_col,
                       width=max(1, int(S * 0.55)), joint="curve")


def petal(im, d, cx, cy, length, width, angle, light, dark, taper=0.75,
          lw=None, ink=INK, veins=False, texture=0.04):
    pts = leaf_pts(cx, cy, length, width, angle, 0, 0, taper)
    shade_polygon(im, pts, light, dark, angle + math.pi / 2, texture=texture)
    outline(d, pts, ink, lw)
    if veins:
        rib = midrib(cx, cy, length * 0.92, angle, 0)
        d.line(rib, fill=tuple(int(c * 0.8) for c in dark), width=max(1, int(S * 0.5)))


def sphere(im, d, cx, cy, r, light, dark, ry=None, ink=INK, lw=None, texture=0.04):
    ry = ry if ry else r
    shade_sphere(im, cx, cy, r, light, dark, ry=ry, texture=texture)
    d.ellipse([cx - r, cy - ry, cx + r, cy + ry], outline=ink,
              width=lw if lw else max(1, int(S * 0.9)))


def stem(im, d, pts, width, light, dark, ink=INK):
    """Stiel mit Rundung: dunkler Grundstrich plus schmaler Lichtkante."""
    d.line(pts, fill=ink, width=int(width) + max(1, int(S * 0.7)), joint="curve")
    d.line(pts, fill=dark, width=int(width), joint="curve")
    hi = [(px - width * 0.18, py - width * 0.2) for px, py in pts]
    d.line(hi, fill=light, width=max(1, int(width * 0.34)), joint="curve")


def curve_pts(p0, p1, p2, n=46):
    out = []
    for i in range(n + 1):
        t = i / n
        x = (1 - t) ** 2 * p0[0] + 2 * (1 - t) * t * p1[0] + t ** 2 * p2[0]
        y = (1 - t) ** 2 * p0[1] + 2 * (1 - t) * t * p1[1] + t ** 2 * p2[1]
        out.append((x, y))
    return out


# ------------------------------------------------------------ Blatt / Papier

def new_plate():
    """Cremefarbenes Papier mit Faserkorn und leichter Vignette."""
    base = np.zeros((CH, CW, 3), dtype=np.float32)
    base[...] = np.array(PAPER, dtype=np.float32)
    small = _rng.normal(0.0, 1.0, (CH // 8, CW // 8))
    small = np.asarray(
        Image.fromarray(((small * 30) + 128).clip(0, 255).astype(np.uint8)).resize(
            (CW, CH), Image.BILINEAR), dtype=np.float32)
    base *= (1.0 + 0.016 * (small - 128.0) / 30.0)[..., None]
    base *= _grain((CH, CW), 0.010)[..., None]

    yy, xx = np.mgrid[0:CH, 0:CW].astype(np.float32)
    vx = (xx / CW - 0.5) * 2
    vy = (yy / CH - 0.5) * 2
    vig = 1.0 - 0.055 * (vx ** 2 + vy ** 2)
    base *= vig[..., None]

    im = Image.fromarray(base.clip(0, 255).astype(np.uint8))
    return im, ImageDraw.Draw(im)


def soft_shadow(im, pts, offset=(9, 13), blur=14, strength=0.20):
    """Weicher Schlagschatten unter einer Form."""
    x0, y0, x1, y1 = _bbox(pts, blur * 3 + max(offset))
    w, h = x1 - x0, y1 - y0
    if w < 4 or h < 4:
        return
    m = Image.new("L", (w, h), 0)
    ImageDraw.Draw(m).polygon(
        [(p[0] - x0 + offset[0], p[1] - y0 + offset[1]) for p in pts], fill=255)
    m = m.filter(ImageFilter.GaussianBlur(blur))
    m = m.point(lambda v: int(v * strength))
    dark = Image.new("RGB", (w, h), (96, 92, 72))
    im.paste(dark, (x0, y0), m)


def finish(im, name):
    im = im.filter(ImageFilter.SMOOTH)
    im = im.resize((W, H), Image.LANCZOS)
    os.makedirs(OUTDIR, exist_ok=True)
    im.save(os.path.join(OUTDIR, name + ".png"), "PNG", optimize=True)
