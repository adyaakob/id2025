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
    <>
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

      <div className="flex flex-1 overflow-hidden p-4 gap-4 bg-background">
        {/* Left Sidebar - Navigation */}
        <div className="w-80 flex flex-col gap-4">
          <Card className="p-4 flex-1">
            <nav className="space-y-2">
              {navigationItems.map((item, index) => {
                const Icon = item.icon
                return (
                  <Button
                    key={index}
                    variant={currentSection === item.section ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setCurrentSection(item.section)}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    {item.label}
                  </Button>
                )
              })}
            </nav>
          </Card>

          <Card className="p-4">
            <BusinessCardScanner />
          </Card>

          <Card className="p-4">
            <AIAssistant />
          </Card>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col gap-4 min-w-0">
          <Card className="flex-1 overflow-hidden">
            <Slideshow currentSection={currentSection} onSectionChange={setCurrentSection} />
          </Card>

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
        </div>

        {/* Right Sidebar - Additional Info */}
        <div className="w-80 flex flex-col gap-4">
          <Card className="p-4 flex-1">
            <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
            <div className="space-y-4">
              <div className="flex items-center">
                <Building2 className="mr-2 h-4 w-4" />
                <span>Vocality Development Group</span>
              </div>
              <div className="flex items-center">
                <Mail className="mr-2 h-4 w-4" />
                <Link href="mailto:info@vocality.com" className="hover:underline">
                  info@vocality.com
                </Link>
              </div>
              <div className="flex items-center">
                <Phone className="mr-2 h-4 w-4" />
                <Link href="tel:+1234567890" className="hover:underline">
                  +1 (234) 567-890
                </Link>
              </div>
              <div className="flex items-center">
                <Globe className="mr-2 h-4 w-4" />
                <Link href="https://www.vocality.com" target="_blank" className="hover:underline">
                  www.vocality.com
                </Link>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <div className="space-y-2">
              <Button variant="ghost" className="w-full justify-start">
                <Wrench className="mr-2 h-4 w-4" />
                Technical Support
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <Truck className="mr-2 h-4 w-4" />
                Order Information
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <Speaker className="mr-2 h-4 w-4" />
                Product Demo
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </>
  )
}