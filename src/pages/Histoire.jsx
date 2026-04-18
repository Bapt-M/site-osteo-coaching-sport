import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
}

const TIMELINE = [
  {
    period: 'Les origines',
    years: 'Enfance',
    img: '/images/origines.jpg',
    paragraphs: [
      "Depuis aussi loin que je me souvienne, j'ai toujours vécu entouré d'animaux. J'ai grandi dans un petit village de 300 habitants, à Kleinfrankenheim, à proximité de Truchtersheim, au cœur du Kochersberg, une région historiquement marquée par le monde agricole et équin. Très jeune, je deviens le plus jeune exposant d'aviculture avec les animaux de la ferme de mon grand-père. Enfant, j'élève même un chevreau au biberon, éduqué comme un chien, qui me suit partout dans le village.",
      "Kleinfrankenheim est aussi la capitale de l'élevage équin en Alsace, avec deux écuries de course majeures : les écuries de trot JUNG et de galop MATZINGER. C'est donc naturellement qu'à partir de l'âge de sept ans, après l'école, je passe tous mes soirs à l'écurie. J'y découvre le quotidien des chevaux, leur soin, leur gestion, et je commence à monter un ancien cheval de course réformé de 21 ans, à l'aide d'un simple escabeau.",
      "Par la suite, aux côtés de Stéphane Bulcourt (Jockey), aujourd'hui figure incontournable des spectacles équestres à Europa-Park, j'apprends à monter des chevaux de course. J'obtiens une licence de Gentleman Rider, me permettant de monter en compétition aux côtés des jockeys professionnels. C'est en observant le vétérinaire intervenir dans ce milieu que naît ma première vocation : devenir vétérinaire équin.",
    ],
  },
  {
    period: 'Kiné & Ostéopathie',
    years: '1990 – 2000',
    img: '/images/formation-kiné.jpg',
    paragraphs: [
      "Le BAC C en poche, je suis admis en classe préparatoire vétérinaire à Nancy, ainsi qu'en Maths Sup à Strasbourg. À trois semaines de la rentrée, je choisis Strasbourg, un cadre plus compatible avec ma vie personnelle : rester proche de ma famille et de mes amis, tout en continuant une pratique sportive intense (football, tennis, monter à cheval, course à pied dans la campagne alsacienne…).",
      "Après une année, le besoin de retourner vers les chevaux se fait sentir. Je constitue un nouveau dossier pour la classe préparatoire vétérinaire : une première année à Nancy, puis une deuxième année à Lycée du Parc à Lyon. Admissible au concours vétérinaire, je ne parviens cependant pas à franchir l'étape de l'oral à l'École nationale vétérinaire de Maison Alfort.",
      "Je m'oriente alors vers des études de kiné du sport. Rapidement, je constate que la formation est essentiellement hospitalo-centrée, alors que la majorité des professionnels exercent en libéral. Surtout, je ressens un manque d'outils concrets pour réellement soigner les patients.",
      "La rencontre avec un enseignant (Mr CHAUVIN) également ostéopathe est déterminante. Je comprends alors que l'ostéopathie correspond pleinement à ma vision du soin. Diplôme de kinésithérapeute en poche, j'intègre simultanément une formation complète en ostéopathie à l'AT Still Academy et à l'Osteopathic Research Institute.",
      "Cette formation s'étale sur six années, dans un contexte où l'ostéopathie n'est encore qu'une médecine dite « parallèle », reconnue officiellement en 2006, puis réglementée par les décrets de 2012. Je poursuis ensuite deux années supplémentaires en alternance à l'UFR STAPS Montpellier, avec une spécialisation en ostéopathie du sport et de l'urgence.",
      "En parallèle, je me forme à l'ostéopathie équine, renouant ainsi avec mes racines, au sein des deux formations de référence en France : l'IFOREC et la formation de Michel Garcia.",
    ],
  },
  {
    period: 'Premiers remplacements & SIG',
    years: '2000 – 2005',
    img: '/images/equipe-france-u21.jpg',
    paragraphs: [
      "Dès l'obtention de mes diplômes, je fais le choix de privilégier les remplacements dans des cabinets fortement impliqués dans le sport. Cette orientation me permet d'intégrer rapidement des environnements compétitifs.",
      "Je remplace notamment Laurent Bondorffer, ce qui me donne l'opportunité de vivre les 32e de finale de la Coupe de France à Stade de la Meinau, lors d'un match historique opposant le Sporting Club de Schiltigheim aux Girondins de Bordeaux.",
      "Je collabore également avec Pascal Ingwiller, aujourd'hui directeur du Collège Ostéopathique de Strasbourg. Je travaille aux côtés de kinésithérapeutes intervenant au centre de formation du Racing Club de Strasbourg Alsace.",
      "Je poursuis ensuite par six mois à la Clinique du Diaconat, en médecine du sport, où je remplace Monsieur Salvador, intervenant notamment auprès du MONE. J'y prends en charge, entre autres, Roxana Maracineanu, à l'époque de son sacre olympique, ainsi que le Mulhouse Basket en Pro B et l'ASIM Football Club en National.",
      "Un tournant majeur survient en regardant un match de Roland-Garros. Inspiré, je décide d'écrire à toutes les ligues sportives d'Alsace. La Ligue d'Alsace de Handball me répond et me confie la prise en charge des espoirs. Mon CV est ensuite transmis à la SIG Strasbourg, nouvellement promue en Pro A.",
      "Contre toute attente, je suis retenu après des échanges avec le médecin Nicolas Sarbacher et les dirigeants, à la demande de Christophe Vitoux. Je découvre alors le sport de très haut niveau et fais une rencontre déterminante : Frédéric Forte, dont l'influence humaine et professionnelle marquera profondément mon parcours.",
      "C'est sur le parquet du nouveau Rhenus Sport que ma fille fait ses premiers pas, symbole d'un cycle de vie intense. Après plusieurs saisons, je fais le choix de m'installer dans mon propre cabinet, souhaitant réduire les déplacements constants liés aux compétitions nationales et européennes.",
      "En parallèle, j'intègre le staff médical de l'Équipe de France U21 de basket-ball, aux côtés de la génération dorée : Tony Parker, Boris Diaw, Ronny Turiaf, Mickaël Gelabale, sous la direction de l'exceptionnel Richard Billant.",
      "Ma dernière saison à la SIG est partagée avec Alain Weisz, figure majeure du basket français, dont l'approche humaine m'a profondément marqué. Au fil de ces années, je côtoie l'INSEP, de nombreux athlètes de haut niveau, ostéopathes, préparateurs physiques et entraîneurs d'exception.",
    ],
  },
  {
    period: 'Cabinet & Club Med',
    years: '2005 – 2024',
    img: '/images/malaga.jpg',
    paragraphs: [
      "Durant les intersaisons, je travaille comme G.O. au Club Med, une expérience que je poursuis encore aujourd'hui, alliant sport, relationnel et environnements d'exception.",
      "J'ouvre mon premier cabinet en 2005 à Oberhausbergen, orienté quasi exclusivement vers les sportifs. J'y accompagne notamment Mehdi Baala, Driss El Himer, Mélanie Skotnik, Mathieu Lorentz, ainsi que plusieurs joueurs du Racing Club de Strasbourg grâce à François Pietra.",
      "J'accompagne également de nombreux basketteurs issus du centre de formation de la SIG évoluant ensuite en Pro B (BCS et BCGO), et Mathieu Sprick, ancien maillot blanc du Tour de France.",
    ],
  },
  {
    period: "Padel & Aujourd'hui",
    years: '2025 –',
    img: '/images/muesser_smatch.jpg',
    paragraphs: [
      "Enfin, en 2025, je découvre le padel au Club Med Opio. Ce sport devient une nouvelle passion. À mon retour en Alsace, je m'y consacre quotidiennement afin d'en comprendre toutes les exigences.",
      "C'est dans ce cadre que j'accompagne aujourd'hui Julien Motz (42ème français) et Yanis Muesser (15ème français) en ostéopathie et en coaching, tout en renouant avec de grandes figures emblématiques du sport alsacien comme Alexis Koessler ou José Guerra.",
    ],
  },
]

