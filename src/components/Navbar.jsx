import { useState, useEffect } from 'react'
import { motion, AnimatePresence, useScroll, useTransform, useMotionTemplate } from 'framer-motion'
import { Link, useNavigate, useLocation } from 'react-router-dom'

// Libellés courts des quatre services du hero + l'histoire. « Intervention
// en entreprise » reste accessible depuis le pied de page.
const navLinks = [
  { label: 'Histoire & formation', href: '/histoire' },
  { label: 'Bilan ostéopathique', href: '/bilan-osteopathique' },
  { label: 'Suivi haut niveau', href: '/suivi-sportif' },
  { label: 'Projet sportif', href: '/projet-sportif' },
  { label: 'Remise en forme', href: '/kinesport-furd' },
]

const TEXT_LIGHT = '#ffffff'
const TEXT_DARK  = '#1A2832'

export default function Navbar() {
  const [menuOpen, setMenuOpen]   = useState(false)
  const [scrolled, setScrolled]   = useState(false)
  const { scrollY } = useScroll()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const isHome = pathname === '/'

  const bgOpacity     = useTransform(scrollY, [0, 72], [0, 0.75])
  const borderOpacity = useTransform(scrollY, [0, 72], [0, 0.12])
  const shadowOpacity = useTransform(scrollY, [0, 72], [0, 0.30])

  const bgColor    = useMotionTemplate`rgba(13,30,43,${bgOpacity})`
  const borderBot  = useMotionTemplate`1px solid rgba(255,255,255,${borderOpacity})`
  const boxShadow  = useMotionTemplate`0 2px 24px rgba(0,0,0,${shadowOpacity})`

  const [pastHero, setPastHero] = useState(false)

  useEffect(() => {
    const unsubHero = scrollY.on('change', v => {
      setPastHero(v > window.innerHeight * 0.7)
      // Le fond est quasiment opaque à 64px → on bascule le texte
      setScrolled(v > 64)
    })
    return unsubHero
  }, [scrollY])

  const textColor = TEXT_LIGHT

  return (
    <>
      <motion.nav
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl"
        style={{
          backgroundColor: bgColor,
          borderBottom: borderBot,
          boxShadow: boxShadow,
        }}
      >
        <div className="max-w-[1360px] mx-auto px-6 desktop:px-12 h-[72px] flex items-center justify-between">

          {/* Logo */}
          <Link to="/">
            <motion.div
              className="font-poppins font-bold text-xs leading-tight tracking-wide cursor-pointer"
              animate={{ color: textColor }}
              transition={{ duration: 0.18 }}
            >
              OSTÉO<br /><span className="font-normal">ET COACHING</span><br />DU SPORT
            </motion.div>
          </Link>

          {/* Liens desktop */}
          <div className="hidden desktop:flex items-center gap-8">
            {(!isHome || pastHero) && navLinks.map(link => (
              <NavLink key={link.label} href={link.href} textColor={textColor}>
                {link.label}
              </NavLink>
            ))}
            <motion.a
              href="#contact"
              className="px-5 py-2 rounded-full text-sm font-semibold font-inter bg-green-accent text-white hover:bg-teal-accent transition-colors"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
            >
              Prendre rendez-vous
            </motion.a>
          </div>

          {/* Burger mobile */}
          <motion.button
            className="desktop:hidden flex flex-col gap-1.5 p-2"
            onClick={() => setMenuOpen(o => !o)}
            aria-label="Menu"
            aria-expanded={menuOpen}
            whileTap={{ scale: 0.9 }}
            animate={{ color: textColor }}
            transition={{ duration: 0.18 }}
          >
            {[0, 1, 2].map(i => (
              <motion.span
                key={i}
                className="block w-6 h-0.5 bg-current"
                animate={menuOpen
                  ? i === 0 ? { rotate: 45, y: 8 }
                  : i === 1 ? { opacity: 0 }
                  : { rotate: -45, y: -8 }
                  : { rotate: 0, y: 0, opacity: 1 }
                }
                transition={{ duration: 0.2 }}
              />
            ))}
          </motion.button>
        </div>
      </motion.nav>

      {/* Menu plein écran mobile */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="fixed inset-0 z-[60] desktop:hidden flex flex-col"
            style={{ background: 'linear-gradient(135deg, var(--c-deep-darker-hex) 0%, var(--c-deep-hex) 60%, var(--c-deep-mid-hex) 100%)' }}
            initial={{ clipPath: 'circle(0% at calc(100% - 44px) 36px)' }}
            animate={{ clipPath: 'circle(150% at calc(100% - 44px) 36px)' }}
            exit={{ clipPath: 'circle(0% at calc(100% - 44px) 36px)' }}
            transition={{ duration: 0.55, ease: [0.76, 0, 0.24, 1] }}
          >
            {/* Bouton fermer */}
            <div className="flex justify-end px-6 pt-6">
              <motion.button
                className="w-11 h-11 flex items-center justify-center rounded-full border border-white/20 text-white"
                onClick={() => setMenuOpen(false)}
                aria-label="Fermer le menu"
                initial={{ opacity: 0, rotate: -90 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: -90 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                whileTap={{ scale: 0.9 }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M1 1L15 15M15 1L1 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </motion.button>
            </div>

            {/* Liens */}
            <div className="flex-1 flex flex-col justify-center px-10 gap-1">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.label}
                  initial={{ opacity: 0, x: -40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  transition={{ duration: 0.4, delay: 0.15 + i * 0.07, ease: [0.22, 1, 0.36, 1] }}
                >
                  <a
                    href={link.href}
                    className="block py-4 border-b border-white/10 font-poppins font-bold text-white text-3xl tracking-tight hover:text-cyan-accent transition-colors"
                    onClick={(e) => { e.preventDefault(); setMenuOpen(false); navigate(link.href) }}
                  >
                    {link.label}
                  </a>
                </motion.div>
              ))}
            </div>

            {/* CTA */}
            <motion.div
              className="px-10 pb-14"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 24 }}
              transition={{ duration: 0.4, delay: 0.45 }}
            >
              <a
                href="#contact"
                className="block w-full text-center px-8 py-4 rounded-full bg-green-accent text-white font-poppins font-bold text-base tracking-wide"
                onClick={() => setMenuOpen(false)}
              >
                Prendre rendez-vous
              </a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

function NavLink({ href, children, textColor }) {
  const navigate = useNavigate()
  return (
    <motion.a
      href={href}
      onClick={(e) => { e.preventDefault(); navigate(href) }}
      className="relative text-sm font-inter font-medium group"
      animate={{ color: textColor }}
      transition={{ duration: 0.18 }}
      whileHover="hover"
    >
      {children}
      <motion.span
        className="absolute -bottom-0.5 left-0 h-px bg-green-accent"
        variants={{ hover: { width: '100%' }, initial: { width: 0 } }}
        initial="initial"
        style={{ width: 0 }}
        transition={{ duration: 0.2 }}
      />
    </motion.a>
  )
}
