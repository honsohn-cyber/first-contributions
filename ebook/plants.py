"""Botanische Lehrtafel-Illustrationen fuer die 18 aetherischen Oele."""
import math
import random

from PIL import ImageDraw

from render import (INK, curve_pts, finish, leaf, leaf_pts, midrib, new_plate,
                    petal, sc, shade_polygon, soft_shadow, sphere, stem)

# --------------------------------------------------------------- Farbpaletten
LEAF_L, LEAF_D = (152, 178, 126), (54, 84, 56)
LEAF_L2, LEAF_D2 = (176, 196, 148), (72, 104, 70)
SAGE_L, SAGE_D = (196, 208, 186), (112, 138, 116)
STEM_L, STEM_D = (140, 166, 118), (66, 94, 62)
WOOD_L, WOOD_D = (188, 152, 106), (104, 74, 46)
INK_W = (66, 50, 34)


# ------------------------------------------------------------------- Lavendel
def lavendel():
    im, d = new_plate()
    rnd = random.Random(1)
    base = (sc(750), sc(590))
    for bx, h, sw in [(-215, 400, 8), (-95, 455, 9), (35, 470, 9), (165, 440, 9), (285, 385, 8)]:
        top = (base[0] + sc(bx), base[1] - sc(h))
        pts = curve_pts(base, (base[0] + sc(bx) * 0.35, base[1] - sc(h) * 0.55), top)
        stem(im, d, pts, sc(sw), STEM_L, STEM_D)
        n = 10
        for k in range(n):
            t = k / (n - 1)
            px = top[0] + sc(rnd.randint(-4, 4))
            py = top[1] + t * sc(165)
            rw = sc(15) * (1 - 0.42 * t) + sc(5)
            rh = sc(22) * (1 - 0.30 * t)
            lt = (176 + int(26 * t), 150 + int(24 * t), 214 + int(18 * t))
            dk = (104 - int(10 * t), 78, 148)
            # Kelch
            shade_polygon(im, leaf_pts(px, py + rh * 0.9, rh * 2.0, rw * 1.7, -math.pi / 2,
                                       0, 0, 0.8), (128, 142, 110), (72, 92, 66),
                          0.0, texture=0.05)
            for sgn in (0, 1, -1):
                ox = sgn * rw * 1.25
                if sgn:
                    rw2, rh2 = rw * 0.72, rh * 0.62
                else:
                    rw2, rh2 = rw, rh
                sphere(im, d, px + ox, py, rw2, lt, dk, ry=rh2,
                       ink=(70, 52, 104), lw=max(1, int(sc(0.7))))
        # Knospenspitze
        sphere(im, d, top[0], top[1] - sc(12), sc(9), (188, 166, 220), (110, 84, 152),
               ry=sc(14), ink=(70, 52, 104), lw=max(1, int(sc(0.7))))
    for ang, ln in [(-2.62, 285), (-0.55, 285), (-2.25, 235), (-0.92, 235),
                    (-1.95, 195), (-1.22, 195)]:
        leaf(im, d, base[0], base[1], sc(ln), sc(30), ang, SAGE_L, SAGE_D,
             curve=0.24, veins=False, taper=1.45, ink=(92, 112, 92))
    finish(im, "lavendel")


# --------------------------------------------------------------- Pfefferminze
def pfefferminze():
    im, d = new_plate()
    base, top = (sc(750), sc(600)), (sc(750), sc(120))
    spine = curve_pts(base, (sc(772), sc(360)), top)
    stem(im, d, spine, sc(12), STEM_L, STEM_D)
    for t, ln, wd, lift in [(0.14, 300, 152, 0.34), (0.34, 268, 134, 0.36),
                            (0.54, 218, 110, 0.40), (0.72, 168, 86, 0.44),
                            (0.86, 120, 60, 0.48)]:
        px, py = spine[int(len(spine) * t)]
        for sgn in (1, -1):
            ang = (0 if sgn > 0 else math.pi) - sgn * lift
            leaf(im, d, px, py, sc(ln), sc(wd), ang,
                 LEAF_L if t < 0.6 else LEAF_L2, LEAF_D,
                 curve=-sgn * 0.20, serrate=10, texture=0.06)
    # Bluetenquirle
    for j, t in enumerate([0.90, 0.955, 1.0]):
        idx = min(int(len(spine) * t), len(spine) - 1)
        px, py = spine[idx]
        rad = sc(46) - j * sc(8)
        for k in range(14):
            a = k * math.pi * 2 / 14
            fx = px + rad * math.cos(a)
            fy = py + rad * 0.55 * math.sin(a)
            sphere(im, d, fx, fy, sc(11), (226, 220, 240), (150, 138, 182),
                   ink=(118, 106, 150), lw=max(1, int(sc(0.7))))
    finish(im, "pfefferminze")


# -------------------------------------------------------------------- Teebaum
def teebaum():
    im, d = new_plate()
    rnd = random.Random(7)
    base = (sc(750), sc(605))
    for bx, by, ang in [(-350, -300, -2.05), (350, -295, -1.10), (0, -450, -1.57),
                        (-185, -400, -1.82), (195, -400, -1.32)]:
        tip = (base[0] + sc(bx), base[1] + sc(by))
        pts = curve_pts(base, ((base[0] + tip[0]) / 2, base[1] + sc(by) * 0.5), tip)
        stem(im, d, pts, sc(7), (150, 130, 96), (104, 84, 58))
        for i in range(5, len(pts) - 2, 3):
            px, py = pts[i]
            for sgn in (1, -1):
                leaf(im, d, px, py, sc(rnd.randint(62, 94)), sc(13),
                     ang + sgn * 0.82 + rnd.uniform(-.18, .18), LEAF_L2, LEAF_D,
                     veins=False, taper=1.6, ink=(72, 96, 70), texture=0.04)
        # Flaschenbuersten-Bluete
        for k in range(46):
            a = rnd.uniform(0, math.pi * 2)
            rr = sc(rnd.randint(12, 62))
            px, py = tip[0] + rr * math.cos(a), tip[1] + rr * math.sin(a) * 0.82
            d.line([(tip[0], tip[1]), (px, py)], fill=(228, 228, 216), width=max(1, int(sc(1.1))))
            sphere(im, d, px, py, sc(4.5), (253, 253, 248), (198, 200, 184),
                   ink=(176, 178, 160), lw=1)
        sphere(im, d, tip[0], tip[1], sc(14), (226, 212, 160), (150, 132, 84),
               ink=(112, 98, 60))
    finish(im, "teebaum")


# ----------------------------------------------------------------- Eukalyptus
def eukalyptus():
    im, d = new_plate()
    base, tip = (sc(210), sc(500)), (sc(1310), sc(175))
    spine = curve_pts(base, (sc(740), sc(500)), tip)
    stem(im, d, spine, sc(11), (168, 176, 148), (108, 122, 104))
    for i, t in enumerate([0.08, 0.20, 0.32, 0.44, 0.56, 0.68, 0.80, 0.91]):
        idx = int(len(spine) * t)
        px, py = spine[idx]
        nxt = spine[min(idx + 3, len(spine) - 1)]
        ang = math.atan2(nxt[1] - py, nxt[0] - px)
        size = sc(126) - i * sc(8)
        for sgn in (1, -1):
            a = ang + sgn * 1.32
            lt = (198, 210, 190) if i % 2 == 0 else (184, 200, 180)
            dk = (108, 134, 116)
            d.line([(px, py), (px + size * 0.22 * math.cos(a), py + size * 0.22 * math.sin(a))],
                   fill=(104, 126, 108), width=max(1, int(sc(1.2))))
            leaf(im, d, px + size * 0.14 * math.cos(a), py + size * 0.14 * math.sin(a),
                 size, size * 0.94, a, lt, dk, taper=0.42, veins=True,
                 ink=(92, 116, 100), texture=0.05)
    for t, off in [(0.28, 62), (0.50, -66), (0.70, 58)]:
        px, py = spine[int(len(spine) * t)]
        cx, cy = px + sc(off) * 0.35, py + sc(off)
        sphere(im, d, cx, cy, sc(20), (194, 182, 148), (118, 108, 78), ry=sc(17),
               ink=(96, 88, 62))
        for k in range(4):
            a = -math.pi / 2 + (k - 1.5) * 0.5
            d.line([(cx, cy - sc(14)), (cx + sc(13) * math.cos(a), cy - sc(14) + sc(13) * math.sin(a))],
                   fill=(112, 102, 74), width=max(1, int(sc(0.8))))
    finish(im, "eukalyptus")


