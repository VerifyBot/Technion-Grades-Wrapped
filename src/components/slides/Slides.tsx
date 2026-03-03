import React from 'react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';
import { WrappedStat } from '../../types';

interface SlideProps {
  stat: WrappedStat;
  isActive: boolean;
}

const PALETTE_STYLES = {
  green: {
    bg: 'bg-[#1DB954]',
    text: 'text-black',
    accent: 'text-white',
    pattern: 'radial-gradient(circle at 50% 50%, #1ed760 0%, #1DB954 100%)'
  },
  pink: {
    bg: 'bg-[#FF0055]',
    text: 'text-white',
    accent: 'text-black',
    pattern: 'repeating-linear-gradient(45deg, #FF0055, #FF0055 10px, #ff1a6b 10px, #ff1a6b 20px)'
  },
  blue: {
    bg: 'bg-[#2E77D0]',
    text: 'text-[#F59B23]',
    accent: 'text-white',
    pattern: 'conic-gradient(from 0deg at 50% 50%, #2E77D0 0deg, #1a5fb0 180deg, #2E77D0 360deg)'
  },
  purple: {
    bg: 'bg-[#8C1932]',
    text: 'text-[#D9E021]',
    accent: 'text-white',
    pattern: 'linear-gradient(135deg, #8C1932 25%, #6e1225 25%, #6e1225 50%, #8C1932 50%, #8C1932 75%, #6e1225 75%, #6e1225 100%)'
  },
  orange: {
    bg: 'bg-[#F59B23]',
    text: 'text-black',
    accent: 'text-[#2E77D0]',
    pattern: 'radial-gradient(circle at 100% 100%, #F59B23 0%, #d48215 50%, #F59B23 100%)'
  }
};

export const SlideLayout: React.FC<SlideProps & { children: React.ReactNode }> = ({ stat, isActive, children }) => {
  const styles = PALETTE_STYLES[stat.colorPalette];

  return (
    <div className={cn("absolute inset-0 w-full h-full overflow-hidden flex flex-col p-8", styles.bg)}>
      {/* Background Pattern */}
      <div 
        className="absolute inset-0 opacity-20 pointer-events-none" 
        style={{ background: styles.pattern, backgroundSize: '40px 40px' }} 
      />
      
      {/* Content Container */}
      <motion.div 
        className={cn("relative z-10 flex flex-col h-full", styles.text)}
        initial={{ opacity: 0 }}
        animate={{ opacity: isActive ? 1 : 0 }}
        transition={{ duration: 0.5 }}
      >
        {children}
      </motion.div>

      {/* Spotify-like Progress Bar (Visual only for vibe) */}
      <div className="absolute top-4 left-4 right-4 flex gap-2 z-20">
        {/* This would be handled by the parent controller in a real app, but adding a static one for 'vibe' if needed */}
      </div>
    </div>
  );
};

// --- Template Components ---

export const BigNumberSlide: React.FC<SlideProps> = ({ stat, isActive }) => {
  const styles = PALETTE_STYLES[stat.colorPalette];
  
  return (
    <SlideLayout stat={stat} isActive={isActive}>
      <div className="flex-1 flex flex-col justify-center items-center text-center w-full">
        <motion.h2 
          className={cn("text-3xl md:text-5xl font-bold mb-8 uppercase tracking-tighter max-w-full break-words", styles.text)}
          initial={{ y: 50, opacity: 0 }}
          animate={isActive ? { y: 0, opacity: 1 } : {}}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          {stat.text}
        </motion.h2>
        
        <motion.div
          className={cn("leading-none font-black tracking-tighter my-4", styles.accent)}
          style={{ fontSize: 'clamp(6rem, 25vw, 12rem)' }}
          initial={{ scale: 0.5, opacity: 0, rotate: -10 }}
          animate={isActive ? { scale: 1, opacity: 1, rotate: 0 } : {}}
          transition={{ type: "spring", bounce: 0.5, delay: 0.4 }}
        >
          {stat.data.value}
        </motion.div>

        <motion.p 
          className={cn("text-xl md:text-2xl font-bold max-w-md w-full break-words px-4", styles.text)}
          initial={{ y: 50, opacity: 0 }}
          animate={isActive ? { y: 0, opacity: 1 } : {}}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          {stat.subtext}
        </motion.p>
      </div>
    </SlideLayout>
  );
};

