"use client"

import React from "react"
import { motion } from "framer-motion"

interface PhysicsHeroProps {
  videoSrc?: string
  placeholderImage?: string
}

export const PhysicsHero = ({ videoSrc, placeholderImage }: PhysicsHeroProps) => {
  return (
    <div className="relative w-full h-full bg-background overflow-hidden flex items-center justify-center">
      {videoSrc ? (
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        >
          <source src={videoSrc} type="video/mp4" />
        </video>
      ) : (
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-40"
          style={{ backgroundImage: placeholderImage ? `url(${placeholderImage})` : 'none' }}
        />
      )}
      
      {/* Black Hole / Singularity Placeholder Visual */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 2, ease: "easeOut" }}
        className="relative z-10 size-64 lg:size-96 rounded-full"
      >
        {/* Event Horizon Glow */}
        <div className="absolute inset-0 rounded-full bg-white/5 blur-[80px]" />
        
        {/* Accretion Disk Simulation (Styled Placeholder) */}
        <div className="absolute inset-[-10%] rounded-full border border-white/5 bg-gradient-to-b from-transparent via-white/5 to-transparent rotate-[30deg]" />
        
        {/* The Singularity */}
        <div className="absolute inset-2 rounded-full bg-black border border-white/10 flex items-center justify-center overflow-hidden">
           <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.05)_0%,_transparent_70%)]" />
        </div>
      </motion.div>

      {/* Atmospheric overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_black_90%)] opacity-80" />
    </div>
  )
}
