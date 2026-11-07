'use client'

import { motion } from 'framer-motion'

export function FloatingShapes() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
      <motion.svg
        className="absolute top-20 left-10 w-32 h-32 text-primary"
        viewBox="0 0 100 100"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ 
          opacity: [0.3, 0.6, 0.3],
          scale: [1, 1.2, 1],
          y: [0, -30, 0],
          rotate: [0, 180, 360]
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      >
        <circle cx="50" cy="50" r="40" fill="currentColor" opacity="0.3" />
        <circle cx="50" cy="50" r="25" fill="currentColor" opacity="0.5" />
      </motion.svg>
      
      <motion.svg
        className="absolute top-40 right-20 w-24 h-24 text-primary"
        viewBox="0 0 100 100"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ 
          opacity: [0.2, 0.5, 0.2],
          scale: [1, 1.3, 1],
          y: [0, 20, 0],
          rotate: [360, 180, 0]
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      >
        <polygon points="50,10 90,90 10,90" fill="currentColor" opacity="0.3" />
      </motion.svg>

      <motion.svg
        className="absolute bottom-40 left-20 w-28 h-28 text-primary"
        viewBox="0 0 100 100"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ 
          opacity: [0.3, 0.6, 0.3],
          scale: [1, 1.1, 1],
          y: [0, -25, 0],
          x: [0, 15, 0]
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      >
        <rect x="20" y="20" width="60" height="60" rx="10" fill="currentColor" opacity="0.3" />
      </motion.svg>

      <motion.svg
        className="absolute bottom-20 right-10 w-20 h-20 text-primary"
        viewBox="0 0 100 100"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ 
          opacity: [0.2, 0.5, 0.2],
          scale: [1, 1.4, 1],
          rotate: [0, 360]
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
      >
        <path d="M50,10 Q90,50 50,90 Q10,50 50,10" fill="currentColor" opacity="0.3" />
      </motion.svg>
    </div>
  )
}

export function AnimatedGradient() {
  return (
    <motion.div
      className="absolute inset-0 opacity-30"
      animate={{
        background: [
          'radial-gradient(circle at 20% 50%, hsl(262, 83%, 65%) 0%, transparent 50%)',
          'radial-gradient(circle at 80% 50%, hsl(217, 91%, 60%) 0%, transparent 50%)',
          'radial-gradient(circle at 50% 80%, hsl(262, 83%, 65%) 0%, transparent 50%)',
          'radial-gradient(circle at 20% 50%, hsl(262, 83%, 65%) 0%, transparent 50%)',
        ],
      }}
      transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
    />
  )
}