# --------------------------------------------------------------- Zitrusfamilie
def _citrus(name, f_light, f_dark, ink_f, leaf_l, leaf_d, blossom=True):
    im, d = new_plate()
    rnd = random.Random(3)
    cx, cy, r = sc(720), sc(330), sc(178)
    br = curve_pts((sc(1240), sc(560)), (sc(1030), sc(280)), (sc(845), sc(205)))
    stem(im, d, br, sc(13), (162, 132, 92), (100, 74, 46))
    for t, ang, ln in [(0.28, -2.30, 240), (0.52, -1.05, 226), (0.76, -2.55, 208)]:
        px, py = br[int(len(br) * t)]
        leaf(im, d, px, py, sc(ln), sc(108), ang, leaf_l, leaf_d, curve=0.24, texture=0.05)

    soft_shadow(im, [(cx + r * math.cos(a), cy + r * math.sin(a)) for a in
                     [i * math.pi / 12 for i in range(24)]], offset=(sc(5), sc(9)),
                blur=sc(9), strength=0.16)
    sphere(im, d, cx, cy, r, f_light, f_dark, ry=r * 0.97, ink=ink_f, texture=0.05)
    # Schalenporen
    for _ in range(600):
        a = rnd.uniform(0, math.pi * 2)
        rr = r * math.sqrt(rnd.uniform(0, 1)) * 0.95
        px, py = cx + rr * math.cos(a), cy + rr * 0.97 * math.sin(a)
        sh = rnd.choice([0.86, 0.9, 1.12])
        col = tuple(min(255, max(0, int(c * sh))) for c in f_dark)
        rad = sc(rnd.uniform(1.4, 3.0))
        d.ellipse([px - rad, py - rad, px + rad, py + rad], fill=col)
    sphere(im, d, cx, cy - r * 0.96, sc(19), (150, 176, 116), (86, 112, 68), ry=sc(13),
           ink=(64, 88, 56))
    leaf(im, d, cx + sc(12), cy - r * 0.94, sc(162), sc(74), -0.42, leaf_l, leaf_d,
         curve=0.2)

    # Aufgeschnittene Haelfte
    hx, hy, hr = sc(292), sc(430), sc(126)
    soft_shadow(im, [(hx + hr * math.cos(a), hy + hr * math.sin(a)) for a in
                     [i * math.pi / 12 for i in range(24)]], offset=(sc(5), sc(9)),
                blur=sc(9), strength=0.16)
    sphere(im, d, hx, hy, hr, (250, 247, 234), (196, 190, 168), ink=ink_f)
    inner = tuple(min(255, c + 16) for c in f_light)
    sphere(im, d, hx, hy, hr * 0.87, inner, f_dark, ink=tuple(min(255, c + 24) for c in ink_f))
    for k in range(9):
        a0 = k * math.pi * 2 / 9 + 0.13
        a1 = (k + 1) * math.pi * 2 / 9 - 0.13
        pts = [(hx, hy)]
        for i in range(13):
            a = a0 + (a1 - a0) * i / 12
            pts.append((hx + hr * 0.80 * math.cos(a), hy + hr * 0.80 * math.sin(a)))
        shade_polygon(im, pts, f_light, f_dark, (a0 + a1) / 2, texture=0.07, cross=False)
        d.line(pts + [pts[0]], fill=(252, 250, 240), width=max(1, int(sc(1.6))), joint="curve")
    sphere(im, d, hx, hy, hr * 0.10, (250, 248, 238), (206, 200, 180), ink=(190, 184, 162), lw=1)

    if blossom:
        bx, by = sc(1075), sc(180)
        for k in range(5):
            a = k * math.pi * 2 / 5 - math.pi / 2
            petal(im, d, bx, by, sc(76), sc(54), a, (253, 252, 246), (206, 202, 186),
                  ink=(178, 174, 156), veins=True)
        sphere(im, d, bx, by, sc(19), (244, 220, 130), (176, 148, 66), ink=(140, 118, 52))
        for k in range(9):
            a = k * math.pi * 2 / 9
            ex, ey = bx + sc(30) * math.cos(a), by + sc(30) * math.sin(a)
            d.line([(bx, by), (ex, ey)], fill=(196, 170, 92), width=max(1, int(sc(0.7))))
            d.ellipse([ex - sc(4), ey - sc(4), ex + sc(4), ey + sc(4)], fill=(226, 198, 106))
    finish(im, name)


def zitrone():
    _citrus("zitrone", (248, 224, 96), (198, 162, 30), (150, 118, 20), (88, 124, 72), (40, 70, 44))


def orange():
    _citrus("orange", (246, 168, 62), (198, 106, 20), (150, 78, 14), (76, 110, 64), (36, 66, 42))


def bergamotte():
    _citrus("bergamotte", (226, 220, 108), (162, 158, 44), (118, 116, 30), (74, 108, 66), (36, 66, 42))


# -------------------------------------------------------------------- Rosmarin
def rosmarin():
    im, d = new_plate()
    rnd = random.Random(11)
    base = (sc(750), sc(608))
    for bx, h, tilt in [(-300, 460, -0.32), (-150, 400, -0.17), (0, 510, 0.0),
                        (155, 405, 0.18), (300, 455, 0.33)]:
        tip = (base[0] + sc(bx), base[1] - sc(h))
        pts = curve_pts(base, (base[0] + sc(bx) * 0.32, base[1] - sc(h) * 0.55), tip)
        stem(im, d, pts, sc(9), (156, 132, 96), (96, 74, 48))
        for i in range(3, len(pts) - 1, 2):
            px, py = pts[i]
            for sgn in (1, -1):
                ang = -math.pi / 2 + tilt + sgn * (0.92 + rnd.uniform(-0.12, 0.12))
                ln = sc(rnd.randint(56, 84))
                leaf(im, d, px, py, ln, sc(15), ang, (146, 170, 122), (56, 86, 58),
                     veins=False, taper=1.7, ink=(58, 82, 56), texture=0.05)
        for i in range(7, len(pts) - 2, 8):
            px, py = pts[i]
            fx = px + sc(rnd.randint(-48, 48))
            fy = py + sc(rnd.randint(-12, 12))
            for k in range(4):
                a = k * math.pi * 2 / 4 + 0.5
                petal(im, d, fx, fy, sc(22), sc(15), a, (190, 202, 234), (120, 138, 186),
                      ink=(96, 112, 158), lw=1)
            sphere(im, d, fx, fy, sc(6), (222, 228, 244), (150, 162, 198), ink=(110, 124, 166), lw=1)
    finish(im, "rosmarin")


# ---------------------------------------------------------------- Zitronengras
def zitronengras():
    im, d = new_plate()
    base = (sc(750), sc(612))
    blades = [(-580, 130, 0), (-425, 65, 0), (-250, 32, 0), (-95, 22, 0),
              (95, 26, 0), (250, 38, 0), (425, 70, 0), (580, 135, 0),
              (-340, 220, 0), (345, 225, 0), (-40, 45, 0), (45, 48, 0)]
    for bx, by, _ in blades:
        tip = (base[0] + sc(bx), sc(by) + sc(30))
        pts = curve_pts(base, (base[0] + sc(bx) * 0.22, base[1] - sc(320)), tip)
        a_side, b_side = [], []
        for i, (px, py) in enumerate(pts):
            t = i / (len(pts) - 1)
            w = sc(25) * (1 - t) ** 0.65 + sc(2.5)
            a_side.append((px + w, py))
            b_side.append((px - w, py))
        poly = a_side + b_side[::-1]
        far = abs(bx) > 350
        shade_polygon(im, poly, (172, 194, 138) if not far else (188, 204, 158),
                      (62, 94, 62) if not far else (92, 122, 84),
                      0.0, texture=0.05)
        d.line(poly + [poly[0]], fill=(58, 86, 58), width=max(1, int(sc(0.8))), joint="curve")
        d.line(pts, fill=(88, 116, 82), width=max(1, int(sc(0.8))), joint="curve")
    for off, hgt in [(-62, 155), (0, 182), (62, 152)]:
        x = base[0] + sc(off)
        poly = [(x - sc(30), base[1] - sc(hgt)), (x + sc(30), base[1] - sc(hgt)),
                (x + sc(33), base[1] + sc(18)), (x - sc(33), base[1] + sc(18))]
        shade_polygon(im, poly, (238, 238, 214), (166, 172, 136), 0.0, texture=0.05)
        d.line(poly + [poly[0]], fill=(132, 138, 104), width=max(1, int(sc(1.0))), joint="curve")
        for k in range(4):
            yy = base[1] - sc(hgt) + sc(40) * (k + 1)
            d.line([(x - sc(30), yy), (x + sc(31), yy - sc(4))],
                   fill=(150, 156, 118), width=max(1, int(sc(0.8))))
    finish(im, "zitronengras")


