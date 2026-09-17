import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import usePageTitle from '../hooks/usePageTitle'

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

const HOMMAGES = [
  {
    nom: 'Fred FORTE',
    role: 'SIG Strasbourg — #4',
    img: '/images/fred-forte.jpg',
    citation: "Voilà mon Manu… c'est ça qu'on veut !",
    paragraphes: [
      "Toutes mes pensées vont à la mémoire d'un Grand Homme, Fred FORTE, #4, avec qui j'ai eu l'immense chance de partager un bout de chemin.",
      "Il est de ces êtres rares que la vie met sur notre route et qui, sans même toujours s'en rendre compte, rendent les autres meilleurs. Par sa force, son exigence, sa bienveillance et cette lumière qu'il portait en lui, Fred était de ceux qui marquent une vie. Un homme inspirant, un modèle, un ANGE…",
      "Je mesure aujourd'hui encore davantage la chance que j'ai eue de le connaître, de croiser son chemin et de recevoir, à ma manière, un peu de ce qu'il avait à transmettre.",
      "À chaque réussite dans ma vie, il y a une pensée qui me traverse : je sais qu'il est là, quelque part, fier de moi, avec son sourire et sa voix qui résonnent encore dans ma tête.",
      "Alors je continue d'avancer, de me dépasser et de donner le meilleur de moi-même, avec une part de lui en moi.",
      "Merci Fred. Pour ce que tu as été, pour ce que tu m'as transmis et pour ce que tu continues de représenter. Tu ne seras jamais oublié.",
    ],
  },
  {
    nom: 'Thierry RUPERT',
    role: 'SIG Strasbourg — international français',
    img: null,
    citation: "Tu seras toujours là, quelque part, dans nos pas… et dans nos souvenirs.",
    paragraphes: [
      "Il y a des personnes que l'on rencontre dans un cadre professionnel et qui prennent une place bien plus importante dans notre vie. Tu as été l'une de ces personnes.",
      "À la SIG, j'étais ton kiné, ton ostéo… mais très vite, notre relation est devenue celle de deux amis, avec cette complicité faite de confiance, de chambrage, de fous rires et de ces petits moments qui, aujourd'hui, prennent une valeur immense. Je n'oublierai jamais la première fois de ta vie où je t'ai emmené faire du ski, à La Bresse dans les Vosges avec Hrvoje Perincic. Une journée hors du temps.",
      "Je garde de toi l'image d'un grand basketteur, bien sûr. International français, compétiteur, passionné. Mais surtout celle de Thierry, l'homme derrière le joueur : quelqu'un de simple, profondément attaché aux siens, qui n'a jamais oublié ses origines.",
      "Et quand je pense à toi, je pense forcément à Elham, avec qui tu avais construit une si belle famille. À Ilana, que j'ai connue toute petite, devenue une formidable basketteuse internationale. À Rayan aussi, son petit frère, qui porte lui aussi fièrement les couleurs du basket.",
      "Ton départ est tellement injuste. Ton cœur t'aura finalement joué le plus mauvais des tours… toi qui avais tant donné au basket et aux autres.",
      "Je ne garde pas seulement le souvenir du joueur que tu étais, mais surtout celui de l'homme que j'ai eu la chance de connaître. Merci pour tout, Thierry.",
    ],
  },
]

