'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { 
    Play, Pause, ChevronLeft, ChevronRight, 
    Maximize, Minimize, Settings, Square 
} from 'lucide-react';
import { AudioControls } from './AudioControls';
import { getAssetPath } from '@/lib/utils';

export const sections = [
    { name: 'overview', slides: 9 },
    { name: 'features', slides: 3 },
    { name: 'specifications', slides: 3 },
    { name: 'audio', slides: 3 },
    { name: 'standards', slides: 3 },
    { name: 'protocols', slides: 3 },
    { name: 'deployment', slides: 3 },
    { name: 'vehicle_ship', slides: 3 },
    { name: 'land_based', slides: 3 },
    { name: 'mechanical', slides: 3 }
];

interface SlideshowProps {
    onSectionChange?: (section: number) => void;
    initialSection?: number;
}

const Slideshow = ({ onSectionChange, initialSection = 0 }: SlideshowProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentSection, setCurrentSection] = useState(initialSection);  
    const [currentSlideInSection, setCurrentSlideInSection] = useState(0);
    const [isMuted, setIsMuted] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [waitingForAudio, setWaitingForAudio] = useState(false);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        setIsPlaying(false);
        setCurrentSection(0); 
        setCurrentSlideInSection(0); 
    }, []);

    useEffect(() => {
        setCurrentSection(initialSection);
        setCurrentSlideInSection(0);
    }, [initialSection]);

    const getCurrentSlidePath = () => {
        const section = sections[currentSection];
        return getAssetPath(`slides/${section.name}/slide${currentSlideInSection + 1}.jpg`);
    };

    const clearSlideTimer = () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    };

    const startSlideTimer = () => {
        clearSlideTimer();
        timerRef.current = setInterval(() => {
            if (isPlaying) {
                handleNextSlide();
            }
        }, 3000);
    };

    const handlePlay = () => {
        setIsPlaying(true);
        if (audioRef.current) {
            audioRef.current.play().catch(console.error);
        }
        startSlideTimer();
    };

    const handlePause = () => {
        setIsPlaying(false);
        clearSlideTimer();
        if (audioRef.current) {
            audioRef.current.pause();
        }
    };

    const handleStop = () => {
        setIsPlaying(false);
        clearSlideTimer();
        setCurrentSection(0);
        setCurrentSlideInSection(0);
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
        if (onSectionChange) {
            onSectionChange(0);
        }
    };

    const handleNextSlide = () => {
        if (currentSlideInSection < sections[currentSection].slides - 1) {
            setCurrentSlideInSection(prev => prev + 1);
        } else if (currentSection < sections.length - 1) {
            const nextSection = currentSection + 1;
            setCurrentSection(nextSection);
            setCurrentSlideInSection(0);
            if (onSectionChange) {
                onSectionChange(nextSection);
            }
        } else {
            handleStop(); 
        }
    };

    const handlePrevSlide = () => {
        if (currentSlideInSection > 0) {
            setCurrentSlideInSection(prev => prev - 1);
        } else if (currentSection > 0) {
            const prevSection = currentSection - 1;
            setCurrentSection(prevSection);
            setCurrentSlideInSection(sections[prevSection].slides - 1);
            if (onSectionChange) {
                onSectionChange(prevSection);
            }
        }
    };

    const handlePlayPause = () => {
        if (isPlaying) {
            handlePause();
        } else {
            handlePlay();
        }
    };

    useEffect(() => {
        return () => {
            clearSlideTimer();
        };
    }, []);

    useEffect(() => {
        const updateSize = () => {
            if (containerRef.current) {
                setContainerSize({
                    width: containerRef.current.offsetWidth,
                    height: containerRef.current.offsetHeight
                });
            }
        };

        window.addEventListener('resize', updateSize);
        updateSize();
        return () => window.removeEventListener('resize', updateSize);
    }, []);

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            containerRef.current?.requestFullscreen();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    return (
        <div ref={containerRef} className="relative w-full h-full bg-black">
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-full h-0 pb-[56.25%]">
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Image
                            src={getCurrentSlidePath()}
                            alt={`Slide ${currentSlideInSection + 1}`}
                            fill
                            className="object-contain"
                            sizes="100vw"
                            priority
                        />
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-black bg-opacity-50 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={handlePlayPause} className="text-white hover:text-gray-300">
                        {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                    </button>
                    <button onClick={handleStop} className="text-white hover:text-gray-300">
                        <Square size={24} />
                    </button>
                    <button onClick={handlePrevSlide} className="text-white hover:text-gray-300">
                        <ChevronLeft size={24} />
                    </button>
                    <button onClick={handleNextSlide} className="text-white hover:text-gray-300">
                        <ChevronRight size={24} />
                    </button>
                    <span className="text-white">
                        {sections[currentSection].name} - {currentSlideInSection + 1}/{sections[currentSection].slides}
                    </span>
                </div>
                
                <div className="flex items-center gap-4">
                    <AudioControls
                        currentSection={sections[currentSection].name}
                        currentSlide={currentSlideInSection}
                        isMuted={isMuted}
                        onMuteToggle={setIsMuted}
                        onAudioComplete={() => {
                            if (isPlaying) {
                                handleNextSlide();
                            }
                        }}
                        audioRef={audioRef}
                        isPlaying={isPlaying}
                    />
                    <button onClick={toggleFullscreen} className="text-white hover:text-gray-300">
                        {isFullscreen ? <Minimize size={24} /> : <Maximize size={24} />}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Slideshow;
