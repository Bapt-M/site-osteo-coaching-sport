import { motion } from 'framer-motion'

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
}

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

const FORMATS = [
  {
    title: 'Bien-être au travail',
    tags: ['QVT', 'Prévention TMS', 'Journées santé'],
    desc: "Interventions sur site pour des séances d'ostéopathie individuelles ou collectives. Prévention des troubles musculo-squelettiques, amélioration des conditions de travail.",
    img: '/images/terrain-1.jpg',
  },
  {
    title: 'Événementiels',
    tags: ['Co-working', 'Team building', 'Conférences'],
    desc: "Présence lors de vos événements d'entreprise — journées santé, espaces bien-être, moments de cohésion. Un service distinctif pour vos collaborateurs.",
    img: '/images/terrain-2.jpg',
  },
  {
    title: 'Club Med',
    tags: ['Villages Club Med', 'Sur disponibilités'],
    desc: "Interventions et accompagnements au sein de différents villages Club Med. Format à définir lors d'un entretien préalable selon le village et les dates.",
    img: '/images/malaga.jpg',
  },
]

export default function InterventionEntreprise() {
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
            <motion.div variants={fadeUp} className="inline-block px-3 py-1 rounded-full bg-green-accent/10 text-green-accent font-syne font-bold text-xs tracking-widest mb-6">
              ENTREPRISE
            </motion.div>
            <motion.h1 variants={fadeUp} className="font-syne font-black text-white text-5xl md:text-7xl leading-none mb-6">
              Intervention<br /><span className="text-green-accent">en entreprise</span>
            </motion.h1>
            <motion.p variants={fadeUp} className="font-inter text-white/70 text-xl max-w-xl leading-relaxed">
              Ostéopathie directement sur site — pour le bien-être de vos équipes, la prévention des TMS et des événements santé mémorables.
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
            <div className="inline-block px-3 py-1 rounded-full bg-green-accent/10 text-green-deep font-syne font-bold text-xs tracking-widest mb-4">
              FORMATS
            </div>
            <h2 className="font-syne font-bold text-text-primary text-4xl md:text-5xl">Trois façons d'intervenir</h2>
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
                      <span key={t} className="px-3 py-1 rounded-full text-xs font-syne font-bold bg-green-accent/10 text-green-deep">{t}</span>
                    ))}
                  </div>
                  <h3 className="font-syne font-bold text-text-primary text-2xl md:text-3xl mb-4">{f.title}</h3>
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
            <h2 className="font-syne font-bold text-white text-4xl mb-4">Un projet en entreprise ?</h2>
            <p className="font-inter text-white/60 text-lg mb-10 max-w-lg mx-auto">
              Les modalités sont définies lors d'un entretien préalable, selon vos besoins et votre contexte.
            </p>
            <motion.a
              href="/#contact"
              className="inline-block px-10 py-4 rounded-full bg-green-accent text-white font-syne font-bold text-base"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
            >
              Nous contacter →
            </motion.a>
          </motion.div>
        </div>
      </section>
    </main>
  )
}
