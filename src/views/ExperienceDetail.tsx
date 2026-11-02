"use client";
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { ArrowRight, Heart, Share2, CheckCircle2, Copy, Check, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Layout } from '@/components/Layout';
import { DetailBreadcrumb } from '@/components/DetailBreadcrumb';
import { OfferingLocationMap } from '@/components/OfferingLocationMap';
import { OfferingStickyCta } from '@/components/OfferingStickyCta';
import { OfferingFactPills } from '@/components/OfferingFactPills';
import { OfferingThingsToKnow, bookingPriceNote } from '@/components/OfferingThingsToKnow';
import { SimilarOfferings } from '@/components/SimilarOfferings';
import { getExperienceById, type Experience } from '@/data/experiencesData';
import { toExperience } from '@/lib/orivePublic';
import { getFacilitatorById } from '@/data/facilitatorsData';
import { isRealOfferingImage, offeringGalleryOf, optimizeOfferingImage } from '@/lib/imageUrl';
import { partnerLabel, resolveFulfillment } from '@/lib/fulfillment';
import { useLanguage } from '@/hooks/useLanguage';
import { toast } from 'sonner';
import { formatOfferingWhenLine, offeringSpan } from '@/lib/offeringSpan';
import { OfferingImageStage } from '@/components/OfferingImageStage';
import { OfferingHeroHeading } from '@/components/OfferingHeroHeading';
import { ensureOfferingDescription } from '@/lib/offeringDescription';