# ---------------------------------------------------------------------- Ingwer
def ingwer():
    im, d = new_plate()
    rnd = random.Random(13)
    cy = sc(452)
    lobes = [(440, 6, 126, 74), (600, 30, 146, 88), (790, 10, 138, 82),
             (952, 36, 112, 68), (525, -104, 82, 56), (700, -122, 94, 60),
             (876, -112, 80, 54), (1075, 12, 82, 56)]
    ell = [(sc(440) + 126 * math.cos(a), cy + 74 * math.sin(a)) for a in
           [i * math.pi / 10 for i in range(20)]]
    soft_shadow(im, ell, offset=(sc(6), sc(11)), blur=sc(10), strength=0.14)
    for x, dy, rw, rh in lobes:
        sphere(im, d, sc(x), cy + sc(dy), sc(rw), (232, 204, 152), (146, 112, 66),
               ry=sc(rh), ink=(112, 84, 48), texture=0.06)
    for x, dy, rw, rh in lobes:
        x = sc(x)
        for k in range(4):
            yy = cy + sc(dy) - sc(rh) * 0.55 + sc(rh) * 0.34 * k
            d.arc([x - sc(rw) * 0.82, yy - sc(20), x + sc(rw) * 0.82, yy + sc(20)],
                  195, 345, fill=(160, 124, 74), width=max(1, int(sc(0.9))))
    for x, ln, ang in [(556, 300, -1.74), (760, 344, -1.54), (932, 292, -1.34)]:
        px = sc(x)
        pts = curve_pts((px, cy - sc(96)), (px + sc(18), cy - sc(240)),
                        (px + sc(38), cy - sc(96) - sc(ln)))
        stem(im, d, pts, sc(10), STEM_L, STEM_D)
        for t, sgn in [(0.42, 1), (0.60, -1), (0.78, 1), (0.92, -1)]:
            lx, ly = pts[int(len(pts) * t)]
            leaf(im, d, lx, ly, sc(180), sc(44), ang + sgn * 0.72, LEAF_L2, LEAF_D,
                 curve=sgn * 0.2, taper=1.25)
    finish(im, "ingwer")


# ----------------------------------------------------------------- Gewuerznelke
def nelke():
    im, d = new_plate()
    br = curve_pts((sc(150), sc(545)), (sc(540), sc(315)), (sc(915), sc(245)))
    stem(im, d, br, sc(14), (160, 128, 90), (98, 72, 44))
    for t, sgn in [(0.22, 1), (0.40, -1), (0.58, 1), (0.76, -1)]:
        px, py = br[int(len(br) * t)]
        leaf(im, d, px, py, sc(226), sc(94), (-0.98 if sgn > 0 else 0.72),
             (146, 172, 120), (48, 78, 52), curve=sgn * 0.22, texture=0.05)
    for x, y, ang in [(1000, 300, -0.38), (1120, 398, -0.18), (955, 470, 0.12),
                      (1175, 245, -0.52), (1082, 542, 0.06)]:
        x, y = sc(x), sc(y)
        ln = sc(148)
        ex, ey = x + ln * math.cos(ang), y + ln * math.sin(ang)
        shaft = leaf_pts(x, y, ln, sc(30), ang, 0, 0, 0.25)
        shade_polygon(im, shaft, (176, 126, 74), (104, 66, 34), ang + math.pi / 2, texture=0.06)
        d.line(shaft + [shaft[0]], fill=INK_W, width=max(1, int(sc(0.9))), joint="curve")
        for k in range(4):
            a = ang + math.pi + (k - 1.5) * 0.52
            petal(im, d, x, y, sc(50), sc(23), a, (186, 136, 82), (108, 70, 38),
                  ink=INK_W, lw=max(1, int(sc(0.8))))
        sphere(im, d, x, y, sc(23), (206, 160, 102), (118, 80, 44), ink=INK_W)
        d.line([(ex, ey), (ex - sc(10) * math.cos(ang), ey - sc(10) * math.sin(ang))],
               fill=(88, 56, 30), width=max(1, int(sc(1.4))))
    finish(im, "nelke")


# ------------------------------------------------------------------- Weihrauch
def weihrauch():
    im, d = new_plate()
    rnd = random.Random(23)
    br = curve_pts((sc(130), sc(285)), (sc(510), sc(165)), (sc(900), sc(240)))
    stem(im, d, br, sc(15), (178, 160, 126), (108, 92, 66))
    for t, sgn in [(0.18, 1), (0.34, -1), (0.50, 1), (0.66, -1), (0.82, 1)]:
        px, py = br[int(len(br) * t)]
        ang = -1.15 if sgn > 0 else 1.05
        rx = px + sc(160) * math.cos(ang)
        ry = py + sc(160) * math.sin(ang)
        d.line([(px, py), (rx, ry)], fill=(84, 108, 72), width=max(1, int(sc(1.6))))
        for k in range(1, 7):
            t2 = k / 6.4
            lx = px + (rx - px) * t2
            ly = py + (ry - py) * t2
            for s2 in (1, -1):
                leaf(im, d, lx, ly, sc(56 - 3 * k), sc(26 - k), ang + s2 * 0.98,
                     (162, 184, 134), (66, 96, 64), veins=False, ink=(62, 88, 60),
                     texture=0.04)
    # Harztraenen
    for x, y, r in [(505, 480, 50), (628, 512, 42), (752, 478, 56), (872, 518, 38),
                    (982, 470, 46), (700, 408, 32), (1088, 508, 34), (1180, 460, 28)]:
        x, y, r = sc(x), sc(y), sc(r)
        pts = [(x + r * math.cos(a), y + r * math.sin(a)) for a in
               [i * math.pi / 10 for i in range(20)]]
        soft_shadow(im, pts, offset=(sc(4), sc(8)), blur=sc(7), strength=0.16)
        sphere(im, d, x, y, r, (246, 228, 184), (176, 142, 88), ry=r * 1.06,
               ink=(140, 112, 66), texture=0.05)
        d.ellipse([x - r * 0.42, y - r * 0.72, x - r * 0.02, y - r * 0.26],
                  fill=(252, 242, 216))
    for t in (0.40, 0.64):
        px, py = br[int(len(br) * t)]
        pts = leaf_pts(px, py, sc(62), sc(30), math.pi / 2, 0, 0, 0.55)
        shade_polygon(im, pts, (240, 220, 174), (166, 134, 82), 0.0, texture=0.04)
        d.line(pts + [pts[0]], fill=(140, 112, 66), width=max(1, int(sc(0.8))), joint="curve")
    finish(im, "weihrauch")


# --------------------------------------------------------------------- Kamille
def kamille():
    im, d = new_plate()
    rnd = random.Random(29)
    base = (sc(750), sc(612))
    heads = [(415, 215, 94), (750, 158, 108), (1080, 228, 90), (578, 328, 72), (922, 334, 74)]
    for hx, hy, r in heads:
        hx, hy, r = sc(hx), sc(hy), sc(r)
        pts = curve_pts(base, ((base[0] + hx) / 2, base[1] - sc(170)), (hx, hy + r * 0.85))
        stem(im, d, pts, sc(8), STEM_L, STEM_D)
        for i in range(4, len(pts) - 3, 5):
            px, py = pts[i]
            for sgn in (1, -1):
                for k in range(4):
                    a = -1.35 + sgn * (0.62 + 0.24 * k)
                    ex, ey = px + sc(36) * math.cos(a), py + sc(36) * math.sin(a)
                    d.line([(px, py), (ex, ey)], fill=(104, 134, 96), width=max(1, int(sc(1.2))))
                    d.line([(ex, ey), (ex + sc(10) * math.cos(a - 0.4),
                                       ey + sc(10) * math.sin(a - 0.4))],
                           fill=(120, 148, 108), width=max(1, int(sc(0.8))))
    for hx, hy, r in heads:
        hx, hy, r = sc(hx), sc(hy), sc(r)
        n = 18
        for k in range(n):
            a = k * math.pi * 2 / n + rnd.uniform(-0.05, 0.05)
            petal(im, d, hx + r * 0.30 * math.cos(a), hy + r * 0.30 * math.sin(a),
                  r * 0.95, r * 0.42, a, (253, 252, 247), (198, 196, 178),
                  taper=0.62, ink=(168, 166, 146), lw=max(1, int(sc(0.8))), veins=True)
        sphere(im, d, hx, hy, r * 0.40, (250, 214, 96), (176, 132, 34),
               ry=r * 0.36, ink=(136, 102, 26), texture=0.07)
        for _ in range(30):
            a = rnd.uniform(0, math.pi * 2)
            rr = r * 0.38 * math.sqrt(rnd.uniform(0, 1)) * 0.85
            px, py = hx + rr * math.cos(a), hy + rr * 0.9 * math.sin(a)
            d.ellipse([px - sc(2.4), py - sc(2.4), px + sc(2.4), py + sc(2.4)],
                      fill=(198, 150, 40))
    finish(im, "kamille")


