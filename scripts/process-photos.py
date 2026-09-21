#!/usr/bin/env python3
"""
process-photos.py
Convert source photos (HEIC/JPG) to web-optimised JPEGs at 1920px wide.
Output: public/images/
Usage: python3 scripts/process-photos.py  (run from project root)
"""

import sys
import subprocess
import os
import tempfile
import shutil

# Auto-install Pillow if missing, and ensure user site-packages is on the path
import site
for sp in site.getusersitepackages() if isinstance(site.getusersitepackages(), list) else [site.getusersitepackages()]:
    if sp not in sys.path:
        sys.path.insert(0, sp)

try:
    from PIL import Image
except ImportError:
    print("Pillow not found — installing...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", "--user", "Pillow"])
    # Re-add user site-packages after install
    for sp in site.getusersitepackages() if isinstance(site.getusersitepackages(), list) else [site.getusersitepackages()]:
        if sp not in sys.path:
            sys.path.insert(0, sp)
    from PIL import Image

# ── Configuration ────────────────────────────────────────────────────────────

PHOTOS_DIR = "/Users/baptistemoog/Documents/Site Manu/OSTÉO ET COACHING DU SPORT/PHOTOS"
OUTPUT_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "public", "images")
TARGET_WIDTH = 1920
JPEG_QUALITY = 88

PHOTO_MAP = [
    # (source filename,            destination filename)
    ("010326 (11).HEIC",          "cabinet-1.jpg"),
    ("010326 (12).HEIC",          "cabinet-2.jpg"),
    ("010326 (14).HEIC",          "cabinet-3.jpg"),
    ("010326 (15).HEIC",          "cabinet-4.jpg"),
    ("010326 (28).HEIC",          "cabinet-5.jpg"),
    ("010326 (29).HEIC",          "cabinet-6.jpg"),
    ("010326 (10).HEIC",          "terrain-1.jpg"),
    ("010326 (4).HEIC",           "terrain-2.jpg"),
    ("010326 (6).HEIC",           "terrain-3.jpg"),
    ("070226 (22).HEIC",          "action-1.jpg"),
    ("070226 (23).HEIC",          "action-2.jpg"),
    ("Juilien Motz.JPG",          "julien-motz.jpg"),
    ("Julien MOTZ 2.jpg",         "julien-motz-2.jpg"),
    # Yannis.jpg et Alexis.jpg sont des captures d'écran Instagram (interface
    # comprise), pas des photos exploitables. Les visuels servis sous
    # yannis-musser.jpg et alexis-koessler.jpg proviennent des versions
    # recadrées de images/. Réactiver ces deux lignes les écraserait.
    ("Nissim Manu.jpg",           "nissim-manu.jpg"),
    ("INSEP.jpg",                 "insep.jpg"),
    ("U21 VITTEL.jpg",            "equipe-france-u21.jpg"),
    ("Vestiaire SIG.jpg",         "sig-vestiaire.jpg"),
    ("Malaga.jpg",                "malaga.jpg"),
    ("Temps mort.jpg",            "temps-mort-sig.jpg"),
    ("Fred FORTE.jpg",            "fred-forte.jpg"),
    ("Jennings.jpg",              "keith-jennings.jpg"),
]

# ── Helpers ───────────────────────────────────────────────────────────────────

def convert_heic_to_jpeg(src_path: str, tmp_dir: str) -> str:
    """Use macOS sips to convert a HEIC file to a temporary JPEG."""
    basename = os.path.splitext(os.path.basename(src_path))[0]
    tmp_jpeg = os.path.join(tmp_dir, basename + ".jpg")
    result = subprocess.run(
        ["sips", "-s", "format", "jpeg", src_path, "--out", tmp_jpeg],
        capture_output=True, text=True
    )
    if result.returncode != 0:
        raise RuntimeError(f"sips failed: {result.stderr.strip()}")
    return tmp_jpeg


def process_image(src_path: str, dest_path: str, tmp_dir: str) -> None:
    """Resize to TARGET_WIDTH wide (LANCZOS) and save as JPEG quality=88."""
    ext = os.path.splitext(src_path)[1].upper()

    if ext == ".HEIC":
        src_path = convert_heic_to_jpeg(src_path, tmp_dir)

    with Image.open(src_path) as img:
        img = img.convert("RGB")  # drop alpha / ensure RGB for JPEG
        w, h = img.size
        if w != TARGET_WIDTH:
            new_h = int(h * TARGET_WIDTH / w)
            img = img.resize((TARGET_WIDTH, new_h), Image.LANCZOS)
        img.save(dest_path, "JPEG", quality=JPEG_QUALITY, optimize=True)


# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    tmp_dir = tempfile.mkdtemp(prefix="photo_proc_")

    processed = 0
    skipped = 0

    try:
        for src_name, dest_name in PHOTO_MAP:
            src_path = os.path.join(PHOTOS_DIR, src_name)
            dest_path = os.path.join(OUTPUT_DIR, dest_name)

            if not os.path.exists(src_path):
                print(f"  SKIP  {src_name}  (not found)")
                skipped += 1
                continue

            try:
                process_image(src_path, dest_path, tmp_dir)
                size_kb = os.path.getsize(dest_path) // 1024
                print(f"  OK    {src_name}  →  {dest_name}  ({size_kb} KB)")
                processed += 1
            except Exception as e:
                print(f"  ERROR {src_name}: {e}")
                skipped += 1
    finally:
        shutil.rmtree(tmp_dir, ignore_errors=True)

    print(f"\nDone: {processed} processed, {skipped} skipped/errored.")


if __name__ == "__main__":
    main()
