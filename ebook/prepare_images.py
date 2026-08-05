"""Bereitet gelieferte Fotos fuer das E-Book auf.

Liest jedes Bild aus img_neu/, schneidet es mittig auf das Bannerformat
1500x640 zu und legt es als JPEG in img_jpg/ ab. Fehlt ein Oel in img_neu/,
bleibt die vorhandene Platzhalter-Illustration bestehen.

Aufruf:  python3 prepare_images.py
"""
import os
import sys

from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, "img_neu")
DST = os.path.join(HERE, "img_jpg")
FALLBACK = os.path.join(HERE, "img")

TARGET_W, TARGET_H = 1500, 640
RATIO = TARGET_W / TARGET_H

KEYS = [
    "lavendel", "pfefferminze", "teebaum", "eukalyptus", "zitrone", "orange",
    "rosmarin", "zitronengras", "ingwer", "nelke", "weihrauch", "kamille",
    "ylang", "geranie", "bergamotte", "wacholder", "muskatellersalbei",
    "sandelholz", "zedernholz", "grapefruit", "thymian", "melisse", "zimt",
    "fenchel", "patchouli", "vetiver", "rose", "jasmin", "kiefer", "myrrhe",
]
EXTS = (".jpg", ".jpeg", ".png", ".webp", ".JPG", ".JPEG", ".PNG", ".WEBP")


def find_source(key):
    for ext in EXTS:
        p = os.path.join(SRC, key + ext)
        if os.path.exists(p):
            return p
    return None


def center_crop(im):
    """Mittiger Beschnitt auf das Zielseitenverhaeltnis."""
    w, h = im.size
    if w / h > RATIO:                     # zu breit -> links/rechts kuerzen
        new_w = int(h * RATIO)
        left = (w - new_w) // 2
        im = im.crop((left, 0, left + new_w, h))
    else:                                 # zu hoch -> oben/unten kuerzen
        new_h = int(w / RATIO)
        top = (h - new_h) // 2
        im = im.crop((0, top, w, top + new_h))
    return im.resize((TARGET_W, TARGET_H), Image.LANCZOS)


def main():
    os.makedirs(SRC, exist_ok=True)
    os.makedirs(DST, exist_ok=True)

    neu, platzhalter, fehlend = [], [], []
    for key in KEYS:
        src = find_source(key)
        if src:
            im = Image.open(src).convert("RGB")
            center_crop(im).save(os.path.join(DST, key + ".jpg"), "JPEG",
                                 quality=88, optimize=True, progressive=True)
            neu.append(key)
        elif os.path.exists(os.path.join(DST, key + ".jpg")) or \
                os.path.exists(os.path.join(FALLBACK, key + ".png")):
            platzhalter.append(key)
        else:
            fehlend.append(key)

    print(f"Eigene Fotos übernommen : {len(neu):>2}  {', '.join(neu) or '–'}")
    print(f"Platzhalter beibehalten : {len(platzhalter):>2}  {', '.join(platzhalter) or '–'}")
    if fehlend:
        print(f"FEHLT ganz              : {len(fehlend):>2}  {', '.join(fehlend)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