const TEMOIGNAGES = [
  {
    nom: 'Matthieu LORENTZ',
    role: "Président de l'Olympia Lutte Schiltigheim",
    img: null,
    extrait: "Quand j'étais sportif de haut niveau, on parlait souvent des victoires, des records et des podiums. Pourtant, derrière chaque performance se cachent des personnes essentielles, souvent dans l'ombre.",
    paragraphes: [
      "Quand j'étais sportif de haut niveau, on parlait souvent des victoires, des records et des podiums. Pourtant, derrière chaque performance se cachent des personnes essentielles, souvent dans l'ombre, qui contribuent chaque jour à rendre ces réussites possibles. Un peu comme la partie immergée de l'iceberg, leur rôle est discret, mais déterminant.",
      "C'est pourquoi je tenais aujourd'hui à prendre le temps de te remercier.",
      "Tout au long de ma carrière de sportif de haut niveau, ton accompagnement en tant qu'ostéopathe a été précieux. Grâce à ton professionnalisme, ta patience et ton engagement, j'ai pu surmonter les blessures, optimiser ma récupération et continuer à repousser mes limites.",
      "Mais au-delà des soins et de ton expertise, tu as toujours su être présent dans les moments difficiles, trouver les mots justes pour me remotiver et me permettre de retrouver rapidement le chemin de l'entraînement et de la compétition.",
      "Une part de mes performances et de mes réussites t'appartient également. Et pour cela, je te suis profondément reconnaissant.",
      "Merci pour ton accompagnement, ta confiance et ton engagement à mes côtés tout au long de cette aventure sportive.",
    ],
  },
  {
    nom: 'Richard BILLANT',
    role: "Ancien sélectionneur des Équipes de France de basket-ball",
    img: '/images/u21-vittel-2001.jpg',
    imgAlt: "Coupure de presse — stage des Espoirs à Vittel, juin 2001, sous la direction de Richard Billant",
    extrait: "Nous avions démarré ensemble en 2001 avec l'équipe de France Espoirs de la célèbre génération 82/83 : Tony Parker, Boris Diaw, Ronny Turiaf et autres.",
    paragraphes: [
      "En effectuant des recherches dans mon passé de sélectionneur national des équipes de France, je me suis rendu compte que nous avions démarré ensemble en 2001 avec l'équipe de France Espoirs de la célèbre génération 82/83, avec de très grands noms du basket français : Tony Parker, Boris Diaw, Ronny Turiaf et autres.",
      "Tu as participé à la première partie de cette campagne avec le stage de Vittel et le tournoi de Guadalajara. Cette première expérience pour nous deux a été le début d'une grande aventure avec les équipes de France. Je garde un excellent souvenir de notre première collaboration et nous nous sommes retrouvés pour la campagne de 2003.",
      "Néanmoins, dans tous ces moments d'échecs et de réussites, il y a toujours de très belles rencontres. Mon cher Manu, tu fais partie de ces belles rencontres. Je suis très sensible à l'ambiance autour des équipes que j'ai dirigées : certes, les résultats sont très importants, mais les relations humaines le sont tout autant.",
      "J'ai toujours accordé une extrême importance aux qualités professionnelles et humaines des membres du staff. Je peux dire que tu cochais parfaitement ces deux qualités. Je regrette que le hasard des staffs ne nous ait pas permis de travailler ensemble lors de campagnes plus victorieuses.",
      "Nous n'avons partagé toi et moi que quelques stages ensemble en 2001 et 2003, mais 22 ans plus tard nous sommes toujours en contact. C'est la preuve que quels que soient les résultats, bons ou mauvais, les relations humaines perdurent et l'on ne se souvient que des bons moments passés ensemble. C'est bien cela le principal !",
    ],
  },
  {
    nom: 'Paris McCURDY',
    role: 'Ancien basketteur professionnel',
    img: null,
    langue: 'Témoignage en anglais',
    extrait: "When I was playing professional basketball, people often focused on the wins, the big games, and the achievements. But behind every performance are people who work quietly behind the scenes.",
    paragraphes: [
      "When I was playing professional basketball, people often focused on the wins, the big games, and the achievements. But behind every performance are people who work quietly behind the scenes, playing an essential role in making those successes possible.",
      "Throughout my professional career, your support as my osteopath was invaluable. Your professionalism, patience, and dedication helped me overcome injuries, recover faster, and keep pushing my limits on the court.",
      "But beyond your expertise, you were always there during the difficult moments, knowing how to motivate me and help me get back to training and competition.",
      "A part of my achievements belongs to you, and for that, I am truly grateful. Thank you for your support, your trust, and everything you brought to my journey.",
      "With my deepest gratitude and sporting friendship, you're my man for ever…",
    ],
  },
]

