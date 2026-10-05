#!/usr/bin/env node
/**
 * Génère un lien de réinitialisation du mot de passe d'un compte admin, à
 * transmettre soi-même (SMS, messagerie…) : le site n'envoie aucun e-mail.
 *
 *   node scripts/lien-mot-de-passe.mjs krieger.manu@orange.fr
 *   node scripts/lien-mot-de-passe.mjs krieger.manu@orange.fr --demo
 *
 * Il faut la clé secrète du projet (Supabase → Project Settings → API Keys →
 * Secret keys, `sb_secret_…`) dans `.env.local`, jamais commité :
 *
 *   SUPABASE_SECRET_KEY=sb_secret_…
 *
 * Le lien mène à `/admin#recuperation=<jeton>`. Le jeton ne sert qu'une fois
 * et expire selon le réglage Authentication → Providers → Email →
 * « Email OTP Expiration » (1 h par défaut, 24 h au plus).
 */
import { existsSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'

for (const fichier of ['.env', '.env.local']) {
  if (existsSync(fichier)) process.loadEnvFile(fichier)
}

const SITES = {
  production: 'https://osteo-et-coaching-du-sport.com',
  demo: 'https://demonstration.osteo-et-coaching-du-sport.com',
}

const email = process.argv.slice(2).find(a => !a.startsWith('--'))
const site = process.argv.includes('--demo') ? SITES.demo : SITES.production
const url = process.env.VITE_SUPABASE_URL
const cleSecrete = process.env.SUPABASE_SECRET_KEY

function arreter(message) {
  console.error(message)
  process.exit(1)
}

if (!email) arreter('Usage : node scripts/lien-mot-de-passe.mjs <adresse> [--demo]')
if (!url) arreter('VITE_SUPABASE_URL manque (.env).')
if (!cleSecrete) arreter('SUPABASE_SECRET_KEY manque : ajoutez-la dans .env.local (voir l’en-tête du script).')

const supabase = createClient(url, cleSecrete, { auth: { persistSession: false, autoRefreshToken: false } })

// `generateLink` crée le jeton sans rien envoyer. On n'utilise pas son
// `action_link` (qui consomme le jeton dès qu'il est ouvert, aperçus de
// messagerie compris) mais le jeton haché, échangé par la page /admin
// seulement quand le nouveau mot de passe est validé.
const { data, error } = await supabase.auth.admin.generateLink({ type: 'recovery', email })
if (error) arreter(`Échec : ${error.message}`)

const { count } = await supabase.from('admins').select('email', { count: 'exact', head: true }).eq('email', email)
if (!count) console.warn(`Attention : ${email} n’est pas dans public.admins, il pourra se connecter mais pas enregistrer.\n`)

console.log(`${site}/admin#recuperation=${data.properties.hashed_token}`)
