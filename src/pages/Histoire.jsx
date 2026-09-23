import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TIMELINE, DIPLOMES, PADEL, HOMMAGES, TEMOIGNAGES } from '../content/data/histoire'
import { useTextes } from '../content/ContenuProvider'
import { enParagraphes } from '../content/registre'

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
}

// Photos de padel : Club Med Opio, Padel Square Marrakech, et les joueurs
// accompagnés aujourd'hui.
export default function Histoire() {
  const textes = useTextes()

  const [videoOpen, setVideoOpen] = useState(false)

  return (
    <main className="bg-site-bg">
      {/* Hero */}
      <section className="relative min-h-[55vh] flex items-end pb-20 overflow-hidden bg-green-deep">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{ backgroundImage: 'url(/images/insep.jpg)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-green-deep/40 via-green-deep/60 to-green-deep" />
        <div className="relative z-10 max-w-[1360px] mx-auto px-6 md:px-12 pt-32">
          <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.12 } } }}>
            <motion.div variants={fadeUp} className="inline-block px-3 py-1 rounded-full bg-green-accent/10 text-green-accent font-poppins font-bold text-xs tracking-widest mb-6">
              {textes['histoire.surtitre']}
            </motion.div>
            <motion.h1
              variants={fadeUp}
              className="font-poppins font-black text-white text-5xl md:text-7xl leading-none mb-6"
            >
              {textes['histoire.titre1']}<br /><span className="text-green-accent">{textes['histoire.titre2']}</span>
            </motion.h1>
            <motion.p variants={fadeUp} className="font-inter text-white/70 text-xl max-w-xl leading-relaxed">
              {textes['histoire.chapo']}
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-24 px-6 max-w-[1360px] mx-auto">
        <div className="space-y-28">
          {TIMELINE.map((item, i) => (
            <motion.div
              key={item.period}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-60px' }}
              variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
              className={`flex flex-col md:flex-row gap-12 items-center ${i % 2 === 1 ? 'md:flex-row-reverse' : ''}`}
            >
              {/* Image */}
              <div className="md:w-[380px] shrink-0">
                {item.img ? (
                  <motion.div
                    variants={fadeUp}
                    className="rounded-2xl overflow-hidden sticky top-24"
                  >
                    <img src={item.img} alt={item.period} className="w-full h-auto block" />
                  </motion.div>
                ) : (
                  <motion.div
                    variants={fadeUp}
                    className="rounded-2xl aspect-[4/3] bg-green-deep/5 flex items-center justify-center sticky top-24"
                  >
                    <span className="font-poppins font-bold text-green-deep/15 text-5xl text-center px-4">{textes[`chapitre.${i}.years`]}</span>
                  </motion.div>
                )}
              </div>

              {/* Texte */}
              <div className="flex-1 min-w-0">
                <motion.div variants={fadeUp} className="text-green-accent font-poppins font-bold text-xs tracking-widest mb-2">
                  {textes[`chapitre.${i}.years`]}
                </motion.div>
                <motion.h2 variants={fadeUp} className="font-poppins font-bold text-text-primary text-3xl md:text-4xl mb-8">
                  {textes[`chapitre.${i}.period`]}
                </motion.h2>
                <div className="space-y-5">
                  {enParagraphes(textes[`chapitre.${i}.paragraphs`]).map((p, j) => (
                    <motion.p
                      key={j}
                      variants={fadeUp}
                      className="font-inter text-text-secondary text-lg leading-relaxed"
                    >
                      {p}
                    </motion.p>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Vidéo FR3 */}
      <section className="py-20 px-6 bg-green-deep">
        <div className="max-w-[1360px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="flex flex-col md:flex-row items-center gap-10"
          >
            <div className="flex-1">
              <div className="inline-block px-3 py-1 rounded-full bg-green-accent/10 text-green-accent font-poppins font-bold text-xs tracking-widest mb-5">
                MÉDIAS
              </div>
              <h2 className="font-poppins font-bold text-white text-4xl mb-4">Passage sur FR3</h2>
              <p className="font-inter text-white/60 text-lg leading-relaxed">
                Reportage France 3 Alsace sur le parcours et la pratique d'Emmanuel Krieger, ostéopathe et coach sportif.
              </p>
            </div>

            <motion.button
              onClick={() => setVideoOpen(true)}
              className="relative rounded-2xl overflow-hidden shrink-0 w-full md:w-[420px] group"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <video
                src="/videos/manu-fr3.mp4"
                className="w-full h-auto block"
                muted
                preload="metadata"
              />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm border border-white/40 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Diplômes */}
      <section className="py-20 px-6 bg-green-deep">
        <div className="max-w-[1360px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <div className="inline-block px-3 py-1 rounded-full bg-green-accent/10 text-green-accent font-poppins font-bold text-xs tracking-widest mb-8">
              DIPLÔMES
            </div>
            <h2 className="font-poppins font-bold text-white text-4xl mb-12">Formations & certifications</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {DIPLOMES.map((d, i) => (
                <div key={d} className="flex items-start gap-4 border border-white/10 rounded-xl p-6">
                  <span className="text-green-accent mt-1 shrink-0">✓</span>
                  <span className="font-inter text-white/80 text-base">{textes[`diplome.${i}`]}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Galerie padel */}
      <section className="py-24 px-6 bg-green-deep/5">
        <div className="max-w-[1360px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="mb-12"
          >
            <div className="inline-block px-3 py-1 rounded-full bg-green-accent/10 text-green-deep font-poppins font-bold text-xs tracking-widest mb-4">
              {textes['padel.surtitre']}
            </div>
            <h2 className="font-poppins font-bold text-text-primary text-4xl md:text-5xl leading-tight">
              {textes['padel.titre1']}<br /><span className="text-green-accent">{textes['padel.titre2']}</span>
            </h2>
            <p className="font-inter text-text-secondary text-lg mt-4 max-w-2xl">
              {textes['padel.chapo']}
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {PADEL.map(({ src, legende }, i) => (
              <motion.figure
                key={src}
                className="m-0 rounded-xl overflow-hidden relative group"
                initial={{ opacity: 0, scale: 0.97 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <img
                  src={src}
                  alt={textes[`padel.${i}.legende`]}
                  className="w-full h-full object-cover aspect-[4/3] block transition-transform duration-500 group-hover:scale-105"
                  onError={e => { e.target.closest('figure').style.display = 'none' }}
                />
                <figcaption className="absolute inset-x-0 bottom-0 px-4 py-3 font-inter text-white text-xs bg-gradient-to-t from-black/75 to-transparent">
                  {textes[`padel.${i}.legende`]}
                </figcaption>
              </motion.figure>
            ))}
          </div>
        </div>
      </section>

      {/* Hommages */}
      <section id="hommages" className="py-24 px-6 bg-green-deep scroll-mt-24">
        <div className="max-w-[1360px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="mb-16"
          >
            <div className="inline-block px-3 py-1 rounded-full bg-green-accent/10 text-green-accent font-poppins font-bold text-xs tracking-widest mb-4">
              {textes['hommages.surtitre']}
            </div>
            <h2 className="font-poppins font-bold text-white text-4xl md:text-5xl leading-tight">
              {textes['hommages.titre1']}<br /><span className="text-green-accent">{textes['hommages.titre2']}</span>
            </h2>
          </motion.div>

          <div className="space-y-16">
            {HOMMAGES.map((h, i) => (
              <motion.article
                key={h.nom}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="flex flex-col md:flex-row gap-10"
              >
                {h.images?.length > 0 && (
                  <div className="md:w-[300px] shrink-0 space-y-4">
                    {h.images.map(({ src, legende }) => (
                      <figure key={src} className="m-0">
                        <div className="rounded-2xl overflow-hidden">
                          <img
                            src={src}
                            alt={textes[`padel.${i}.legende`]}
                            className="w-full h-auto block"
                            onError={e => { e.target.closest('figure').style.display = 'none' }}
                          />
                        </div>
                        <figcaption className="font-inter text-white/45 text-xs mt-2">{legende}</figcaption>
                      </figure>
                    ))}
                  </div>
                )}
                <div className="flex-1 border-l-2 border-green-accent/40 pl-6 md:pl-8">
                  <h3 className="font-poppins font-bold text-white text-2xl">{textes[`hommage.${i}.nom`]}</h3>
                  <p className="font-inter text-green-accent text-sm mb-6">{textes[`hommage.${i}.role`]}</p>
                  {h.citation && (
                    <p className="font-poppins italic text-white text-xl md:text-2xl leading-snug mb-6">
                      «&nbsp;{textes[`hommage.${i}.citation`]}&nbsp;»
                    </p>
                  )}
                  <div className="space-y-4">
                    {enParagraphes(textes[`hommage.${i}.paragraphes`]).map((t, j) => (
                      <p key={j} className="font-inter text-white/70 leading-relaxed">{t}</p>
                    ))}
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* Témoignages */}
      <section id="temoignages" className="py-24 px-6 scroll-mt-24">
        <div className="max-w-[1360px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="mb-16"
          >
            <div className="inline-block px-3 py-1 rounded-full bg-green-accent/10 text-green-deep font-poppins font-bold text-xs tracking-widest mb-4">
              {textes['temoignages.surtitre']}
            </div>
            <h2 className="font-poppins font-bold text-text-primary text-4xl md:text-5xl leading-tight">
              {textes['temoignages.titre']}
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {TEMOIGNAGES.map((t, i) => (
              <Temoignage key={t.nom} temoignage={t} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Galerie */}
      <section className="py-24 px-6 max-w-[1360px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mb-12"
        >
          <div className="inline-block px-3 py-1 rounded-full bg-green-accent/10 text-green-deep font-poppins font-bold text-xs tracking-widest mb-4">
            {textes['galerie.surtitre']}
          </div>
          <h2 className="font-poppins font-bold text-text-primary text-4xl">{textes['galerie.titre']}</h2>
        </motion.div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { src: '/images/sig-vestiaire.jpg', alt: 'Vestiaire SIG Basket' },
            { src: '/images/equipe-france-u21.jpg', alt: 'Équipe de France U21 — Vittel' },
            { src: '/images/insep.jpg', alt: 'INSEP' },
            { src: '/images/malaga.jpg', alt: 'Malaga' },
            { src: '/images/nissim-manu.jpg', alt: 'Avec Nissim' },
            { src: '/images/temps-mort-sig.jpg', alt: 'Temps mort SIG' },
          ].map(({ src, alt }) => (
            <motion.div
              key={src}
              className="rounded-xl overflow-hidden"
              initial={{ opacity: 0, scale: 0.97 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              whileHover={{ scale: 1.02 }}
            >
              <img
                src={src}
                alt={alt}
                className="w-full h-auto block"
                onError={e => { e.target.parentElement.style.display = 'none' }}
              />
            </motion.div>
          ))}
        </div>
      </section>
      {/* Modal vidéo */}
      <AnimatePresence>
        {videoOpen && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => setVideoOpen(false)}
          >
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            <motion.div
              className="relative w-full max-w-3xl"
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              onClick={e => e.stopPropagation()}
            >
              <button
                onClick={() => setVideoOpen(false)}
                className="absolute -top-10 right-0 text-white/70 hover:text-white font-poppins text-sm flex items-center gap-2 transition-colors"
              >
                Fermer ✕
              </button>
              <video
                src="/videos/manu-fr3.mp4"
                controls
                autoPlay
                className="w-full rounded-2xl shadow-2xl"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}

/** Carte de témoignage : extrait par défaut, texte intégral au clic. */
function Temoignage({ temoignage: t, index }) {
  const [ouvert, setOuvert] = useState(false)
  const textes = useTextes()
  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="rounded-2xl bg-white border border-green-deep/10 overflow-hidden shadow-sm"
    >
      {t.img && (
        <img
          src={t.img}
          alt={t.imgAlt || t.nom}
          className="w-full h-auto block border-b border-green-deep/10"
          onError={e => { e.target.style.display = 'none' }}
        />
      )}
      <div className="p-7">
        <div className="font-poppins text-green-accent text-4xl leading-none mb-3">“</div>
        <div className="space-y-4">
          {(ouvert ? enParagraphes(textes[`temoignage.${index}.paragraphes`]) : [textes[`temoignage.${index}.extrait`]]).map((p, i) => (
            <p key={i} className="font-inter text-text-secondary leading-relaxed">{p}</p>
          ))}
        </div>
        <button
          onClick={() => setOuvert(o => !o)}
          className="mt-5 font-poppins font-bold text-sm text-green-accent hover:text-teal-accent transition-colors"
        >
          {ouvert ? 'Réduire ↑' : 'Lire le témoignage →'}
        </button>
        <div className="mt-6 pt-5 border-t border-green-deep/10">
          <div className="font-poppins font-bold text-text-primary">{textes[`temoignage.${index}.nom`]}</div>
          <div className="font-inter text-text-secondary/70 text-sm">{textes[`temoignage.${index}.role`]}</div>
          {t.langue && (
            <div className="font-inter text-text-secondary/50 text-xs mt-1">{t.langue}</div>
          )}
        </div>
      </div>
    </motion.article>
  )
}
