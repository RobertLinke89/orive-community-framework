import Link from 'next/link';
import { memo } from 'react';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ElementAvatar } from '@/components/directory/ElementAvatar';
import { isSafeAvatarUrl } from '@/lib/safeImage';
import { ELEMENT_OF, type ElementKey } from '@/components/directory/elements';
import { Star, MapPin, Calendar } from 'lucide-react';
import { LQIPImage } from '@/components/LQIPImage';
import { getFacilitatorById } from '@/data/facilitatorsData';
import type { Experience } from '@/data/experiencesData';
import { buildPublicProfilePath } from '@/lib/publicProfilePath';



interface ExperienceCardProps extends Experience { }

export const ExperienceCard = memo(function ExperienceCard({
  id,
  title,
  facilitatorId,
  facilitatorName,
  facilitatorAvatar,
  location,
  price,
  image,
  dates,
  rating,
  reviewCount,
  category,
  tags,
}: ExperienceCardProps) {
  // Get facilitator data for additional info
  const facilitator = getFacilitatorById(facilitatorId);
  const initials = facilitatorName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase();

  // Use facilitatorAvatar from experience data, fallback to facilitator data
  const avatarSrc = facilitatorAvatar || facilitator?.avatar;

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

      <Card className="relative overflow-hidden hover:shadow-lg hover:shadow-highlight/10 transition-all duration-300 border-gray-100 dark:border-[#1a3a5c] bg-white dark:bg-[#0f2137] group rounded-md">
        <div className="relative">
          <LQIPImage
            src={image}
            alt={title}
            aspectRatio="video"
            className="group-hover:scale-105"
          />
          <Badge className="absolute top-3 left-3 bg-highlight text-white font-bold z-10 border-none shadow-sm capitalize">
            {category}
          </Badge>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-1">
              {title}
            </h3>

            {/* Facilitator info with avatar */}
            <Link
              href={buildPublicProfilePath({ id: facilitatorId, username: (facilitator as any)?.username })}
              className="flex items-center gap-2.5 group/facilitator hover:opacity-80 transition-opacity"
            >
              {isSafeAvatarUrl(avatarSrc) ? (
              <Avatar className="h-8 w-8 border-2 border-highlight/20">
                <AvatarImage
                  src={avatarSrc}
                  alt={facilitatorName}
                  className="object-cover"
                />
                <AvatarFallback className="bg-highlight/10 text-highlight text-xs font-medium">
                  {initials}
                </AvatarFallback>
              </Avatar>
              ) : (
                <ElementAvatar
                  element={(facilitator?.tags || []).map((x) => ELEMENT_OF[x === 'Bodywork' ? 'BodyWork' : x] as ElementKey | undefined).find(Boolean) || 'aether'}
                  size={32}
                />
              )}
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
              <MapPin className="w-3 h-3" />
              <span className="line-clamp-1">{location}</span>
            </div>
          </div>

          {dates && dates.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <Calendar className="w-4 h-4" />
              <span>{dates[0].date}</span>
            </div>
          )}

          {/* Tags */}
          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {tags.slice(0, 3).map((tag, i) => (
                <Badge
                  key={i}
                  variant="outline"
                  className="text-xs bg-secondary/50 border-border/50"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-[#1a3a5c]">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">€{price}</div>
            <Link href={`/experience/${id}`}>
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
