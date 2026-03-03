import React, { useState } from 'react';
import { Upload, Play, Heart, Skull, Shuffle } from 'lucide-react';
import { motion } from 'motion/react';
import { GradeData, WrappedMode } from '../types';
import { cn } from '../lib/utils';

interface UploadScreenProps {
  onDataLoaded: (data: GradeData, mode: WrappedMode) => void;
  onUseDemo: (mode: WrappedMode) => void;
}

export const UploadScreen: React.FC<UploadScreenProps> = ({ onDataLoaded, onUseDemo }) => {
  const [error, setError] = useState<string | null>(null);
  const [selectedMode, setSelectedMode] = useState<WrappedMode>('mixed');

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        // Basic validation
        if (!Array.isArray(json)) throw new Error("Data must be an array");
        if (json.length > 0 && !json[0].name) throw new Error("Invalid format: missing course name");
        
        onDataLoaded(json as GradeData, selectedMode);
      } catch (err) {
        setError("Invalid JSON file. Please check the format.");
      }
    };
    reader.readAsText(file);
  };

  const handleDemoClick = () => {
    onUseDemo(selectedMode);
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white flex flex-col items-center justify-center p-6">
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="max-w-md w-full space-y-8 text-center"
      >
        <div className="space-y-2">
          <h1 className="text-5xl font-black tracking-tighter bg-gradient-to-r from-[#1DB954] to-[#1ed760] text-transparent bg-clip-text">
            GRADE WRAPPED
          </h1>
          <p className="text-gray-400 text-lg">Your academic year, served cold.</p>
        </div>

        {/* Mode Selection */}
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => setSelectedMode('encouraging')}
            className={cn(
              "p-4 rounded-xl border border-white/10 flex flex-col items-center gap-2 transition-all",
              selectedMode === 'encouraging' ? "bg-green-500/20 border-green-500 text-green-500" : "bg-[#181818] hover:bg-[#222]"
            )}
          >
            <Heart size={24} />
            <span className="text-xs font-bold uppercase">Encouraging</span>
          </button>
          <button
            onClick={() => setSelectedMode('evil')}
            className={cn(
              "p-4 rounded-xl border border-white/10 flex flex-col items-center gap-2 transition-all",
              selectedMode === 'evil' ? "bg-red-500/20 border-red-500 text-red-500" : "bg-[#181818] hover:bg-[#222]"
            )}
          >
            <Skull size={24} />
            <span className="text-xs font-bold uppercase">Evil</span>
          </button>
          <button
            onClick={() => setSelectedMode('mixed')}
            className={cn(
              "p-4 rounded-xl border border-white/10 flex flex-col items-center gap-2 transition-all",
              selectedMode === 'mixed' ? "bg-purple-500/20 border-purple-500 text-purple-500" : "bg-[#181818] hover:bg-[#222]"
            )}
          >
            <Shuffle size={24} />
            <span className="text-xs font-bold uppercase">Mixed</span>
          </button>
        </div>

        <div className="bg-[#181818] p-8 rounded-2xl border border-white/10 shadow-xl">
          <div className="border-2 border-dashed border-white/20 rounded-xl p-8 flex flex-col items-center justify-center gap-4 hover:border-[#1DB954] transition-colors cursor-pointer relative">
            <input 
              type="file" 
              accept=".json"
              onChange={handleFileUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="w-16 h-16 bg-[#282828] rounded-full flex items-center justify-center">
              <Upload className="w-8 h-8 text-[#1DB954]" />
            </div>
            <div className="space-y-1">
              <p className="font-bold">Drop your JSON here</p>
              <p className="text-sm text-gray-500">or click to browse</p>
            </div>
          </div>

          {error && (
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-500 text-sm mt-4"
            >
              {error}
            </motion.p>
          )}

          <div className="mt-6 flex items-center gap-4">
            <div className="h-px bg-white/10 flex-1" />
            <span className="text-xs text-gray-500 uppercase">Or</span>
            <div className="h-px bg-white/10 flex-1" />
          </div>

          <button 
            onClick={handleDemoClick}
            className="w-full mt-6 bg-white text-black font-bold py-4 rounded-full hover:scale-105 transition-transform flex items-center justify-center gap-2"
          >
            <Play size={20} fill="black" />
            Try Demo Mode
          </button>
        </div>

        <div className="text-xs text-gray-600">
          <p>Format: [{"{"}"name": "Course", "grades": ...{"}"}]</p>
        </div>
      </motion.div>
    </div>
  );
};
