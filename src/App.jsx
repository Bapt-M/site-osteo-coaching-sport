import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Histoire from './pages/Histoire'
import BilanOsteopathique from './pages/BilanOsteopathique'
import SuiviSportif from './pages/SuiviSportif'
import InterventionEntreprise from './pages/InterventionEntreprise'
import ProjetSportif from './pages/ProjetSportif'
import KinesportFurd from './pages/KinesportFurd'
import Navbar from './components/Navbar'
import Footer from './components/Footer'

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/histoire" element={<Histoire />} />
        <Route path="/bilan-osteopathique" element={<BilanOsteopathique />} />
        <Route path="/suivi-sportif" element={<SuiviSportif />} />
        <Route path="/intervention-entreprise" element={<InterventionEntreprise />} />
        <Route path="/projet-sportif" element={<ProjetSportif />} />
        <Route path="/kinesport-furd" element={<KinesportFurd />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  )
}
