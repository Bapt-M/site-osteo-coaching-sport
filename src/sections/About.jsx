import { motion } from 'framer-motion'
import { useTextes } from '../content/ContenuProvider'

const slideIn = (direction) => ({
  hidden: { opacity: 0, x: direction === 'left' ? -60 : 60 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } },
})

export default function About() {
  const textes = useTextes()
  return (
    <section id="about" className="py-24 md:py-36 px-6 bg-site-bg overflow-x-clip">
      <div className="max-w-[1360px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
        {/* Image */}
        <motion.div
          className="relative"
          variants={slideIn('left')}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
        >
          <div className="relative rounded-2xl overflow-hidden aspect-[4/5]">
            <img
              src="/images/manu-padel-square.jpg"
              alt="Emmanuel Krieger au Padel Square"
              className="w-full h-full object-cover"
              onError={e => { e.target.style.display = 'none' }}
            />
            <div className="absolute bottom-6 left-6 right-6 glass rounded-xl p-4">
              <div className="font-poppins font-bold text-text-primary">Emmanuel Krieger</div>
              <div className="font-inter text-sm text-text-secondary mt-0.5">{textes['apropos.legende']}</div>
            </div>
          </div>
          <div className="absolute -bottom-4 -right-4 w-32 h-32 rounded-full bg-green-accent/10 blur-2xl -z-10" />
        </motion.div>

        {/* Texte */}
        <motion.div
          variants={slideIn('right')}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
        >
          <div className="inline-block px-3 py-1 rounded-full bg-green-accent/10 text-green-deep font-poppins font-bold text-xs tracking-widest mb-6">
            {textes['apropos.surtitre']}
          </div>
          <h2 className="font-poppins font-bold text-4xl md:text-5xl text-text-primary leading-tight mb-6">
            {textes['apropos.titre1']}<br /><span className="gradient-text">{textes['apropos.titre2']}</span>
          </h2>
          <p className="font-inter text-text-secondary text-lg leading-relaxed mb-4">
            {textes['apropos.texte1']}
          </p>
          <p className="font-inter text-text-secondary text-lg leading-relaxed mb-8">
            {textes['apropos.texte2']}
          </p>
          <motion.a
            href="#services"
            className="inline-flex items-center gap-2 font-poppins font-bold text-green-deep border-b-2 border-green-accent pb-0.5"
            whileHover={{ x: 4 }}
            transition={{ duration: 0.2 }}
          >
            En savoir plus →
          </motion.a>
        </motion.div>
      </div>
    </section>
  )
}
