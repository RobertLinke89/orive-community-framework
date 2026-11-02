import { memo, useMemo } from 'react';
import { Star, Quote } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

// Using public folder paths for smaller bundle
const avatar1 = '/avatars/avatar-1.png';
const avatar4 = '/avatars/avatar-4.png';
const avatar5 = '/avatars/avatar-5.png';
const avatar6 = '/avatars/avatar-6.png';
const avatar8 = '/avatars/avatar-8.png';
const avatar9 = '/avatars/avatar-9.png';

interface Testimonial {
  id: string;
  name: string;
  avatar: string;
  location: string;
  rating: number;
  text: string;
  sessionType: string;
}

const testimonials: Testimonial[] = [
  {
    id: '1',
    name: 'Sarah M.',
    avatar: avatar1,
    location: 'Berlin, Germany',
    rating: 5,
    text: 'The breathwork session was transformative. I found clarity and peace I had been searching for years.',
    sessionType: 'Breathwork',
  },
  {
    id: '2',
    name: 'James K.',
    avatar: avatar4,
    location: 'Amsterdam, Netherlands',
    rating: 5,
    text: 'Marcus helped me break through mental barriers that were holding me back in my career. Highly recommended!',
    sessionType: 'Life Coaching',
  },
  {
    id: '3',
    name: 'Lisa R.',
    avatar: avatar5,
    location: 'Vienna, Austria',
    rating: 5,
    text: 'The meditation retreat changed my perspective on life. I feel more centered and present than ever.',
    sessionType: 'Meditation',
  },
  {
    id: '4',
    name: 'Michael T.',
    avatar: avatar6,
    location: 'Munich, Germany',
    rating: 5,
    text: 'Incredible sound healing experience. The facilitator created such a safe and nurturing space.',
    sessionType: 'Sound Healing',
  },
  {
    id: '5',
    name: 'Anna S.',
    avatar: avatar8,
    location: 'Lisbon, Portugal',
    rating: 5,
    text: 'The leadership coaching sessions gave me tools I use every day. My team dynamics have completely shifted.',
    sessionType: 'Leadership Coaching',
  },
  {
    id: '6',
    name: 'David L.',
    avatar: avatar9,
    location: 'Barcelona, Spain',
    rating: 5,
    text: 'Found my perfect yoga instructor through ORIVE. The personalized approach made all the difference.',
    sessionType: 'Yoga',
  },
];

const StarRating = memo(function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${
            i < rating
              ? 'fill-highlight text-highlight'
              : 'fill-muted text-muted'
          }`}
        />
      ))}
    </div>
  );
});

const TestimonialCard = memo(function TestimonialCard({
  testimonial,
}: {
  testimonial: Testimonial;
}) {
  return (
    <div className="relative h-full group/card focus-within:z-10">
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
      
      <div className="relative h-full p-6 rounded-xl bg-white dark:bg-[#0f2137] border border-slate-200/80 dark:border-[#1a3a5c] shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] hover:shadow-[0_16px_32px_-12px_rgba(0,205,172,0.15)] group-hover/card:border-[#00CDAC]/30 dark:group-hover/card:border-transparent transition-all duration-300">
        {/* Quote icon */}
        <Quote className="absolute top-4 right-4 w-8 h-8 text-[#00CDAC]/15" />
        
        {/* Rating */}
        <StarRating rating={testimonial.rating} />
        
        {/* Text */}
        <p className="mt-4 text-slate-600 dark:text-gray-300 text-sm leading-relaxed line-clamp-4">
          "{testimonial.text}"
        </p>
        
        {/* Session type badge */}
        <div className="mt-4 inline-block px-3 py-1 rounded-full bg-[#00CDAC]/10 text-[#008975] dark:text-[#00CDAC] border border-[#00CDAC]/20 text-xs font-semibold">
          {testimonial.sessionType}
        </div>
        
        {/* Author */}
        <div className="mt-4 flex items-center gap-3">
          <img
            src={testimonial.avatar}
            alt={testimonial.name}
            className="w-10 h-10 rounded-full object-cover border-2 border-[#00CDAC]/30"
          />
          <div>
            <p className="font-bold text-slate-900 dark:text-white text-sm">{testimonial.name}</p>
            <p className="text-slate-400 dark:text-gray-500 text-xs">{testimonial.location}</p>
          </div>
        </div>
      </div>
    </div>
  );
});

export const ClientTestimonials = memo(function ClientTestimonials() {
  const items = useMemo(() => testimonials, []);

  return (
    <section className="py-16 sm:py-20 px-4 sm:px-6 bg-slate-50/60 dark:bg-[#0a1628] border-t border-b border-slate-200/60 dark:border-white/5">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-2">
            What Our <span className="bg-gradient-to-r from-[#00CDAC] to-[#02AAB0] bg-clip-text text-transparent">Community</span> Says
          </h2>
          <p className="text-slate-500 dark:text-gray-400 text-sm sm:text-base max-w-xl mx-auto">
            Real experiences from people who found their path through ORIVE
          </p>
        </div>

        {/* Carousel */}
        <Carousel
          opts={{
            align: 'start',
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-3 sm:-ml-4">
            {items.map((testimonial) => (
              <CarouselItem
                key={testimonial.id}
                className="pl-3 sm:pl-4 basis-[85%] sm:basis-1/2 lg:basis-1/3"
              >
                <TestimonialCard testimonial={testimonial} />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden sm:flex -left-4 bg-white dark:bg-[#0f2137] border-gray-200 dark:border-[#1a3a5c] hover:bg-gray-50 dark:hover:bg-[#1a3a5c]" />
          <CarouselNext className="hidden sm:flex -right-4 bg-white dark:bg-[#0f2137] border-gray-200 dark:border-[#1a3a5c] hover:bg-gray-50 dark:hover:bg-[#1a3a5c]" />
        </Carousel>

        {/* Trust indicators */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-center">
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {[avatar1, avatar4, avatar5, avatar6].map((avatar, i) => (
                <img
                  key={i}
                  src={avatar}
                  alt="Client"
                  className="w-8 h-8 rounded-full border-2 border-white dark:border-[#0a1628] object-cover"
                />
              ))}
            </div>
            <span className="text-gray-500 dark:text-gray-400 text-sm">
              <span className="font-semibold text-gray-900 dark:text-white">2,500+</span> happy clients
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Star className="w-4 h-4 fill-highlight text-highlight" />
            <span className="text-gray-500 dark:text-gray-400 text-sm">
              <span className="font-semibold text-gray-900 dark:text-white">4.9</span> average rating
            </span>
          </div>
        </div>
      </div>
    </section>
  );
});
