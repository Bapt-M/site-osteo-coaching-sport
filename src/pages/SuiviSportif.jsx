import { motion } from 'framer-motion'
import usePageTitle from '../hooks/usePageTitle'
import { MODALITES, REFERENCES } from '../content/data/suivi'
import { useTextes } from '../content/ContenuProvider'

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
}

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
}

export default function SuiviSportif() {
  usePageTitle('Suivi des sportifs de haut niveau')
  const textes = useTextes()

  return (
    <main className="bg-site-bg">
      {/* Hero */}
      <section className="relative min-h-[55vh] flex items-end pb-20 overflow-hidden bg-green-deep">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{ backgroundImage: 'url(/images/action-1.jpg)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-green-deep/40 via-green-deep/60 to-green-deep" />
        <div className="relative z-10 max-w-[1360px] mx-auto px-6 md:px-12 pt-32">
          <motion.div variants={stagger} initial="hidden" animate="visible">
            <motion.div variants={fadeUp} className="inline-block px-3 py-1 rounded-full bg-green-accent/10 text-green-accent font-poppins font-bold text-xs tracking-widest mb-6">
              {textes['suivi.surtitre']}
            </motion.div>
            <motion.h1 variants={fadeUp} className="font-poppins font-black text-white text-5xl md:text-7xl leading-none mb-6" aria-label="suivi sportif">
              {textes['suivi.titre1']}<br /><span className="text-green-accent">{textes['suivi.titre2']}</span>
            </motion.h1>
            <motion.p variants={fadeUp} className="font-inter text-white/70 text-xl max-w-xl leading-relaxed">
              {textes['suivi.chapo']}
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Présentation + Modalités */}
      <section className="py-24 px-6 overflow-x-clip">
        <div className="max-w-[1360px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

          {/* Texte source */}
          <motion.div
            initial={{ opacity: 0, x: -32 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="inline-block px-3 py-1 rounded-full bg-green-accent/10 text-green-deep font-poppins font-bold text-xs tracking-widest mb-6">
              {textes['suivi.approche.surtitre']}
            </div>
            <h2 className="font-poppins font-bold text-text-primary text-4xl md:text-5xl mb-8 leading-tight">
              Un suivi ostéopathique<br />spécifique
            </h2>
            <p className="font-inter text-text-secondary text-lg leading-relaxed mb-6">
              {textes['suivi.approche.titre']}
            </p>
            <p className="font-inter text-text-secondary text-lg leading-relaxed">
              {textes['suivi.approche.texte']}
            </p>
          </motion.div>

          {/* Modalités */}
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="flex flex-col gap-4"
          >
            {MODALITES.map((m) => (
              <motion.div
                key={m.title}
                variants={fadeUp}
                className="flex items-center gap-5 border border-text-primary/10 rounded-2xl px-7 py-5 hover:border-green-accent/40 transition-colors"
              >
                <span className="text-2xl shrink-0">{m.icon}</span>
                <span className="font-poppins font-semibold text-text-primary text-lg">{m.title}</span>
              </motion.div>
            ))}
          </motion.div>

        </div>
      </section>

      {/* Avant / Après */}
      <section className="py-24 px-6 bg-green-deep/5">
        <div className="max-w-[1360px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="mb-16"
          >
            <div className="inline-block px-3 py-1 rounded-full bg-green-accent/10 text-green-deep font-poppins font-bold text-xs tracking-widest mb-4">
              {textes['suivi.resultats.surtitre']}
            </div>
            <h2 className="font-poppins font-bold text-text-primary text-4xl md:text-5xl leading-tight">
              {textes['suivi.resultats.titre']}
            </h2>
          </motion.div>

          <div className="grid grid-cols-2 gap-6 max-w-2xl">
            {[
              { src: '/images/avant01.jpg', label: 'Avant' },
              { src: '/images/apres01.jpg', label: 'Après' },
            ].map(({ src, label }) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="relative rounded-2xl overflow-hidden"
              >
                <img src={src} alt={label} className="w-full object-cover" />
                <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/50 backdrop-blur-sm">
                  <span className="font-poppins font-bold text-white text-sm">{label}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Références — texte complet */}
      <section className="py-24 px-6 bg-green-deep">
        <div className="max-w-[1360px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="mb-16"
          >
            <div className="inline-block px-3 py-1 rounded-full bg-green-accent/10 text-green-accent font-poppins font-bold text-xs tracking-widest mb-4">
              {textes['suivi.refs.surtitre']}
            </div>
            <h2 className="font-poppins font-bold text-white text-4xl md:text-5xl leading-tight">
              {textes['suivi.refs.titre1']}<br /><span className="text-green-accent">{textes['suivi.refs.titre2']}</span>
            </h2>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            {REFERENCES.map((ref, i) => (
              <motion.div
                key={ref.nom}
                variants={fadeUp}
                className="rounded-2xl overflow-hidden"
              >
                {/* Image */}
                <div className="relative aspect-[4/3]">
                  <img
                    src={ref.img}
                    alt={ref.nom}
                    className="w-full h-full object-cover block"
                    onError={e => { e.target.style.opacity = 0.1 }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 px-6 pb-4">
                    <div className="font-poppins font-bold text-white text-xl">{textes[`reference.${i}.nom`]}</div>
                  </div>
                </div>
                {/* Texte complet */}
                <div className="bg-white/5 border border-white/10 rounded-b-2xl px-6 py-5">
                  <p className="font-inter text-white/75 text-sm leading-relaxed">{textes[`reference.${i}.texte`]}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </main>
  )
}
