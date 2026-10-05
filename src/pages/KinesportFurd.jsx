import { motion } from 'framer-motion'
import { PUBLICS, ETAPES, ESPACES } from '../content/data/remise'
import { useTextes } from '../content/ContenuProvider'

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
}

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
}

function Pastille({ children, claire = false }) {
  return (
    <div className={`inline-block px-3 py-1 rounded-full bg-green-accent/10 font-poppins font-bold text-xs tracking-widest mb-6
                     ${claire ? 'text-green-accent' : 'text-green-deep'}`}>
      {children}
    </div>
  )
}

/** Un espace de la salle : texte d'un côté, ses photos de l'autre (alterné). */
function Espace({ titre, texte, photos, inverse }) {
  // Deux photos prennent moins de largeur que trois : elles gardent ainsi à
  // peu près la même taille d'un espace à l'autre.
  const duo = photos.length === 2
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className={`${duo ? 'lg:col-span-6' : 'lg:col-span-4'} ${inverse ? 'lg:order-2' : ''}`}
      >
        <h3 className="font-poppins font-bold text-text-primary text-2xl md:text-3xl mb-4">{titre}</h3>
        <p className="font-inter text-text-secondary text-lg leading-relaxed">{texte}</p>
      </motion.div>

      {/* Mobile : défilement horizontal ; à partir de md, une grille d'une ligne. */}
      <motion.div
        variants={stagger}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className={`${duo ? 'lg:col-span-6' : 'lg:col-span-8'} -mx-6 px-6 md:mx-0 md:px-0 flex md:grid gap-4 overflow-x-auto md:overflow-visible
                    snap-x snap-mandatory [scrollbar-width:none]
                    ${duo ? 'md:grid-cols-2' : 'md:grid-cols-3'}`}
      >
        {photos.map(({ src, alt }) => (
          <motion.figure
            key={src}
            variants={fadeUp}
            className="relative shrink-0 w-[72%] sm:w-[45%] md:w-auto snap-start rounded-2xl overflow-hidden aspect-[3/4] bg-green-deep/5"
          >
            <img src={src} alt={alt} loading="lazy" className="w-full h-full object-cover" />
            <figcaption className="absolute inset-x-0 bottom-0 px-4 pt-10 pb-3 bg-gradient-to-t from-black/60 to-transparent
                                   font-inter text-white text-sm">
              {alt}
            </figcaption>
          </motion.figure>
        ))}
      </motion.div>
    </div>
  )
}

export default function KinesportFurd() {
  const textes = useTextes()
  const mail = textes['contact.mail']

  return (
    <main className="bg-site-bg">
      {/* Hero */}
      <section className="relative min-h-[60vh] flex items-end pb-20 overflow-hidden bg-green-deep">
        <div
          className="absolute inset-0 bg-cover bg-[center_40%] opacity-40"
          style={{ backgroundImage: 'url(/images/remise-rameur.jpg)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-green-deep/30 via-green-deep/60 to-green-deep" />
        <div className="relative z-10 w-full max-w-[1360px] mx-auto px-6 md:px-12 pt-32">
          <motion.div variants={stagger} initial="hidden" animate="visible">
            <motion.div variants={fadeUp}>
              <Pastille claire>{textes['remise.surtitre']}</Pastille>
            </motion.div>
            <motion.h1 variants={fadeUp} className="font-poppins font-black text-white text-5xl md:text-7xl leading-none mb-6">
              {textes['remise.titre1']}<br /><span className="text-green-accent">{textes['remise.titre2']}</span>
            </motion.h1>
            <motion.p variants={fadeUp} className="font-inter text-white/75 text-xl max-w-xl leading-relaxed">
              {textes['remise.texte']}
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Pour qui */}
      <section className="py-24 px-6 overflow-x-clip">
        <div className="max-w-[1360px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -32 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <Pastille>{textes['remise.public.surtitre']}</Pastille>
            <h2 className="font-poppins font-bold text-text-primary text-4xl md:text-5xl mb-8 leading-tight">
              {textes['remise.public.titre1']}<br />{textes['remise.public.titre2']}
            </h2>
            <p className="font-inter text-text-secondary text-lg leading-relaxed">
              {textes['remise.public.texte']}
            </p>
          </motion.div>

          <motion.ul
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="flex flex-col gap-4"
          >
            {PUBLICS.map((_, i) => (
              <motion.li
                key={i}
                variants={fadeUp}
                className="flex items-center gap-5 border border-text-primary/10 rounded-2xl px-7 py-5 hover:border-green-accent/40 transition-colors"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                     strokeLinecap="round" strokeLinejoin="round" className="text-green-accent shrink-0" aria-hidden="true">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                <span className="font-poppins font-semibold text-text-primary text-lg">{textes[`remise.public.${i}.title`]}</span>
              </motion.li>
            ))}
          </motion.ul>
        </div>
      </section>

      {/* Déroulement */}
      <section className="py-24 px-6 bg-green-deep/5">
        <div className="max-w-[1360px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="mb-16"
          >
            <Pastille>{textes['remise.etapes.surtitre']}</Pastille>
            <h2 className="font-poppins font-bold text-text-primary text-4xl md:text-5xl">{textes['remise.etapes.titre']}</h2>
          </motion.div>

          <motion.ol
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6"
          >
            {ETAPES.map((etape, i) => (
              <motion.li
                key={etape.num}
                variants={fadeUp}
                className="bg-site-bg border border-text-primary/10 rounded-2xl p-8 hover:border-green-accent/40 transition-colors"
              >
                <div className="font-poppins font-black text-5xl text-green-accent/25 mb-4 leading-none" aria-hidden="true">{etape.num}</div>
                <h3 className="font-poppins font-bold text-text-primary text-xl mb-3">{textes[`remise.etape.${i}.title`]}</h3>
                <p className="font-inter text-text-secondary leading-relaxed">{textes[`remise.etape.${i}.body`]}</p>
              </motion.li>
            ))}
          </motion.ol>
        </div>
      </section>

      {/* La salle */}
      <section className="py-24 px-6 overflow-x-clip">
        <div className="max-w-[1360px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="mb-16"
          >
            <Pastille>{textes['remise.salle.surtitre']}</Pastille>
            <h2 className="font-poppins font-bold text-text-primary text-4xl md:text-5xl leading-tight">
              {textes['remise.salle.titre1']}<br /><span className="gradient-text">{textes['remise.salle.titre2']}</span>
            </h2>
          </motion.div>

          <div className="flex flex-col gap-20">
            {ESPACES.map((espace, i) => (
              <Espace
                key={espace.title}
                titre={textes[`remise.espace.${i}.title`]}
                texte={textes[`remise.espace.${i}.body`]}
                photos={espace.photos}
                inverse={i % 2 === 1}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-24 px-6 bg-green-deep">
        <div className="max-w-[1360px] mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="font-poppins font-bold text-white text-4xl mb-6">{textes['remise.cta.titre']}</h2>
            <p className="font-inter text-white/60 text-lg mb-10 max-w-lg mx-auto">
              {textes['remise.cta.texte']}
            </p>
            <motion.a
              href={`mailto:${mail}?subject=${encodeURIComponent('Programme de remise en forme')}`}
              className="inline-block px-10 py-4 rounded-full bg-green-accent text-white font-poppins font-bold text-base"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
            >
              {textes['remise.cta.bouton']}
            </motion.a>
          </motion.div>
        </div>
      </section>
    </main>
  )
}
