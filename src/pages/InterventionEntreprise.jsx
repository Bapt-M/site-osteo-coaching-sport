import { motion } from 'framer-motion'
import usePageTitle from '../hooks/usePageTitle'
import { FORMATS } from '../content/data/entreprise'
import { useTextes } from '../content/ContenuProvider'

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
}

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

export default function InterventionEntreprise() {
  usePageTitle('Intervention en entreprise')
  const textes = useTextes()

  return (
    <main className="bg-site-bg">
      {/* Hero */}
      <section className="relative min-h-[55vh] flex items-end pb-20 overflow-hidden bg-green-deep">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{ backgroundImage: 'url(/images/terrain-1.jpg)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-green-deep/40 via-green-deep/60 to-green-deep" />
        <div className="relative z-10 max-w-[1360px] mx-auto px-6 md:px-12 pt-32">
          <motion.div variants={stagger} initial="hidden" animate="visible">
            <motion.div variants={fadeUp} className="inline-block px-3 py-1 rounded-full bg-green-accent/10 text-green-accent font-poppins font-bold text-xs tracking-widest mb-6">
              {textes['entreprise.surtitre']}
            </motion.div>
            <motion.h1 variants={fadeUp} className="font-poppins font-black text-white text-5xl md:text-7xl leading-none mb-6">
              {textes['entreprise.titre1']}<br /><span className="text-green-accent">{textes['entreprise.titre2']}</span>
            </motion.h1>
            <motion.p variants={fadeUp} className="font-inter text-white/70 text-xl max-w-xl leading-relaxed">
              {textes['entreprise.chapo']}
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* 3 formats */}
      <section className="py-24 px-6">
        <div className="max-w-[1360px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="mb-16"
          >
            <div className="inline-block px-3 py-1 rounded-full bg-green-accent/10 text-green-deep font-poppins font-bold text-xs tracking-widest mb-4">
              {textes['entreprise.formats.surtitre']}
            </div>
            <h2 className="font-poppins font-bold text-text-primary text-4xl md:text-5xl">Trois façons d'intervenir</h2>
          </motion.div>

          <div className="space-y-16">
            {FORMATS.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.7 }}
                className={`flex flex-col md:flex-row gap-12 items-center ${i % 2 === 1 ? 'md:flex-row-reverse' : ''}`}
              >
                <div className="flex-1">
                  <div className="flex flex-wrap gap-2 mb-4">
                    {f.tags.map(t => (
                      <span key={t} className="px-3 py-1 rounded-full text-xs font-poppins font-bold bg-green-accent/10 text-green-deep">{t}</span>
                    ))}
                  </div>
                  <h3 className="font-poppins font-bold text-text-primary text-2xl md:text-3xl mb-4">{f.title}</h3>
                  <p className="font-inter text-text-secondary text-lg leading-relaxed">{f.desc}</p>
                </div>
                <div className="flex-1 rounded-2xl overflow-hidden aspect-[16/9]">
                  <img src={f.img} alt={f.title} className="w-full h-full object-cover" onError={e => { e.target.parentElement.style.background = 'rgb(var(--c-deep) / 0.13)' }} />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 bg-green-deep">
        <div className="max-w-[1360px] mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="font-poppins font-bold text-white text-4xl mb-4">Un projet en entreprise ?</h2>
            <p className="font-inter text-white/60 text-lg mb-10 max-w-lg mx-auto">
              Les modalités sont définies lors d'un entretien préalable, selon vos besoins et votre contexte.
            </p>
            <motion.a
              href="/#contact"
              className="inline-block px-10 py-4 rounded-full bg-green-accent text-white font-poppins font-bold text-base"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
            >
              {textes['entreprise.cta.bouton']}
            </motion.a>
          </motion.div>
        </div>
      </section>
    </main>
  )
}
