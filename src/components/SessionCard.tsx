"use client";
import Link from 'next/link';
import { memo } from 'react';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, Eye, ShoppingCart } from 'lucide-react';
import { LQIPImage } from '@/components/LQIPImage';
import { getFacilitatorById } from '@/data/facilitatorsData';
import type { Session } from '@/data/sessionsData';
import { buildPublicProfilePath } from '@/lib/publicProfilePath';

const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'instant' });

interface SessionCardProps extends Session { }

export const SessionCard = memo(function SessionCard({
  id,
  title,
  facilitatorId,
  facilitatorName,
  rating,
  reviewCount,
  sales,
  views,
  image,
  hourlyRate,
  location,
  tags,
}: SessionCardProps) {
  // Get facilitator data for avatar
  const facilitator = getFacilitatorById(facilitatorId);
  const initials = facilitatorName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase();

  return (
    <div className="relative group/card focus-within:z-10">
      {/* Animated glowing border - always visible in dark mode */}
      <div
        className="absolute -inset-[1px] rounded-md opacity-0 dark:opacity-40 group-hover/card:opacity-100 dark:group-hover/card:opacity-100 group-focus-within/card:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: 'linear-gradient(90deg, transparent, #00CDAC, transparent)',
          backgroundSize: '200% 100%',
          animation: 'borderGlow 6s ease-in-out infinite',
        }}
      />
      {/* Secondary glow layer for depth */}
      <div
        className="absolute -inset-[2px] rounded-md opacity-0 dark:opacity-20 group-hover/card:opacity-40 dark:group-hover/card:opacity-40 group-focus-within/card:opacity-60 transition-opacity duration-500 pointer-events-none blur-sm"
        style={{
          background: 'linear-gradient(90deg, transparent, #00CDAC, transparent)',
          backgroundSize: '200% 100%',
          animation: 'borderGlow 6s ease-in-out infinite',
        }}
      />
      {/* Focus pulse ring */}
      <div
        className="absolute -inset-[3px] rounded-md opacity-0 group-focus-within/card:opacity-100 pointer-events-none transition-opacity duration-300"
        style={{
          background: 'transparent',
          boxShadow: '0 0 0 2px rgba(0, 205, 172, 0.4)',
          animation: 'focusPulse 2s ease-in-out infinite',
        }}
      />

      <Card className="relative overflow-hidden hover:shadow-lg hover:shadow-highlight/10 transition-all duration-300 border-gray-100 dark:border-[#1a3a5c] bg-white dark:bg-[#0f2137] group rounded-md">
        <div className="relative">
          <LQIPImage
            src={image}
            alt={title}
            aspectRatio="video"
            className="group-hover:scale-105"
          />
          <div className="absolute top-3 left-3">
            <Badge className="bg-highlight/90 backdrop-blur-sm text-highlight-foreground border-0 shadow-sm">
              1:1
            </Badge>
          </div>
          <div className="absolute top-3 right-3 px-2.5 py-1 bg-white/90 backdrop-blur-sm rounded-full text-sm font-medium text-gray-900 shadow-sm">
            {hourlyRate.split(' ')[0]}
          </div>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-1">
              {title}
            </h3>

            {/* Facilitator info with avatar */}
            <Link
              href={buildPublicProfilePath({ id: facilitatorId, username: (facilitator as any)?.username })}
              onClick={scrollToTop}
              className="flex items-center gap-2.5 group/facilitator hover:opacity-80 transition-opacity"
            >
              <Avatar className="h-8 w-8 border-2 border-highlight/20">
                <AvatarImage
                  src={facilitator?.avatar}
                  alt={facilitatorName}
                  className="object-cover"
                />
                <AvatarFallback className="bg-highlight/10 text-highlight text-xs font-medium">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-900 dark:text-white group-hover/facilitator:text-highlight transition-colors">
                  {facilitatorName}
                </span>
                {facilitator?.tags && (
                  <span className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                    {facilitator.tags[0]}
                  </span>
                )}
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-highlight fill-highlight" />
              <span className="font-semibold text-gray-900 dark:text-white">{rating}</span>
              <span className="text-gray-500 dark:text-gray-400">({reviewCount})</span>
            </div>
            <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
              <ShoppingCart className="w-3 h-3" />
              <span>{sales}</span>
            </div>
            <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
              <Eye className="w-3 h-3" />
              <span>{views}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {tags.slice(0, 3).map((tag, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="bg-highlight/10 text-highlight border-highlight/20 dark:bg-highlight/15 dark:border-highlight/30"
              >
                {tag}
              </Badge>
            ))}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-[#1a3a5c]">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>{sales} bookings</span>
              </div>
            </div>
            <Link href={`/session/${id}`} onClick={scrollToTop}>
              <Button className="bg-highlight hover:bg-highlight/90">
                View Details
              </Button>
            </Link>
          </div>
        </div>
      </Card>

    </div>
  );
});
