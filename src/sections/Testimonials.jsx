import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useTextes } from '../content/ContenuProvider'
import { TESTIMONIALS } from '../content/data/temoignages'

// Extraits des témoignages reçus. Le texte intégral est sur /histoire#temoignages.
const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
}

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
}

export default function Testimonials() {
  const textes = useTextes()
  return (
    <section id="testimonials" className="py-24 md:py-36 px-6 bg-green-deep">
      <div className="max-w-[1360px] mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-block px-3 py-1 rounded-full bg-green-accent/20 text-cyan-accent font-poppins font-bold text-xs tracking-widest mb-4">
            {textes['temoins.surtitre']}
          </div>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
        >
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.author}
              variants={cardVariants}
              whileHover={{ y: -8, boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}
              className="rounded-2xl p-8 cursor-default border border-white/15 bg-white/[0.05]"
            >
              <div className="text-5xl font-poppins font-bold text-cyan-accent/40 leading-none mb-4">"</div>
              <p className="font-inter text-white/75 text-base leading-relaxed mb-6">{textes[`temoin.${i}.text`]}</p>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.gradient} flex items-center justify-center text-white font-poppins font-bold text-xs shrink-0`}>
                  {t.initial}
                </div>
                <div>
                  <div className="font-poppins font-bold text-white text-sm">{textes[`temoin.${i}.author`]}</div>
                  <div className="font-inter text-white/50 text-xs">{textes[`temoin.${i}.role`]}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Vers les hommages et témoignages de la page Histoire */}
        <motion.div
          className="mt-16 pt-12 border-t border-white/10 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="font-inter text-white/60 text-lg mb-8 max-w-2xl mx-auto">
            {textes['temoins.amorce']}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/histoire#temoignages"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-green-accent text-white font-poppins font-bold tracking-wide hover:bg-teal-accent transition-colors"
            >
              {textes['temoins.lien1']}
            </Link>
            <Link
              to="/histoire#hommages"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full border border-white/25 text-white font-poppins font-bold tracking-wide hover:bg-white/10 transition-colors"
            >
              {textes['temoins.lien2']}
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
