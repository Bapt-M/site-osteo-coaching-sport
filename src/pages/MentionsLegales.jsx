import { motion } from 'framer-motion'
import { useTextes } from '../content/ContenuProvider'
import { enParagraphes } from '../content/registre'
import { SECTIONS, PARAGRAPHES, A_COMPLETER } from '../content/data/mentions'

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
}

export default function MentionsLegales() {
  const textes = useTextes()

  return (
    <main className="bg-site-bg">
      {/* Bandeau */}
      <section className="bg-green-deep px-6 pt-32 pb-16">
        <div className="max-w-3xl mx-auto">
          <motion.div initial="hidden" animate="visible" variants={fadeUp}>
            <div className="inline-block px-3 py-1 rounded-full bg-green-accent/10 text-green-accent font-poppins font-bold text-xs tracking-widest mb-6">
              {textes['ml.surtitre']}
            </div>
            <h1 className="font-poppins font-black text-white text-4xl md:text-6xl leading-none">
              {textes['ml.titre']}
            </h1>
          </motion.div>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-6 py-16 md:py-24">

        {/* Blocs d'identification */}
        {SECTIONS.map(section => (
          <motion.section
            key={section.id}
            className="mb-12"
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
          >
            <h2 className="font-poppins font-bold text-text-primary text-xl mb-5 pb-2 border-b border-black/10">
              {textes[`ml.section.${section.id}`]}
            </h2>
            <dl className="space-y-3">
              {section.lignes.map(({ cle, libelle }) => {
                const valeur = textes[cle]
                const manquant = valeur === A_COMPLETER
                return (
                  <div key={cle} className="flex flex-col sm:flex-row sm:gap-6">
                    <dt className="font-inter text-text-secondary/70 text-sm sm:w-56 sm:shrink-0">{libelle}</dt>
                    <dd className={`font-inter text-sm whitespace-pre-line ${
                      manquant ? 'text-amber-700 bg-amber-50 px-2 py-0.5 rounded' : 'text-text-primary'
                    }`}>
                      {valeur}
                    </dd>
                  </div>
                )
              })}
            </dl>
          </motion.section>
        ))}

        {/* Blocs rédigés */}
        {PARAGRAPHES.map(({ cle, id }) => (
          <motion.section
            key={cle}
            className="mb-12"
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
          >
            <h2 className="font-poppins font-bold text-text-primary text-xl mb-5 pb-2 border-b border-black/10">
              {textes[`${cle}.titre`]}
            </h2>
            <div className="space-y-4">
              {enParagraphes(textes[cle]).map((p, i) => (
                <p key={i} className="font-inter text-text-secondary leading-relaxed">{p}</p>
              ))}
            </div>
          </motion.section>
        ))}

        <p className="font-inter text-text-secondary/60 text-sm pt-6 border-t border-black/10">
          {textes['ml.maj']}
        </p>
      </div>
    </main>
  )
}
