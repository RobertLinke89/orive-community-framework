import Link from 'next/link';
import { memo, useMemo } from 'react';
import { SafeImage } from '@/components/SafeImage';

import { CheckCircle, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { buildPublicProfilePath } from '@/lib/publicProfilePath';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

// Using public folder paths for smaller bundle
const facilitator1 = '/facilitators/facilitator-1.jpg';
const facilitator2 = '/facilitators/facilitator-2.jpg';
const facilitator3 = '/facilitators/facilitator-3.jpg';
const facilitator4 = '/facilitators/facilitator-4.jpg';
const facilitator5 = '/facilitators/facilitator-5.jpg';
const facilitator6 = '/facilitators/facilitator-6.jpg';

interface FeaturedFacilitator {
  id: string;
  username?: string;
  name: string;
  avatar: string;
  specialty: string;
  rating: number;
  reviewCount: number;
  tags: string[];
}

const featuredFacilitators: FeaturedFacilitator[] = [
  {
    id: '1',
    name: 'Emma van der Berg',
    avatar: facilitator1,
    specialty: 'Breathwork Master',
    rating: 5.0,
    reviewCount: 183,
    tags: ['Breathwork', 'Inner Strength'],
  },
  {
    id: '3',
    name: 'Mei Chen',
    avatar: facilitator3,
    specialty: 'Meditation Guide',
    rating: 5.0,
    reviewCount: 156,
    tags: ['Meditation', 'Mindfulness'],
  },
  {
    id: '4',
    name: 'David Morrison',
    avatar: facilitator4,
    specialty: 'Spiritual Guide',
    rating: 4.9,
    reviewCount: 203,
    tags: ['Spiritual Growth', 'Self-Discovery'],
  },
  {
    id: '15',
    name: 'Victoria Chen',
    avatar: facilitator5,
    specialty: 'Leadership Coach',
    rating: 5.0,
    reviewCount: 178,
    tags: ['Leadership', 'Transformation'],
  },
  {
    id: '6',
    name: 'Thomas Schneider',
    avatar: facilitator6,
    specialty: 'Massage Therapist',
    rating: 4.9,
    reviewCount: 112,
    tags: ['Massage', 'Relaxation'],
  },
  {
    id: '2',
    name: 'Marcus Hoffmann',
    avatar: facilitator2,
    specialty: 'Life Coach',
    rating: 4.9,
    reviewCount: 89,
    tags: ['Life Coaching', 'Personal Growth'],
  },
];

const FacilitatorCard = memo(function FacilitatorCard({
  facilitator,
}: {
  facilitator: FeaturedFacilitator;
}) {
  return (
    <Link
      href={buildPublicProfilePath({ id: facilitator.id, username: facilitator.username })}
      className="block group/card focus-within:z-10"
    >
      <div className="relative overflow-hidden rounded-lg">
        {/* Animated border glow effect */}
        <div 
          className="absolute -inset-[1px] rounded-lg opacity-0 group-hover/card:opacity-100 group-focus-within/card:opacity-100 transition-opacity duration-500 dark:block hidden"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, transparent 30%, #00CDAC 50%, transparent 70%, transparent 100%)',
            backgroundSize: '200% 100%',
            animation: 'borderGlow 6s ease-in-out infinite',
          }}
        />
        {/* Secondary blur glow */}
        <div 
          className="absolute -inset-[2px] rounded-lg opacity-0 group-hover/card:opacity-40 group-focus-within/card:opacity-60 blur-sm transition-opacity duration-500 dark:block hidden"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, transparent 30%, #00CDAC 50%, transparent 70%, transparent 100%)',
            backgroundSize: '200% 100%',
            animation: 'borderGlow 6s ease-in-out infinite',
          }}
        />
        {/* Focus pulse ring */}
        <div 
          className="absolute -inset-[3px] rounded-lg opacity-0 group-focus-within/card:opacity-100 pointer-events-none transition-opacity duration-300 dark:block hidden"
          style={{
            background: 'transparent',
            boxShadow: '0 0 0 2px rgba(0, 205, 172, 0.4)',
            animation: 'focusPulse 2s ease-in-out infinite',
          }}
        />
        
        <div className="relative bg-white dark:bg-[#0f2137] rounded-lg border border-gray-100 dark:border-[#1a3a5c] group-hover/card:border-gray-200 dark:group-hover/card:border-transparent transition-all duration-300 overflow-hidden">
          {/* Image */}
          <div className="relative aspect-[3/4] overflow-hidden">
            <SafeImage
              src={facilitator.avatar}
              alt={facilitator.name}
              kind="cover"
              className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-102"
            />
            {/* Subtle gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
            
            {/* Content overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-medium text-gray-900 dark:text-white text-base">{facilitator.name}</h3>
                <CheckCircle className="w-3.5 h-3.5 text-[#00CDAC] flex-shrink-0" />
              </div>
              <p className="text-gray-600 dark:text-white/80 text-sm mb-2">{facilitator.specialty}</p>
              
              {/* Rating */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <span className="text-[#00CDAC] text-sm">★</span>
                  <span className="text-gray-900 dark:text-white text-sm">{facilitator.rating.toFixed(1)}</span>
                </div>
                <span className="text-gray-500 dark:text-white/50 text-xs">({facilitator.reviewCount})</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
});

export const FeaturedFacilitators = memo(function FeaturedFacilitators() {
  const facilitators = useMemo(() => featuredFacilitators, []);

  return (
    <section className="py-16 sm:py-20 px-4 sm:px-6 bg-white dark:bg-gray-100 dark:bg-[#0a1628]">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-white mb-1">
              Featured Facilitators
            </h2>
            <p className="text-gray-400 dark:text-gray-500 text-sm">
              Connect with top-rated practitioners
            </p>
          </div>
          <Link href="/marketplace">
            <Button variant="ghost" className="hidden sm:flex items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-normal">
              View all
              <ChevronRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        {/* Carousel */}
        <Carousel
          opts={{
            align: 'start',
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-4">
            {facilitators.map((facilitator) => (
              <CarouselItem
                key={facilitator.id}
                className="pl-4 basis-[70%] sm:basis-1/2 md:basis-1/3 lg:basis-1/4"
              >
                <FacilitatorCard facilitator={facilitator} />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden sm:flex -left-4 bg-white dark:bg-[#0f2137] border-gray-100 dark:border-[#1a3a5c] hover:bg-gray-50 dark:hover:bg-[#1a3a5c] hover:border-gray-200" />
          <CarouselNext className="hidden sm:flex -right-4 bg-white dark:bg-[#0f2137] border-gray-100 dark:border-[#1a3a5c] hover:bg-gray-50 dark:hover:bg-[#1a3a5c] hover:border-gray-200" />
        </Carousel>

        {/* Mobile view all button */}
        <div className="mt-8 text-center sm:hidden">
          <Link href="/marketplace">
            <Button variant="ghost" className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-normal">
              View all facilitators
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
});
