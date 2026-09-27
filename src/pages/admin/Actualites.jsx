import { ACTUALITES } from '../../content/registre'
import Champ from './Champ'
import Photos from './Photos'

const TITRE_BLOC = 'font-poppins font-bold text-text-primary text-base mb-5 pb-2 border-b border-black/10'

/**
 * Onglet Actualités : tout ce qui alimente la section de l'accueil au même
 * endroit. Les photos s'enregistrent une à une ; le titre et le post Facebook
 * sont des textes du registre, enregistrés par la barre commune en bas.
 */
export default function Actualites({ client, valeurs, initial, onChange, onReset }) {
  const [titre, facebook] = ACTUALITES.champs
  const champ = (c) => (
    <Champ champ={c} valeur={valeurs[c.cle]} modifie={valeurs[c.cle] !== initial[c.cle]}
           onChange={onChange} onReset={onReset} />
  )

  return (
    <>
      <div className="mb-8">
        <h2 className="font-poppins font-bold text-text-primary text-2xl">{ACTUALITES.titre}</h2>
        <a href={ACTUALITES.route} target="_blank" rel="noreferrer"
           className="font-inter text-sm text-green-accent hover:underline">
          voir la section ↗
        </a>
      </div>

      <section className="mb-12">{champ(titre)}</section>

      <section aria-labelledby="actu-photos" className="mb-12">
        <h3 id="actu-photos" className={TITRE_BLOC}>Photos</h3>
        <Photos client={client} />
      </section>

      <section aria-labelledby="actu-facebook" className="mb-12">
        <h3 id="actu-facebook" className={TITRE_BLOC}>Dernier post Facebook</h3>
        {champ(facebook)}
        <p className="font-inter text-xs text-text-secondary/70 mt-2">
          Enregistrez avec le bouton en bas de page. Laisser vide masque le bloc Facebook.
        </p>
      </section>
    </>
  )
}
