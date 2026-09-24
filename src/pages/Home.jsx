import Hero from '../sections/Hero'
import SliderActions from '../sections/SliderActions'
import Actualites from '../sections/Actualites'
import About from '../sections/About'
import Testimonials from '../sections/Testimonials'
import Contact from '../sections/Contact'

export default function Home() {
  return (
    <main>
      <Hero />
      <SliderActions />
      <Actualites />
      <About />
      <Testimonials />
      <Contact />
    </main>
  )
}
