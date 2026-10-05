import { useEffect, useState } from 'react'
import { getSupabase, supabaseConfigure } from '../lib/supabase'
import { ACTUALITES, DEFAUTS, PAGES } from '../content/registre'
import OngletActualites from './admin/Actualites'
import Fiches from './admin/Fiches'
import Champ, { CHAMP } from './admin/Champ'

/** Entrée du sommaire qui n'est pas une page de textes : photos + textes Actualités. */
const ONGLET_ACTUALITES = ACTUALITES.id

/** Onglets des fiches (hommages, témoignages), sous « Actualités ». */
const ONGLETS_FICHES = [
  { id: 'fiches-hommage', type: 'hommage', titre: 'Hommages' },
  { id: 'fiches-temoignage', type: 'temoignage', titre: 'Témoignages' },
]

/* ── Écran de connexion ─────────────────────────────────────────────── */

/** Longueur minimale d'un nouveau mot de passe. */
export const LONGUEUR_MIN_MDP = 8

const BOUTON_PRINCIPAL = `mt-8 w-full py-3 rounded-full bg-green-accent text-white font-poppins font-bold
                          hover:bg-teal-accent transition-colors disabled:opacity-60 cursor-pointer`
const LIEN_DISCRET = 'font-inter text-white/60 hover:text-white text-sm underline underline-offset-4 cursor-pointer'

const LIEN_PERIME = 'Ce lien a expiré ou a déjà servi. Demandez-en un nouveau à la personne qui vous l’a envoyé.'

/** Messages d'erreur de Supabase Auth, en français quand on les connaît. */
function traduireErreurAuth(error) {
  if (error.message === 'Invalid login credentials') return 'Identifiants incorrects.'
  if (error.code === 'same_password') return 'Le nouveau mot de passe doit être différent de l’ancien.'
  if (error.code === 'weak_password') return 'Mot de passe trop faible : allongez-le ou variez les caractères.'
  if (error.code === 'otp_expired') return LIEN_PERIME
  if (error.status === 429) return 'Trop de tentatives rapprochées. Réessayez dans quelques minutes.'
  return error.message
}

function Marque() {
  return (
    <div className="font-poppins font-bold text-white text-xs leading-tight tracking-wide mb-10">
      OSTÉO<br /><span className="font-normal">ET COACHING</span><br />DU SPORT
    </div>
  )
}

function Connexion({ client, onConnecte }) {
  const [email, setEmail] = useState('')
  const [motDePasse, setMotDePasse] = useState('')
  const [erreur, setErreur] = useState(null)
  const [envoi, setEnvoi] = useState(false)

  async function soumettre(e) {
    e.preventDefault()
    setErreur(null)
    setEnvoi(true)
    const { data, error } = await client.auth.signInWithPassword({ email, password: motDePasse })
    setEnvoi(false)
    if (error) {
      setErreur(traduireErreurAuth(error))
      return
    }
    onConnecte(data.session)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-green-deep">
      <form onSubmit={soumettre} className="w-full max-w-sm">
        <Marque />
        <h1 className="font-poppins font-bold text-white text-2xl mb-1">Administration</h1>
        <p className="font-inter text-white/50 text-sm mb-8">Connectez-vous pour modifier les textes du site.</p>

        <label className="block font-inter text-white/70 text-sm mb-2" htmlFor="email">Adresse e-mail</label>
        <input
          id="email" type="email" required autoComplete="username"
          value={email} onChange={e => setEmail(e.target.value)}
          className={CHAMP + ' mb-5'}
        />

        <label className="block font-inter text-white/70 text-sm mb-2" htmlFor="mdp">Mot de passe</label>
        <input
          id="mdp" type="password" required autoComplete="current-password"
          value={motDePasse} onChange={e => setMotDePasse(e.target.value)}
          className={CHAMP}
        />

        {erreur && (
          <p role="alert" className="font-inter text-red-300 text-sm mt-4">{erreur}</p>
        )}

        <button type="submit" disabled={envoi} className={BOUTON_PRINCIPAL}>
          {envoi ? 'Connexion…' : 'Se connecter'}
        </button>

        {/* Pas d'envoi d'e-mail depuis le site : le lien de réinitialisation
            est généré par le webmaster (scripts/lien-mot-de-passe.mjs). */}
        <p className="font-inter text-white/40 text-xs mt-6 text-center">
          Mot de passe oublié ? Demandez un lien de réinitialisation à votre webmaster.
        </p>
      </form>
    </div>
  )
}

/* ── Choix d'un nouveau mot de passe ────────────────────────────────── */

