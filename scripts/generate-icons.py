#!/usr/bin/env python3
"""
generate-icons.py
Fabrique les icônes du site et l'image de partage à partir de public/logo.png.
Sortie : public/
Usage : python3 scripts/generate-icons.py   (depuis la racine du projet)

Le logotype est *blanc* : invisible sur les fonds clairs. Toutes les icônes
reçoivent donc le bleu profond de la charte en aplat, ce qui les rend lisibles
aussi bien sur un onglet clair que sombre.
"""

import os
from PIL import Image

RACINE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PUBLIC = os.path.join(RACINE, "public")
LOGO = os.path.join(PUBLIC, "logo.png")

FOND = (13, 30, 43)          # green-deep, cf. tailwind.config.js
PART_SYMBOLE = 0.62          # le disque occupe les 62 % supérieurs du logotype


def symbole(logo):
    """Isole le pictogramme, sans le texte, recadré au plus juste puis carré."""
    haut = logo.crop((0, 0, logo.width, int(logo.height * PART_SYMBOLE)))
    boite = haut.getchannel("A").getbbox()
    haut = haut.crop(boite)
    cote = max(haut.size)
    marge = int(cote * 0.10)
    carre = Image.new("RGBA", (cote + 2 * marge, cote + 2 * marge), (0, 0, 0, 0))
    carre.paste(haut, ((carre.width - haut.width) // 2,
                       (carre.height - haut.height) // 2), haut)
    return carre


def aplat(source, taille, fond=FOND):
    """Redimensionne sur un fond opaque — les icônes ne gèrent pas la transparence."""
    fondu = Image.new("RGB", (taille, taille), fond)
    vignette = source.resize((taille, taille), Image.LANCZOS)
    fondu.paste(vignette, (0, 0), vignette)
    return fondu


def main():
    logo = Image.open(LOGO).convert("RGBA")
    marque = symbole(logo)

    sorties = []

    # Favicon multi-résolution : 16 px pour les onglets, 48 px pour les raccourcis.
    ico = os.path.join(PUBLIC, "favicon.ico")
    aplat(marque, 48).save(ico, sizes=[(16, 16), (32, 32), (48, 48)])
    sorties.append(ico)

    # 96 px : Google recommande au moins 48 px pour le favicon des résultats
    # de recherche, et sert l'icône en haute densité sur les écrans récents.
    for taille, nom in [(32, "favicon-32.png"), (96, "favicon-96.png"),
                        (192, "icon-192.png"), (512, "icon-512.png"),
                        (180, "apple-touch-icon.png")]:
        chemin = os.path.join(PUBLIC, nom)
        aplat(marque, taille).save(chemin, optimize=True)
        sorties.append(chemin)

    # Image de partage (Open Graph) : logotype entier, cadre 1200x630 imposé
    # par les réseaux sociaux et les messageries.
    og = Image.new("RGB", (1200, 630), FOND)
    h = int(630 * 0.72)
    entier = logo.copy()
    entier.thumbnail((h, h), Image.LANCZOS)
    og.paste(entier, ((1200 - entier.width) // 2, (630 - entier.height) // 2), entier)
    chemin = os.path.join(PUBLIC, "og-image.jpg")
    og.save(chemin, "JPEG", quality=90, optimize=True, progressive=True)
    sorties.append(chemin)

    for c in sorties:
        print(f"  {os.path.relpath(c, RACINE):34} {os.path.getsize(c) // 1024:4} Ko")


if __name__ == "__main__":
    main()
