import Hero from '../sections/Hero'
import SliderActions from '../sections/SliderActions'
import About from '../sections/About'
import Testimonials from '../sections/Testimonials'
import Contact from '../sections/Contact'

export default function Home() {
  return (
    <main>
      <Hero />
      <SliderActions />
      <About />
      <Testimonials />
      <Contact />
    </main>
  )
}