# ---------------------------------------------------------------- Ylang-Ylang
def ylang():
    im, d = new_plate()
    rnd = random.Random(31)
    br = curve_pts((sc(1310), sc(150)), (sc(950), sc(195)), (sc(600), sc(300)))
    stem(im, d, br, sc(14), (162, 132, 92), (98, 72, 44))
    for t, sgn in [(0.16, 1), (0.38, -1), (0.60, 1)]:
        px, py = br[int(len(br) * t)]
        leaf(im, d, px, py, sc(246), sc(102), (0.52 if sgn > 0 else -0.78),
             (144, 170, 118), (46, 76, 50), curve=-sgn * 0.2, texture=0.05)
    for cx, cy, scl in [(600, 300, 1.0), (890, 232, 0.70), (1120, 190, 0.54)]:
        cx, cy = sc(cx), sc(cy)
        for k in range(6):
            a = math.pi / 2 + (k - 2.5) * 0.40 + rnd.uniform(-0.05, 0.05)
            ln = sc(int(252 * scl)) + sc(rnd.randint(-18, 18))
            petal(im, d, cx, cy, ln, sc(int(42 * scl)), a, (244, 222, 132), (170, 138, 54),
                  taper=1.55, ink=(132, 106, 42), veins=True)
        for k in range(3):
            a = math.pi / 2 + (k - 1) * 0.78
            petal(im, d, cx, cy, sc(int(118 * scl)), sc(int(36 * scl)), a,
                  (234, 206, 108), (162, 130, 48), taper=1.3, ink=(126, 100, 40))
        sphere(im, d, cx, cy, sc(int(25 * scl)), (214, 182, 88), (132, 104, 40),
               ink=(104, 82, 32))
    finish(im, "ylang")


# --------------------------------------------------------------------- Geranie
def geranie():
    im, d = new_plate()
    rnd = random.Random(37)
    base = (sc(750), sc(612))

    def round_leaf(cx, cy, r):
        pts = []
        for i in range(160):
            a = i * math.pi * 2 / 160
            pts.append((cx + r * (1 + 0.12 * math.sin(a * 5)) * math.cos(a),
                        cy + r * 0.86 * (1 + 0.12 * math.sin(a * 5)) * math.sin(a)))
        soft_shadow(im, pts, offset=(sc(4), sc(8)), blur=sc(8), strength=0.13)
        shade_polygon(im, pts, (156, 182, 124), (62, 96, 64), -0.9, texture=0.06)
        d.line(pts + [pts[0]], fill=(52, 82, 54), width=max(1, int(sc(0.9))), joint="curve")
        for k in range(5):
            a = -math.pi / 2 + (k - 2) * 0.60
            ex, ey = cx + r * 0.80 * math.cos(a), cy + r * 0.70 * math.sin(a)
            d.line([(cx, cy), (ex, ey)], fill=(74, 106, 70), width=max(1, int(sc(1.1))))
            for j in range(1, 4):
                t = j / 4
                mx, my = cx + (ex - cx) * t, cy + (ey - cy) * t
                for s in (1, -1):
                    d.line([(mx, my), (mx + r * 0.16 * math.cos(a + s * 1.1),
                                       my + r * 0.16 * math.sin(a + s * 1.1))],
                           fill=(92, 122, 84), width=max(1, int(sc(0.6))))
        d.arc([cx - r * 0.58, cy - r * 0.52, cx + r * 0.58, cy + r * 0.52], 200, 340,
              fill=(96, 126, 86), width=max(1, int(sc(0.9))))

    for lx, ly, r in [(355, 412, 134), (1145, 412, 126), (562, 468, 102), (938, 472, 98)]:
        px, py = sc(lx), sc(ly)
        d.line([base, (px, py)], fill=(70, 100, 66), width=sc(10))
        d.line([base, (px, py)], fill=(126, 154, 108), width=sc(4))
        round_leaf(px, py, sc(r))
    for hx, hy in [(750, 172), (555, 258), (948, 252)]:
        hx, hy = sc(hx), sc(hy)
        pts = curve_pts(base, ((base[0] + hx) / 2, base[1] - sc(230)), (hx, hy + sc(60)))
        stem(im, d, pts, sc(8), STEM_L, STEM_D)
        for k in range(7):
            a = k * math.pi * 2 / 7
            fx, fy = hx + sc(50) * math.cos(a), hy + sc(44) * math.sin(a)
            for m in range(5):
                pa = m * math.pi * 2 / 5 + a
                petal(im, d, fx, fy, sc(38), sc(29), pa, (244, 174, 190), (192, 104, 132),
                      taper=0.62, ink=(158, 84, 110), lw=max(1, int(sc(0.7))))
            sphere(im, d, fx, fy, sc(8), (250, 232, 236), (200, 150, 170),
                   ink=(168, 108, 134), lw=1)
    finish(im, "geranie")


# ------------------------------------------------------------------- Wacholder
def wacholder():
    im, d = new_plate()
    rnd = random.Random(41)
    main = curve_pts((sc(160), sc(548)), (sc(700), sc(348)), (sc(1330), sc(225)))
    stem(im, d, main, sc(13), (158, 128, 92), (94, 70, 44))
    for i in range(4, len(main) - 2, 3):
        px, py = main[i]
        for sgn in (1, -1):
            for k in range(3):
                a = (-1.12 + 0.32 * k) * sgn if sgn > 0 else (1.12 - 0.32 * k)
                a += rnd.uniform(-0.10, 0.10)
                ln = sc(rnd.randint(58, 92))
                leaf(im, d, px, py, ln, sc(14), a, (150, 176, 132), (52, 84, 60),
                     veins=False, taper=1.75, ink=(48, 76, 56), texture=0.04)
    for t in (0.22, 0.34, 0.46, 0.58, 0.70, 0.82, 0.30, 0.54, 0.78):
        px, py = main[int(len(main) * t)]
        ox, oy = sc(rnd.randint(-46, 46)), sc(rnd.randint(-44, 44))
        r = sc(rnd.randint(24, 31))
        pts = [(px + ox + r * math.cos(a), py + oy + r * math.sin(a)) for a in
               [i * math.pi / 9 for i in range(18)]]
        soft_shadow(im, pts, offset=(sc(3), sc(6)), blur=sc(6), strength=0.15)
        sphere(im, d, px + ox, py + oy, r, (126, 136, 168), (34, 40, 62),
               ink=(28, 34, 52), texture=0.05)
        for k in range(3):
            a = k * math.pi * 2 / 3 + 0.5
            d.line([(px + ox, py + oy),
                    (px + ox + r * 0.48 * math.cos(a), py + oy + r * 0.48 * math.sin(a))],
                   fill=(46, 52, 76), width=max(1, int(sc(0.8))))
    finish(im, "wacholder")