export const TextFocusSlide: React.FC<SlideProps> = ({ stat, isActive }) => {
  const styles = PALETTE_STYLES[stat.colorPalette];
  
  return (
    <SlideLayout stat={stat} isActive={isActive}>
      <div className="flex-1 flex flex-col justify-center items-start text-left w-full">
        <motion.div
          className="space-y-4 w-full"
          initial="hidden"
          animate={isActive ? "visible" : "hidden"}
          variants={{
            visible: { transition: { staggerChildren: 0.2 } }
          }}
        >
          {stat.text.split(' ').map((word, i) => (
            <motion.span 
              key={i}
              className={cn("block font-black uppercase tracking-tighter leading-[0.9] break-words", styles.accent)}
              style={{ fontSize: 'clamp(3rem, 12vw, 6rem)' }}
              variants={{
                hidden: { x: -50, opacity: 0 },
                visible: { x: 0, opacity: 1 }
              }}
            >
              {word}
            </motion.span>
          ))}
        </motion.div>

        <motion.p 
          className={cn("mt-12 text-2xl md:text-3xl font-bold max-w-full break-words", styles.text)}
          initial={{ opacity: 0 }}
          animate={isActive ? { opacity: 1 } : {}}
          transition={{ delay: 1 }}
        >
          {stat.subtext}
        </motion.p>
      </div>
    </SlideLayout>
  );
};

export const ComparisonSlide: React.FC<SlideProps> = ({ stat, isActive }) => {
  const styles = PALETTE_STYLES[stat.colorPalette];
  const labels = stat.data.labels || ['Moed A', 'Moed B'];
  
  return (
    <SlideLayout stat={stat} isActive={isActive}>
      <div className="flex-1 flex flex-col justify-center items-center w-full max-w-full overflow-hidden px-4">
        <motion.h2 
          className={cn("text-2xl md:text-4xl font-bold mb-8 text-center uppercase break-words w-full max-w-2xl", styles.text)}
          initial={{ opacity: 0 }}
          animate={isActive ? { opacity: 1 } : {}}
        >
          {stat.text}
        </motion.h2>

        <div className="flex flex-col lg:flex-row items-center gap-6 lg:gap-12 w-full justify-center">
          <motion.div 
            className="flex flex-col items-center flex-1 min-w-0 w-full"
            initial={{ scale: 0 }}
            animate={isActive ? { scale: 1 } : {}}
            transition={{ delay: 0.3 }}
          >
            <span className="text-lg md:text-2xl font-bold mb-2 text-center px-2">{labels[0]}</span>
            <span 
              className={cn("font-black max-w-full text-center whitespace-nowrap leading-none", styles.text)}
              style={{ fontSize: 'clamp(1.5rem, 10vw, 3.2rem)' }}
            >
              {stat.data.before}
            </span>
          </motion.div>

          <motion.div 
            className="text-4xl md:text-6xl rotate-90 lg:rotate-0 flex-shrink-0 my-2 lg:my-0"
            initial={{ opacity: 0, rotate: -180 }}
            animate={isActive ? { opacity: 1, rotate: 0 } : {}}
            transition={{ delay: 0.8 }}
          >
            ➜
          </motion.div>

          <motion.div 
            className="flex flex-col items-center flex-1 min-w-0 w-full"
            initial={{ scale: 0 }}
            animate={isActive ? { scale: 1.2 } : {}}
            transition={{ delay: 1.2, type: "spring" }}
          >
            <span className="text-lg md:text-2xl font-bold mb-2 text-center px-2">{labels[1]}</span>
            <span 
              className={cn("font-black max-w-full text-center whitespace-nowrap leading-none", styles.accent)}
              style={{ fontSize: 'clamp(1.5rem, 10vw, 3.2rem)' }}
            >
              {stat.data.after}
            </span>
          </motion.div>
        </div>

        <motion.p 
          className={cn("mt-8 md:mt-12 text-base md:text-xl font-bold text-center max-w-lg w-full break-words px-4", styles.text)}
          initial={{ opacity: 0, y: 20 }}
          animate={isActive ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 1.5 }}
        >
          {stat.subtext}
        </motion.p>
      </div>
    </SlideLayout>
  );
};

