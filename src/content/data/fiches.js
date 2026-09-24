// Fiches d'origine, au format de la table `fiches`. Elles ont servi à la
// reprise en base et restent le repli du site quand Supabase est injoignable.
import { HOMMAGES, TEMOIGNAGES } from './histoire'

const hommages = HOMMAGES.map((h, i) => ({
  id: `origine-hommage-${i}`,
  type: 'hommage',
  nom: h.nom,
  fonction: h.role,
  titre: h.citation ?? '',
  texte: h.paragraphes.join('\n\n'),
  images: (h.images ?? []).map(({ src, legende }) => ({ chemin: src, legende: legende ?? '' })),
  ordre: i,
}))

const temoignages = TEMOIGNAGES.map((t, i) => ({
  id: `origine-temoignage-${i}`,
  type: 'temoignage',
  nom: t.nom,
  fonction: t.langue ? `${t.role} · ${t.langue.replace(/^Témoignage/, 'témoignage')}` : t.role,
  titre: t.extrait ?? '',
  texte: t.paragraphes.join('\n\n'),
  images: t.img ? [{ chemin: t.img, legende: t.imgAlt ?? '' }] : [],
  ordre: i,
}))

export const FICHES_ORIGINE = [...hommages, ...temoignages]
