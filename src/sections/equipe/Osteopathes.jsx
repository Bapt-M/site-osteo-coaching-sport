import { motion } from 'framer-motion'
import { useFiches } from '../../content/useFiches'
import { useTextes } from '../../content/ContenuProvider'

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
}

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
}

const paragraphes = (texte) => texte.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean)

/**
 * Les ostéopathes du cabinet (fiches `osteopathe`) : une photo et leur
 * vision de l'ostéopathie. Rien ne s'affiche tant qu'aucune fiche n'existe.
 */
export default function Osteopathes() {
  const textes = useTextes()
  const osteopathes = (useFiches() ?? []).filter(f => f.type === 'osteopathe')
  if (!osteopathes.length) return null

  return (
    <section aria-labelledby="titre-osteopathes" className="py-24 px-6 bg-green-deep/5">
      <div className="max-w-[1360px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mb-16"
        >
          <div className="inline-block px-3 py-1 rounded-full bg-green-accent/10 text-green-deep font-poppins font-bold text-xs tracking-widest mb-4">
            {textes['bilan.equipe.surtitre']}
          </div>
          <h2 id="titre-osteopathes" className="font-poppins font-bold text-text-primary text-4xl md:text-5xl leading-tight">
            {textes['bilan.equipe.titre1']}<br /><span className="gradient-text">{textes['bilan.equipe.titre2']}</span>
          </h2>
        </motion.div>

        <motion.ul
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className={`grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 ${osteopathes.length > 2 ? 'xl:grid-cols-3' : ''}`}
        >
          {osteopathes.map(o => {
            const photo = o.images[0]
            return (
              <motion.li key={o.id} variants={fadeUp} className="flex flex-col sm:flex-row md:flex-col lg:flex-row gap-6 lg:gap-8">
                <div className="shrink-0 w-full sm:w-56 md:w-full lg:w-56 aspect-[4/5] rounded-2xl overflow-hidden bg-green-deep/10">
                  {photo && (
                    <img src={photo.url} alt={photo.legende || o.nom} loading="lazy" className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="min-w-0">
                  <h3 className="font-poppins font-bold text-text-primary text-2xl">{o.nom}</h3>
                  {o.fonction && <p className="font-inter text-green-accent font-medium mt-1">{o.fonction}</p>}
                  <div className="mt-5 pl-5 border-l-2 border-green-accent/30 space-y-4">
                    {paragraphes(o.texte).map((p, i) => (
                      <p key={i} className="font-inter text-text-secondary leading-relaxed">{p}</p>
                    ))}
                  </div>
                </div>
              </motion.li>
            )
          })}
        </motion.ul>
      </div>
    </section>
  )
}