/**
 * Plein écran, par-dessus l'éditeur s'il est ouvert : l'éditeur reste monté
 * et garde les modifications en attente.
 *
 * Avec `jeton` (lien de réinitialisation), on n'est pas encore connecté : le
 * jeton n'est échangé contre une session qu'à l'envoi du formulaire. Un
 * aperçu de lien (messagerie, antivirus) qui ouvre la page ne le consomme
 * donc pas. `onAnnuler` absent = il faut aller au bout.
 */
function NouveauMotDePasse({ client, email, jeton, onTermine, onAnnuler }) {
  const [motDePasse, setMotDePasse] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [erreur, setErreur] = useState(null)
  const [envoi, setEnvoi] = useState(false)
  const [compte, setCompte] = useState(email)
  // Le jeton ne sert qu'une fois : après l'échange, un nouvel essai (mot de
  // passe refusé) passe directement à la mise à jour.
  const [jetonUtilise, setJetonUtilise] = useState(!jeton)
  const [termine, setTermine] = useState(false)

  async function soumettre(e) {
    e.preventDefault()
    setErreur(null)
    if (motDePasse.length < LONGUEUR_MIN_MDP) {
      setErreur(`Le mot de passe doit faire au moins ${LONGUEUR_MIN_MDP} caractères.`)
      return
    }
    if (motDePasse !== confirmation) {
      setErreur('Les deux mots de passe ne correspondent pas.')
      return
    }
    setEnvoi(true)
    if (!jetonUtilise) {
      const { data, error } = await client.auth.verifyOtp({ token_hash: jeton, type: 'recovery' })
      if (error) {
        setEnvoi(false)
        setErreur(error.code === 'otp_expired' || error.status === 403 ? LIEN_PERIME : traduireErreurAuth(error))
        return
      }
      setJetonUtilise(true)
      setCompte(data.user?.email)
    }
    const { error } = await client.auth.updateUser({ password: motDePasse })
    setEnvoi(false)
    if (error) {
      setErreur(traduireErreurAuth(error))
      return
    }
    setTermine(true)
  }

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="titre-mdp"
         className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center px-6 py-10 bg-green-deep">
      {termine ? (
        <div className="w-full max-w-sm">
          <Marque />
          <h1 id="titre-mdp" className="font-poppins font-bold text-white text-2xl mb-1">Mot de passe modifié</h1>
          <p role="status" className="font-inter text-white/60 text-sm">
            {compte ? `Utilisez-le désormais pour vous connecter avec ${compte}.` : 'Utilisez-le désormais pour vous connecter.'}
          </p>
          <button type="button" onClick={onTermine} className={BOUTON_PRINCIPAL}>
            Continuer vers l’administration
          </button>
        </div>
      ) : (
        <form onSubmit={soumettre} className="w-full max-w-sm">
          <Marque />
          <h1 id="titre-mdp" className="font-poppins font-bold text-white text-2xl mb-1">Nouveau mot de passe</h1>
          <p className="font-inter text-white/50 text-sm mb-8">
            {compte ? `Pour le compte ${compte}. ` : ''}Au moins {LONGUEUR_MIN_MDP} caractères.
          </p>

          {/* Champ caché : aide les gestionnaires de mots de passe à rattacher le nouveau au bon compte. */}
          {compte && <input type="email" autoComplete="username" value={compte} readOnly hidden />}

          <label className="block font-inter text-white/70 text-sm mb-2" htmlFor="nouveau-mdp">Nouveau mot de passe</label>
          <input
            id="nouveau-mdp" type="password" required autoComplete="new-password" autoFocus
            value={motDePasse} onChange={e => setMotDePasse(e.target.value)}
            className={CHAMP + ' mb-5'}
          />

          <label className="block font-inter text-white/70 text-sm mb-2" htmlFor="confirmation-mdp">Confirmer le mot de passe</label>
          <input
            id="confirmation-mdp" type="password" required autoComplete="new-password"
            value={confirmation} onChange={e => setConfirmation(e.target.value)}
            className={CHAMP}
          />

          {erreur && (
            <p role="alert" className="font-inter text-red-300 text-sm mt-4">{erreur}</p>
          )}

          <button type="submit" disabled={envoi} className={BOUTON_PRINCIPAL}>
            {envoi ? 'Enregistrement…' : 'Enregistrer le mot de passe'}
          </button>

          {onAnnuler && (
            <div className="mt-6 text-center">
              <button type="button" onClick={onAnnuler} className={LIEN_DISCRET}>Annuler</button>
            </div>
          )}
        </form>
      )}
    </div>
  )
}


