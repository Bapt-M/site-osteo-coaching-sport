import { useEffect, useRef, useState } from 'react'
import { urlLecteurFacebook } from '../../lib/facebook'

/**
 * Dernier post Facebook. Le lecteur officiel dépose des cookies dès qu'il se
 * charge : on affiche d'abord un encart aux couleurs du site, et l'iframe
 * n'est créée qu'à la demande du visiteur (recommandation CNIL).
 */
export default function PostFacebook({ lien }) {
  const [charge, setCharge] = useState(false)
  const [largeur, setLargeur] = useState(500)
  const conteneur = useRef(null)
  const iframe = useRef(null)

  // Le bouton disparaît une fois le lecteur affiché : sans ce transfert de
  // focus, le clavier retombe sur <body> et Tab perd le fil de la page.
  useEffect(() => {
    if (charge) iframe.current?.focus()
  }, [charge])

  function afficher() {
    // clientWidth vaut 0 en jsdom (pas de mise en page) : on garde alors 500.
    setLargeur(conteneur.current?.clientWidth || 500)
    setCharge(true)
  }

  return (
    <div ref={conteneur} className="w-full max-w-[500px] mx-auto">
      {charge ? (
        <iframe
          ref={iframe}
          src={urlLecteurFacebook(lien, largeur)}
          title="Dernière publication Facebook d’Emmanuel Krieger"
          height="620"
          className="w-full rounded-2xl bg-white border-0"
          allow="encrypted-media; clipboard-write; picture-in-picture; web-share"
        />
      ) : (
        <div className="rounded-2xl bg-green-deep text-white p-8 md:p-10">
          <div className="font-inter text-white/60 text-xs tracking-widest uppercase mb-3">Facebook</div>
          <h3 className="font-poppins font-bold text-2xl leading-tight mb-4">
            Dernière actualité<br />sur Facebook
          </h3>
          <p className="font-inter text-white/70 text-sm leading-relaxed mb-8">
            Le post est hébergé par Facebook. En l’affichant, vous acceptez que Facebook
            dépose des cookies sur votre appareil.
          </p>
          <button
            type="button" onClick={afficher}
            className="px-7 py-3 rounded-full bg-green-accent text-white font-poppins font-bold text-sm
                       hover:bg-teal-accent transition-colors cursor-pointer"
          >
            Afficher le post
          </button>
        </div>
      )}
      <a
        href={lien} target="_blank" rel="noopener noreferrer"
        className="inline-block mt-4 font-inter text-sm text-green-accent hover:underline"
      >
        Voir sur Facebook ↗
      </a>
    </div>
  )
}
