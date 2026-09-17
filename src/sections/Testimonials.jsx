import { motion } from 'framer-motion'

const TESTIMONIALS = [
  {
    text: "Après des mois de douleurs au dos, Emmanuel a trouvé la solution en quelques séances. Son approche combinée ostéo + coaching est vraiment unique.",
    author: 'Michel Perraud', role: 'Coureur amateur', initial: 'M',
    gradient: 'from-green-accent to-teal-accent',
  },
  {
    text: "Le programme de coaching personnalisé a complètement transformé ma préparation. Je n'ai jamais été aussi performant sur mes compétitions.",
    author: 'Sophie Martin', role: 'Triathlète', initial: 'S',
    gradient: 'from-cyan-accent to-teal-accent',
  },
  {
    text: "Je recommande vivement. La prise en charge est complète, professionnelle et vraiment adaptée aux sportifs. Résultats visibles dès la première séance.",
    author: 'Thomas Lebrun', role: 'Footballeur', initial: 'T',
    gradient: 'from-teal-accent to-green-accent',
  },
]

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
}

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
}

export default function Testimonials() {
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
            TÉMOIGNAGES
          </div>
          <h2 className="font-poppins font-bold text-4xl md:text-5xl text-white">
            Ce que disent mes patients
          </h2>
          <p className="font-inter text-white/60 text-lg mt-3">
            Des résultats concrets, des vies transformées
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
        >
          {TESTIMONIALS.map(t => (
            <motion.div
              key={t.author}
              variants={cardVariants}
              whileHover={{ y: -8, boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}
              className="rounded-2xl p-8 cursor-default border border-white/15 bg-white/[0.05]"
            >
              <div className="text-5xl font-poppins font-bold text-cyan-accent/40 leading-none mb-4">"</div>
              <p className="font-inter text-white/75 text-base leading-relaxed mb-6">{t.text}</p>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.gradient} flex items-center justify-center text-white font-poppins font-bold text-sm shrink-0`}>
                  {t.initial}
                </div>
                <div>
                  <div className="font-poppins font-bold text-white text-sm">{t.author}</div>
                  <div className="font-inter text-white/50 text-xs">{t.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