export const LeaderboardSlide: React.FC<SlideProps> = ({ stat, isActive }) => {
  const styles = PALETTE_STYLES[stat.colorPalette];
  const leaderboard = stat.data.leaderboard as { name: string, grade: number, avg: number, beatAvg: boolean }[];

  return (
    <SlideLayout stat={stat} isActive={isActive}>
      <div className="flex-1 flex flex-col p-4 w-full max-w-full overflow-hidden">
        <motion.h1 
          className={cn("text-3xl md:text-5xl font-black uppercase mb-6 text-center", styles.accent)}
          initial={{ y: -50, opacity: 0 }}
          animate={isActive ? { y: 0, opacity: 1 } : {}}
        >
          {stat.text}
        </motion.h1>

        <div className="flex-1 overflow-y-auto pr-2 space-y-3 scrollbar-hide mask-image-gradient">
          {leaderboard.map((course, i) => (
            <motion.div 
              key={course.name}
              className={cn(
                "flex items-center justify-between p-4 rounded-2xl shadow-lg transform transition-all hover:scale-[1.02]",
                "bg-white/10 backdrop-blur-xl border border-white/20"
              )}
              initial={{ x: -50, opacity: 0 }}
              animate={isActive ? { x: 0, opacity: 1 } : {}}
              transition={{ delay: 0.3 + (i * 0.1) }}
            >
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <span className={cn("text-2xl font-black w-8", styles.text)}>{i + 1}</span>
                <div className="flex flex-col min-w-0">
                  <span className={cn("font-bold text-sm md:text-base break-words leading-tight", styles.accent)}>{course.name}</span>
                  <span className={cn("text-xs opacity-70", styles.text)}>Avg: {course.avg}</span>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className={cn("text-2xl font-black", course.beatAvg ? styles.accent : styles.text)}>{course.grade}</span>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.p 
          className={cn("mt-4 text-center font-bold", styles.text)}
          initial={{ opacity: 0 }}
          animate={isActive ? { opacity: 1 } : {}}
          transition={{ delay: 2 }}
        >
          {stat.subtext}
        </motion.p>
      </div>
    </SlideLayout>
  );
};

export const SummarySlide: React.FC<SlideProps> = ({ stat, isActive }) => {
  const styles = PALETTE_STYLES[stat.colorPalette];
  
  return (
    <SlideLayout stat={stat} isActive={isActive}>
      <div className="flex-1 flex flex-col p-4 w-full">
        <motion.h1 
          className={cn("text-4xl md:text-5xl font-black uppercase mb-8 break-words", styles.accent)}
          initial={{ x: -100, opacity: 0 }}
          animate={isActive ? { x: 0, opacity: 1 } : {}}
        >
          {stat.text}
        </motion.h1>

        <div className="grid grid-cols-1 gap-4 md:gap-6 w-full">
          {[
            { label: "Top Course", value: stat.data.topCourse },
            { label: "Best Grade", value: stat.data.topGrade },
            { label: "Total Exams", value: stat.data.totalExams },
            { label: "Average", value: stat.data.average },
            { label: "Moed Bs", value: stat.data.moedBs },
          ].map((item, i) => (
            <motion.div 
              key={item.label}
              className={cn("flex justify-between items-end border-b-2 pb-2 gap-4", styles.text)}
              style={{ borderColor: 'currentColor' }}
              initial={{ x: -50, opacity: 0 }}
              animate={isActive ? { x: 0, opacity: 1 } : {}}
              transition={{ delay: 0.3 + (i * 0.1) }}
            >
              <span className="text-lg md:text-xl font-bold uppercase flex-shrink-0">{item.label}</span>
              <span className={cn("text-2xl md:text-3xl font-black text-right min-w-0 break-words max-w-[60%]", styles.accent)}>{item.value}</span>
            </motion.div>
          ))}
        </div>

        <motion.div 
          className="mt-auto pt-8 text-center"
          initial={{ opacity: 0 }}
          animate={isActive ? { opacity: 1 } : {}}
          transition={{ delay: 1.5 }}
        >
          <div className={cn("inline-block px-8 py-4 text-2xl font-bold uppercase border-4", styles.accent)} style={{ borderColor: 'currentColor' }}>
            #GradeWrapped
          </div>
        </motion.div>
      </div>
    </SlideLayout>
  );
};

export const IntroSlide: React.FC<SlideProps> = ({ stat, isActive }) => {
  const styles = PALETTE_STYLES[stat.colorPalette];
  
  return (
    <SlideLayout stat={stat} isActive={isActive}>
      <div className="flex-1 flex flex-col justify-center items-center relative">
        {/* Animated shapes background */}
        <motion.div 
          className={cn("absolute inset-0 flex items-center justify-center opacity-30")}
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        >
          <div className={cn("w-[150vw] h-[150vw] border-[100px] rounded-full border-dashed", styles.text)} />
        </motion.div>

        <motion.div
          className="relative z-10 text-center"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={isActive ? { scale: 1, opacity: 1 } : {}}
          transition={{ duration: 0.8 }}
        >
          <h1 className={cn("text-8xl font-black uppercase tracking-tighter mb-4", styles.accent)}>
            {stat.data.year}
          </h1>
          <div className={cn("text-6xl font-black uppercase tracking-tighter bg-black text-white px-4 py-2 rotate-2 inline-block")}>
            Wrapped
          </div>
        </motion.div>
      </div>
    </SlideLayout>
  );
};
