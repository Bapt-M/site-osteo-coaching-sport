import { motion } from 'framer-motion'
import { COMPOSANTES, ATHLETES } from '../content/data/projet'
import { useTextes } from '../content/ContenuProvider'

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
}

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

export default function ProjetSportif() {
  const textes = useTextes()

  return (
    <main className="bg-site-bg">
      {/* Hero */}
      <section className="relative min-h-[55vh] flex items-end pb-20 overflow-hidden bg-green-deep">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{ backgroundImage: 'url(/images/julien-motz.jpg)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-green-deep/40 via-green-deep/60 to-green-deep" />
        <div className="relative z-10 max-w-[1360px] mx-auto px-6 md:px-12 pt-32">
          <motion.div variants={stagger} initial="hidden" animate="visible">
            <motion.div variants={fadeUp} className="inline-block px-3 py-1 rounded-full bg-green-accent/10 text-green-accent font-poppins font-bold text-xs tracking-widest mb-6">
              {textes['projet.surtitre']}
            </motion.div>
            <motion.h1 variants={fadeUp} className="font-poppins font-black text-white text-5xl md:text-7xl leading-none mb-6">
              {textes['projet.titre1']}<br /><span className="text-green-accent">{textes['projet.titre2']}</span>
            </motion.h1>
            <motion.p variants={fadeUp} className="font-inter text-white/70 text-xl max-w-xl leading-relaxed">
              {textes['projet.chapo']}
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Citation */}
      <section className="py-16 px-6 bg-green-deep/5">
        <div className="max-w-[900px] mx-auto text-center">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="font-poppins font-bold text-text-primary text-2xl md:text-3xl italic leading-relaxed"
          >
            "Ne dit-on pas que qui peut le plus peut le moins…"
          </motion.p>
        </div>
      </section>

      {/* 6 composantes */}
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
              {textes['projet.prise.surtitre']}
            </div>
            <h2 className="font-poppins font-bold text-text-primary text-4xl md:text-5xl">
              Une approche<br />globale et individualisée
            </h2>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {COMPOSANTES.map((c, i) => (
              <motion.div
                key={c.label}
                variants={fadeUp}
                className="border border-text-primary/10 rounded-2xl p-8 hover:border-green-accent/40 transition-colors"
              >
                <div className="font-poppins font-black text-4xl text-green-accent/15 mb-3 leading-none">
                  {String(i + 1).padStart(2, '0')}
                </div>
                <h3 className="font-poppins font-bold text-text-primary text-xl mb-2">{c.label}</h3>
                <p className="font-inter text-text-secondary leading-relaxed">{c.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Athlètes */}
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
              {textes['projet.athletes.surtitre']}
            </div>
            <h2 className="font-poppins font-bold text-white text-4xl">
              Julien Motz, Samir Baala,<br /><span className="text-green-accent">et bien d'autres…</span>
            </h2>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-3 gap-4"
          >
            {ATHLETES.map(a => (
              <motion.div
                key={a.nom}
                variants={fadeUp}
                className="relative rounded-2xl overflow-hidden aspect-[3/4]"
              >
                {a.img ? (
                  <img src={a.img} alt={a.nom} className="w-full h-full object-cover" onError={e => { e.target.style.opacity = '0' }} />
                ) : (
                  <div className="w-full h-full bg-white/5" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <div className="font-poppins font-bold text-white text-base">{a.nom}</div>
                  <div className="font-inter text-white/50 text-sm mt-0.5">{a.detail}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-8 text-center font-inter text-white/40 text-sm"
          >
            Les tarifs sont variables, définis en fonction du niveau d'accompagnement demandé et adaptés individuellement à chaque projet.
          </motion.p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-[1360px] mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="font-poppins font-bold text-text-primary text-4xl mb-4">Vous avez un projet ?</h2>
            <p className="font-inter text-text-secondary text-lg mb-10 max-w-lg mx-auto">
              Tout commence par un bilan ostéopathique complet et un rendez-vous de définition d'objectifs.
            </p>
            <motion.a
              href="/#contact"
              className="inline-block px-10 py-4 rounded-full bg-green-deep text-white font-poppins font-bold text-base hover:bg-green-accent hover:text-white transition-colors"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
            >
              {textes['projet.bouton']}
            </motion.a>
          </motion.div>
        </div>
      </section>
    </main>
  )
}