# ------------------------------------------------------------ Muskatellersalbei
def muskatellersalbei():
    im, d = new_plate()
    base = (sc(750), sc(560))
    for ang, ln, wd in [(-2.74, 300, 148), (-0.40, 300, 148), (-2.32, 244, 122),
                        (-0.82, 244, 122)]:
        leaf(im, d, base[0], base[1], sc(ln), sc(wd), ang, (166, 184, 142), (76, 106, 74),
             curve=0.2, serrate=9, texture=0.07)
    spike = curve_pts(base, (sc(768), sc(340)), (sc(758), sc(105)))
    d.line(spike, fill=(96, 124, 88), width=sc(10), joint="curve")
    d.line([(px - sc(2), py) for px, py in spike], fill=(138, 164, 118),
           width=sc(4), joint="curve")
    for i in range(5, len(spike) - 1, 4):
        px, py = spike[i]
        t = i / len(spike)
        for sgn in (1, -1):
            petal(im, d, px, py, sc(int(116 - 56 * t)), sc(int(70 - 32 * t)),
                  (-0.42 if sgn > 0 else math.pi + 0.42), (230, 218, 238), (168, 152, 194),
                  taper=0.72, ink=(140, 124, 170), lw=max(1, int(sc(0.7))), veins=True)
            fx = px + sgn * sc(int(54 - 24 * t))
            fy = py - sc(10)
            for m in range(3):
                a = (-0.48 if sgn > 0 else math.pi + 0.48) + (m - 1) * 0.40
                petal(im, d, fx, fy, sc(int(54 - 22 * t)), sc(int(25 - 9 * t)), a,
                      (204, 190, 230), (132, 116, 172), taper=0.8, ink=(112, 98, 148), lw=1)
    finish(im, "muskatellersalbei")


# ------------------------------------------------------------------ Sandelholz
def sandelholz():
    im, d = new_plate()
    rnd = random.Random(47)
    for x, y, w, h in [(392, 478, 300, 90), (440, 566, 258, 76)]:
        x, y, w, h = sc(x), sc(y), sc(w), sc(h)
        pts = [(x - w / 2, y - h / 2), (x + w / 2, y - h / 2),
               (x + w / 2, y + h / 2), (x - w / 2, y + h / 2)]
        soft_shadow(im, pts, offset=(sc(5), sc(9)), blur=sc(8), strength=0.15)
        shade_polygon(im, pts, (214, 180, 132), (128, 94, 58), math.pi / 2, texture=0.08)
        d.line(pts + [pts[0]], fill=INK_W, width=max(1, int(sc(1.0))), joint="curve")
        for k in range(7):
            yy = y - h / 2 + h * (k + 1) / 8
            d.line([(x - w / 2 + sc(10), yy), (x + w / 2 - sc(10), yy + sc(rnd.randint(-3, 3)))],
                   fill=(168, 132, 88), width=max(1, int(sc(0.8))))
    cx, cy, r = sc(298), sc(318), sc(122)
    pts = [(cx + r * math.cos(a), cy + r * math.sin(a)) for a in
           [i * math.pi / 12 for i in range(24)]]
    soft_shadow(im, pts, offset=(sc(5), sc(9)), blur=sc(8), strength=0.15)
    # flache Schnittflaeche statt Kugel
    shade_polygon(im, pts, (232, 204, 160), (186, 152, 106), -0.7, texture=0.07)
    d.ellipse([cx - r, cy - r, cx + r, cy + r], outline=INK_W, width=max(1, int(sc(1.2))))
    # Rinde
    d.ellipse([cx - r, cy - r, cx + r, cy + r], outline=(120, 88, 54), width=max(1, int(sc(3.2))))
    d.ellipse([cx - r * 0.90, cy - r * 0.90, cx + r * 0.90, cy + r * 0.90],
              outline=(150, 114, 72), width=max(1, int(sc(1.6))))
    for k in range(8):
        rr = r * (0.83 - k * 0.098)
        wob = sc(2.4) * math.sin(k * 1.7)
        d.ellipse([cx - rr, cy - rr * 0.97 + wob, cx + rr, cy + rr * 0.97 + wob],
                  outline=(148, 110, 68) if k % 2 == 0 else (172, 138, 96),
                  width=max(1, int(sc(1.5 if k % 2 == 0 else 1.0))))
    for k in range(30):
        a = rnd.uniform(0, math.pi * 2)
        r0 = r * rnd.uniform(0.12, 0.86)
        r1 = min(r * 0.9, r0 + r * rnd.uniform(0.06, 0.18))
        d.line([(cx + r0 * math.cos(a), cy + r0 * 0.96 * math.sin(a)),
                (cx + r1 * math.cos(a), cy + r1 * 0.96 * math.sin(a))],
               fill=(160, 124, 82), width=max(1, int(sc(0.7))))
    d.ellipse([cx - r * 0.07, cy - r * 0.07, cx + r * 0.07, cy + r * 0.07],
              fill=(150, 112, 70), outline=(118, 86, 52), width=max(1, int(sc(0.8))))
    br = curve_pts((sc(650), sc(560)), (sc(910), sc(250)), (sc(1310), sc(170)))
    stem(im, d, br, sc(12), (162, 132, 92), (98, 72, 44))
    for t, sgn in [(0.14, 1), (0.30, -1), (0.46, 1), (0.62, -1), (0.78, 1), (0.92, -1)]:
        px, py = br[int(len(br) * t)]
        leaf(im, d, px, py, sc(186), sc(76), (-1.02 if sgn > 0 else 0.82),
             (150, 176, 124), (52, 82, 54), curve=sgn * 0.24, texture=0.05)
    for t in (0.38, 0.56, 0.72):
        px, py = br[int(len(br) * t)]
        sphere(im, d, px + sc(rnd.randint(-24, 24)), py + sc(rnd.randint(22, 48)), sc(17),
               (118, 92, 122), (44, 32, 50), ink=(36, 26, 42))
    finish(im, "sandelholz")


# ------------------------------------------------------------------ Zedernholz
def zedernholz():
    im, d = new_plate()
    rnd = random.Random(51)
    for x, y, w, h in [(300, 520, 250, 78), (350, 596, 210, 64)]:
        x, y, w, h = sc(x), sc(y), sc(w), sc(h)
        pts = [(x - w / 2, y - h / 2), (x + w / 2, y - h / 2),
               (x + w / 2, y + h / 2), (x - w / 2, y + h / 2)]
        soft_shadow(im, pts, offset=(sc(5), sc(9)), blur=sc(8), strength=0.15)
        shade_polygon(im, pts, (206, 168, 122), (118, 86, 52), math.pi / 2, texture=0.08)
        d.line(pts + [pts[0]], fill=INK_W, width=max(1, int(sc(1.0))), joint="curve")
        for k in range(6):
            yy = y - h / 2 + h * (k + 1) / 7
            d.line([(x - w / 2 + sc(10), yy), (x + w / 2 - sc(10), yy + sc(rnd.randint(-3, 3)))],
                   fill=(160, 124, 82), width=max(1, int(sc(0.8))))
    br = curve_pts((sc(560), sc(430)), (sc(900), sc(300)), (sc(1330), sc(300)))
    stem(im, d, br, sc(13), (150, 124, 90), (92, 68, 44))
    for i in range(3, len(br) - 2, 4):
        px, py = br[i]
        for sgn in (1, -1):
            bx = px + sc(rnd.randint(-8, 8))
            by = py + sgn * sc(rnd.randint(24, 44))
            d.line([(px, py), (bx, by)], fill=(104, 82, 54), width=max(1, int(sc(1.4))))
            for k in range(11):
                a = k * math.pi * 2 / 11 + rnd.uniform(-0.1, 0.1)
                ln = sc(rnd.randint(34, 52))
                leaf(im, d, bx, by, ln, sc(9), a, (156, 178, 138), (58, 88, 62),
                     veins=False, taper=1.8, ink=(54, 82, 58), texture=0.03)
    for cx, cy, ch in [(880, 258, 108), (1130, 262, 92)]:
        cx, cy, ch = sc(cx), sc(cy), sc(ch)
        cw = ch * 0.56
        pts = [(cx - cw / 2, cy + ch / 2), (cx - cw / 2, cy - ch * 0.3),
               (cx, cy - ch / 2), (cx + cw / 2, cy - ch * 0.3), (cx + cw / 2, cy + ch / 2)]
        shade_polygon(im, pts, (196, 164, 118), (110, 84, 56), 0.0, texture=0.07)
        d.line(pts + [pts[0]], fill=INK_W, width=max(1, int(sc(1.0))), joint="curve")
        for k in range(6):
            yy = cy - ch * 0.34 + ch * 0.16 * k
            d.line([(cx - cw / 2, yy), (cx + cw / 2, yy)], fill=(142, 110, 72),
                   width=max(1, int(sc(0.9))))
    finish(im, "zedernholz")


