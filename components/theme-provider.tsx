"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

type Attribute = "class" | "data-theme" | "data-mode"

interface ThemeProviderProps {
  children: React.ReactNode;
  attribute?: Attribute;
  defaultTheme?: "system" | "light" | "dark";
  enableSystem?: boolean;
  storageKey?: string;
}

export function ThemeProvider({ 
  children, 
  ...props 
}: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute={"class" as Attribute}
      defaultTheme="system"
      enableSystem
      {...props}
    >
      {children}
    </NextThemesProvider>
  )
}
