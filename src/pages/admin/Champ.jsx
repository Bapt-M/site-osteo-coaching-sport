import { DEFAUTS } from '../../content/registre'

/** Classes des zones de saisie de l'administration. */
export const CHAMP = 'w-full rounded-lg border border-black/15 bg-white px-4 py-3 font-inter text-text-primary ' +
                     'outline-none focus:border-green-accent focus:ring-2 focus:ring-green-accent/25 transition'

/** Un texte éditable du registre, avec son état « modifié » et le retour à l'original. */
export default function Champ({ champ, valeur, modifie, onChange, onReset, contexte }) {
  const { cle, libelle, multi } = champ
  const surcharge = valeur !== DEFAUTS[cle]
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3 mb-2">
        <label htmlFor={cle} className="font-inter text-text-primary text-sm font-medium">
          {contexte && <span className="text-text-secondary/60">{contexte} · </span>}
          {libelle}
          {modifie && <span className="ml-2 text-green-accent text-xs">modifié</span>}
        </label>
        {surcharge && (
          <button type="button" onClick={() => onReset(cle)}
                  className="font-inter text-text-secondary/70 hover:text-green-accent text-xs transition-colors cursor-pointer shrink-0">
            rétablir l’original
          </button>
        )}
      </div>
      {multi ? (
        <textarea
          id={cle} rows={Math.min(14, String(valeur).split('\n').length + 1)}
          value={valeur} onChange={e => onChange(cle, e.target.value)}
          className={CHAMP + ' resize-y leading-relaxed'}
        />
      ) : (
        <input id={cle} type="text" value={valeur}
               onChange={e => onChange(cle, e.target.value)} className={CHAMP} />
      )}
    </div>
  )
}
