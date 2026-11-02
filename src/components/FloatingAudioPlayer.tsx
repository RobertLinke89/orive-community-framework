"use client";
import { useState } from "react";
import { Play, Pause, Music2, ExternalLink, X, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export function FloatingAudioPlayer() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);

  const trackInfo = {
    title: "Ambient Wellness",
    artist: "Relaxation Sounds",
    spotifyUrl: "https://open.spotify.com/track/4Je1LAnVHBPGidvP5cfvWx",
    embedUrl: "https://open.spotify.com/embed/track/4Je1LAnVHBPGidvP5cfvWx?utm_source=generator&theme=0"
  };

  const handlePlayToggle = () => {
    if (!isPlaying) {
      setIsExpanded(true);
    }
    setIsPlaying(!isPlaying);
  };

  if (!isVisible) {
    return (
      <Button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-20 left-4 z-40 h-12 w-12 rounded-full bg-highlight hover:bg-highlight/90 shadow-lg shadow-highlight/20"
      >
        <Music2 className="h-5 w-5 text-gray-900 dark:text-white" />
      </Button>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className={cn(
          "fixed bottom-16 md:bottom-4 left-4 right-4 md:right-auto md:left-4 z-40 transition-all duration-300",
          isExpanded ? "md:w-80" : "md:w-72"
        )}
      >
        <div className="bg-card/95 backdrop-blur-xl border border-border/50 rounded-lg shadow-2xl shadow-black/20 overflow-hidden">
          {/* Expanded Spotify Embed */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <iframe 
                  src={trackInfo.embedUrl}
                  width="100%" 
                  height="152" 
                  frameBorder="0" 
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
                  loading="lazy"
                  className="rounded-t-xl"
                  style={{ borderRadius: '12px 12px 0 0' }}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Mini Player Bar */}
          <div className="p-3 flex items-center gap-3">
            {/* Play/Pause Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePlayToggle}
              className={cn(
                "h-10 w-10 rounded-full flex-shrink-0 transition-all duration-300",
                isPlaying 
                  ? "bg-highlight text-white hover:bg-highlight/90" 
                  : "bg-muted hover:bg-muted/80 text-foreground"
              )}
            >
              {isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4 ml-0.5" />
              )}
            </Button>

            {/* Track Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {trackInfo.title}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {trackInfo.artist}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-1 flex-shrink-0">
              {/* Expand/Collapse */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsExpanded(!isExpanded)}
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
              >
                <ChevronUp className={cn(
                  "h-4 w-4 transition-transform duration-300",
                  isExpanded && "rotate-180"
                )} />
              </Button>

              {/* Open in Spotify */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => window.open(trackInfo.spotifyUrl, '_blank', 'noopener,noreferrer')}
                className="h-8 w-8 text-muted-foreground hover:text-[#1DB954]"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>

              {/* Close */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsVisible(false)}
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Progress Bar Animation */}
          {isPlaying && (
            <div className="h-1 bg-muted overflow-hidden">
              <motion.div
                className="h-full bg-highlight"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ 
                  duration: 30, 
                  ease: "linear",
                  repeat: Infinity 
                }}
              />
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}