const DIPLOMES = [
  'Diplôme de Kinésithérapeute',
  "Diplôme d'Ostéopathie D.O. — AT Still Academy & Osteopathic Research Institute",
  'Certificat Ostéopathe du Sport — UFR STAPS Montpellier (2007)',
  'Formation Ostéopathie Équine — IFOREC & Michel Garcia',
]

export default function Histoire() {
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
            <motion.div variants={fadeUp} className="inline-block px-3 py-1 rounded-full bg-green-accent/10 text-green-accent font-syne font-bold text-xs tracking-widest mb-6">
              HISTOIRE & FORMATION
            </motion.div>
            <motion.h1
              variants={fadeUp}
              className="font-syne font-black text-white text-5xl md:text-7xl leading-none mb-6"
            >
              Histoire &amp; Formation<br /><span className="text-green-accent">un parcours atypique</span>
            </motion.h1>
            <motion.p variants={fadeUp} className="font-inter text-white/70 text-xl max-w-xl leading-relaxed">
              De l'écurie alsacienne aux parquets de Pro A — le chemin d'un praticien formé par la passion du sport et du soin.
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
                    <span className="font-syne font-bold text-green-deep/15 text-5xl text-center px-4">{item.years}</span>
                  </motion.div>
                )}
              </div>

              {/* Texte */}
              <div className="flex-1 min-w-0">
                <motion.div variants={fadeUp} className="text-green-accent font-syne font-bold text-xs tracking-widest mb-2">
                  {item.years}
                </motion.div>
                <motion.h2 variants={fadeUp} className="font-syne font-bold text-text-primary text-3xl md:text-4xl mb-8">
                  {item.period}
                </motion.h2>
                <div className="space-y-5">
                  {item.paragraphs.map((p, j) => (
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
              <div className="inline-block px-3 py-1 rounded-full bg-green-accent/10 text-green-accent font-syne font-bold text-xs tracking-widest mb-5">
                MÉDIAS
              </div>
              <h2 className="font-syne font-bold text-white text-4xl mb-4">Passage sur FR3</h2>
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
            <div className="inline-block px-3 py-1 rounded-full bg-green-accent/10 text-green-accent font-syne font-bold text-xs tracking-widest mb-8">
              DIPLÔMES
            </div>
            <h2 className="font-syne font-bold text-white text-4xl mb-12">Formations & certifications</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {DIPLOMES.map(d => (
                <div key={d} className="flex items-start gap-4 border border-white/10 rounded-xl p-6">
                  <span className="text-green-accent mt-1 shrink-0">✓</span>
                  <span className="font-inter text-white/80 text-base">{d}</span>
                </div>
              ))}
            </div>
          </motion.div>
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
          <div className="inline-block px-3 py-1 rounded-full bg-green-accent/10 text-green-deep font-syne font-bold text-xs tracking-widest mb-4">
            GALERIE
          </div>
          <h2 className="font-syne font-bold text-text-primary text-4xl">Moments marquants</h2>
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
                className="absolute -top-10 right-0 text-white/70 hover:text-white font-syne text-sm flex items-center gap-2 transition-colors"
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
