import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Get the correct path for assets (images, audio, etc.) that works in both development and production
 * @param path - The path to the asset relative to the public directory
 * @returns The correct path that works in both development and GitHub Pages
 */
export function getAssetPath(path: string): string {
  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  // In production (GitHub Pages), prefix with /id2025
  if (process.env.NODE_ENV === 'production') {
    return `/id2025/${cleanPath}`;
  }
  
  // In development, use path as is
  return `/${cleanPath}`;
}

/**
 * Get the base URL for the current environment
 * @returns The base URL including the base path for GitHub Pages in production
 */
export function getBaseUrl(): string {
  if (process.env.NODE_ENV === 'production') {
    return 'https://adyaakob.github.io/id2025';
  }
  return '';
}
