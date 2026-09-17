import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

// La page /intervention-entreprise existe toujours mais n'est plus liée
// depuis la navigation (conservée en archive).
const PAGES = [
  { label: 'Histoire et formation', href: '/histoire' },
  { label: 'Bilan, traitement et soin ostéopathique', href: '/bilan-osteopathique' },
  { label: 'Suivi des sportifs de haut niveau', href: '/suivi-sportif' },
  { label: 'Projet sportif personnalisé', href: '/projet-sportif' },
  { label: 'Programme et suivi de remise en forme', href: '/kinesport-furd' },
]

export default function Footer() {
  return (
    <motion.footer
      className="bg-footer-bg text-white pt-16 pb-10 px-6"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
    >
      <div className="max-w-[1360px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">

        {/* Identité */}
        <div>
          <div className="font-poppins font-bold text-lg leading-tight mb-4">
            OSTÉO<br /><span className="font-normal text-green-accent">ET COACHING</span><br />DU SPORT
          </div>
          <p className="text-white/50 text-sm font-inter leading-relaxed">
            34 Rue de Strasbourg<br />67117 Furdenheim
          </p>
          <p className="text-white/50 text-sm font-inter mt-3">
            Emmanuel Krieger<br />
            Ostéopathe &amp; Coach sportif
          </p>
        </div>

        {/* Navigation */}
        <div className="flex flex-col gap-3">
          <h4 className="font-poppins font-bold text-xs tracking-widest text-white/40 uppercase mb-1">Pages</h4>
          {PAGES.map(({ label, href }) => (
            <Link
              key={href}
              to={href}
              className="text-white/70 hover:text-green-accent transition-colors text-sm font-inter"
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Contact */}
        <div className="flex flex-col gap-3">
          <h4 className="font-poppins font-bold text-xs tracking-widest text-white/40 uppercase mb-1">Contact</h4>
          <a
            href="#contact"
            className="inline-flex items-center gap-2 text-white/70 hover:text-green-accent transition-colors text-sm font-inter"
          >
            Prendre rendez-vous
          </a>
          <div className="mt-2 flex flex-col gap-3">
            <h4 className="font-poppins font-bold text-xs tracking-widest text-white/40 uppercase">Légal</h4>
            {['Mentions légales'].map(label => (
              <a key={label} href="#" className="text-white/70 hover:text-green-accent transition-colors text-sm font-inter">
                {label}
              </a>
            ))}
          </div>
        </div>

      </div>

      <div className="max-w-[1360px] mx-auto mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <p className="text-white/30 text-xs font-inter">© {new Date().getFullYear()} Emmanuel Krieger. Tous droits réservés.</p>
        <p className="text-white/20 text-xs font-inter">Furdenheim, Alsace</p>
      </div>
    </motion.footer>
  )
}
