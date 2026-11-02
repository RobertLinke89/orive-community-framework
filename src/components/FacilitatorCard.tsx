"use client";
import { useRouter } from 'next/navigation';
import { memo, useState, useCallback } from 'react';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, MapPin, Clock, Eye } from 'lucide-react';
import { LQIPImage } from '@/components/LQIPImage';
import { VerifiedBadge } from '@/components/VerifiedBadge';
import { motion } from 'framer-motion';

interface FacilitatorCardProps {
  id: string;
  username?: string;
  name: string;
  avatar: string;
  isVerified: boolean;
  rating: number;
  reviewCount: number;
  views: number;
  tags: string[];
  hourlyRate?: string;
  location?: string;
}

export const FacilitatorCard = memo(function FacilitatorCard({
  id,
  username,
  name,
  avatar,
  isVerified,
  rating,
  reviewCount,
  views,
  tags,
  hourlyRate,
  location,
}: FacilitatorCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const navigate = useRouter();

  const isUuid = (value: string) =>
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

  const handleViewProfile = useCallback(() => {
    // Prefer username URLs; fall back to id-based public profile URL.
    // (If id isn't a UUID, keep the legacy internal route for sample/mock data.)
    if (username && username.trim()) {
      navigate.push(`/${encodeURIComponent(username.trim())}`);
      return;
    }

    if (isUuid(id)) {
      navigate.push(`/p/${id}`);
      return;
    }

    navigate.push(`/facilitator/${id}`);
  }, [navigate, id, username]);

  const toggleFavorite = useCallback(() => {
    setIsFavorite(prev => !prev);
  }, []);

  return (
    <motion.div 
      whileHover={{ y: -4, scale: 1.01 }} 
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className="h-full"
    >
      <Card className="h-full overflow-hidden bg-white dark:bg-white/5 backdrop-blur-sm border border-slate-200/80 dark:border-white/10 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_35px_-12px_rgba(0,205,172,0.18)] hover:border-[#00CDAC]/40 dark:hover:border-white/20 transition-all duration-300 rounded-xl group cursor-pointer" onClick={handleViewProfile}>
        <div className="relative overflow-hidden aspect-[4/3] bg-slate-100 dark:bg-[#01223F]">
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-50 dark:opacity-80 dark:from-[#01223F] dark:via-[#01223F]/20 z-10" />
          <div className="w-full h-full transform group-hover:scale-105 transition-transform duration-700">
            <LQIPImage
              src={avatar}
              alt={name}
              aspectRatio="4/3"
            />
          </div>
          <div className="absolute top-3 left-3 z-20">
            <Badge className="bg-[#00CDAC] text-white font-bold border-0 shadow-sm">
              Expert
            </Badge>
          </div>
          {hourlyRate && (
            <div className="absolute top-3 right-3 px-3 py-1.5 bg-white/95 dark:bg-[#01223F]/80 backdrop-blur-md rounded-full text-xs font-bold text-slate-900 dark:text-white border border-slate-200/90 dark:border-white/10 shadow-xs z-20">
              {String(hourlyRate).split(' ')[0]}
            </div>
          )}
        </div>

        {/* Card Content */}
        <div className="p-4 flex flex-col gap-2.5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-[#00CDAC] transition-colors">{name}</h3>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-white/60 font-medium">
                <div className="flex items-center gap-1.5">
                  <span className="text-[#FDDB5B]">★</span>
                  <span className="text-slate-900 dark:text-white font-bold">{rating.toFixed(1)}</span>
                  <span className="text-slate-400 dark:text-white/60">({reviewCount})</span>
                </div>
                {isVerified && <VerifiedBadge size="sm" />}
              </div>
            </div>
          </div>

          {/* Tags */}
          {Array.isArray(tags) && tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {tags.slice(0, 2).map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-0.5 text-[9px] font-bold tracking-wider text-slate-600 dark:text-white/60 uppercase bg-slate-100/80 dark:bg-white/5 rounded border border-slate-200/60 dark:border-white/10"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2 mt-auto">
            <Button
              className="flex-1 h-9 rounded-lg bg-gradient-to-r from-[#00CDAC] to-[#02AAB0] text-white font-bold hover:opacity-95 transition-all shadow-xs border-none"
              onClick={(e) => { e.stopPropagation(); handleViewProfile(); }}
            >
              View profile
            </Button>
            <Button
              variant="outline"
              size="icon"
              className={`h-9 w-9 rounded-lg border-slate-200/80 dark:border-white/10 ${isFavorite ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-slate-50 dark:bg-white/5 text-slate-400 dark:text-white/40 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-700 dark:hover:text-white'} transition-all`}
              onClick={(e) => { e.stopPropagation(); toggleFavorite(); }}
            >
              <Heart
                className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`}
              />
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
});
