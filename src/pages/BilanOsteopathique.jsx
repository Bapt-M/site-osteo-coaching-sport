import { motion } from 'framer-motion'
import usePageTitle from '../hooks/usePageTitle'

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
}

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

const STEPS = [
  {
    num: '01',
    title: 'Premier rendez-vous',
    body: "La première séance est consacrée à une ostéopathie complète et à l'évaluation de vos besoins réels. Bilan complet de votre état, de vos antécédents sportifs et de vos objectifs.",
  },
  {
    num: '02',
    title: 'Calendrier personnalisé',
    body: "À l'issue du bilan, un calendrier de suivi personnalisé est proposé — adapté à votre rythme, votre discipline et vos objectifs. Fréquence et durée définies ensemble.",
  },
  {
    num: '03',
    title: 'Forfait annuel',
    body: "Possibilité de mettre en place un forfait annuel selon les objectifs et la fréquence nécessaire. Une solution pour un suivi continu, optimisé et économique.",
  },
]

const GALERIE = [
  { src: '/images/bilan-manipulation.jpg', alt: 'Manipulation ostéopathique en cabinet' },
  { src: '/images/cabinet-2.jpg', alt: 'Séance ostéopathique' },
  { src: '/images/balneo.jpg', alt: 'Traitement manuel' },
  { src: '/images/manu_manipulation.jpg', alt: 'Consultation' },
  { src: '/images/cabinet-5.jpg', alt: 'Cabinet — vue 2' },
  { src: '/images/cabinet-6.jpg', alt: 'Suivi patient' },
]

export default function BilanOsteopathique() {
  usePageTitle('Bilan, traitement et soin ostéopathique')

  return (
    <main className="bg-site-bg">
      {/* Hero */}
      <section className="relative min-h-[55vh] flex items-end pb-20 overflow-hidden bg-green-deep">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-25"
          style={{ backgroundImage: 'url(/images/cabinet-1.jpg)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-green-deep/40 via-green-deep/60 to-green-deep" />
        <div className="relative z-10 max-w-[1360px] mx-auto px-6 md:px-12 pt-32">
          <motion.div variants={stagger} initial="hidden" animate="visible">
            <motion.div variants={fadeUp} className="inline-block px-3 py-1 rounded-full bg-green-accent/10 text-green-accent font-poppins font-bold text-xs tracking-widest mb-6">
              EN CABINET
            </motion.div>
            <motion.h1 variants={fadeUp} className="font-poppins font-black text-white text-5xl md:text-7xl leading-none mb-6">
              Bilan, traitement<br /><span className="text-green-accent">&amp; soin ostéopathique</span>
            </motion.h1>
            <motion.p variants={fadeUp} className="font-inter text-white/70 text-xl max-w-xl leading-relaxed">
              Une approche globale et individualisée du soin ostéopathique — en cabinet, adaptée à chaque patient.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* 3 étapes */}
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
              DÉROULEMENT
            </div>
            <h2 className="font-poppins font-bold text-text-primary text-4xl md:text-5xl">Comment ça fonctionne</h2>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {STEPS.map(step => (
              <motion.div
                key={step.num}
                variants={fadeUp}
                className="border border-text-primary/10 rounded-2xl p-8 hover:border-green-accent/40 transition-colors"
              >
                <div className="font-poppins font-black text-5xl text-green-accent/20 mb-4 leading-none">{step.num}</div>
                <h3 className="font-poppins font-bold text-text-primary text-xl mb-3">{step.title}</h3>
                <p className="font-inter text-text-secondary leading-relaxed">{step.body}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Galerie cabinet */}
      <section className="py-12 px-6 bg-green-deep/5">
        <div className="max-w-[1360px] mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {GALERIE.map(({ src, alt }) => (
              <motion.div
                key={src}
                className="rounded-xl overflow-hidden aspect-[4/3]"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                whileHover={{ scale: 1.02 }}
              >
                <img src={src} alt={alt} className="w-full h-full object-cover" onError={e => { e.target.parentElement.style.display = 'none' }} />
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
            <h2 className="font-poppins font-bold text-white text-4xl mb-6">Prendre rendez-vous</h2>
            <p className="font-inter text-white/60 text-lg mb-10 max-w-lg mx-auto">
              Le premier rendez-vous est une séance ostéopathique complète. Aucun bilan préalable nécessaire.
            </p>
            <motion.a
              href="/#contact"
              className="inline-block px-10 py-4 rounded-full bg-green-accent text-white font-poppins font-bold text-base"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
            >
              Prendre rendez-vous →
            </motion.a>
          </motion.div>
        </div>
      </section>
    </main>
  )
}