export default function Histoire() {
  usePageTitle('Histoire et formation')

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
              HISTOIRE & FORMATION
            </motion.div>
            <motion.h1
              variants={fadeUp}
              className="font-poppins font-black text-white text-5xl md:text-7xl leading-none mb-6"
            >
              Histoire<br /><span className="text-green-accent">&amp; formation</span>
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
                    <span className="font-poppins font-bold text-green-deep/15 text-5xl text-center px-4">{item.years}</span>
                  </motion.div>
                )}
              </div>

              {/* Texte */}
              <div className="flex-1 min-w-0">
                <motion.div variants={fadeUp} className="text-green-accent font-poppins font-bold text-xs tracking-widest mb-2">
                  {item.years}
                </motion.div>
                <motion.h2 variants={fadeUp} className="font-poppins font-bold text-text-primary text-3xl md:text-4xl mb-8">
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

      {/* Hommages */}
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
              HOMMAGES
            </div>
            <h2 className="font-poppins font-bold text-white text-4xl md:text-5xl leading-tight">
              Ceux qui m'ont<br /><span className="text-green-accent">marqué</span>
            </h2>
          </motion.div>

          <div className="space-y-16">
            {HOMMAGES.map(h => (
              <motion.article
                key={h.nom}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="flex flex-col md:flex-row gap-10"
              >
                {h.img && (
                  <div className="md:w-[300px] shrink-0">
                    <div className="rounded-2xl overflow-hidden">
                      <img
                        src={h.img}
                        alt={h.nom}
                        className="w-full h-auto block"
                        onError={e => { e.target.parentElement.style.display = 'none' }}
                      />
                    </div>
                  </div>
                )}
                <div className="flex-1 border-l-2 border-green-accent/40 pl-6 md:pl-8">
                  <h3 className="font-poppins font-bold text-white text-2xl">{h.nom}</h3>
                  <p className="font-inter text-green-accent text-sm mb-6">{h.role}</p>
                  {h.citation && (
                    <p className="font-poppins italic text-white text-xl md:text-2xl leading-snug mb-6">
                      «&nbsp;{h.citation}&nbsp;»
                    </p>
                  )}
                  <div className="space-y-4">
                    {h.paragraphes.map((t, i) => (
                      <p key={i} className="font-inter text-white/70 leading-relaxed">{t}</p>
                    ))}
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* Témoignages */}
      <section className="py-24 px-6">
        <div className="max-w-[1360px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="mb-16"
          >
            <div className="inline-block px-3 py-1 rounded-full bg-green-accent/10 text-green-deep font-poppins font-bold text-xs tracking-widest mb-4">
              TÉMOIGNAGES
            </div>
            <h2 className="font-poppins font-bold text-text-primary text-4xl md:text-5xl leading-tight">
              Remerciements &amp; témoignages
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {TEMOIGNAGES.map(t => (
              <Temoignage key={t.nom} temoignage={t} />
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
            GALERIE
          </div>
          <h2 className="font-poppins font-bold text-text-primary text-4xl">Moments marquants</h2>
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
function Temoignage({ temoignage: t }) {
  const [ouvert, setOuvert] = useState(false)
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
          {(ouvert ? t.paragraphes : [t.extrait]).map((p, i) => (
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
          <div className="font-poppins font-bold text-text-primary">{t.nom}</div>
          <div className="font-inter text-text-secondary/70 text-sm">{t.role}</div>
          {t.langue && (
            <div className="font-inter text-text-secondary/50 text-xs mt-1">{t.langue}</div>
          )}
        </div>
      </div>
    </motion.article>
  )
}
