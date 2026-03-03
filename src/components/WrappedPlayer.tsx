import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { WrappedStat } from '../types';
import { BigNumberSlide, TextFocusSlide, ComparisonSlide, SummarySlide, IntroSlide, LeaderboardSlide } from './slides/Slides';
import { Pause, Edit2, X } from 'lucide-react';
import bgMusic from '../public/music/bgmusic.mp3';
interface WrappedPlayerProps {
  stats: WrappedStat[];
  onClose: () => void;
}

const SLIDE_DURATION = 5000; // 5 seconds per slide

export const WrappedPlayer: React.FC<WrappedPlayerProps> = ({ stats, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [customStats, setCustomStats] = useState(stats);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);
  const [progress, setProgress] = useState(0);

  const currentStat = customStats[currentIndex];
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (isPlaying && !isEditing) {
      const startTime = Date.now();
      
      progressInterval.current = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const newProgress = Math.min((elapsed / SLIDE_DURATION) * 100, 100);
        setProgress(newProgress);

        if (elapsed >= SLIDE_DURATION) {
          handleNext();
        }
      }, 50);
    } else {
      if (progressInterval.current) clearInterval(progressInterval.current);
    }

    return () => {
      if (progressInterval.current) clearInterval(progressInterval.current);
    };
  }, [currentIndex, isPlaying, isEditing]);

// 2. Add this new useEffect to sync music with the play/pause state
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying && !isEditing) {
        // We use catch() because browsers sometimes block autoplay 
        // until the user interacts with the screen
        audioRef.current.play().catch(err => console.log("Audio play blocked:", err));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, isEditing]);

  const handleNext = () => {
    setProgress(0);
    if (currentIndex < customStats.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setIsPlaying(false); // End of wrapped
    }
  };

  const handlePrev = () => {
    setProgress(0);
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleEditUpdate = (newText: string, newSubtext: string) => {
    const updated = [...customStats];
    updated[currentIndex] = {
      ...updated[currentIndex],
      text: newText,
      subtext: newSubtext
    };
    setCustomStats(updated);
  };

  const renderSlide = () => {
    const props = { stat: currentStat, isActive: true };
    
    switch (currentStat.template) {
      case 'big-number': return <BigNumberSlide {...props} />;
      case 'text-focus': return currentStat.type === 'intro' ? <IntroSlide {...props} /> : <TextFocusSlide {...props} />;
      case 'comparison': return <ComparisonSlide {...props} />;
      case 'list': return <SummarySlide {...props} />;
      case 'leaderboard': return <LeaderboardSlide {...props} />;
      default: return <TextFocusSlide {...props} />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
      {/* Mobile-first container aspect ratio */}
      <audio ref={audioRef} src={bgMusic} loop />
      <div className="relative w-full h-full md:w-[400px] md:h-[800px] md:max-h-[90vh] bg-black overflow-hidden shadow-2xl md:rounded-3xl">
        
        {/* Progress Bars */}
        <div className="absolute top-4 left-4 right-4 z-50 flex gap-1">
          {customStats.map((_, idx) => (
            <div key={idx} className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white transition-all duration-100 ease-linear"
                style={{ 
                  width: idx < currentIndex ? '100%' : idx === currentIndex ? `${progress}%` : '0%' 
                }}
              />
            </div>
          ))}
        </div>

        {/* Controls Overlay */}
        <div className="absolute inset-0 z-40 flex">
          <div className="w-1/3 h-full" onClick={handlePrev} />
          <div className="w-1/3 h-full flex items-center justify-center">
            {/* Center tap to pause/play */}
            <div 
              className="w-full h-full" 
              onClick={() => setIsPlaying(!isPlaying)} 
            />
          </div>
          <div className="w-1/3 h-full" onClick={handleNext} />
        </div>

        {/* Top Right Actions */}
        <div className="absolute top-8 right-4 z-50 flex gap-4">
          <button onClick={() => setIsEditing(!isEditing)} className="p-2 bg-black/20 backdrop-blur-md rounded-full text-white hover:bg-white/20">
            <Edit2 size={20} />
          </button>
          <button onClick={onClose} className="p-2 bg-black/20 backdrop-blur-md rounded-full text-white hover:bg-white/20">
            <X size={20} />
          </button>
        </div>

        {/* Slide Render */}
        <AnimatePresence mode="wait">
          <motion.div 
            key={currentIndex}
            className="w-full h-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {renderSlide()}
          </motion.div>
        </AnimatePresence>

        {/* Editor Overlay */}
        {isEditing && (
          <div className="absolute inset-x-0 bottom-0 z-50 bg-black/80 backdrop-blur-lg p-6 rounded-t-3xl border-t border-white/10">
            <h3 className="text-white font-bold mb-4">Edit Text</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-400 uppercase">Main Text</label>
                <input 
                  type="text" 
                  value={currentStat.text}
                  onChange={(e) => handleEditUpdate(e.target.value, currentStat.subtext || '')}
                  className="w-full bg-white/10 border border-white/20 rounded p-2 text-white"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 uppercase">Subtext</label>
                <input 
                  type="text" 
                  value={currentStat.subtext}
                  onChange={(e) => handleEditUpdate(currentStat.text, e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded p-2 text-white"
                />
              </div>
              <button 
                onClick={() => setIsEditing(false)}
                className="w-full bg-green-500 text-black font-bold py-3 rounded-xl mt-2"
              >
                Done
              </button>
            </div>
          </div>
        )}

        {/* Play/Pause Indicator (Optional) */}
        {!isPlaying && !isEditing && (
          <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none">
            <div className="bg-black/40 p-4 rounded-full backdrop-blur-sm">
              <Pause className="text-white w-8 h-8" fill="white" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
