'use client';

import { useState, useEffect } from 'react'
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

export default function Home() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [currentSection, setCurrentSection] = useState(0)
  const totalDuration = 3120 // 52:00 in seconds
  const basePath = process.env.NODE_ENV === 'production' ? '/id2025' : ''

  const navigationItems = [
    { icon: Radio, label: 'Overview', section: 0 },
    { icon: Antenna, label: 'Features', section: 1 },
    { icon: Settings2, label: 'Specifications', section: 2 },
    { icon: Speaker, label: 'Audio', section: 3 },
    { icon: Shield, label: 'Standards', section: 4 },
    { icon: Network, label: 'Protocols', section: 5 },
    { icon: Router, label: 'Deployment', section: 6 },
    { icon: Truck, label: 'Vehicle/Ship', section: 7 },
    { icon: Building2, label: 'Land-based', section: 8 },
    { icon: Wrench, label: 'Mechanical', section: 9 },
  ]

  const handleSectionChange = (section: number) => {
    setCurrentSection(section);
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="bg-secondary text-secondary-foreground p-4 flex justify-between items-center">
        <div className="flex-1 flex justify-center">
          <div className="text-3xl font-bold text-secondary-foreground tracking-wider uppercase">VRG VoIP Radio Gateway</div>
        </div>
        <div className="flex items-center space-x-4">
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden p-4 gap-4 bg-background">
        {/* Left Sidebar - AI Assistant */}
        <div className="w-80 flex flex-col bg-card rounded-lg shadow-sm overflow-hidden">
          <div className="p-4 border-b border-border">
            <h2 className="font-semibold">AI Support Assistant</h2>
            <p className="text-xs text-muted-foreground">Military-grade Radio Communication System</p>
          </div>
          <div className="flex-1">
            <AIAssistant />
          </div>
        </div>

        {/* Main Content Area - Slideshow */}
        <div className="flex-1 flex flex-col bg-card rounded-lg shadow-sm overflow-hidden">
          {/* Slideshow Container */}
          <div className="flex-1 bg-secondary">
            <div className="w-full h-full">
              <Slideshow 
                initialSection={currentSection}
                onSectionChange={handleSectionChange}
              />
            </div>
          </div>

          {/* Navigation */}
          <div className="border-t border-secondary">
            <nav className="flex justify-between px-2 py-2 bg-gradient-to-b from-primary/80 to-primary">
              {navigationItems.map((item) => (
                <Button
                  key={item.label}
                  variant="ghost"
                  onClick={() => setCurrentSection(item.section)}
                  className={`flex flex-col items-center gap-1.5 h-auto py-3 px-4 
                    bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl
                    shadow-lg hover:shadow-xl hover:scale-105 hover:bg-white/20
                    transition-all duration-300 ease-out
                    text-black min-w-[90px] transform hover:-translate-y-0.5
                    active:translate-y-0 active:shadow-md
                    ${currentSection === item.section ? 'bg-white/30' : ''}`}
                >
                  <item.icon className="h-7 w-7 text-black drop-shadow-md" />
                  <span className="text-[14px] font-medium text-center leading-tight uppercase text-black drop-shadow-sm">
                    {item.label}
                  </span>
                </Button>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex gap-2 p-2 bg-background">
        <Card className="p-2 w-1/5">
          <h3 className="font-semibold text-xs mb-1 text-foreground text-center">COMPANY INFO</h3>
          <p className="text-xs text-muted-foreground text-center">TEQ ARMADA SDN BHD</p>
          <p className="text-xs text-muted-foreground text-center">B5-2A Ostina Business Avenue</p>
          <p className="text-xs text-muted-foreground text-center">43650 Bandar Baru Bangi</p>
          <p className="text-xs text-muted-foreground text-center">Selangor Darul Ehsan</p>
          <p className="text-xs text-muted-foreground text-center">Malaysia</p>
          <Link 
            href="http://www.teqarmada.com" 
            target="_blank"
            className="flex items-center justify-center gap-1 text-accent hover:underline mt-2"
          >
            <Globe className="h-3 w-3" />
            www.teqarmada.com
          </Link>
        </Card>

        <Card className="p-2 w-1/5">
          <div className="flex justify-center items-center h-full">
            <NextImage
              src={getAssetPath('images/teqarmada-logo.png')}
              alt="Teq Armada Logo"
              width={150}
              height={75}
              className="object-contain"
            />
          </div>
        </Card>

        <Card className="p-2 w-1/5">
          <h3 className="font-semibold text-xs mb-1 text-foreground text-center">SALES CONTACT</h3>
          <p className="text-xs text-muted-foreground text-center">JAZLAN BIN ABDUL JALIL</p>
          <p className="flex items-center justify-center gap-1 text-blue-500">
            <Briefcase className="h-3 w-3" />
            Manager, Sales and Marketing
          </p>
          <p className="flex items-center justify-center gap-1">
            <Phone className="h-3 w-3" />
            +6016 693 4865
          </p>
          <p className="flex items-center justify-center gap-1">
            <PhoneCall className="h-3 w-3" />
            +603 3851 3314
          </p>
          <p className="flex items-center justify-center gap-1 text-accent">
            <Mail className="h-3 w-3" />
            jazlan@teqarmada.com
          </p>
        </Card>

        <BusinessCardScanner />

        <Card className="p-2 flex-grow">
          <h3 className="font-semibold text-xs mb-1 text-foreground text-center">CONTACT FORM</h3>
          <form className="space-y-2">
            <div className="flex gap-2">
              <Input placeholder="Name" className="text-xs h-7 flex-1 bg-card text-foreground text-center" />
              <Input placeholder="Email" className="text-xs h-7 flex-1 bg-card text-foreground text-center" />
              <Input placeholder="Phone" className="text-xs h-7 flex-1 bg-card text-foreground text-center" />
            </div>
            <Textarea 
              placeholder="Message" 
              className="min-h-[60px] text-xs bg-card text-foreground text-center" 
            />
            <div className="flex gap-2">
              <Button 
                type="button"
                variant="outline" 
                className="w-full text-xs h-7 font-medium hover:bg-destructive/10 hover:text-destructive border-secondary-foreground/20"
              >
                CLEAR
              </Button>
              <Button 
                type="submit"
                variant="secondary" 
                className="w-full text-xs h-7 font-medium bg-secondary hover:bg-secondary/80 text-secondary-foreground"
              >
                SUBMIT
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}