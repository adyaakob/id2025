import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Get the correct path for assets (images, audio, etc.) that works in both development and production
 * @param path - The path to the asset relative to the public directory
 * @returns The correct path that works in both development and Vercel
 */
export function getAssetPath(path: string): string {
  const basePath = process.env.NODE_ENV === 'production' ? '/id2025' : '';
  return `${basePath}${path}`;
}

/**
 * Get the base URL for the current environment
 * @returns The base URL for the current environment
 */
export function getBaseUrl(): string {
  if (process.env.NODE_ENV === 'production') {
    return process.env.NEXT_PUBLIC_API_BASE_URL || '';
  }
  return process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';
}