# ------------------------------------------------------------------ Grapefruit
def grapefruit():
    _citrus("grapefruit", (248, 196, 148), (206, 124, 96), (150, 84, 66), (78, 112, 68), (38, 68, 44))


# --------------------------------------------------------------------- Thymian
def thymian():
    im, d = new_plate()
    rnd = random.Random(53)
    base = (sc(750), sc(605))
    for bx, h in [(-300, 400), (-155, 452), (0, 480), (155, 450), (300, 398),
                  (-80, 350), (85, 352)]:
        tip = (base[0] + sc(bx), base[1] - sc(h))
        pts = curve_pts(base, (base[0] + sc(bx) * 0.3, base[1] - sc(h) * 0.55), tip)
        stem(im, d, pts, sc(6), (158, 136, 102), (100, 80, 54))
        for i in range(3, len(pts) - 1, 2):
            px, py = pts[i]
            ang = math.atan2(pts[min(i + 2, len(pts) - 1)][1] - py,
                             pts[min(i + 2, len(pts) - 1)][0] - px)
            for sgn in (1, -1):
                leaf(im, d, px, py, sc(rnd.randint(26, 38)), sc(15),
                     ang + sgn * 1.0 + rnd.uniform(-0.15, 0.15), (152, 172, 124),
                     (62, 92, 64), veins=False, taper=0.7, ink=(58, 86, 60), texture=0.03)
        for k in range(3):
            t = 0.78 + k * 0.08
            px, py = pts[min(int(len(pts) * t), len(pts) - 1)]
            for m in range(6):
                a = m * math.pi * 2 / 6
                fx, fy = px + sc(20) * math.cos(a), py + sc(16) * math.sin(a)
                petal(im, d, fx, fy, sc(20), sc(14), a, (232, 196, 214), (176, 124, 158),
                      taper=0.6, ink=(148, 100, 132), lw=1)
    finish(im, "thymian")


# --------------------------------------------------------------------- Melisse
def melisse():
    im, d = new_plate()
    base, top = (sc(430), sc(585)), (sc(1090), sc(165))
    spine = curve_pts(base, (sc(700), sc(430)), top)
    stem(im, d, spine, sc(12), (150, 172, 116), (72, 102, 66))

    def heart_leaf(x, y, size, ang):
        pts = []
        n = 70
        for i in range(n + 1):
            t = i / n
            th = -math.pi / 2 + t * math.pi * 2
            r = size * (0.78 + 0.34 * math.sin(th) - 0.18 * math.sin(th) ** 2)
            r *= 1 + 0.055 * math.sin(th * 11)
            lx, ly = r * math.cos(th) * 0.92, r * math.sin(th)
            pts.append((x + lx * math.cos(ang) - ly * math.sin(ang),
                        y + lx * math.sin(ang) + ly * math.cos(ang)))
        shade_polygon(im, pts, (172, 198, 132), (64, 100, 62), ang + math.pi / 2, texture=0.06)
        d.line(pts + [pts[0]], fill=(48, 78, 52), width=max(1, int(sc(0.9))), joint="curve")
        for k in range(5):
            a = ang + (k - 2) * 0.42
            d.line([(x, y), (x + size * 0.78 * math.cos(a), y + size * 0.78 * math.sin(a))],
                   fill=(78, 110, 72), width=max(1, int(sc(0.8))))

    rnd = random.Random(89)
    for t, size, sgn in [(0.08, 126, 1), (0.19, 118, -1), (0.31, 108, 1),
                         (0.43, 96, -1), (0.55, 84, 1), (0.67, 72, -1),
                         (0.79, 58, 1), (0.90, 46, -1)]:
        px, py = spine[int(len(spine) * t)]
        ang = -math.pi / 2 + sgn * (math.pi / 2 + rnd.uniform(0.30, 0.78))
        hx = px + sc(size) * 0.90 * math.cos(ang)
        hy = py + sc(size) * 0.90 * math.sin(ang)
        d.line([(px, py), (hx, hy)], fill=(84, 116, 74), width=max(1, int(sc(1.6))))
        heart_leaf(hx, hy, sc(size), ang + rnd.uniform(-0.18, 0.18))
    for t in (0.62, 0.78, 0.90):
        px, py = spine[int(len(spine) * t)]
        for sgn in (1, -1):
            for k in range(3):
                fx = px + sgn * sc(38 + 10 * k)
                fy = py - sc(6 * k)
                for m in range(5):
                    a = m * math.pi * 2 / 5
                    petal(im, d, fx, fy, sc(15), sc(10), a, (252, 250, 240),
                          (198, 198, 176), taper=0.6, ink=(172, 172, 150), lw=1)
    finish(im, "melisse")


# ------------------------------------------------------------------------ Zimt
def zimt():
    im, d = new_plate()
    rnd = random.Random(59)
    for x, y, ln, ang in [(340, 430, 330, -0.10), (420, 530, 300, 0.06), (300, 600, 250, -0.03)]:
        x, y = sc(x), sc(y)
        ln = sc(ln)
        th = sc(52)
        pts = leaf_pts(x, y, ln, th, ang, 0, 0, 0.14)
        soft_shadow(im, pts, offset=(sc(4), sc(8)), blur=sc(7), strength=0.15)
        shade_polygon(im, pts, (198, 146, 96), (112, 70, 40), ang + math.pi / 2, texture=0.09)
        d.line(pts + [pts[0]], fill=INK_W, width=max(1, int(sc(1.0))), joint="curve")
        for k in range(7):
            t = 0.12 + k * 0.12
            lx = x + ln * t * math.cos(ang)
            ly = y + ln * t * math.sin(ang)
            d.line([(lx - th * 0.45 * math.sin(ang), ly + th * 0.45 * math.cos(ang)),
                    (lx + th * 0.45 * math.sin(ang), ly - th * 0.45 * math.cos(ang))],
                   fill=(150, 104, 62), width=max(1, int(sc(0.7))))
        # eingerollte Stirnseite
        ex, ey = x + ln * math.cos(ang), y + ln * math.sin(ang)
        for k in range(4):
            rr = th * (0.46 - k * 0.10)
            d.ellipse([ex - rr, ey - rr, ex + rr, ey + rr], outline=(128, 86, 50),
                      width=max(1, int(sc(0.9))))
    br = curve_pts((sc(700), sc(560)), (sc(980), sc(250)), (sc(1330), sc(200)))
    stem(im, d, br, sc(12), (158, 128, 90), (96, 70, 44))
    for t, sgn in [(0.20, 1), (0.42, -1), (0.62, 1), (0.82, -1)]:
        px, py = br[int(len(br) * t)]
        ang = -1.05 if sgn > 0 else 0.85
        leaf(im, d, px, py, sc(210), sc(88), ang, (154, 178, 126), (52, 82, 54),
             curve=sgn * 0.2, veins=False, texture=0.05)
        for off in (-0.26, 0.0, 0.26):
            rib = midrib(px, py, sc(200), ang + off, sgn * 0.2)
            d.line(rib, fill=(76, 106, 70), width=max(1, int(sc(0.8))), joint="curve")
    finish(im, "zimt")


# ---------------------------------------------------------------------- Fenchel
def fenchel():
    im, d = new_plate()
    rnd = random.Random(61)
    base = (sc(750), sc(612))
    stem(im, d, curve_pts(base, (sc(756), sc(400)), (sc(752), sc(230))), sc(13),
         (172, 190, 130), (96, 124, 74))
    # Feine Fiederblaetter
    for t, sgn in [(0.30, 1), (0.48, -1), (0.66, 1)]:
        px = base[0] + sgn * sc(int(40 * t))
        py = base[1] - sc(int(300 * t))
        for k in range(9):
            a = -math.pi / 2 + sgn * (0.35 + 0.13 * k)
            ln = sc(rnd.randint(120, 190))
            ex, ey = px + ln * math.cos(a), py + ln * math.sin(a)
            d.line([(px, py), (ex, ey)], fill=(112, 142, 84), width=max(1, int(sc(1.0))))
            for m in range(1, 6):
                t2 = m / 5.5
                mx, my = px + (ex - px) * t2, py + (ey - py) * t2
                for s2 in (1, -1):
                    d.line([(mx, my), (mx + sc(26) * math.cos(a + s2 * 1.0),
                                       my + sc(26) * math.sin(a + s2 * 1.0))],
                           fill=(134, 162, 100), width=max(1, int(sc(0.7))))
    # Doldenblueten
    for ux, uy, ur in [(752, 230, 210), (520, 300, 130), (990, 296, 126)]:
        ux, uy, ur = sc(ux), sc(uy), sc(ur)
        for k in range(13):
            a = -math.pi + k * math.pi / 12
            ex, ey = ux + ur * math.cos(a) * 0.95, uy + ur * 0.5 * math.sin(a) - ur * 0.24
            d.line([(ux, uy), (ex, ey)], fill=(126, 152, 88), width=max(1, int(sc(0.9))))
            for m in range(7):
                a2 = m * math.pi * 2 / 7
                fx, fy = ex + sc(13) * math.cos(a2), ey + sc(11) * math.sin(a2)
                sphere(im, d, fx, fy, sc(6), (250, 224, 118), (188, 158, 52),
                       ink=(150, 124, 42), lw=1)
    for x, y in [(1180, 470), (1250, 520), (1130, 545), (1290, 440)]:
        x, y = sc(x), sc(y)
        pts = leaf_pts(x, y, sc(58), sc(24), -1.2, 0, 0, 0.5)
        shade_polygon(im, pts, (206, 190, 138), (130, 114, 70), 0.0, texture=0.06)
        d.line(pts + [pts[0]], fill=(104, 90, 54), width=max(1, int(sc(0.8))), joint="curve")
    finish(im, "fenchel")


