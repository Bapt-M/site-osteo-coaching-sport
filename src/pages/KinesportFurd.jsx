import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import usePageTitle from '../hooks/usePageTitle'
import { useTextes } from '../content/ContenuProvider'

export default function KinesportFurd() {
  usePageTitle('Programme et suivi de remise en forme')
  const textes = useTextes()

  return (
    <main className="min-h-screen bg-site-bg flex flex-col items-center justify-center px-6 text-center">
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-lg"
      >
        <div className="inline-flex items-center gap-3 px-3 py-1 rounded-full bg-green-accent/10 mb-8">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-deep shrink-0">
            <path d="M12 6v6l4 2" />
            <circle cx="12" cy="12" r="10" />
          </svg>
          <span className="text-green-deep font-poppins font-bold text-xs tracking-widest">{textes['remise.surtitre']}</span>
        </div>

        <h1 className="font-poppins font-bold text-4xl md:text-5xl text-text-primary leading-tight mb-5">
          {textes['remise.titre1']}<br /><span className="gradient-text">{textes['remise.titre2']}</span>
        </h1>

        <p className="font-inter text-text-secondary text-lg leading-relaxed mb-10">
          {textes['remise.texte']}
        </p>

        <Link to="/">
          <motion.span
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-green-accent text-white font-poppins font-bold tracking-wide"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
          >
            ← Retour à l'accueil
          </motion.span>
        </Link>
      </motion.div>
    </main>
  )
}
