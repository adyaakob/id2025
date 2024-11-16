'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { 
    Play, Pause, ChevronLeft, ChevronRight, 
    Volume2, VolumeX, Maximize, Minimize, Settings 
} from 'lucide-react';

const Slideshow = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);
    const [isMuted, setIsMuted] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showSettings, setShowSettings] = useState(false);

    const slides = [
        '/images/slide1.jpg',
        '/images/slide2.jpg'
    ];

    // Update container size when it changes
    useEffect(() => {
        const updateContainerSize = () => {
            if (containerRef.current) {
                const { width, height } = containerRef.current.getBoundingClientRect();
                setContainerSize({ width, height });
            }
        };

        // Initial measurement
        updateContainerSize();

        // Measure on window resize
        window.addEventListener('resize', updateContainerSize);
        
        // Measure on container size change
        const resizeObserver = new ResizeObserver(updateContainerSize);
        if (containerRef.current) {
            resizeObserver.observe(containerRef.current);
        }

        return () => {
            window.removeEventListener('resize', updateContainerSize);
            resizeObserver.disconnect();
        };
    }, []);

    const nextSlide = useCallback(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, [slides.length]);

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    };

    const togglePlayPause = () => {
        setIsPlaying((prev) => !prev);
    };

    const toggleMute = () => {
        setIsMuted((prev) => !prev);
    };

    const toggleFullscreen = async () => {
        if (!document.fullscreenElement) {
            await containerRef.current?.requestFullscreen();
            setIsFullscreen(true);
        } else {
            await document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    const toggleSettings = () => {
        setShowSettings((prev) => !prev);
    };

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isPlaying) {
            interval = setInterval(nextSlide, 3000);
        }
        return () => {
            if (interval) {
                clearInterval(interval);
            }
        };
    }, [isPlaying, nextSlide]);

    return (
        <div 
            ref={containerRef} 
            style={{
                position: 'relative',
                width: '100%',
                height: '100%',
                backgroundColor: 'rgb(31, 41, 55)',
                overflow: 'hidden'
            }}
        >
            {slides.map((slide, index) => (
                <div
                    key={slide}
                    className={`absolute inset-0 transition-opacity duration-500 ${
                        index === currentSlide ? 'opacity-100' : 'opacity-0'
                    }`}
                >
                    <Image
                        src={slide}
                        alt={`Slide ${index + 1}`}
                        fill
                        sizes="(max-width: 1920px) 100vw, 1920px"
                        quality={100}
                        priority={index === 0}
                        style={{ 
                            objectFit: 'contain',
                            objectPosition: 'center',
                            border: 'none',
                            outline: 'none'
                        }}
                    />
                </div>
            ))}
            
            {/* Progress Bar */}
            <div className="progress-bar">
                <div 
                    className="progress-bar-fill"
                    style={{ 
                        width: `${((currentSlide + 1) / slides.length) * 100}%`
                    }}
                />
            </div>

            {/* Control Bar */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 flex justify-between items-center">
                {/* Left Controls */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={togglePlayPause}
                        className="w-10 h-10 rounded-full bg-white/30 hover:bg-white/50 text-white flex items-center justify-center transition-colors"
                        title={isPlaying ? 'Pause' : 'Play'}
                    >
                        {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                    </button>
                    <button
                        onClick={toggleMute}
                        className="w-10 h-10 rounded-full bg-white/30 hover:bg-white/50 text-white flex items-center justify-center transition-colors"
                        title={isMuted ? 'Unmute' : 'Mute'}
                    >
                        {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                    </button>
                    <span className="text-white text-sm">
                        {`${currentSlide + 1} / ${slides.length}`}
                    </span>
                </div>

                {/* Center Controls */}
                <div className="absolute left-1/2 transform -translate-x-1/2 flex gap-2">
                    <button
                        onClick={prevSlide}
                        className="w-10 h-10 rounded-full bg-white/30 hover:bg-white/50 text-white flex items-center justify-center transition-colors"
                        title="Previous"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <button
                        onClick={nextSlide}
                        className="w-10 h-10 rounded-full bg-white/30 hover:bg-white/50 text-white flex items-center justify-center transition-colors"
                        title="Next"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>

                {/* Right Controls */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={toggleSettings}
                        className="w-10 h-10 rounded-full bg-white/30 hover:bg-white/50 text-white flex items-center justify-center transition-colors"
                        title="Settings"
                    >
                        <Settings size={20} />
                    </button>
                    <button
                        onClick={toggleFullscreen}
                        className="w-10 h-10 rounded-full bg-white/30 hover:bg-white/50 text-white flex items-center justify-center transition-colors"
                        title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                    >
                        {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
                    </button>
                </div>
            </div>

            {/* Settings Menu */}
            {showSettings && (
                <div className="absolute bottom-20 right-4 bg-black/90 text-white p-4 rounded-lg">
                    <div className="text-sm space-y-2">
                        <div className="flex items-center justify-between gap-4">
                            <span>Autoplay</span>
                            <button
                                onClick={togglePlayPause}
                                className="px-2 py-1 rounded bg-white/20 hover:bg-white/30"
                            >
                                {isPlaying ? 'On' : 'Off'}
                            </button>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                            <span>Sound</span>
                            <button
                                onClick={toggleMute}
                                className="px-2 py-1 rounded bg-white/20 hover:bg-white/30"
                            >
                                {isMuted ? 'Off' : 'On'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Slideshow;
