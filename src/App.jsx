import { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import Histoire from './pages/Histoire'
import BilanOsteopathique from './pages/BilanOsteopathique'
import SuiviSportif from './pages/SuiviSportif'
import InterventionEntreprise from './pages/InterventionEntreprise'
import ProjetSportif from './pages/ProjetSportif'
import KinesportFurd from './pages/KinesportFurd'
import MentionsLegales from './pages/MentionsLegales'
import Navbar from './components/Navbar'
import ScrollManager from './components/ScrollManager'
import Footer from './components/Footer'
import { ContenuProvider } from './content/ContenuProvider'

// L'administration n'est chargée que si on s'y rend.
const Admin = lazy(() => import('./pages/Admin'))

/** L'administration a sa propre mise en page : ni barre de navigation, ni pied de page. */
function Site() {
  const admin = useLocation().pathname.startsWith('/admin')
  return (
    <>
      {!admin && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/histoire" element={<Histoire />} />
        <Route path="/bilan-osteopathique" element={<BilanOsteopathique />} />
        <Route path="/suivi-sportif" element={<SuiviSportif />} />
        <Route path="/intervention-entreprise" element={<InterventionEntreprise />} />
        <Route path="/projet-sportif" element={<ProjetSportif />} />
        <Route path="/kinesport-furd" element={<KinesportFurd />} />
        <Route path="/mentions-legales" element={<MentionsLegales />} />
        <Route path="/admin" element={
          <Suspense fallback={<div className="min-h-screen bg-green-deep" />}>
            <Admin />
          </Suspense>
        } />
      </Routes>
      {!admin && <Footer />}
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ContenuProvider>
        <ScrollManager />
        <Site />
      </ContenuProvider>
    </BrowserRouter>
  )
}
