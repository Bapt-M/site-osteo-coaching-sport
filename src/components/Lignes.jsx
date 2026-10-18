/** Texte sur plusieurs lignes : chaque retour à la ligne devient un <br />. */
export default function Lignes({ texte }) {
  const lignes = String(texte ?? '').split('\n')
  return lignes.map((l, i) => (
    <span key={i}>{l}{i < lignes.length - 1 && <br />}</span>
  ))
}
