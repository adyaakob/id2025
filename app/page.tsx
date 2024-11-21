'use client';

import { useState, useEffect, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Radio, Shield, Network, Settings2, Antenna, Milestone,
         Speaker, Truck, Building2, Wrench, 
         Play, Pause, Volume1, Maximize2, Settings, Send, Globe,
         Briefcase, Phone, Mail, PhoneCall, Navigation, Router } from 'lucide-react'
import NextImage from 'next/image'
import Link from 'next/link'
import Slideshow, { sections } from "@/components/Slideshow"
import BusinessCardScanner from "@/components/BusinessCardScanner"
import AIAssistant from '@/components/AIAssistant'
import { useTheme } from 'next-themes'
import { ThemeToggle } from '@/components/theme-toggle'
import { getAssetPath } from '@/lib/utils';
import { AudioControls } from '@/components/AudioControls'

export default function Home() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [currentSection, setCurrentSection] = useState(0)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isMuted, setIsMuted] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)
  const totalDuration = 3120 // 52:00 in seconds

  const navigationItems = [
    { icon: Radio, label: 'Overview', section: 0 },
    { icon: Antenna, label: 'Features', section: 1 },
    { icon: Settings2, label: 'Specifications', section: 2 },
    { icon: Shield, label: 'Security', section: 3 },
    { icon: Network, label: 'Network', section: 4 }
  ]

  const handleAudioComplete = () => {
    setIsPlaying(false)
    setCurrentTime(0)
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-secondary text-secondary-foreground p-4 flex justify-between items-center">
        <div className="flex-1 flex justify-center">
          <div className="text-3xl font-bold text-secondary-foreground tracking-wider uppercase">
            VRG VoIP Radio Gateway
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <ThemeToggle />
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        {/* Navigation Bar */}
        <div className="bg-card border-b p-2">
          <nav className="flex justify-center space-x-2">
            {navigationItems.map((item, index) => {
              const Icon = item.icon
              return (
                <Button
                  key={index}
                  variant={currentSection === item.section ? "secondary" : "ghost"}
                  className="flex items-center gap-2"
                  onClick={() => setCurrentSection(item.section)}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Button>
              )
            })}
          </nav>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 p-4">
          <div className="h-full rounded-lg overflow-hidden bg-card">
            <Slideshow currentSection={currentSection} onSectionChange={setCurrentSection} />
          </div>
        </div>

        {/* Bottom Modules */}
        <div className="bg-background p-4 border-t">
          <div className="grid grid-cols-3 gap-4">
            {/* Business Card Scanner */}
            <Card className="p-4">
              <BusinessCardScanner />
            </Card>

            {/* Audio Controls */}
            <Card className="p-4">
              <AudioControls
                currentSection={currentSection.toString()}
                currentSlide={currentSlide}
                isMuted={isMuted}
                onMuteToggle={setIsMuted}
                onAudioComplete={handleAudioComplete}
                audioRef={audioRef}
                isPlaying={isPlaying}
              />
            </Card>

            {/* AI Assistant */}
            <Card className="p-4">
              <AIAssistant />
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-secondary text-secondary-foreground p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Building2 className="h-4 w-4" />
            <span>Vocality Development Group</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="mailto:info@vocality.com" className="flex items-center hover:underline">
              <Mail className="h-4 w-4 mr-2" />
              info@vocality.com
            </Link>
            <Link href="tel:+1234567890" className="flex items-center hover:underline">
              <Phone className="h-4 w-4 mr-2" />
              +1 (234) 567-890
            </Link>
            <Link href="https://www.vocality.com" target="_blank" className="flex items-center hover:underline">
              <Globe className="h-4 w-4 mr-2" />
              www.vocality.com
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}