# -------------------------------------------------------------------- Patchouli
def patchouli():
    im, d = new_plate()
    base = (sc(400), sc(580))
    spine = curve_pts(base, (sc(700), sc(430)), (sc(1120), sc(185)))
    stem(im, d, spine, sc(14), (150, 168, 112), (76, 102, 62))
    rnd = random.Random(91)
    for t, size, sgn in [(0.06, 150, 1), (0.18, 140, -1), (0.32, 128, 1),
                         (0.45, 114, -1), (0.58, 100, 1), (0.70, 86, -1),
                         (0.82, 70, 1), (0.92, 56, -1)]:
        px, py = spine[int(len(spine) * t)]
        ang = (0 if sgn > 0 else math.pi) - sgn * rnd.uniform(0.26, 0.68)
        leaf(im, d, px, py, sc(size), sc(int(size * 0.80)), ang,
             (168, 186, 128), (66, 96, 62), curve=-sgn * 0.16, serrate=8,
             taper=0.62, texture=0.08)
    for k in range(9):
        a = -math.pi / 2 + (k - 4) * 0.28
        fx = spine[-1][0] + sc(30) * math.cos(a)
        fy = spine[-1][1] + sc(26) * math.sin(a) - sc(14)
        petal(im, d, fx, fy, sc(26), sc(16), a, (226, 210, 226), (166, 146, 176),
              taper=0.7, ink=(138, 120, 150), lw=1)
    finish(im, "patchouli")


# ---------------------------------------------------------------------- Vetiver
def vetiver():
    im, d = new_plate()
    rnd = random.Random(67)
    crown = (sc(750), sc(330))
    for bx, by in [(-520, 60), (-380, 30), (-230, 15), (-90, 8), (90, 10),
                   (230, 18), (380, 34), (520, 66), (-160, 25), (165, 28)]:
        tip = (crown[0] + sc(bx), sc(by))
        pts = curve_pts(crown, (crown[0] + sc(bx) * 0.25, crown[1] - sc(170)), tip)
        a_side, b_side = [], []
        for i, (px, py) in enumerate(pts):
            t = i / (len(pts) - 1)
            w = sc(19) * (1 - t) ** 0.6 + sc(2)
            a_side.append((px + w, py))
            b_side.append((px - w, py))
        poly = a_side + b_side[::-1]
        shade_polygon(im, poly, (176, 196, 140), (72, 102, 66), 0.0, texture=0.05)
        d.line(poly + [poly[0]], fill=(60, 88, 58), width=max(1, int(sc(0.8))), joint="curve")
    # Wurzelgeflecht
    for k in range(58):
        sx = crown[0] + sc(rnd.randint(-90, 90))
        ex = crown[0] + sc(rnd.randint(-330, 330))
        ey = sc(rnd.randint(500, 625))
        pts = curve_pts((sx, crown[1] + sc(20)),
                        ((sx + ex) / 2 + sc(rnd.randint(-50, 50)), (crown[1] + ey) / 2),
                        (ex, ey))
        d.line(pts, fill=(140, 108, 70) if k % 3 else (112, 84, 52),
               width=max(1, int(sc(rnd.uniform(1.0, 2.4)))), joint="curve")
    pts = [(crown[0] + sc(120) * math.cos(a), crown[1] + sc(52) * math.sin(a))
           for a in [i * math.pi / 12 for i in range(24)]]
    shade_polygon(im, pts, (204, 178, 132), (120, 92, 58), math.pi / 2, texture=0.08)
    d.line(pts + [pts[0]], fill=INK_W, width=max(1, int(sc(1.0))), joint="curve")
    finish(im, "vetiver")


# ------------------------------------------------------------------------- Rose
def rose():
    im, d = new_plate()
    rnd = random.Random(71)
    br = curve_pts((sc(760), sc(620)), (sc(820), sc(400)), (sc(800), sc(300)))
    stem(im, d, br, sc(13), (140, 168, 110), (68, 98, 62))
    for t in (0.30, 0.55, 0.78):
        px, py = br[int(len(br) * t)]
        for sgn in (1, -1):
            d.polygon([(px, py - sc(6)), (px + sgn * sc(20), py - sc(2)), (px, py + sc(8))],
                      fill=(112, 136, 84), outline=(70, 96, 62))
    # Blattzweige, die am Hauptstiel ansetzen
    for t, sgn in [(0.18, -1), (0.34, 1), (0.52, -1), (0.68, 1)]:
        px, py = br[int(len(br) * t)]
        ang = math.pi + 0.30 * sgn if sgn < 0 else -0.30
        ang = (math.pi + 0.42) if sgn < 0 else (-0.42)
        rx = px + sc(230) * math.cos(ang)
        ry = py + sc(230) * math.sin(ang)
        d.line([(px, py), (rx, ry)], fill=(74, 104, 66), width=max(1, int(sc(2.0))))
        for k in range(1, 3):
            t2 = k / 2.6
            lx = px + (rx - px) * t2
            ly = py + (ry - py) * t2
            for s2 in (1, -1):
                leaf(im, d, lx, ly, sc(112), sc(66), ang + s2 * 0.92, (150, 176, 120),
                     (52, 82, 54), curve=s2 * 0.14, serrate=11, texture=0.06)
        leaf(im, d, rx, ry, sc(124), sc(72), ang, (150, 176, 120), (52, 82, 54),
             curve=0.10, serrate=11, texture=0.06)

    def bloom(cx, cy, r, tone=0):
        cols = [((246, 186, 200), (188, 104, 132)), ((242, 172, 190), (176, 92, 122)),
                ((238, 158, 180), (166, 82, 112))]
        for ring, (nn, rad, ln, wd) in enumerate(
                [(9, 0.72, 0.62, 0.52), (8, 0.50, 0.50, 0.44), (6, 0.30, 0.38, 0.36),
                 (5, 0.15, 0.26, 0.28)]):
            lt, dk = cols[min(ring, 2)]
            if tone:
                lt = tuple(min(255, c + 6) for c in lt)
            for k in range(nn):
                a = k * math.pi * 2 / nn + ring * 0.42 + rnd.uniform(-0.06, 0.06)
                fx = cx + r * rad * math.cos(a)
                fy = cy + r * rad * 0.92 * math.sin(a)
                petal(im, d, fx, fy, r * ln, r * wd, a + math.pi, lt, dk,
                      taper=0.55, ink=(148, 74, 102), lw=max(1, int(sc(0.8))), veins=True)
        for k in range(5):
            a = k * math.pi * 2 / 5
            petal(im, d, cx, cy, r * 0.20, r * 0.16, a, (232, 148, 172), (158, 78, 108),
                  taper=0.6, ink=(140, 70, 96), lw=1)

    bloom(sc(760), sc(268), sc(196))
    bloom(sc(455), sc(232), sc(104), tone=1)
    for bx, by, s in [(1055, 235, 74), (1180, 330, 58)]:
        bx, by = sc(bx), sc(by)
        s = sc(s)
        pts = leaf_pts(bx, by + s * 0.9, s * 1.9, s * 1.15, -math.pi / 2, 0, 0, 0.55)
        shade_polygon(im, pts, (240, 168, 188), (166, 86, 116), 0.0, texture=0.05)
        d.line(pts + [pts[0]], fill=(144, 72, 100), width=max(1, int(sc(0.9))), joint="curve")
        for k in range(4):
            a = -math.pi / 2 + (k - 1.5) * 0.44
            petal(im, d, bx, by + s * 0.85, s * 1.1, s * 0.34, a, (146, 172, 116),
                  (68, 98, 62), taper=1.2, ink=(58, 86, 58), lw=1)
    finish(im, "rose")


