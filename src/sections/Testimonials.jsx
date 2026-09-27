import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useTextes } from '../content/ContenuProvider'
import { useFiches } from '../content/useFiches'
import { enParagraphes } from '../content/registre'

// Extraits des témoignages reçus. Le texte intégral est sur /histoire#temoignages.
const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
}

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
}

const DEGRADES = ['from-green-accent to-teal-accent', 'from-cyan-accent to-teal-accent', 'from-teal-accent to-green-accent']

/** « Matthieu LORENTZ » → « ML ». */
export const initiales = (nom) =>
  nom.split(/\s+/).filter(Boolean).slice(0, 2).map(m => m[0].toUpperCase()).join('')

/** Coupe au dernier espace avant `max` caractères et ajoute « … ». */
export function tronquer(texte, max = 220) {
  if (texte.length <= max) return texte
  const coupe = texte.slice(0, max)
  return coupe.slice(0, coupe.lastIndexOf(' ') > 0 ? coupe.lastIndexOf(' ') : max).trimEnd() + '…'
}

/** Phrase mise en avant, ou faute de titre, le premier paragraphe du texte. */
const citation = (t) => t.titre || (enParagraphes(t.texte)[0] ?? '')

export default function Testimonials() {
  const textes = useTextes()
  const temoignages = (useFiches() ?? []).filter(f => f.type === 'temoignage').slice(0, 3)
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

        {temoignages.length > 0 && (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
          >
            {temoignages.map((t, i) => (
              <motion.div
                key={t.id}
                variants={cardVariants}
                whileHover={{ y: -8, boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}
                className="rounded-2xl p-8 cursor-default border border-white/15 bg-white/[0.05]"
              >
                <div className="text-5xl font-poppins font-bold text-cyan-accent/40 leading-none mb-4">"</div>
                <p className="font-inter text-white/75 text-base leading-relaxed mb-6">{tronquer(citation(t))}</p>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${DEGRADES[i % 3]} flex items-center justify-center text-white font-poppins font-bold text-xs shrink-0`}>
                    {initiales(t.nom)}
                  </div>
                  <div>
                    <div className="font-poppins font-bold text-white text-sm">{t.nom}</div>
                    <div className="font-inter text-white/50 text-xs">{t.fonction}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

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
