import { useEffect, useState } from 'react'
import { getSupabase, supabaseConfigure } from '../lib/supabase'
import { DEFAUTS, PAGES } from '../content/registre'

const CHAMP = 'w-full rounded-lg border border-black/15 bg-white px-4 py-3 font-inter text-text-primary ' +
              'outline-none focus:border-green-accent focus:ring-2 focus:ring-green-accent/25 transition'

/* ── Écran de connexion ─────────────────────────────────────────────── */

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
      setErreur(error.message === 'Invalid login credentials'
        ? 'Identifiants incorrects.'
        : error.message)
      return
    }
    onConnecte(data.session)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-green-deep">
      <form onSubmit={soumettre} className="w-full max-w-sm">
        <div className="font-poppins font-bold text-white text-xs leading-tight tracking-wide mb-10">
          OSTÉO<br /><span className="font-normal">ET COACHING</span><br />DU SPORT
        </div>
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

        <button
          type="submit" disabled={envoi}
          className="mt-8 w-full py-3 rounded-full bg-green-accent text-white font-poppins font-bold
                     hover:bg-teal-accent transition-colors disabled:opacity-60 cursor-pointer"
        >
          {envoi ? 'Connexion…' : 'Se connecter'}
        </button>
      </form>
    </div>
  )
}


/* ── Un champ ───────────────────────────────────────────────────────── */

function Champ({ champ, valeur, modifie, onChange, onReset, contexte }) {
  const { cle, libelle, multi } = champ
  const surcharge = valeur !== DEFAUTS[cle]
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3 mb-2">
        <label htmlFor={cle} className="font-inter text-text-primary text-sm font-medium">
          {contexte && <span className="text-text-secondary/60">{contexte} · </span>}
          {libelle}
          {modifie && <span className="ml-2 text-green-accent text-xs">modifié</span>}
        </label>
        {surcharge && (
          <button type="button" onClick={() => onReset(cle)}
                  className="font-inter text-text-secondary/70 hover:text-green-accent text-xs transition-colors cursor-pointer shrink-0">
            rétablir l’original
          </button>
        )}
      </div>
      {multi ? (
        <textarea
          id={cle} rows={Math.min(14, String(valeur).split('\n').length + 1)}
          value={valeur} onChange={e => onChange(cle, e.target.value)}
          className={CHAMP + ' resize-y leading-relaxed'}
        />
      ) : (
        <input id={cle} type="text" value={valeur}
               onChange={e => onChange(cle, e.target.value)} className={CHAMP} />
      )}
    </div>
  )
}

/* ── Recherche transverse ───────────────────────────────────────────── */

function Resultats({ filtre, valeurs, initial, onChange, onReset }) {
  const q = filtre.toLowerCase()
  const trouves = PAGES.flatMap(p =>
    p.groupes.flatMap(g =>
      g.champs
        .filter(c =>
          c.libelle.toLowerCase().includes(q) ||
          String(valeurs[c.cle]).toLowerCase().includes(q))
        .map(c => ({ champ: c, contexte: `${p.titre} · ${g.titre}` }))))

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

function Editeur({ client, session, onDeconnexion }) {
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
        </nav>

        <main className="flex-1 min-w-0">
          {/* Sélecteur mobile */}
          <select
            value={pageActive} onChange={e => { setPageActive(e.target.value); setFiltre('') }}
            className="md:hidden w-full rounded-lg border border-black/15 bg-white px-3 py-3 mb-6 font-inter"
          >
            {PAGES.map(p => <option key={p.id} value={p.id}>{p.titre}</option>)}
          </select>

          {filtre
            ? <Resultats filtre={filtre} valeurs={valeurs} initial={initial} onChange={majChamp} onReset={reinitialiser} />
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
    </div>
  )
}

/* ── Page ───────────────────────────────────────────────────────────── */

export default function Admin() {
  const [client, setClient] = useState(null)
  const [session, setSession] = useState(undefined)   // undefined = on ne sait pas encore

  useEffect(() => {
    let desabonner = () => {}
    getSupabase().then(c => {
      if (!c) { setSession(null); return }
      setClient(c)
      c.auth.getSession().then(({ data }) => setSession(data.session))
      const { data: sub } = c.auth.onAuthStateChange((_e, s) => setSession(s))
      desabonner = () => sub.subscription.unsubscribe()
    })
    return () => desabonner()
  }, [])

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

  return session
    ? <Editeur client={client} session={session} onDeconnexion={() => client.auth.signOut()} />
    : <Connexion client={client} onConnecte={setSession} />
}
