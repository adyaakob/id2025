'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Radio, Shield, Network, Settings2, Antenna, Milestone,
         Speaker, Truck, Building2, Wrench, 
         Play, Pause, Volume1, Maximize2, Settings, Send, Globe, Sun, Moon,
         Briefcase, Phone, Mail, PhoneCall, Navigation, Router } from 'lucide-react'
import NextImage from 'next/image'
import Link from 'next/link'
import Slideshow, { sections } from "@/components/Slideshow"
import BusinessCardScanner from "@/components/BusinessCardScanner"
import { getAssetPath } from '@/lib/utils'
import { AudioControls } from '@/components/AudioControls'
import { useTheme } from 'next-themes'
import { ThemeToggle } from '@/components/theme-toggle'
import AIAssistant from '@/components/AIAssistant'

export default function Component() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [currentSection, setCurrentSection] = useState(0)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isMuted, setIsMuted] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [showCompanyInfo, setShowCompanyInfo] = useState(false)
  const [showBusinessScanner, setShowBusinessScanner] = useState(false)
  const [showContactForm, setShowContactForm] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const audioRef = useRef<HTMLAudioElement>(null)
  const totalDuration = 3120 // 52:00 in seconds

  useEffect(() => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDarkMode(true)
      document.documentElement.classList.add('dark')
    }
  }, [])

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDarkMode])

  useEffect(() => {
    const checkDevice = () => {
      setIsMobile(window.innerWidth <= 768)
    }

    // Initial check
    checkDevice()

    // Add resize listener
    window.addEventListener('resize', checkDevice)

    // Cleanup
    return () => window.removeEventListener('resize', checkDevice)
  }, [])

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
    document.documentElement.classList.toggle('dark')
  }

  const navigationItems = [
    { label: 'Overview', icon: Radio, section: 'overview' },
    { label: 'Features', icon: Settings2, section: 'features' },
    { label: 'Specifications', icon: Shield, section: 'specifications' },
    { label: 'Audio', icon: Speaker, section: 'audio' },
    { label: 'Standards', icon: Milestone, section: 'standards' },
    { label: 'Protocols', icon: Network, section: 'protocols' },
    { label: 'Deployment', icon: Settings, section: 'deployment' },
    { label: 'Vehicle/Ship', icon: Truck, section: 'vehicle_ship' },
    { label: 'Land-based', icon: Building2, section: 'land_based' },
    { label: 'Mechanical', icon: Wrench, section: 'mechanical' }
  ]

  const handleSectionChange = (section: number) => {
    setCurrentSection(section)
  }

  const handleAudioComplete = () => {
    setIsPlaying(false)
    setCurrentTime(0)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    setMessages([...messages, { role: 'user', content: input }])
    setInput('')
  }

  const handleNavigation = (section: string) => {
    setCurrentSection(section.toLowerCase())
  }

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % sections.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + sections.length) % sections.length)
  }

  const MobileView = () => (
    <div className="flex flex-col gap-4 p-4 bg-background">
      {/* Company Info */}
      <Card className="p-4">
        <div className="flex flex-col items-center gap-4">
          <NextImage
            src={getAssetPath("/images/teqarmada-logo.png")}
            alt="Teq Armada Logo"
            width={200}
            height={100}
            className="object-contain"
          />
          <div className="text-center">
            <h1 className="text-xl font-bold mb-1">TEQ ARMADA SDN BHD</h1>
            <p className="text-sm text-muted-foreground">VRG VoIP Radio Gateway</p>
          </div>
        </div>
      </Card>

      {/* Sales Contact */}
      <Card className="p-4">
        <h2 className="text-lg font-semibold mb-4 text-center">Sales Contact</h2>
        <div className="space-y-2 text-center">
          <p className="text-base font-medium">JAZLAN BIN ABDUL JALIL</p>
          <p className="text-sm text-blue-500">Manager, Sales and Marketing</p>
          <div className="flex flex-col gap-2 mt-4">
            <Button variant="outline" className="flex items-center gap-2" onClick={() => window.location.href = 'tel:+60166934865'}>
              <Phone className="h-4 w-4" />
              +6016 693 4865
            </Button>
            <Button variant="outline" className="flex items-center gap-2" onClick={() => window.location.href = 'tel:+60338513314'}>
              <PhoneCall className="h-4 w-4" />
              +603 3851 3314
            </Button>
            <Button variant="outline" className="flex items-center gap-2" onClick={() => window.location.href = 'mailto:jazlan@teqarmada.com'}>
              <Mail className="h-4 w-4" />
              jazlan@teqarmada.com
            </Button>
          </div>
        </div>
      </Card>

      {/* Business Card Scanner */}
      <Card className="p-4">
        <h2 className="text-lg font-semibold mb-4 text-center">Business Card Scanner</h2>
        <BusinessCardScanner />
      </Card>

      {/* Contact Form */}
      <Card className="p-4">
        <h2 className="text-lg font-semibold mb-4 text-center">Contact Us</h2>
        <form className="space-y-4">
          <Input placeholder="Your Name" />
          <Input placeholder="Email" type="email" />
          <Input placeholder="Phone" type="tel" />
          <Textarea placeholder="Message" className="min-h-[100px]" />
          <Button className="w-full">Send Message</Button>
        </form>
      </Card>
    </div>
  )

  const DesktopView = () => (
    <div className="flex flex-1 overflow-hidden p-4 gap-4 bg-background">
      {/* Left Sidebar - Chat */}
      <div className="w-80 product-assistant-container flex flex-col">
        <div className="product-assistant-header">
          <div className="text-sm font-medium text-secondary-foreground">AI Support Assistant</div>
          <div className="text-xs text-muted-foreground">Military-grade Radio Communication System</div>
        </div>
        <div className="product-assistant-content flex-1 p-4 overflow-y-auto space-y-4">
          {/* Example chat messages */}
          <div className="chat-message chat-message-assistant">
            Welcome to VRG VoIP Radio Gateway! How can I assist you with our military-grade communication system?
          </div>
          <div className="chat-message chat-message-user">
            Can you tell me about the main features?
          </div>
        </div>
        <div className="p-4 border-t border-border/50 bg-card/95">
          <div className="relative">
            <Input 
              placeholder="Ask me anything..." 
              className="product-assistant-input pr-10 text-sm"
            />
            <Button 
              size="icon"
              variant="ghost" 
              className="absolute right-1.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col bg-card rounded-lg shadow-sm overflow-hidden">
        {/* Slideshow Container */}
        <div className="flex-1 bg-secondary relative">
          <Slideshow 
            currentSection={currentSection}
            onSectionChange={setCurrentSection}
          />
        </div>

        {/* Bottom Navigation */}
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
  )

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="bg-secondary text-secondary-foreground p-4 flex justify-between items-center">
        <div className="flex-1 flex justify-center">
          <div className="text-3xl font-bold text-secondary-foreground tracking-wider uppercase">VRG VoIP Radio Gateway</div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleTheme}
          className="absolute right-4 flex items-center gap-2 text-xs text-secondary-foreground hover:bg-secondary-foreground/20"
        >
          {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          {isDarkMode ? 'Light Mode' : 'Dark Mode'}
        </Button>
      </header>

      {/* Main Content */}
      {isMobile ? (
        <MobileView />
      ) : (
        <DesktopView />
      )}

      {/* Footer - Only show in desktop view */}
      {!isMobile && (
        <footer className="mt-auto">
          <div className="flex gap-2 p-2 bg-background">
            <Card className="p-2 w-1/5">
              <h3 className="font-semibold text-xs mb-1 text-foreground text-center">COMPANY INFO</h3>
              <div className="text-xs space-y-1 text-muted-foreground text-center">
                <p className="text-xl font-medium text-foreground mb-2">TEQ ARMADA SDN BHD</p>
                <div className="flex flex-col items-center justify-center gap-1">
                  <p className="flex items-center justify-center gap-1">
                    <Building2 className="h-3 w-3" />
                    B5-2A Ostina Business Avenue
                  </p>
                  <p className="flex items-center justify-center gap-1">
                    <Navigation className="h-3 w-3" />
                    43650 Bandar Baru Bangi
                  </p>
                  <p className="flex items-center justify-center gap-1">
                    <Navigation className="h-3 w-3" />
                    Selangor Darul Ehsan
                  </p>
                  <p className="flex items-center justify-center gap-1">
                    <Navigation className="h-3 w-3" />
                    Malaysia
                  </p>
                </div>
                <Link 
                  href="http://www.teqarmada.com" 
                  target="_blank"
                  className="flex items-center justify-center gap-1 text-accent hover:underline mt-2"
                >
                  <Globe className="h-3 w-3" />
                  www.teqarmada.com
                </Link>
              </div>
            </Card>

            <Card className="p-2 w-1/5">
              <div className="flex justify-center items-center h-full">
                <NextImage
                  src={getAssetPath("/images/teqarmada-logo.png")}
                  alt="Teq Armada Logo"
                  width={150}
                  height={75}
                  className="object-contain"
                />
              </div>
            </Card>

            <Card className="p-2 w-1/5">
              <h3 className="font-semibold text-xs mb-1 text-foreground text-center">SALES CONTACT</h3>
              <div className="text-xs space-y-1 text-muted-foreground text-center">
                <p className="text-xl font-medium text-foreground mb-2">JAZLAN BIN ABDUL JALIL</p>
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
              </div>
            </Card>

            <Card className="p-2 w-[300px]">
              <BusinessCardScanner />
            </Card>

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
        </footer>
      )}
    </div>
  )
}