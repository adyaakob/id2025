'use client';

import { useState, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { Button } from "@/components/ui/button";

type Language = 'en' | 'id' | 'ms';

interface AudioControlsProps {
  currentSection: string;
  currentSlide: number;
  isMuted: boolean;
  onMuteToggle: (muted: boolean) => void;
  onAudioComplete: () => void;
  audioRef: React.RefObject<HTMLAudioElement>;
  isPlaying: boolean;
}

export const AudioControls: React.FC<AudioControlsProps> = ({
  currentSection,
  currentSlide,
  isMuted,
  onMuteToggle,
  onAudioComplete,
  audioRef,
  isPlaying
}) => {
  const [currentLanguage, setCurrentLanguage] = useState<Language>('en');

  useEffect(() => {
    if (audioRef.current) {
      const audioPath = `/audio/${currentSection}/slide${currentSlide + 1}_${currentLanguage}.mp3`;
      audioRef.current.src = audioPath;
      audioRef.current.load();
      
      if (isPlaying && !isMuted) {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.log('Audio playback failed:', error);
          });
        }
      }
    }
  }, [currentSection, currentSlide, currentLanguage, isPlaying, isMuted, audioRef]);

  const handleMuteToggle = () => {
    if (audioRef.current) {
      if (!isMuted) {
        audioRef.current.pause();
      } else if (isPlaying) {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(console.error);
        }
      }
    }
    onMuteToggle(!isMuted);
  };

  const languageLabels: Record<Language, string> = {
    en: 'English',
    id: 'Indonesia',
    ms: 'Bahasa Malaysia'
  };

  const handleLanguageChange = (language: Language) => {
    setCurrentLanguage(language);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      if (!isMuted && isPlaying) {
        audioRef.current.play();
      }
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleMuteToggle}
        className="text-white hover:text-gray-300"
      >
        {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
      </button>
      <audio
        ref={audioRef}
        onEnded={onAudioComplete}
        style={{ display: 'none' }}
      />
      {/* Language selection buttons */}
      {Object.entries(languageLabels).map(([lang, label]) => (
        <Button
          key={lang}
          variant={currentLanguage === lang ? "secondary" : "ghost"}
          size="sm"
          onClick={() => handleLanguageChange(lang as Language)}
          className={`text-white hover:text-gray-300`}
        >
          {label}
        </Button>
      ))}
    </div>
  );
};
