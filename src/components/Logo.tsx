import React from 'react';
import { motion } from 'motion/react';

export const Logo: React.FC<{ className?: string, showText?: boolean, textColor?: string }> = ({ 
  className = "w-12 h-12", 
  showText = true,
  textColor = "text-slate-900 dark:text-white"
}) => {
  return (
    <div className="flex items-center gap-4 group cursor-pointer">
      <div className={`relative ${className}`}>
        {/* Ambient Glow */}
        <motion.div 
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ 
            duration: 4, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
          className="absolute -inset-2 bg-indigo-500/20 blur-xl rounded-full"
        />
        
        {/* Main Icon Container */}
        <div className="relative w-full h-full flex items-center justify-center">
          {/* Background Layer (Slate) */}
          <motion.div 
            whileHover={{ rotate: -12, scale: 1.05 }}
            className="absolute inset-0 bg-slate-900 dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-700/50"
          />
          
          {/* Accent Layer (Indigo) */}
          <motion.div 
            whileHover={{ rotate: 12, scale: 1.1 }}
            className="absolute inset-0 bg-indigo-600 rounded-2xl opacity-80 mix-blend-overlay"
          />
          
          {/* Glassmorphism Overlay */}
          <div className="absolute inset-0.5 bg-white/10 backdrop-blur-[2px] rounded-[14px] border border-white/20 shadow-inner" />
          
          {/* The "O" and "V" Intertwined Symbol */}
          <svg 
            viewBox="0 0 100 100" 
            className="relative z-10 w-3/5 h-3/5 text-white drop-shadow-lg"
            fill="none" 
            stroke="currentColor" 
            strokeWidth="12" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            {/* Stylized O */}
            <motion.circle 
              cx="50" cy="50" r="35" 
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
            />
            {/* Stylized V / Checkmark hybrid */}
            <motion.path 
              d="M35 50 L50 65 L75 35" 
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
              stroke="url(#logo-gradient)"
            />
            <defs>
              <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#818cf8" />
                <stop offset="100%" stopColor="#ffffff" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {showText && (
        <div className="flex flex-col -space-y-1.5">
          <div className="flex items-baseline gap-1">
            <span className={`text-2xl font-black tracking-tighter ${textColor}`}>
              OyVey
            </span>
            <motion.div 
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-1.5 h-1.5 bg-indigo-500 rounded-full mb-1"
            />
          </div>
          <span className="text-[9px] font-black uppercase tracking-[0.4em] text-indigo-500 dark:text-indigo-400 opacity-80">
            Accounting AI
          </span>
        </div>
      )}
    </div>
  );
};