/* ── Recherche transverse ───────────────────────────────────────────── */

function Resultats({ filtre, valeurs, initial, onChange, onReset }) {
  const q = filtre.toLowerCase()
  const correspond = c =>
    c.libelle.toLowerCase().includes(q) || String(valeurs[c.cle]).toLowerCase().includes(q)
  const trouves = [
    ...PAGES.flatMap(p =>
      p.groupes.flatMap(g =>
        g.champs.filter(correspond).map(c => ({ champ: c, contexte: `${p.titre} · ${g.titre}` })))),
    ...ACTUALITES.champs.filter(correspond).map(c => ({ champ: c, contexte: ACTUALITES.titre })),
  ]

  if (!trouves.length) {
    return <p className="font-inter text-text-secondary">Aucun texte ne correspond à « {filtre} ».</p>
  }
  return (
    <>
      <h2 className="font-poppins font-bold text-text-primary text-2xl mb-8">
        {trouves.length} résultat{trouves.length > 1 ? 's' : ''}
      </h2>
      <div className="space-y-6">
        {trouves.map(({ champ, contexte }) => (
          <Champ key={champ.cle} champ={champ} valeur={valeurs[champ.cle]}
                 modifie={valeurs[champ.cle] !== initial[champ.cle]}
                 contexte={contexte} onChange={onChange} onReset={onReset} />
        ))}
      </div>
    </>
  )
}

/* ── Éditeur ────────────────────────────────────────────────────────── */

