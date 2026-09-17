import { motion } from 'framer-motion'
import usePageTitle from '../hooks/usePageTitle'

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
}

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
}

const MODALITES = [
  { icon: '📅', title: 'Suivi régulier en cabinet' },
  { icon: '📡', title: 'Suivi à distance' },
  { icon: '🏆', title: 'Accompagnement lors des compétitions' },
  { icon: '🏋️', title: 'Interventions pendant les périodes de préparation' },
]

const REFERENCES = [
  {
    nom: 'SIG Basket Strasbourg',
    img: '/images/sig-vestiaire.jpg',
    texte: "Après avoir écrit à toutes les ligues sportives d'Alsace, mon CV est transmis à la SIG Strasbourg, nouvellement promue en Pro A. Contre toute attente, je suis retenu après des échanges avec le médecin Nicolas Sarbacher et les dirigeants, à la demande de Christophe Vitoux. Je découvre alors le sport de très haut niveau et fais une rencontre déterminante : Frédéric Forte, dont l'influence humaine et professionnelle marquera profondément mon parcours.",
  },
  {
    nom: 'Équipe de France U21',
    img: '/images/equipe-france-u21.jpg',
    texte: "En parallèle de la SIG, j'intègre le staff médical de l'Équipe de France U21 de basket-ball, aux côtés de la génération dorée : Tony Parker, Boris Diaw, Ronny Turiaf, Mickaël Gelabale, sous la direction de l'exceptionnel Richard Billant.",
  },
  {
    nom: 'INSEP',
    img: '/images/insep.jpg',
    texte: "Au fil de ces années à la SIG et avec l'Équipe de France, je côtoie l'INSEP et de nombreux athlètes de haut niveau, ostéopathes, préparateurs physiques et entraîneurs d'exception. Un environnement qui forge profondément ma vision du soin sportif.",
  },
  {
    nom: 'Yanis Muesser',
    img: '/images/yanis-muesser-soin.jpg',
    texte: "15ème joueur français de padel, Yanis Muesser est aujourd'hui accompagné en ostéopathie et en coaching : soins en cabinet entre les tournois, suivi de la charge d'entraînement et préparation aux échéances. Un suivi complet, du traitement de la douleur à la performance.",
  },
  {
    nom: 'Keith Jennings',
    img: '/images/keith-jennings.jpg',
    texte: "Joueur emblématique de la SIG Basket et de la NBA, Keith Jennings fait partie des athlètes que j'ai eu le privilège d'accompagner. Des moments de terrain, de vestiaire et de temps morts qui restent parmi les plus marquants de ces années au plus haut niveau.",
  },
]

export default function SuiviSportif() {
  usePageTitle('Suivi des sportifs de haut niveau')

  return (
    <main className="bg-site-bg">
      {/* Hero */}
      <section className="relative min-h-[55vh] flex items-end pb-20 overflow-hidden bg-green-deep">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{ backgroundImage: 'url(/images/action-1.jpg)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-green-deep/40 via-green-deep/60 to-green-deep" />
        <div className="relative z-10 max-w-[1360px] mx-auto px-6 md:px-12 pt-32">
          <motion.div variants={stagger} initial="hidden" animate="visible">
            <motion.div variants={fadeUp} className="inline-block px-3 py-1 rounded-full bg-green-accent/10 text-green-accent font-poppins font-bold text-xs tracking-widest mb-6">
              HAUT NIVEAU
            </motion.div>
            <motion.h1 variants={fadeUp} className="font-poppins font-black text-white text-5xl md:text-7xl leading-none mb-6" aria-label="suivi sportif">
              Suivi des sportifs<br /><span className="text-green-accent">de haut niveau</span>
            </motion.h1>
            <motion.p variants={fadeUp} className="font-inter text-white/70 text-xl max-w-xl leading-relaxed">
              L'ensemble des outils et techniques ostéopathiques disponibles est utilisé pour optimiser la performance, la récupération et la longévité sportive.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Présentation + Modalités */}
      <section className="py-24 px-6 overflow-x-clip">
        <div className="max-w-[1360px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

          {/* Texte source */}
          <motion.div
            initial={{ opacity: 0, x: -32 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="inline-block px-3 py-1 rounded-full bg-green-accent/10 text-green-deep font-poppins font-bold text-xs tracking-widest mb-6">
              APPROCHE
            </div>
            <h2 className="font-poppins font-bold text-text-primary text-4xl md:text-5xl mb-8 leading-tight">
              Un suivi ostéopathique<br />spécifique
            </h2>
            <p className="font-inter text-text-secondary text-lg leading-relaxed mb-6">
              Mise en place d'un suivi ostéopathique spécifique pour les sportifs de haut niveau.
            </p>
            <p className="font-inter text-text-secondary text-lg leading-relaxed">
              L'ensemble des outils et techniques ostéopathiques disponibles est utilisé pour optimiser la performance, la récupération et la longévité sportive.
            </p>
          </motion.div>

          {/* Modalités */}
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="flex flex-col gap-4"
          >
            {MODALITES.map((m) => (
              <motion.div
                key={m.title}
                variants={fadeUp}
                className="flex items-center gap-5 border border-text-primary/10 rounded-2xl px-7 py-5 hover:border-green-accent/40 transition-colors"
              >
                <span className="text-2xl shrink-0">{m.icon}</span>
                <span className="font-poppins font-semibold text-text-primary text-lg">{m.title}</span>
              </motion.div>
            ))}
          </motion.div>

        </div>
      </section>

      {/* Avant / Après */}
      <section className="py-24 px-6 bg-green-deep/5">
        <div className="max-w-[1360px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="mb-16"
          >
            <div className="inline-block px-3 py-1 rounded-full bg-green-accent/10 text-green-deep font-poppins font-bold text-xs tracking-widest mb-4">
              RÉSULTATS
            </div>
            <h2 className="font-poppins font-bold text-text-primary text-4xl md:text-5xl leading-tight">
              Avant &amp; après
            </h2>
          </motion.div>

          <div className="grid grid-cols-2 gap-6 max-w-2xl">
            {[
              { src: '/images/avant01.jpg', label: 'Avant' },
              { src: '/images/apres01.jpg', label: 'Après' },
            ].map(({ src, label }) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="relative rounded-2xl overflow-hidden"
              >
                <img src={src} alt={label} className="w-full object-cover" />
                <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/50 backdrop-blur-sm">
                  <span className="font-poppins font-bold text-white text-sm">{label}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Références — texte complet */}
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
              PARCOURS
            </div>
            <h2 className="font-poppins font-bold text-white text-4xl md:text-5xl leading-tight">
              Clubs & athlètes<br /><span className="text-green-accent">accompagnés</span>
            </h2>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            {REFERENCES.map((ref) => (
              <motion.div
                key={ref.nom}
                variants={fadeUp}
                className="rounded-2xl overflow-hidden"
              >
                {/* Image */}
                <div className="relative aspect-[4/3]">
                  <img
                    src={ref.img}
                    alt={ref.nom}
                    className="w-full h-full object-cover block"
                    onError={e => { e.target.style.opacity = 0.1 }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 px-6 pb-4">
                    <div className="font-poppins font-bold text-white text-xl">{ref.nom}</div>
                  </div>
                </div>
                {/* Texte complet */}
                <div className="bg-white/5 border border-white/10 rounded-b-2xl px-6 py-5">
                  <p className="font-inter text-white/75 text-sm leading-relaxed">{ref.texte}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </main>
  )
}
