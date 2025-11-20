import React from 'react'
import { motion } from 'framer-motion'
import HeroCanvas from './components/HeroCanvas'
import ComingSoon from './components/ComingSoon'

function App() {
  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: '#0a0a0a' }}>
      {/* Cinematic bokeh particles */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute -top-10 left-1/3 w-72 h-72 rounded-full blur-3xl" style={{ background: 'radial-gradient(circle, rgba(130,90,40,0.18), transparent 60%)' }} />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full blur-[100px]" style={{ background: 'radial-gradient(circle, rgba(100,30,25,0.22), transparent 65%)' }} />
      </div>

      {/* WebGL hero: wine liquid + matte bottle silhouette */}
      <HeroCanvas />

      {/* Dark vignette for depth */}
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(60% 60% at 50% 45%, rgba(0,0,0,0) 0%, rgba(0,0,0,0.3) 60%, rgba(0,0,0,0.85) 100%)'
      }} />

      {/* Header / Brand mark */}
      <header className="relative z-10 flex items-center justify-center pt-10">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }} className="text-center">
          <div className="text-xs tracking-[0.4em] uppercase" style={{ color: 'rgba(210,180,102,0.7)' }}>VinoCEO</div>
        </motion.div>
      </header>

      {/* Main content */}
      <main className="relative z-10 flex items-center justify-center min-h-[70vh] p-6">
        <ComingSoon />
      </main>

      {/* Subtle bottom info */}
      <footer className="relative z-10 flex items-center justify-center pb-10">
        <p className="text-[10px] tracking-[0.35em] uppercase" style={{ color: 'rgba(210,180,102,0.55)' }}>
          Crafted in Quiet Luxury
        </p>
      </footer>
    </div>
  )
}

export default App