function formatDuration(duration: string, isDe: boolean): string {
  const raw = String(duration || '').trim();
  if (/day|tag/i.test(raw)) return raw;
  if (/hour|std|hr/i.test(raw) && !/\d+\s*min/i.test(raw)) return raw;
  const mins = parseInt(raw.replace(/[^0-9]/g, ''), 10);
  if (!Number.isFinite(mins) || mins <= 0) return raw;
  if (mins >= 1440) {
    const days = Math.max(1, Math.round(mins / 1440));
    return isDe
      ? `${days} ${days === 1 ? 'Tag' : 'Tage'}`
      : `${days} ${days === 1 ? 'day' : 'days'}`;
  }
  if (mins >= 60) {
    const hours = Math.max(1, Math.round(mins / 60));
    return isDe ? `${hours} Std.` : `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
  }
  return isDe ? `${mins} Min.` : `${mins} min`;
}

export default function ExperienceDetail() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : params.id?.[0] || "";
  const navigate = useRouter();
  const staticExperience = getExperienceById(id || '');
  const { language, copy } = useLanguage();
  const isDe = language === 'de';
  const [copied, setCopied] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [oriveExperience, setOriveExperience] = useState<Experience | null>(null);
  const [oriveLoading, setOriveLoading] = useState(!staticExperience && String(id).startsWith('orive-'));

  useEffect(() => {
    if (staticExperience || !id) return;
    let cancelled = false;
    fetch(`/api/orive/inventory/${encodeURIComponent(id)}`)
      .then(async (res) => {
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled || !data?.raw) return;
        setOriveExperience(toExperience(data.raw, data.slots || []) as Experience);
      })
      .finally(() => {
        if (!cancelled) setOriveLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id, staticExperience]);

  const experience = staticExperience || oriveExperience;

  const facilitator = experience ? getFacilitatorById(experience.facilitatorId) : null;
  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  const handleNativeShare = async () => {
    if (!('share' in navigator)) return false;
    try {
      await navigator.share({
        title: experience?.title ?? 'Experience',
        text: experience ? experience.title : 'Experience',
        url: shareUrl,
      });
      return true;
    } catch {
      return false;
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success(copy('Link kopiert', 'Link copied'));
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(copy('Kopieren fehlgeschlagen', 'Failed to copy'));
    }
  };

  const handleShare = (platform: 'twitter' | 'facebook' | 'linkedin' | 'whatsapp') => {
    const text = experience ? experience.title : 'ORIVE';
    const urls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(`${text} ${shareUrl}`)}`,
    };
    window.open(urls[platform], '_blank', 'noopener,noreferrer');
  };

  if (!experience) {
    if (oriveLoading) {
      return (
        <Layout>
          <div className="container mx-auto px-4 py-20 text-center text-sm text-slate-500">Loading…</div>
        </Layout>
      );
    }
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-3xl font-bold mb-4">{copy('Angebot nicht gefunden', 'Experience Not Found')}</h1>
          <Link href="/marketplace">
            <Button>{copy('Zum Marketplace', 'Browse Experiences')}</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const fulfillment = resolveFulfillment(experience);
  const heroImage = isRealOfferingImage(experience.image)
    ? optimizeOfferingImage(experience.image, 1600)
    : experience.image;
  const gallery = offeringGalleryOf({
    image: experience.image,
    tags: experience.tags,
    title: experience.title,
    type: experience.type,
  });
  const initials = experience.facilitatorName.split(' ').map((n) => n[0]).join('').toUpperCase();
  const facilitatorTags = facilitator?.tags || (experience.category ? [experience.category] : []);
  const aboutText = ensureOfferingDescription({
    title: experience.title,
    description: experience.description,
    tags: experience.tags,
    category: experience.category,
    location: experience.location,
    facilitatorName: experience.facilitatorName,
    type: experience.type,
    lang: language === "de" ? "de" : "en",
  });
  const durationLabel = experience.duration ? formatDuration(experience.duration, isDe) : '';
  const dates = experience.dates || [];
  const showRating = fulfillment === 'orive' && typeof experience.rating === 'number' && experience.rating > 0;
  const priceNote = bookingPriceNote(fulfillment, isDe, experience.source_platform);
  const priceLabel = experience.price > 0
    ? `€${experience.price}`
    : (copy('Preis beim Partner', 'Price on partner site'));
  const ctaLabel = fulfillment === 'orive'
    ? (copy('Auf ORIVE buchen', 'Book on ORIVE'))
    : experience.source_url
      ? (copy(`Bei ${partnerLabel(experience.source_platform)} öffnen`, `Open on ${partnerLabel(experience.source_platform)}`))
      : '';
  const ctaHref = fulfillment === 'orive'
    ? `/checkout/${experience.id}`
    : experience.source_url || null;
  const breadcrumbKind = /retreat|auszeit|immersion|tages[- ]?retreat/i.test(
    `${experience.title} ${(experience.tags || []).join(' ')} ${experience.location || ''}`
  )
    ? 'Retreats'
    : (copy('Events', 'Events'));

  return (
    <Layout>
      <div className="min-h-screen bg-background pb-24 lg:pb-0">
        <section className="relative w-full">
          <OfferingImageStage images={gallery.length ? gallery : [heroImage]} title={experience.title} tall />

          <div className="absolute top-20 left-4 sm:left-8 z-10 max-w-[min(100%,36rem)] pr-20">
            <DetailBreadcrumb
              overlay
              items={[
                { label: copy('Marktplatz', 'Marketplace'), href: '/' },
                { label: breadcrumbKind, href: '/' },
                { label: experience.title },
              ]}
            />
          </div>

          <div className="absolute top-20 right-4 sm:right-8 flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setIsFavorite(!isFavorite);
                toast.success(isFavorite ? (copy('Gespeichert entfernt', 'Removed')) : (copy('Gespeichert', 'Saved')));
              }}
              className="w-10 h-10 rounded-full bg-white/95 text-slate-700 flex items-center justify-center hover:bg-white"
              aria-label={copy('Merken', 'Save')}
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-[#FF385C] text-[#FF385C]' : ''}`} />
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="w-10 h-10 rounded-full bg-white/95 text-slate-700 flex items-center justify-center hover:bg-white"
                  aria-label={copy('Teilen', 'Share')}
                  onClick={async (e) => {
                    if (await handleNativeShare()) {
                      e.preventDefault();
                      e.stopPropagation();
                    }
                  }}
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem onClick={handleCopyLink}>
                  {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                  {copied ? (copy('Kopiert', 'Copied')) : (copy('Link kopieren', 'Copy link'))}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleShare('whatsapp')}>WhatsApp</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleShare('twitter')}>X</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="absolute bottom-0 left-0 right-0 px-4 sm:px-8 lg:px-12 pb-8 sm:pb-10">
            <div className="max-w-6xl mx-auto">
              <OfferingHeroHeading
                title={experience.title}
                category={experience.category}
                location={experience.location}
                facilitatorName={experience.facilitatorName}
                listingLabel={
                  !showRating && fulfillment === 'external'
                    ? (copy(`Gelistet auf ${partnerLabel(experience.source_platform)}`, `Listed on ${partnerLabel(experience.source_platform)}`))
                    : null
                }
                rating={showRating ? experience.rating : null}
                reviewCount={showRating ? experience.reviewCount : null}
              />
            </div>
          </div>
        </section>

        <div className="max-w-6xl mx-auto px-4 sm:px-8 lg:px-12 py-10 sm:py-14">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-16">
            <div className="lg:col-span-7 space-y-12">
              <OfferingFactPills
                isDe={isDe}
                title={experience.title}
                type={experience.type}
                location={experience.location}
                isOnline={experience.is_online}
                duration={durationLabel}
                groupSize={experience.groupSize}
                language={experience.language}
                category={experience.category}
                tags={experience.tags}
                fulfillment={fulfillment}
                partner={experience.source_platform}
              />

              {aboutText ? (
                <section>
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
                    {copy('Über das Angebot', 'About')}
                  </h2>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-light text-[17px] whitespace-pre-line text-justify">
                    {aboutText}
                  </p>
                </section>
              ) : null}

              {experience.whatToExpect && experience.whatToExpect.length > 0 ? (
              <section>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
                  {copy('Ablauf', 'What to expect')}
                </h2>
                <ul className="space-y-3">
                  {experience.whatToExpect.map((item: string, index: number) => (
                    <li key={index} className="flex items-start gap-3 text-slate-600 dark:text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-[#00CDAC] mt-0.5 shrink-0" />
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </section>
              ) : null}

              {experience.whatToBring && experience.whatToBring.length > 0 ? (
              <section>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
                  {copy('Mitbringen', 'What to bring')}
                </h2>
                <div className="flex flex-wrap gap-2">
                  {experience.whatToBring.map((item: string, index: number) => (
                    <span
                      key={index}
                      className="px-3 py-1.5 rounded-full text-sm text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-white/5 border border-slate-200/80 dark:border-white/10"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </section>
              ) : null}

              <section>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-5">
                  {copy('Facilitator', 'Facilitator')}
                </h2>
                <button
                  type="button"
                  onClick={() => navigate.push(`/facilitator/${experience.facilitatorId}`)}
                  className="w-full flex items-center gap-4 text-left group"
                >
                  <Avatar className="w-14 h-14">
                    <AvatarImage src={experience.facilitatorAvatar || facilitator?.avatar} alt={experience.facilitatorName} />
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-slate-900 dark:text-white group-hover:text-[#00CDAC] transition-colors">
                      {experience.facilitatorName}
                    </p>
                    <p className="text-sm text-slate-500">{facilitatorTags.slice(0, 2).join(' · ')}</p>
                  </div>
                  <span className="text-sm font-medium text-slate-500 group-hover:text-[#00CDAC] inline-flex items-center gap-1 shrink-0">
                    {copy('Profil', 'Profile')}
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </button>
              </section>

              <OfferingLocationMap
                location={experience.location}
                isOnline={experience.is_online}
                isDe={isDe}
              />

              <OfferingThingsToKnow
                fulfillment={fulfillment}
                partner={experience.source_platform}
                isDe={isDe}
              />

              {fulfillment === 'orive' && experience.reviews && experience.reviews.length > 0 ? (
                <section>
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-5">
                    {copy('Stimmen', 'Reviews')}
                  </h2>
                  <div className="space-y-6">
                    {experience.reviews.slice(0, 2).map((review: { author: string; rating: number; date: string; text: string }, index: number) => (
                      <blockquote key={index} className="border-l-2 border-[#00CDAC]/40 pl-4">
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed">“{review.text}”</p>
                        <footer className="mt-2 text-sm text-slate-400">
                          {review.author}
                          {review.date ? ` · ${review.date}` : ''}
                        </footer>
                      </blockquote>
                    ))}
                  </div>
                </section>
              ) : null}
            </div>

            <aside className="lg:col-span-5">
              <div className="lg:sticky lg:top-24 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#02182B] p-6 sm:p-7 space-y-6">
                <div>
                  {experience.price > 0 ? (
                    <p className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
                      €{experience.price}
                      <span className="ml-2 text-sm font-normal text-slate-400">
                        {fulfillment === 'orive'
                          ? (copy('über ORIVE', 'sold by ORIVE'))
                          : (copy('laut Partner', 'listed by partner'))}
                      </span>
                    </p>
                  ) : (
                    <p className="text-lg font-semibold tracking-tight text-slate-900 dark:text-white">
                      {copy('Preis auf der Partnerseite', 'Price on partner site')}
                    </p>
                  )}
                </div>

                {dates.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-[11px] uppercase tracking-wider text-slate-400">
                    {fulfillment === 'orive'
                      ? (copy('Termine auf ORIVE', 'Dates on ORIVE'))
                      : (copy('Termin laut Partner', 'Date listed by partner'))}
                  </p>
                  {dates.map((date: { date: string; time: string; spots?: number }, index: number) => {
                    const isoStart = /^\d{4}-\d{2}-\d{2}/.test(date.date);
                    const isoEnd = /^\d{4}-\d{2}-\d{2}/.test(date.time || '');
                    const span = isoStart
                      ? offeringSpan({
                          title: experience.title,
                          description: experience.description,
                          tags: experience.tags,
                          duration: experience.duration,
                          start_at: date.date,
                          end_at: isoEnd ? date.time : undefined,
                        })
                      : null;
                    const when = span ? formatOfferingWhenLine(span, isDe) : date.date;
                    return (
                    <div key={index} className="flex items-center justify-between py-2.5 border-b border-slate-100 dark:border-white/5 last:border-0">
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">{when}</p>
                        {!isoStart && date.time ? <p className="text-xs text-slate-400">{date.time}</p> : null}
                      </div>
                      {fulfillment === 'orive' && date.spots != null ? (
                        <p className="text-xs text-slate-500">
                          {date.spots} {copy('Plätze', 'spots')}
                        </p>
                      ) : null}
                    </div>
                    );
                  })}
                </div>
                ) : null}

                {fulfillment === 'orive' ? (
                  <div className="space-y-2">
                    <Button
                      onClick={() => navigate.push(`/checkout/${experience.id}`)}
                      className="w-full h-12 rounded-full bg-[#00CDAC] hover:bg-[#02AAB0] text-white text-sm font-semibold"
                    >
                      {copy('Auf ORIVE buchen', 'Book on ORIVE')}
                    </Button>
                    <p className="text-[11px] text-slate-400 text-center leading-relaxed">{priceNote}</p>
                  </div>
                ) : experience.source_url ? (
                  <div className="space-y-2">
                    <a
                      href={experience.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full h-12 rounded-full bg-[#00CDAC] hover:bg-[#02AAB0] text-white text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors"
                    >
                      {copy(`Bei ${partnerLabel(experience.source_platform)} öffnen`, `Open on ${partnerLabel(experience.source_platform)}`)}
                      <ExternalLink className="w-4 h-4" />
                    </a>
                    <p className="text-[11px] text-slate-400 text-center leading-relaxed">
                      {priceNote}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 text-center leading-relaxed">
                    {copy('Dieses Angebot ist derzeit nicht über ORIVE buchbar.', 'This listing is not available to book on ORIVE.')}
                  </p>
                )}

                <button
                  type="button"
                  onClick={() => navigate.push(`/facilitator/${experience.facilitatorId}`)}
                  className="w-full text-sm font-medium text-slate-500 hover:text-[#00CDAC] transition-colors"
                >
                  {copy('Facilitator kontaktieren', 'Contact facilitator')}
                </button>
              </div>
            </aside>
          </div>
        </div>
        <SimilarOfferings
          excludeId={experience.id}
          title={experience.title}
          type="event"
          location={experience.location}
          tags={experience.tags}
        />
        <OfferingStickyCta
          price={priceLabel}
          note={priceNote}
          actionLabel={ctaLabel}
          href={ctaHref}
          external={fulfillment !== 'orive'}
        />
      </div>
    </Layout>
  );
}