function Editeur({ client, session, onChangerMotDePasse, onDeconnexion }) {
  const [pageActive, setPageActive] = useState(PAGES[0].id)
  const [filtre, setFiltre] = useState('')
  const [valeurs, setValeurs] = useState(DEFAUTS)
  const [initial, setInitial] = useState(DEFAUTS)
  const [etat, setEtat] = useState('chargement')   // chargement | pret | envoi
  const [message, setMessage] = useState(null)

  useEffect(() => {
    let vivant = true
    client.from('site_content').select('cle, valeur').then(({ data, error }) => {
      if (!vivant) return
      if (error) {
        setMessage({ type: 'erreur', texte: `Lecture impossible : ${error.message}` })
        setEtat('pret')
        return
      }
      const enBase = Object.fromEntries((data ?? []).map(({ cle, valeur }) => [cle, valeur]))
      const fusion = { ...DEFAUTS, ...enBase }
      setValeurs(fusion)
      setInitial(fusion)
      setEtat('pret')
    })
    return () => { vivant = false }
  }, [client])

  const modifiees = Object.keys(valeurs).filter(c => valeurs[c] !== initial[c])

  const majChamp = (cle, v) => setValeurs(prev => ({ ...prev, [cle]: v }))
  const modifsActualites = ACTUALITES.champs.filter(c => valeurs[c.cle] !== initial[c.cle]).length
  const compteModifs = (page) =>
    page.groupes.flatMap(g => g.champs).filter(c => valeurs[c.cle] !== initial[c.cle]).length

  async function enregistrer() {
    if (!modifiees.length) return
    setEtat('envoi')
    setMessage(null)
    const lignes = modifiees.map(cle => ({ cle, valeur: valeurs[cle] }))
    const { error } = await client.from('site_content').upsert(lignes, { onConflict: 'cle' })
    setEtat('pret')
    if (error) {
      setMessage({ type: 'erreur', texte: `Enregistrement refusé : ${error.message}` })
      return
    }
    setInitial({ ...valeurs })
    setMessage({ type: 'succes', texte: `${lignes.length} texte${lignes.length > 1 ? 's' : ''} enregistré${lignes.length > 1 ? 's' : ''}.` })
  }

  function reinitialiser(cle) {
    setValeurs(v => ({ ...v, [cle]: DEFAUTS[cle] }))
  }

  if (etat === 'chargement') {
    return <p className="font-inter text-text-secondary p-10">Chargement des textes…</p>
  }

  return (
    <div className="min-h-screen bg-site-bg pb-40">
      <header className="sticky top-0 z-20 bg-green-deep px-6 md:px-10 py-5 flex items-center justify-between gap-4">
        <div>
          <div className="font-poppins font-bold text-white">Administration</div>
          <div className="font-inter text-white/50 text-xs">{session.user.email}</div>
        </div>
        <div className="flex items-center gap-3">
          <a href="/" target="_blank" rel="noreferrer"
             className="font-inter text-white/70 hover:text-white text-sm transition-colors">
            Voir le site ↗
          </a>
          <button onClick={onChangerMotDePasse}
                  className="font-inter text-white/70 hover:text-white text-sm transition-colors cursor-pointer">
            Mot de passe
          </button>
          <button onClick={onDeconnexion}
                  className="font-inter text-white/70 hover:text-white text-sm transition-colors cursor-pointer">
            Se déconnecter
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 pt-10 flex gap-10">

        {/* Sommaire des pages */}
        <nav className="hidden md:block w-56 shrink-0 sticky top-28 self-start">
          <input
            type="search" value={filtre} onChange={e => setFiltre(e.target.value)}
            placeholder="Rechercher un texte…"
            className="w-full rounded-lg border border-black/15 bg-white px-3 py-2 mb-5 font-inter text-sm
                       outline-none focus:border-green-accent transition"
          />
          <ul className="space-y-1">
            {PAGES.map(p => {
              const n = compteModifs(p)
              return (
                <li key={p.id}>
                  <button
                    onClick={() => { setPageActive(p.id); setFiltre('') }}
                    className={`w-full text-left px-3 py-2 rounded-lg font-inter text-sm transition-colors cursor-pointer
                      ${p.id === pageActive && !filtre
                        ? 'bg-green-accent text-white'
                        : 'text-text-secondary hover:bg-black/5'}`}
                  >
                    {p.titre}
                    {n > 0 && (
                      <span className={`ml-2 text-xs ${p.id === pageActive && !filtre ? 'text-white/80' : 'text-green-accent'}`}>
                        ({n})
                      </span>
                    )}
                  </button>
                </li>
              )
            })}
          </ul>
          <div className="mt-5 pt-5 border-t border-black/10">
            <button
              onClick={() => { setPageActive(ONGLET_ACTUALITES); setFiltre('') }}
              className={`w-full text-left px-3 py-2 rounded-lg font-inter text-sm transition-colors cursor-pointer
                ${pageActive === ONGLET_ACTUALITES && !filtre
                  ? 'bg-green-accent text-white'
                  : 'text-text-secondary hover:bg-black/5'}`}
            >
              {ACTUALITES.titre}
              {modifsActualites > 0 && (
                <span className={`ml-2 text-xs ${pageActive === ONGLET_ACTUALITES && !filtre ? 'text-white/80' : 'text-green-accent'}`}>
                  ({modifsActualites})
                </span>
              )}
            </button>
            {ONGLETS_FICHES.map(o => (
              <button
                key={o.id}
                onClick={() => { setPageActive(o.id); setFiltre('') }}
                className={`w-full text-left px-3 py-2 rounded-lg font-inter text-sm transition-colors cursor-pointer mt-1
                  ${o.id === pageActive && !filtre
                    ? 'bg-green-accent text-white'
                    : 'text-text-secondary hover:bg-black/5'}`}
              >
                {o.titre}
              </button>
            ))}
          </div>
        </nav>

        <main className="flex-1 min-w-0">
          {/* Sélecteur mobile */}
          <select
            value={pageActive} onChange={e => { setPageActive(e.target.value); setFiltre('') }}
            className="md:hidden w-full rounded-lg border border-black/15 bg-white px-3 py-3 mb-6 font-inter"
          >
            {PAGES.map(p => <option key={p.id} value={p.id}>{p.titre}</option>)}
            <option value={ONGLET_ACTUALITES}>{ACTUALITES.titre}</option>
            {ONGLETS_FICHES.map(o => <option key={o.id} value={o.id}>{o.titre}</option>)}
          </select>

          {filtre
            ? <Resultats filtre={filtre} valeurs={valeurs} initial={initial} onChange={majChamp} onReset={reinitialiser} />
            : ONGLETS_FICHES.some(o => o.id === pageActive)
              // `key` sur le type : un changement d'onglet remonte le composant plutôt que
              // de réutiliser son état (édition en cours, liste) pour l'autre type de fiche.
              ? <Fiches key={ONGLETS_FICHES.find(o => o.id === pageActive).type}
                        client={client} type={ONGLETS_FICHES.find(o => o.id === pageActive).type} />
              : pageActive === ONGLET_ACTUALITES
              ? <OngletActualites client={client} valeurs={valeurs} initial={initial}
                                  onChange={majChamp} onReset={reinitialiser} />
              : (() => {
                const page = PAGES.find(p => p.id === pageActive)
                return (
                  <>
                    <div className="mb-8">
                      <h2 className="font-poppins font-bold text-text-primary text-2xl">{page.titre}</h2>
                      <a href={page.route} target="_blank" rel="noreferrer"
                         className="font-inter text-sm text-green-accent hover:underline">
                        voir la page ↗
                      </a>
                    </div>
                    {page.groupes.map(groupe => (
                      <section key={groupe.id} className="mb-12">
                        <h3 className="font-poppins font-bold text-text-primary text-base mb-5 pb-2 border-b border-black/10">
                          {groupe.titre}
                        </h3>
                        <div className="space-y-6">
                          {groupe.champs.map(c => (
                            <Champ key={c.cle} champ={c} valeur={valeurs[c.cle]}
                                   modifie={valeurs[c.cle] !== initial[c.cle]}
                                   onChange={majChamp} onReset={reinitialiser} />
                          ))}
                        </div>
                      </section>
                    ))}
                  </>
                )
              })()}
        </main>
      </div>

      {/* Barre d'enregistrement */}
      {!((pageActive === ONGLET_ACTUALITES || ONGLETS_FICHES.some(o => o.id === pageActive)) && !modifiees.length) && (
        <div className="fixed bottom-0 inset-x-0 z-20 bg-white border-t border-black/10 px-6 py-4">
          <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
            <div className="font-inter text-sm">
              {message
                ? <span className={message.type === 'erreur' ? 'text-red-600' : 'text-green-accent'}>{message.texte}</span>
                : <span className="text-text-secondary">
                    {modifiees.length ? `${modifiees.length} modification${modifiees.length > 1 ? 's' : ''} en attente` : 'Aucune modification'}
                  </span>}
            </div>
            <button
              onClick={enregistrer}
              disabled={!modifiees.length || etat === 'envoi'}
              className="px-7 py-3 rounded-full bg-green-accent text-white font-poppins font-bold text-sm
                         hover:bg-teal-accent transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              {etat === 'envoi' ? 'Enregistrement…' : 'Enregistrer'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Page ───────────────────────────────────────────────────────────── */

/**
 * Jeton d'un lien de réinitialisation `/admin#recuperation=<jeton>`, généré
 * par scripts/lien-mot-de-passe.mjs. Il est dans le fragment : il n'est
 * jamais envoyé au serveur, ni consigné dans les journaux.
 */
export function lireJeton(hash) {
  return new URLSearchParams(hash.replace(/^#/, '')).get('recuperation') || null
}

export default function Admin() {
  const [client, setClient] = useState(null)
  const [session, setSession] = useState(undefined)   // undefined = on ne sait pas encore
  const [jeton, setJeton] = useState(() => lireJeton(window.location.hash))
  const [changement, setChangement] = useState(false)

  useEffect(() => {
    let desabonner = () => {}
    getSupabase().then(c => {
      if (!c) { setSession(null); return }
      setClient(c)
      c.auth.getSession().then(({ data }) => setSession(data.session))
      const { data: sub } = c.auth.onAuthStateChange((evenement, s) => {
        if (evenement === 'SIGNED_OUT') setChangement(false)
        setSession(s)
      })
      desabonner = () => sub.subscription.unsubscribe()
    })
    return () => desabonner()
  }, [])

  function finRecuperation() {
    // Le jeton a servi : il ne doit pas rouvrir le formulaire à l'actualisation.
    window.history.replaceState(null, '', window.location.pathname + window.location.search)
    setJeton(null)
  }

  if (!supabaseConfigure) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 bg-green-deep">
        <div className="max-w-md">
          <h1 className="font-poppins font-bold text-white text-xl mb-3">Administration indisponible</h1>
          <p className="font-inter text-white/60 text-sm leading-relaxed">
            Les variables <code className="text-white/90">VITE_SUPABASE_URL</code> et{' '}
            <code className="text-white/90">VITE_SUPABASE_PUBLISHABLE_KEY</code> ne sont pas définies
            sur cet environnement. Le site public reste affiché normalement.
          </p>
        </div>
      </div>
    )
  }

  if (session === undefined || !client) {
    return <div className="min-h-screen bg-green-deep" />
  }

  // Arrivé par un lien de réinitialisation : connecté ou non, on choisit
  // d'abord le nouveau mot de passe ; l'éditeur s'ouvre ensuite.
  if (jeton) {
    return <NouveauMotDePasse client={client} jeton={jeton} onTermine={finRecuperation} />
  }

  if (!session) {
    return <Connexion client={client} onConnecte={setSession} />
  }

  return (
    <>
      <Editeur client={client} session={session}
               onChangerMotDePasse={() => setChangement(true)}
               onDeconnexion={() => client.auth.signOut()} />
      {changement && (
        <NouveauMotDePasse client={client} email={session.user.email}
                           onTermine={() => setChangement(false)}
                           onAnnuler={() => setChangement(false)} />
      )}
    </>
  )
}
