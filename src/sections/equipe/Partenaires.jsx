import { motion } from 'framer-motion'
import { useFiches } from '../../content/useFiches'
import { useTextes } from '../../content/ContenuProvider'

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
}

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

const paragraphes = (texte) => texte.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean)

/**
 * Professionnels de santé et spécialistes partenaires (fiches `partenaire`).
 * La première image sert de portrait, les suivantes s'affichent en vignettes.
 * Rien ne s'affiche tant qu'aucune fiche n'existe.
 */
export default function Partenaires() {
  const textes = useTextes()
  const partenaires = (useFiches() ?? []).filter(f => f.type === 'partenaire')
  if (!partenaires.length) return null

  return (
    <section aria-labelledby="titre-partenaires" className="pb-24 px-6">
      <div className="max-w-[1360px] mx-auto pt-24 border-t border-text-primary/10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mb-16 max-w-2xl"
        >
          <div className="inline-block px-3 py-1 rounded-full bg-green-accent/10 text-green-deep font-poppins font-bold text-xs tracking-widest mb-4">
            {textes['suivi.partenaires.surtitre']}
          </div>
          <h2 id="titre-partenaires" className="font-poppins font-bold text-text-primary text-4xl md:text-5xl leading-tight mb-6">
            {textes['suivi.partenaires.titre1']}<br /><span className="gradient-text">{textes['suivi.partenaires.titre2']}</span>
          </h2>
          {textes['suivi.partenaires.texte'] && (
            <p className="font-inter text-text-secondary text-lg leading-relaxed">{textes['suivi.partenaires.texte']}</p>
          )}
        </motion.div>

        <motion.ul
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {partenaires.map(p => {
            const [portrait, ...autres] = p.images
            return (
              <motion.li
                key={p.id}
                variants={fadeUp}
                className="flex flex-col border border-text-primary/10 rounded-2xl overflow-hidden hover:border-green-accent/40 transition-colors"
              >
                <div className="aspect-[4/3] bg-green-deep/5">
                  {portrait && (
                    <img src={portrait.url} alt={portrait.legende || p.nom} loading="lazy" className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="p-6 flex-1">
                  <h3 className="font-poppins font-bold text-text-primary text-xl">{p.nom}</h3>
                  {p.fonction && <p className="font-inter text-green-accent text-sm font-medium mt-1">{p.fonction}</p>}
                  {paragraphes(p.texte).map((t, i) => (
                    <p key={i} className="font-inter text-text-secondary leading-relaxed mt-3">{t}</p>
                  ))}
                  {autres.length > 0 && (
                    <div className="flex gap-2 mt-5">
                      {autres.map(img => (
                        <img key={img.url} src={img.url} alt={img.legende || ''} loading="lazy"
                             className="w-16 h-16 rounded-lg object-cover bg-green-deep/5" />
                      ))}
                    </div>
                  )}
                </div>
              </motion.li>
            )
          })}
        </motion.ul>
      </div>
    </section>
  )
}
