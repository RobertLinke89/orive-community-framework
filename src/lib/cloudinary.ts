/**
 * Cloudinary Image Optimization Utility
 * 
 * Transforms image URLs to use Cloudinary's fetch feature for automatic
 * optimization, WebP conversion, and responsive sizing.
 */

import { supabase } from '@/integrations/supabase/client';

// Cache for cloud name
let cachedCloudName: string | null = null;
let configFetched = false;

export interface CloudinaryOptions {
  width?: number;
  height?: number;
  quality?: 'auto' | 'auto:low' | 'auto:eco' | 'auto:good' | 'auto:best' | number;
  format?: 'auto' | 'webp' | 'avif' | 'jpg' | 'png';
  crop?: 'fill' | 'fit' | 'scale' | 'crop' | 'thumb' | 'limit';
  gravity?: 'auto' | 'face' | 'center' | 'north' | 'south' | 'east' | 'west';
  blur?: number;
  effect?: string;
  dpr?: 'auto' | number;
}

/**
 * Fetch Cloudinary config from edge function (called once)
 */
export async function initCloudinary(): Promise<void> {
  if (configFetched) return;
  
  try {
    const { data, error } = await supabase.functions.invoke('get-cloudinary-config');
    if (!error && data?.cloudName) {
      cachedCloudName = data.cloudName;
    }
  } catch (e) {
    console.warn('Failed to fetch Cloudinary config:', e);
  }
  
  configFetched = true;
}

/**
 * Check if Cloudinary is configured
 */
export function isCloudinaryConfigured(): boolean {
  return Boolean(cachedCloudName);
}

/**
 * Get the cloud name (for sync access after init)
 */
export function getCloudName(): string | null {
  return cachedCloudName;
}

/**
 * Build Cloudinary transformation string from options
 */
function buildTransformations(options: CloudinaryOptions): string {
  const transforms: string[] = [];

  // Format - always prefer auto for best browser support
  transforms.push(`f_${options.format || 'auto'}`);

  // Quality optimization
  transforms.push(`q_${options.quality || 'auto'}`);

  // DPR for retina displays
  if (options.dpr) {
    transforms.push(`dpr_${options.dpr}`);
  }

  // Dimensions
  if (options.width) {
    transforms.push(`w_${options.width}`);
  }
  if (options.height) {
    transforms.push(`h_${options.height}`);
  }

  // Crop mode
  if (options.crop) {
    transforms.push(`c_${options.crop}`);
  }

  // Gravity for smart cropping
  if (options.gravity) {
    transforms.push(`g_${options.gravity}`);
  }

  // Blur effect (for LQIP placeholders)
  if (options.blur) {
    transforms.push(`e_blur:${options.blur}`);
  }

  // Custom effects
  if (options.effect) {
    transforms.push(`e_${options.effect}`);
  }

  return transforms.join(',');
}

/**
 * Get the absolute URL for an image
 */
function getAbsoluteUrl(src: string): string {
  // If already absolute, return as-is
  if (src.startsWith('http://') || src.startsWith('https://')) {
    return src;
  }

  // For relative URLs, construct absolute URL
  if (typeof window !== 'undefined') {
    return new URL(src, window.location.origin).href;
  }

  // Fallback for SSR
  return src;
}

/**
 * Transform an image URL to use Cloudinary optimization
 * Uses Cloudinary's "fetch" feature to optimize any publicly accessible image
 */
export function optimizeImage(src: string, options: CloudinaryOptions = {}): string {
  // Skip if Cloudinary isn't configured
  if (!cachedCloudName) {
    return src;
  }

  // Skip data URIs and blob URLs
  if (src.startsWith('data:') || src.startsWith('blob:')) {
    return src;
  }

  // Skip if already a Cloudinary URL
  if (src.includes('cloudinary.com') || src.includes('res.cloudinary.com')) {
    return src;
  }

  const absoluteUrl = getAbsoluteUrl(src);
  const transformations = buildTransformations(options);

  // Use Cloudinary fetch URL format
  return `https://res.cloudinary.com/${cachedCloudName}/image/fetch/${transformations}/${encodeURIComponent(absoluteUrl)}`;
}

/**
 * Generate responsive image srcset for different viewport widths
 */
export function generateSrcSet(
  src: string, 
  widths: number[] = [320, 640, 768, 1024, 1280, 1536],
  options: Omit<CloudinaryOptions, 'width'> = {}
): string {
  if (!isCloudinaryConfigured()) {
    return '';
  }

  return widths
    .map(w => `${optimizeImage(src, { ...options, width: w })} ${w}w`)
    .join(', ');
}

/**
 * Generate a low-quality placeholder version of an image
 */
export function generateLQIP(src: string, width: number = 20): string {
  return optimizeImage(src, {
    width,
    quality: 'auto:low',
    blur: 1000,
    format: 'webp',
  });
}

/**
 * Preset configurations for common use cases
 */
export const presets = {
  thumbnail: { width: 150, height: 150, crop: 'thumb' as const, gravity: 'auto' as const },
  card: { width: 400, quality: 'auto' as const, crop: 'fill' as const },
  hero: { width: 1920, quality: 'auto:good' as const, format: 'auto' as const },
  avatar: { width: 100, height: 100, crop: 'thumb' as const, gravity: 'face' as const },
  og: { width: 1200, height: 630, crop: 'fill' as const },
};

export default {
  optimizeImage,
  generateSrcSet,
  generateLQIP,
  isCloudinaryConfigured,
  initCloudinary,
  presets,
};
