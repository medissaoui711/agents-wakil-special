import Navbar from '../sections/Navbar'
import Hero from '../sections/Hero'
import AgentNetwork from '../sections/AgentNetwork'
import HowItWorks from '../sections/HowItWorks'
import UseCases from '../sections/UseCases'
import Privacy from '../sections/Privacy'
import CTA from '../sections/CTA'
import Footer from '../sections/Footer'

export default function Home() {
  return (
    <div className="min-h-screen bg-white overflow-x-hidden" style={{ direction: 'rtl' }}>
      <Navbar />
      <Hero />
      <AgentNetwork />
      <HowItWorks />
      <UseCases />
      <Privacy />
      <CTA />
      <Footer />
    </div>
  )
}