# ----------------------------------------------------------------------- Jasmin
def jasmin():
    im, d = new_plate()
    rnd = random.Random(73)
    vine = curve_pts((sc(120), sc(520)), (sc(700), sc(220)), (sc(1350), sc(400)))
    stem(im, d, vine, sc(11), (146, 172, 116), (70, 100, 64))
    for t, sgn in [(0.14, 1), (0.30, -1), (0.46, 1), (0.62, -1), (0.78, 1), (0.90, -1)]:
        px, py = vine[int(len(vine) * t)]
        ang = -1.2 if sgn > 0 else 1.05
        rx = px + sc(126) * math.cos(ang)
        ry = py + sc(126) * math.sin(ang)
        d.line([(px, py), (rx, ry)], fill=(78, 108, 68), width=max(1, int(sc(1.4))))
        for k in range(1, 4):
            t2 = k / 3.4
            lx = px + (rx - px) * t2
            ly = py + (ry - py) * t2
            for s2 in (1, -1):
                leaf(im, d, lx, ly, sc(74), sc(40), ang + s2 * 1.0, (152, 178, 122),
                     (54, 84, 56), taper=0.68, ink=(48, 76, 52), texture=0.04)
        leaf(im, d, rx, ry, sc(80), sc(42), ang, (152, 178, 122), (54, 84, 56),
             taper=0.68, ink=(48, 76, 52), texture=0.04)
    for fx, fy, s in [(330, 330, 78), (620, 250, 92), (900, 268, 86),
                      (1160, 360, 74), (475, 420, 62), (1030, 430, 60)]:
        fx, fy, s = sc(fx), sc(fy), sc(s)
        for k in range(6):
            a = k * math.pi * 2 / 6 + rnd.uniform(-0.05, 0.05)
            petal(im, d, fx + s * 0.16 * math.cos(a), fy + s * 0.16 * math.sin(a),
                  s * 0.92, s * 0.40, a, (253, 252, 246), (204, 200, 190),
                  taper=0.6, ink=(176, 172, 158), lw=max(1, int(sc(0.8))), veins=True)
        sphere(im, d, fx, fy, s * 0.17, (252, 246, 220), (206, 192, 148),
               ink=(178, 164, 124), lw=1)
    finish(im, "jasmin")


# ----------------------------------------------------------------------- Kiefer
def kiefer():
    im, d = new_plate()
    rnd = random.Random(79)
    br = curve_pts((sc(120), sc(470)), (sc(700), sc(330)), (sc(1340), sc(390)))
    stem(im, d, br, sc(16), (152, 122, 86), (92, 66, 42))
    for i in range(3, len(br) - 2, 7):
        px, py = br[i]
        for sgn in (1, -1):
            bx = px + sc(rnd.randint(-10, 10))
            by = py + sgn * sc(rnd.randint(20, 36))
            d.line([(px, py), (bx, by)], fill=(102, 76, 48), width=max(1, int(sc(2.0))))
            for k in range(5):
                a = (-math.pi / 2 if sgn > 0 else math.pi / 2) + (k - 2) * 0.17
                a += rnd.uniform(-0.05, 0.05)
                ln = sc(rnd.randint(150, 220))
                leaf(im, d, bx, by, ln, sc(12), a, (140, 168, 122), (46, 78, 56),
                     veins=False, taper=2.0, ink=(42, 72, 52), texture=0.03)
    for cx, cy, ch in [(560, 520, 150), (1010, 512, 128)]:
        cx, cy, ch = sc(cx), sc(cy), sc(ch)
        cw = ch * 0.60
        pts = leaf_pts(cx, cy - ch / 2, ch, cw, math.pi / 2, 0, 0, 0.48)
        soft_shadow(im, pts, offset=(sc(4), sc(8)), blur=sc(7), strength=0.14)
        shade_polygon(im, pts, (190, 150, 100), (104, 72, 42), 0.0, texture=0.08)
        d.line(pts + [pts[0]], fill=INK_W, width=max(1, int(sc(1.0))), joint="curve")
        for row in range(7):
            yy = cy - ch * 0.40 + ch * 0.135 * row
            half = cw * 0.5 * math.sin(math.pi * (row + 1) / 8.6) ** 0.5
            for col in range(4):
                sx = cx - half + 2 * half * col / 3
                d.arc([sx - sc(15), yy - sc(11), sx + sc(15), yy + sc(11)], 200, 340,
                      fill=(140, 102, 62), width=max(1, int(sc(1.0))))
    finish(im, "kiefer")


# ----------------------------------------------------------------------- Myrrhe
def myrrhe():
    im, d = new_plate()
    rnd = random.Random(83)
    br = curve_pts((sc(140), sc(300)), (sc(520), sc(190)), (sc(920), sc(255)))
    stem(im, d, br, sc(15), (162, 146, 116), (100, 86, 62))
    for i in range(3, len(br) - 2, 3):
        px, py = br[i]
        for sgn in (1, -1):
            a = (-1.25 if sgn > 0 else 1.15) + rnd.uniform(-0.15, 0.15)
            d.line([(px, py), (px + sc(46) * math.cos(a), py + sc(46) * math.sin(a))],
                   fill=(120, 104, 78), width=max(1, int(sc(1.5))))
    for t, sgn in [(0.16, 1), (0.32, -1), (0.50, 1), (0.68, -1), (0.84, 1)]:
        px, py = br[int(len(br) * t)]
        ang = -1.1 if sgn > 0 else 1.0
        for k in range(3):
            a = ang + (k - 1) * 0.5
            leaf(im, d, px, py, sc(58), sc(30), a, (156, 172, 130), (66, 92, 64),
                 taper=0.65, ink=(58, 84, 58), texture=0.04)
    for x, y, r in [(500, 480, 54), (630, 518, 46), (760, 482, 60), (884, 522, 40),
                    (996, 474, 48), (700, 412, 34), (1100, 512, 38), (1196, 462, 30)]:
        x, y, r = sc(x), sc(y), sc(r)
        ph = rnd.uniform(0, 6.28)
        pts = [(x + r * (1 + 0.09 * math.sin(a * 3 + ph) + 0.05 * math.sin(a * 5 + ph)) * math.cos(a),
                y + r * 0.94 * (1 + 0.09 * math.sin(a * 3 + ph) + 0.05 * math.sin(a * 5 + ph)) * math.sin(a))
               for a in [i * math.pi / 18 for i in range(36)]]
        soft_shadow(im, pts, offset=(sc(4), sc(8)), blur=sc(7), strength=0.17)
        shade_polygon(im, pts, (208, 138, 92), (118, 62, 38), -0.8, texture=0.09)
        d.line(pts + [pts[0]], fill=(92, 50, 30), width=max(1, int(sc(0.9))), joint="curve")
        d.ellipse([x - r * 0.40, y - r * 0.66, x - r * 0.02, y - r * 0.24],
                  fill=(232, 176, 130))
    finish(im, "myrrhe")


PLANTS = {
    "lavendel": lavendel, "pfefferminze": pfefferminze, "teebaum": teebaum,
    "eukalyptus": eukalyptus, "zitrone": zitrone, "orange": orange,
    "rosmarin": rosmarin, "zitronengras": zitronengras, "ingwer": ingwer,
    "nelke": nelke, "weihrauch": weihrauch, "kamille": kamille,
    "ylang": ylang, "geranie": geranie, "bergamotte": bergamotte,
    "wacholder": wacholder, "muskatellersalbei": muskatellersalbei,
    "sandelholz": sandelholz, "zedernholz": zedernholz, "grapefruit": grapefruit,
    "thymian": thymian, "melisse": melisse, "zimt": zimt, "fenchel": fenchel,
    "patchouli": patchouli, "vetiver": vetiver, "rose": rose, "jasmin": jasmin,
    "kiefer": kiefer, "myrrhe": myrrhe,
}

if __name__ == "__main__":
    for n, fn in PLANTS.items():
        fn()
        print("ok", n)
