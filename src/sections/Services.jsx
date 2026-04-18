import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

const SERVICES = [
  { num: 1, title: 'Ostéopathie du sport', body: "Traitement des douleurs musculaires, articulaires et tendineuses liées à la pratique sportive.", href: '/bilan-osteopathique' },
  { num: 2, title: 'Coaching personnalisé', body: "Programmes d'entraînement sur mesure adaptés à vos objectifs et votre condition physique.", href: '/projet-sportif' },
  { num: 3, title: 'Préparation physique', body: "Renforcement, mobilité et endurance pour atteindre votre potentiel maximum.", href: '/projet-sportif' },
  { num: 4, title: 'Suivi de performance', body: "Analyse et suivi régulier de vos progrès avec ajustement continu des programmes.", href: '/suivi-sportif' },
]

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
}

export default function Services() {
  const [open, setOpen] = useState(null)

  return (
    <section id="services" className="py-24 md:py-36 px-6 bg-green-deep">
      <div className="max-w-[1360px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-block px-3 py-1 rounded-full bg-green-accent/10 text-green-accent font-syne font-bold text-xs tracking-widest mb-6">
              PRESTATIONS
            </div>
            <h2 className="font-syne font-bold text-4xl md:text-5xl text-white leading-tight mb-4">
              Mes <span className="gradient-text">services</span>
            </h2>
            <p className="font-inter text-white/60 text-lg mb-12">
              Une gamme complète de soins et d'accompagnement adaptée aux sportifs de tous niveaux.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {SERVICES.map(service => (
              <motion.div key={service.num} variants={itemVariants}>
                <ServiceItem
                  service={service}
                  isOpen={open === service.num}
                  onToggle={() => setOpen(open === service.num ? null : service.num)}
                />
              </motion.div>
            ))}
          </motion.div>
        </div>

        <motion.div
          className="relative rounded-2xl overflow-hidden aspect-[3/4] hidden md:block"
          initial={{ opacity: 0, x: 60 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <img src="/images/OSTEO-pic-9.jpg" alt="Ostéopathie et coaching" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-green-deep/80 to-transparent" />
          <motion.a
            href="#contact"
            className="absolute bottom-8 left-8 right-8 py-4 rounded-xl bg-green-accent text-white font-syne font-bold text-center tracking-wide"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Prendre rendez-vous →
          </motion.a>
        </motion.div>
      </div>
    </section>
  )
}

function ServiceItem({ service, isOpen, onToggle }) {
  const navigate = useNavigate()

  return (
    <div className="relative border-t border-white/10 py-5 overflow-hidden">
      <span className="absolute right-0 top-0 font-syne font-bold text-8xl text-white/[0.04] leading-none select-none pointer-events-none">
        {service.num}
      </span>

      <motion.button
        className="w-full flex items-center justify-between text-left gap-4"
        onClick={onToggle}
        whileTap={{ scale: 0.99 }}
      >
        <div className="flex items-center gap-4">
          <span className="font-syne font-bold text-green-accent text-sm w-5">{service.num}</span>
          <span className="font-syne font-bold text-white text-lg md:text-xl">{service.title}</span>
        </div>
        <motion.span
          className="text-green-accent font-bold text-xl shrink-0"
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.2 }}
        >
          +
        </motion.span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <p className="font-inter text-white/60 text-base mt-3 pl-9 leading-relaxed">
              {service.body}
            </p>
            <motion.a
              href={service.href}
              onClick={e => { e.preventDefault(); navigate(service.href) }}
              className="inline-block mt-3 ml-9 font-syne font-bold text-green-accent text-sm hover:underline"
              whileHover={{ x: 4 }}
              transition={{ duration: 0.2 }}
            >
              Découvrir →
            </motion.a>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
