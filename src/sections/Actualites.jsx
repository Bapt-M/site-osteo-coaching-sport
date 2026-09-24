import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useTextes } from '../content/ContenuProvider'
import { lirePhotos } from '../lib/supabase'
import { lireSaisieFacebook } from '../lib/facebook'
import { DEFAUTS } from '../content/registre'
import NuagePhotos from './actualites/NuagePhotos'
import PostFacebook from './actualites/PostFacebook'

const apparition = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } },
}

/**
 * Photos publiées par Manu et dernier post Facebook. Chaque bloc disparaît
 * s'il n'a rien à montrer ; sans aucun des deux, la section n'est pas rendue.
 */
export default function Actualites() {
  const textes = useTextes()
  const [photos, setPhotos] = useState(null)   // null = lecture en cours

  useEffect(() => {
    let vivant = true
    lirePhotos().then(p => { if (vivant) setPhotos(p) })
    return () => { vivant = false }
  }, [])

  const titre = textes['actu.titre']?.trim() || DEFAUTS['actu.titre']
  // Lien simple ou code « Intégrer » : seul le lien validé en est retenu.
  const facebook = lireSaisieFacebook(textes['actu.facebook.lien'])
  const aFacebook = facebook !== null
  // Pendant la lecture, on réserve la place du nuage pour éviter un saut de mise en page.
  const aPhotos = photos === null || photos.length > 0

  if (!aFacebook && !aPhotos) return null
  if (!aFacebook && photos === null) return null   // rien de sûr à montrer avant la réponse

  const deuxColonnes = aPhotos && aFacebook

  return (
    <section id="actualites" className="py-24 md:py-32 px-6 bg-site-bg overflow-x-clip">
      <div className="max-w-[1360px] mx-auto">
        <h2 className="font-poppins font-bold text-4xl md:text-5xl text-text-primary leading-tight mb-14">
          {titre}
        </h2>
        <motion.div
          data-testid="actualites-grille"
          className={`grid grid-cols-1 gap-16 items-center ${deuxColonnes ? 'desktop:grid-cols-2' : ''}`}
          variants={apparition} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }}
        >
          {aPhotos && (
            <div className={deuxColonnes ? '' : 'max-w-3xl w-full mx-auto'}>
              {photos
                ? <NuagePhotos photos={photos} />
                : <div className="w-full aspect-[5/4]" aria-hidden="true" />}
            </div>
          )}
          {aFacebook && <PostFacebook lien={facebook.lien} hauteur={facebook.hauteur ?? undefined} />}
        </motion.div>
      </div>
    </section>
  )
}
