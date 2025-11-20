import React from 'react'
import { motion } from 'framer-motion'

export default function ComingSoon(){
  return (
    <div className="relative z-10 flex flex-col items-center justify-center text-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
        className="space-y-6"
      >
        <h1
          className="text-[12vw] sm:text-7xl md:text-8xl tracking-[0.12em] font-serif"
          style={{
            color: 'rgb(210, 180, 102)',
            textShadow: '0 0 24px rgba(210,180,102,0.08)'
          }}
        >
          COMING SOON
        </h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.9 }}
          transition={{ delay: 0.6, duration: 1.4 }}
          className="text-sm md:text-base tracking-wide"
          style={{ color: 'rgba(235, 225, 205, 0.75)' }}
        >
          “Designed for wine lovers, Crafted for elegance”
        </motion.p>

        <motion.button
          whileHover={{ boxShadow: '0 0 24px rgba(210,180,102,0.25)', scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="mt-6 inline-flex items-center gap-2 rounded-full px-6 py-2 text-sm tracking-widest uppercase"
          style={{
            color: 'rgb(210, 180, 102)',
            border: '1px solid rgba(210,180,102,0.5)',
            background: 'rgba(20, 15, 10, 0.35)',
            backdropFilter: 'blur(6px)'
          }}
        >
          Notify Me
        </motion.button>
      </motion.div>
    </div>
  )
}
