import { motion } from 'framer-motion'

const HOURS = [
  { day: 'Lundi',    hours: '08:00 – 20:00' },
  { day: 'Mardi',    hours: '08:00 – 20:00' },
  { day: 'Mercredi', hours: '08:00 – 20:00' },
  { day: 'Jeudi',    hours: '08:00 – 20:00' },
  { day: 'Vendredi', hours: '08:00 – 18:00' },
  { day: 'Samedi',   hours: '08:00 – 12:00' },
]

const slideIn = (direction) => ({
  hidden: { opacity: 0, x: direction === 'left' ? -60 : 60 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } },
})

export default function Contact() {
  return (
    <section id="contact" className="py-24 md:py-36 px-6 bg-site-bg overflow-x-clip">
      <div className="max-w-[1360px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">

        {/* Image */}
        <motion.div
          className="relative rounded-2xl overflow-hidden aspect-[4/5] hidden md:block"
          variants={slideIn('left')}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <img src="/images/bureau.jpg" alt="Cabinet" className="w-full h-full object-cover" onError={e => e.target.style.display='none'} />
          <div className="absolute inset-0 bg-gradient-to-t from-site-bg/60 to-transparent" />
        </motion.div>

        {/* Infos */}
        <motion.div
          variants={slideIn('right')}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="flex flex-col gap-5"
        >
          <div>
            <div className="inline-block px-3 py-1 rounded-full bg-green-accent/10 text-green-deep font-poppins font-bold text-xs tracking-widest mb-5">
              CONTACT &amp; HORAIRES
            </div>
            <h2 className="font-poppins font-bold text-4xl md:text-5xl text-text-primary">
              Prendre rendez-vous
            </h2>
          </div>

          {/* Adresse & téléphone */}
          <div className="rounded-2xl border border-black/10 bg-black/[0.03] p-6 flex flex-col gap-4">
            <div className="flex items-start gap-3">
              <span className="text-green-deep mt-0.5 shrink-0">📍</span>
              <div>
                <p className="text-text-secondary/60 text-xs font-poppins uppercase tracking-widest mb-1">Adresse</p>
                <p className="text-text-primary font-inter text-sm leading-relaxed">34 Rue de Strasbourg<br />67117 Furdenheim</p>
              </div>
            </div>
            <div className="border-t border-black/10" />
            <div className="flex items-start gap-3">
              <span className="text-green-deep mt-0.5 shrink-0">📞</span>
              <div>
                <p className="text-text-secondary/60 text-xs font-poppins uppercase tracking-widest mb-1">Téléphone</p>
                <p className="text-text-primary font-inter text-sm">+33 6 XX XX XX XX</p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <motion.a
            href="#"
            className="flex w-full justify-center py-4 rounded-xl bg-green-accent text-white font-poppins font-bold text-base tracking-wide"
            whileHover={{ scale: 1.02, backgroundColor: 'var(--c-accent-light-hex)' }}
            whileTap={{ scale: 0.98 }}
          >
            Réserver en ligne →
          </motion.a>

          {/* Horaires */}
          <div className="rounded-2xl border border-black/10 bg-black/[0.03] overflow-hidden">
            <div className="px-6 py-4 border-b border-black/10">
              <p className="text-text-secondary/60 text-xs font-poppins uppercase tracking-widest">Horaires d'ouverture</p>
            </div>
            {HOURS.map((h, i) => (
              <motion.div
                key={h.day}
                className="flex justify-between items-center px-6 py-3 border-b border-black/[0.06] last:border-0"
                initial={{ opacity: 0, x: 16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05, duration: 0.4 }}
              >
                <span className="font-inter text-text-primary text-sm">{h.day}</span>
                <span className="font-poppins font-bold text-green-deep text-sm">{h.hours}</span>
              </motion.div>
            ))}
          </div>

        </motion.div>
      </div>
    </section>
  )
}
