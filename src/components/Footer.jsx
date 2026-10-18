import { motion } from 'framer-motion'
import { useListe, useTextes } from '../content/ContenuProvider'
import Lien from './Lien'
import Lignes from './Lignes'

const LIEN = 'text-white/70 hover:text-green-accent transition-colors text-sm font-inter'

export default function Footer() {
  const textes = useTextes()
  const pages = useListe('pied.pages').filter(l => l.label)
  const legal = useListe('pied.legal').filter(l => l.label)
  const copyright = String(textes['pied.copyright'] ?? '').replace('{annee}', new Date().getFullYear())

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
            {textes['marque.ligne1']}<br /><span className="font-normal text-green-accent">{textes['marque.ligne2']}</span><br />{textes['marque.ligne3']}
          </div>
          <p className="text-white/50 text-sm font-inter leading-relaxed">
            <Lignes texte={textes['pied.adresse']} />
          </p>
          <p className="text-white/50 text-sm font-inter mt-3">
            <Lignes texte={textes['pied.identite']} />
          </p>
        </div>

        {/* Navigation */}
        <div className="flex flex-col gap-3">
          <h4 className="font-poppins font-bold text-xs tracking-widest text-white/40 uppercase mb-1">{textes['pied.pages.titre']}</h4>
          {pages.map(({ label, lien }, i) => (
            <Lien key={i} href={lien} className={LIEN}>{label}</Lien>
          ))}
        </div>

        {/* Contact */}
        <div className="flex flex-col gap-3">
          <h4 className="font-poppins font-bold text-xs tracking-widest text-white/40 uppercase mb-1">{textes['pied.contact.titre']}</h4>
          {textes['pied.rdv'] && (
            <Lien href={textes['lien.rdv']} className={'inline-flex items-center gap-2 ' + LIEN}>
              {textes['pied.rdv']}
            </Lien>
          )}
          {legal.length > 0 && (
            <div className="mt-2 flex flex-col gap-3">
              <h4 className="font-poppins font-bold text-xs tracking-widest text-white/40 uppercase">{textes['pied.legal.titre']}</h4>
              {legal.map(({ label, lien }, i) => (
                <Lien key={i} href={lien} className={LIEN}>{label}</Lien>
              ))}
            </div>
          )}
        </div>

      </div>

      <div className="max-w-[1360px] mx-auto mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <p className="text-white/30 text-xs font-inter">{copyright}</p>
        <p className="text-white/20 text-xs font-inter">{textes['pied.lieu']}</p>
      </div>
    </motion.footer>
  )
}
