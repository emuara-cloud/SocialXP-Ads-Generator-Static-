import React, { useState } from 'react';
import { BannerConfig } from '../types';
import { CheckCircle2, RotateCcw, Sparkles, Info, ChevronLeft, ChevronRight } from 'lucide-react';

interface BannerPreviewProps {
  config: BannerConfig;
  onResetToDefault: () => void;
}

// Helper function to convert hex color to rgba with opacity
function hexToRgba(hex: string, alpha: number = 0.85): string {
  if (!hex) return `rgba(14, 165, 233, ${alpha})`;
  if (hex.startsWith('rgba') || hex.startsWith('rgb')) return hex;
  let c = hex.replace('#', '').trim();
  if (c.length === 3) {
    c = c.split('').map((x) => x + x).join('');
  }
  if (c.length === 6) {
    const num = parseInt(c, 16);
    const r = (num >> 16) & 255;
    const g = (num >> 8) & 255;
    const b = num & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  return hex;
}

const VerifiedBadge: React.FC<{ className?: string }> = ({ className = 'w-[13px] h-[13px] shrink-0' }) => (
  <svg
    aria-label="Verified"
    className={`${className} overflow-visible inline-block translate-y-[0.5px]`}
    viewBox="-1 -1 42 42"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fill="#0095F6"
      d="M20 0L24.3 2.8L29.3 1.5L31.9 5.8L37 7.2L37 12.3L40 16.3L37.5 20L40 23.7L37 27.7L37 32.8L31.9 34.2L29.3 38.5L24.3 37.2L20 40L15.7 37.2L10.7 38.5L8.1 34.2L3 32.8L3 27.7L0 23.7L2.5 20L0 16.3L3 12.3L3 7.2L8.1 5.8L10.7 1.5L15.7 2.8L20 0Z"
    />
    <path fill="white" d="M18.3 26L11.5 19.3L13.6 17.2L18.3 21.8L27.6 12.5L29.7 14.6L18.3 26Z" />
  </svg>
);

export const BannerPreview: React.FC<BannerPreviewProps> = ({ config, onResetToDefault }) => {
  const [bgBackdrop, setBgBackdrop] = useState<'light' | 'dark'>('light');
  const [clickNotice, setClickNotice] = useState<{ url: string; label: string } | null>(null);
  const [activeSlideIndex, setActiveSlideIndex] = useState<number>(0);
  const touchStartXRef = React.useRef<number | null>(null);

  // Auto slide effect
  React.useEffect(() => {
    if (!config.isCarousel || config.carouselAutoSlide === false) return;
    const slidesCount = (config.carouselImages && config.carouselImages.length > 0)
      ? config.carouselImages.length
      : 1;
    if (slidesCount <= 1) return;

    const intervalTime = (config.carouselAutoSlideInterval || 3.5) * 1000;
    const timer = setInterval(() => {
      setActiveSlideIndex((prev) => (prev + 1) % slidesCount);
    }, intervalTime);

    return () => clearInterval(timer);
  }, [config.isCarousel, config.carouselAutoSlide, config.carouselAutoSlideInterval, config.carouselImages]);

  const handleSwipeEnd = (endX: number, totalSlides: number) => {
    if (touchStartXRef.current !== null) {
      const diff = touchStartXRef.current - endX;
      if (Math.abs(diff) > 25) {
        if (diff > 0) {
          setActiveSlideIndex((prev) => Math.min(totalSlides - 1, prev + 1));
        } else {
          setActiveSlideIndex((prev) => Math.max(0, prev - 1));
        }
      }
      touchStartXRef.current = null;
    }
  };

  const handleElementClick = (e: React.MouseEvent, customUrl?: string, label: string = 'Banner') => {
    e.stopPropagation();
    const targetUrl = customUrl || config.clickTagUrl || 'https://leverategroup.asia/';
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
    setClickNotice({ url: targetUrl, label });
    setTimeout(() => setClickNotice(null), 3500);
  };

  // Determine animation style class
  const getAnimationClass = () => {
    switch (config.animationStyle) {
      case 'blink':
        return 'animate-pulse';
      default:
        return '';
    }
  };

  const is916Ratio = (config.mainKvAspectRatio || '4:5') === '9:16';

  return (
    <div className="flex flex-col items-center w-full h-full">
      {/* Top Toolbar Controls for Preview */}
      <div className="w-full bg-white border-b border-slate-200 px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-slate-700 shrink-0 shadow-xs">
        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 rounded-full bg-[#004526] animate-ping" />
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Live Banner Preview (300×600)</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Backdrop toggle */}
          <div className="bg-slate-100 p-1 rounded-lg flex items-center text-xs border border-slate-200">
            <button
              onClick={() => setBgBackdrop('light')}
              className={`px-2 py-1 rounded font-medium transition ${bgBackdrop === 'light' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
              title="Light background"
            >
              Light
            </button>
            <button
              onClick={() => setBgBackdrop('dark')}
              className={`px-2 py-1 rounded font-medium transition ${bgBackdrop === 'dark' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
              title="Dark background"
            >
              Dark
            </button>
          </div>

          <button
            onClick={onResetToDefault}
            className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition font-semibold border border-slate-200 shadow-2xs active:scale-95 cursor-pointer"
            title="Reset default values"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" /> Reset
          </button>
        </div>
      </div>



      {/* Main Canvas Container */}
      <div
        className={`relative flex-1 w-full flex items-center justify-center p-6 overflow-auto transition-colors duration-300 ${
          bgBackdrop === 'light'
            ? 'bg-white'
            : 'bg-neutral-950'
        }`}
      >
        {/* ClickTag Banner Alert Toast */}
        {clickNotice && (
          <div className="absolute top-4 z-50 bg-cyan-600 text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-medium animate-bounce border border-cyan-400">
            <CheckCircle2 className="w-4 h-4" />
            <span>
              <strong>Landing URL ({clickNotice.label}):</strong> Opens{' '}
              <span className="underline font-mono">{clickNotice.url}</span>
            </span>
          </div>
        )}

        {/* Clean 300x600 Banner Container */}
        <div className="shadow-2xl ring-1 ring-black/10 rounded-[12px]">
          {/* ========================================== */}
          {/* EXACT 300x600 BANNER COMPONENT */}
          {/* ========================================== */}
          {(() => {
            const is916 = (config.mainKvAspectRatio || '4:5') === '9:16';
            const isTikTokMode = is916 && config.layoutMode === 'tiktok';
            const isReelsMode = is916 && (config.layoutMode === 'reels' || (!config.layoutMode && !isTikTokMode));
            const isVideo = config.mainKvMediaType === 'video' || config.mainKvFilename?.toLowerCase().endsWith('.mp4');
            const fitMode = config.mainKvObjectFit || 'cover';
            const fitClass = fitMode === 'contain' ? 'object-contain' : 'object-cover';
            const cleanCtaText = (config.ctaText || 'Shop now')
              .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{2300}-\u{23FF}\u{2B50}\u{2B55}\u{203C}\u{2049}\u{2122}\u{2139}\u{2194}-\u{2199}\u{21A9}-\u{21AA}\u{2934}-\u{2935}\u{3030}\u{303D}\u{3297}\u{3299}]/gu, '')
              .slice(0, 20);
            const cleanProfileName = (config.profileName || 'username')
              .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{2300}-\u{23FF}\u{2B50}\u{2B55}\u{203C}\u{2049}\u{2122}\u{2139}\u{2194}-\u{2199}\u{21A9}-\u{21AA}\u{2934}-\u{2935}\u{3030}\u{303D}\u{3297}\u{3299}]/gu, '')
              .slice(0, 25);
            const cleanCollabProfileName = (config.collabProfileName || 'partner')
              .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{2300}-\u{23FF}\u{2B50}\u{2B55}\u{203C}\u{2049}\u{2122}\u{2139}\u{2194}-\u{2199}\u{21A9}-\u{21AA}\u{2934}-\u{2935}\u{3030}\u{303D}\u{3297}\u{3299}]/gu, '')
              .slice(0, 25);

            // ----------------------------------------------------
            // 1. TIKTOK 9:16 FYP OVERLAY LAYOUT
            // ----------------------------------------------------
            if (isTikTokMode) {
              return (
                <div
                  onClick={(e) => handleElementClick(e, config.clickTagUrl, 'Main Banner')}
                  className="relative w-[300px] h-[600px] flex items-center justify-center cursor-pointer overflow-hidden bg-transparent select-none transition-transform hover:shadow-xl"
                  style={{ width: '300px', height: '600px' }}
                >
                  {/* Video/Image Card Wrapper (300x533 = 9:16 ratio) */}
                  <div className="relative w-[300px] h-[533px] rounded-[12px] overflow-hidden bg-black flex items-center justify-center">
                    {/* Background Media */}
                    {isVideo ? (
                      <video
                        src={config.mainKvDataUrl}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <img
                        src={config.mainKvDataUrl}
                        alt="Main Promo"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://placehold.co/300x533/e2e8f0/64748b?text=TikTok+KV+(9:16)`;
                        }}
                      />
                    )}

                    {/* Dark Gradient Overlays */}
                    <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-black/70 to-transparent pointer-events-none z-10" />
                    <div className="absolute bottom-0 left-0 right-0 h-60 bg-gradient-to-t from-black/90 via-black/50 to-transparent pointer-events-none z-10" />

                    {/* Right Side Vertical Action Stack (TikTok FYP style) */}
                    <div className="absolute right-2.5 bottom-2.5 z-20 flex flex-col items-center gap-3 text-white">
                      {/* 1. Avatar with Red Plus Badge */}
                      <div className="w-10 flex flex-col items-center justify-center">
                        <div
                          onClick={(e) => handleElementClick(e, config.profileClickUrl, 'Profile')}
                          className="relative cursor-pointer group mb-0.5"
                          title="Profile"
                        >
                          <img
                            src={config.profilePicDataUrl}
                            alt="Profile"
                            className="w-[38px] h-[38px] rounded-full object-cover border border-white/90 shadow-md group-hover:scale-105 transition-transform"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://placehold.co/100x100/e2e8f0/64748b?text=User';
                            }}
                          />
                          {/* Red Plus Badge */}
                          {config.showFollowButton && (
                            <div
                              onClick={(e) => {
                                e.stopPropagation();
                                handleElementClick(e, config.followClickUrl, 'Follow');
                              }}
                              className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#ff2c55] text-white rounded-full flex items-center justify-center shadow-md border border-white hover:scale-110 transition-transform cursor-pointer"
                              title="Follow button"
                            >
                              <svg className="w-2.5 h-2.5 text-white stroke-[3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                              </svg>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* 2. TikTok Heart (Like) */}
                      <div
                        onClick={(e) => handleElementClick(e, config.likeClickUrl, 'Like')}
                        className="w-10 flex flex-col items-center justify-center cursor-pointer group text-center"
                        title="Like button"
                      >
                        <div className="w-7 h-7 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <svg className="w-6 h-6 text-white drop-shadow-md fill-white" viewBox="0 0 24 24">
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                          </svg>
                        </div>
                        <span className="text-[9.5px] font-semibold text-white drop-shadow-sm tracking-tight text-center leading-none mt-0.5 w-full block">
                          {config.likesCount || '538'}
                        </span>
                      </div>

                      {/* 3. TikTok Comment Bubble */}
                      <div
                        onClick={(e) => handleElementClick(e, config.commentClickUrl, 'Comment')}
                        className="w-10 flex flex-col items-center justify-center cursor-pointer group text-center"
                        title="Comment button"
                      >
                        <div className="w-7 h-7 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <svg className="w-6 h-6 text-white drop-shadow-md fill-white" viewBox="0 0 24 24">
                            <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z" />
                          </svg>
                        </div>
                        <span className="text-[9.5px] font-semibold text-white drop-shadow-sm tracking-tight text-center leading-none mt-0.5 w-full block">
                          {config.commentsCount || '277'}
                        </span>
                      </div>

                      {/* 4. TikTok Save / Bookmark Ribbon */}
                      <div
                        onClick={(e) => handleElementClick(e, config.saveClickUrl, 'Save')}
                        className="w-10 flex flex-col items-center justify-center cursor-pointer group text-center"
                        title="Bookmark button"
                      >
                        <div className="w-7 h-7 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <svg className="w-6 h-6 text-white drop-shadow-md fill-white" viewBox="0 0 24 24">
                            <path d="M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2z" />
                          </svg>
                        </div>
                        <span className="text-[9.5px] font-semibold text-white drop-shadow-sm tracking-tight text-center leading-none mt-0.5 w-full block">
                          {config.repostCount || '120'}
                        </span>
                      </div>

                      {/* 5. TikTok Share Arrow */}
                      <div
                        onClick={(e) => handleElementClick(e, config.shareClickUrl, 'Share')}
                        className="w-10 flex flex-col items-center justify-center cursor-pointer group text-center"
                        title="Share button"
                      >
                        <div className="w-7 h-7 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <svg className="w-6 h-6 text-white drop-shadow-md fill-white" viewBox="0 0 24 24">
                            <path d="M13.5 8.5V5L20 11.5L13.5 18V14.5C8.5 14.5 5 16 3 19.5C4 14.5 7 9.5 13.5 8.5Z" />
                          </svg>
                        </div>
                        <span className="text-[9.5px] font-semibold text-white drop-shadow-sm tracking-tight text-center leading-none mt-0.5 w-full block">
                          {config.shareCount || '188'}
                        </span>
                      </div>

                      {/* 6. TikTok Spinning Vinyl Disc / Turntable Sound Icon */}
                      <div className="w-10 flex items-center justify-center">
                        <div
                          className="w-[32px] h-[32px] rounded-full bg-[#121212] border border-neutral-700/80 shadow-md flex items-center justify-center relative overflow-hidden animate-[spin_3s_linear_infinite] mt-0.5 cursor-pointer"
                          title="Sound vinyl disc"
                        >
                          {/* Vinyl Groove Rings */}
                          <div className="absolute inset-1 rounded-full border border-white/10 pointer-events-none" />
                          <div className="absolute inset-2 rounded-full border border-white/5 pointer-events-none" />
                          {/* Center Record Label */}
                          <div className="w-[14px] h-[14px] rounded-full bg-[#ff2c55] border border-black/40 flex items-center justify-center z-10 shadow-xs">
                            <svg className="w-2.5 h-2.5 text-white fill-current" viewBox="0 0 24 24">
                              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Left Profile & Caption & CTA Section */}
                    <div className="absolute left-2.5 right-14 bottom-2.5 z-20 flex flex-col gap-1 text-white">
                      {/* Profile Row */}
                      <div
                        onClick={(e) => handleElementClick(e, config.profileClickUrl, 'Profile')}
                        className="flex items-center gap-1 cursor-pointer max-w-full overflow-hidden"
                      >
                        {config.isCollab ? (
                          <div className="flex flex-col justify-center min-w-0 leading-tight">
                            <div className="flex items-center gap-1 min-w-0">
                              <span className="font-sans text-[12px] font-bold text-white tracking-tight drop-shadow-md truncate max-w-[145px]">
                                {cleanProfileName}
                              </span>
                              {config.isVerified !== false && (
                                <svg aria-label="Verified" className="w-[12px] h-[12px] shrink-0 fill-[#20d5ec]" viewBox="0 0 24 24">
                                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                                </svg>
                              )}
                              <span className="text-[10.5px] text-white/80 font-normal">and</span>
                            </div>
                            <div className="flex items-center gap-1 min-w-0">
                              <span className="font-sans text-[12px] font-bold text-white tracking-tight drop-shadow-md truncate max-w-[145px]">
                                {cleanCollabProfileName}
                              </span>
                              {config.collabIsVerified !== false && (
                                <svg aria-label="Verified" className="w-[12px] h-[12px] shrink-0 fill-[#20d5ec]" viewBox="0 0 24 24">
                                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                                </svg>
                              )}
                            </div>
                          </div>
                        ) : (
                          <>
                            <span className="font-sans text-[13px] font-bold text-white tracking-tight drop-shadow-md leading-tight truncate shrink-0 max-w-[165px]">
                              {cleanProfileName}
                            </span>
                            {config.isVerified !== false && (
                              <svg
                                aria-label="Verified"
                                className="w-[14px] h-[14px] shrink-0 fill-[#20d5ec] inline-block"
                                viewBox="0 0 24 24"
                              >
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                              </svg>
                            )}
                          </>
                        )}
                      </div>

                      {/* Caption */}
                      <div className="pr-1 max-h-[42px] overflow-hidden">
                        <p className="text-[11px] leading-[14px] line-clamp-3 text-white/95 font-normal whitespace-pre-line break-words drop-shadow-md m-0 p-0">{(config.caption || '').trim()}</p>
                      </div>

                      {/* TikTok Red/Custom Slim CTA Button */}
                      <div
                        onClick={(e) => handleElementClick(e, config.ctaClickUrl, 'CTA Button')}
                        className={`w-full h-7 rounded-[8px] flex items-center justify-center px-3 z-20 shadow-lg transition-all cursor-pointer mt-0.5 ${getAnimationClass()}`}
                        style={{
                          background: config.ctaBgColor || '#ff2c55',
                          color: config.ctaTextColor || '#ffffff',
                        }}
                      >
                        <span className="font-sans text-[12px] font-bold tracking-tight text-center truncate">
                          {cleanCtaText}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }

            // ----------------------------------------------------
            // 2. REELS 9:16 FULL-SCREEN OVERLAY LAYOUT
            // ----------------------------------------------------
            if (isReelsMode) {
              return (
                <div
                  onClick={(e) => handleElementClick(e, config.clickTagUrl, 'Main Banner')}
                  className="relative w-[300px] h-[600px] flex items-center justify-center cursor-pointer overflow-hidden bg-transparent select-none transition-transform hover:shadow-xl"
                  style={{ width: '300px', height: '600px' }}
                >
                  {/* Video/Image Card Wrapper (300x533 = 9:16 ratio) */}
                  <div className="relative w-[300px] h-[533px] rounded-[12px] overflow-hidden bg-black flex items-center justify-center">
                    {/* Background Media (No stroke/outline, fills frame) */}
                    {isVideo ? (
                      <video
                        src={config.mainKvDataUrl}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <img
                        src={config.mainKvDataUrl}
                        alt="Main Promo"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://placehold.co/300x533/e2e8f0/64748b?text=Reels+KV+(9:16)`;
                        }}
                      />
                    )}

                    {/* Dark Gradient Overlays for contrast */}
                    <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-black/75 via-black/30 to-transparent pointer-events-none z-10" />
                    <div className="absolute bottom-0 left-0 right-0 h-56 bg-gradient-to-t from-black/90 via-black/60 to-transparent pointer-events-none z-10" />

                    {/* Right Side Vertical Action Stack */}
                    <div className="absolute right-2.5 bottom-2.5 z-20 flex flex-col items-center gap-2.5 text-white">
                      {/* Like */}
                      <div
                        onClick={(e) => handleElementClick(e, config.likeClickUrl, 'Like')}
                        className="flex flex-col items-center cursor-pointer group"
                        title="Like button"
                      >
                        <div className="p-1 rounded-full group-hover:scale-110 transition-transform">
                          <svg aria-label="Like" className="w-5.5 h-5.5 text-white drop-shadow-md" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path d="M16.792 3.904A4.989 4.989 0 0 1 21.5 9.122c0 3.072-2.652 4.959-5.197 7.222-2.512 2.243-3.865 3.469-4.303 3.752-.477-.265-2.143-1.821-4.303-3.752C5.141 14.072 2.5 12.167 2.5 9.122a4.989 4.989 0 0 1 4.708-5.218 4.21 4.21 0 0 1 3.675 1.941c.84 1.174 2.381 1.174 3.234 0a4.203 4.203 0 0 1 3.675-1.941z" />
                          </svg>
                        </div>
                        <span className="text-[9.5px] font-semibold text-white drop-shadow-sm tracking-tight">{config.likesCount || '1,777'}</span>
                      </div>

                      {/* Comment */}
                      <div
                        onClick={(e) => handleElementClick(e, config.commentClickUrl, 'Comment')}
                        className="flex flex-col items-center cursor-pointer group"
                        title="Comment button"
                      >
                        <div className="p-1 rounded-full group-hover:scale-110 transition-transform">
                          <svg aria-label="Comment" className="w-5.5 h-5.5 text-white drop-shadow-md" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" viewBox="0 0 24 24">
                            <path d="M20.656 17.008a9.993 9.993 0 1 0-3.59 3.615L22 22Z" />
                          </svg>
                        </div>
                        <span className="text-[9.5px] font-semibold text-white drop-shadow-sm tracking-tight">{config.commentsCount || '885'}</span>
                      </div>

                      {/* Share Paper Plane */}
                      <div
                        onClick={(e) => handleElementClick(e, config.shareClickUrl, 'Share')}
                        className="flex flex-col items-center cursor-pointer group"
                        title="Share button"
                      >
                        <div className="p-1 rounded-full group-hover:scale-110 transition-transform">
                          <svg aria-label="Share Post" className="w-5.5 h-5.5 text-white drop-shadow-md" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" viewBox="0 0 24 24">
                            <line x1="22" y1="3" x2="9.218" y2="10.083" />
                            <polygon points="11.698 20.334 22 3.001 2 3.001 9.218 10.084 11.698 20.334" />
                          </svg>
                        </div>
                        <span className="text-[9.5px] font-semibold text-white drop-shadow-sm tracking-tight">{config.shareCount || config.repostCount || '433'}</span>
                      </div>

                      {/* 3 Dots Menu */}
                      <div className="flex flex-col items-center cursor-pointer opacity-80 hover:opacity-100">
                        <div className="p-1">
                          <svg className="w-4.5 h-4.5 text-white drop-shadow-md" fill="currentColor" viewBox="0 0 24 24">
                            <circle cx="12" cy="5" r="2" />
                            <circle cx="12" cy="12" r="2" />
                            <circle cx="12" cy="19" r="2" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Left Profile & Caption Info Section */}
                    <div className="absolute left-2.5 right-16 bottom-12 z-20 flex flex-col gap-1.5 text-white">
                      {/* Profile Row */}
                      <div
                        onClick={(e) => handleElementClick(e, config.profileClickUrl, 'Profile')}
                        className="flex items-center gap-1.5 flex-wrap cursor-pointer"
                      >
                        {config.isCollab ? (
                          <>
                            <div className="relative shrink-0 w-[36px] h-[36px]">
                              <img
                                src={config.collabProfilePicDataUrl || config.profilePicDataUrl}
                                alt="Collab Profile"
                                className="w-[22px] h-[22px] rounded-full object-cover absolute top-0 right-0 shadow-sm border border-white/60"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = 'https://placehold.co/100x100/e2e8f0/64748b?text=User';
                                }}
                              />
                              <img
                                src={config.profilePicDataUrl}
                                alt="Profile"
                                className="w-[22px] h-[22px] rounded-full object-cover absolute bottom-0 left-0 ring-2 ring-black shadow-sm z-10"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = 'https://placehold.co/100x100/e2e8f0/64748b?text=User';
                                }}
                              />
                            </div>

                            <div className="flex flex-col justify-center min-w-0 leading-tight">
                              <div className="flex items-center gap-1 min-w-0">
                                <span className="font-sans text-[11.5px] font-bold text-white tracking-tight truncate drop-shadow-md">
                                  {cleanProfileName}
                                </span>
                                {config.isVerified !== false && <VerifiedBadge className="w-[11.5px] h-[11.5px]" />}
                                <span className="text-[10.5px] text-white/80 font-normal">and</span>
                              </div>
                              <div className="flex items-center gap-1 min-w-0">
                                <span className="font-sans text-[11.5px] font-bold text-white tracking-tight truncate drop-shadow-md">
                                  {cleanCollabProfileName}
                                </span>
                                {config.collabIsVerified !== false && <VerifiedBadge className="w-[11.5px] h-[11.5px]" />}
                              </div>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="relative shrink-0 w-[32px] h-[32px] flex items-center justify-center">
                              <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 38 38" fill="none">
                                <defs>
                                  <linearGradient id="instaStoryGradPreviewReels" x1="0%" y1="100%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#FCAF45" />
                                    <stop offset="50%" stopColor="#FD1D1D" />
                                    <stop offset="100%" stopColor="#C13584" />
                                  </linearGradient>
                                </defs>
                                <circle cx="19" cy="19" r="17.5" stroke="url(#instaStoryGradPreviewReels)" strokeWidth="2" fill="none" />
                              </svg>
                              <img
                                src={config.profilePicDataUrl}
                                alt="Profile"
                                className="w-[25px] h-[25px] rounded-full object-cover relative z-10 block"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = 'https://placehold.co/100x100/e2e8f0/64748b?text=User';
                                }}
                              />
                            </div>

                            <span className="font-sans text-[12.5px] font-bold text-white tracking-tight truncate drop-shadow-md">
                              {cleanProfileName}
                            </span>
                            {config.isVerified !== false && <VerifiedBadge className="w-[13px] h-[13px]" />}
                          </>
                        )}

                        {/* Follow Button */}
                        {config.showFollowButton && (
                          <button
                            onClick={(e) => handleElementClick(e, config.followClickUrl, 'Follow')}
                            className="ml-1 px-2.5 py-0.5 text-[10.5px] font-semibold text-white border border-white/80 bg-black/30 hover:bg-black/50 rounded-lg transition-all backdrop-blur-xs cursor-pointer"
                          >
                            Follow
                          </button>
                        )}
                      </div>

                      {/* Caption */}
                      <div className="pr-2 max-h-[42px] overflow-hidden">
                        <p className="text-[11px] leading-[14px] line-clamp-3 text-white/95 font-normal whitespace-pre-line break-words drop-shadow-md m-0 p-0">{(config.caption || '').trim()}</p>
                      </div>
                    </div>

                    {/* Bottom CTA Button (Slimmer h-8, inside video bounds) */}
                    <div
                      onClick={(e) => handleElementClick(e, config.ctaClickUrl, 'CTA Button')}
                      className={`absolute bottom-2.5 left-2.5 right-16 h-8 rounded-[6px] flex items-center justify-between px-3 z-20 shadow-md transition-all cursor-pointer ${getAnimationClass()}`}
                      style={{
                        background: config.ctaBgColor || '#0ea5e9',
                        color: config.ctaTextColor || '#ffffff',
                      }}
                    >
                      <span className="font-['Instagram_Sans',-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,Helvetica,Arial,sans-serif] text-[12px] font-semibold tracking-tight truncate">
                        {cleanCtaText}
                      </span>
                      <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              );
            }

            // ----------------------------------------------------
            // 2. STANDARD FEED LAYOUT (4:5, 1:1, 16:9, or 9:16 Feed Mode)
            // ----------------------------------------------------
            return (
              <div
                onClick={(e) => handleElementClick(e, config.clickTagUrl, 'Main Banner')}
                className="relative w-[300px] h-[600px] border border-gray-200 rounded-[12px] flex flex-col cursor-pointer overflow-hidden bg-white select-none transition-transform hover:shadow-xl"
                style={{ width: '300px', height: '600px' }}
              >
                {/* === HEADER === */}
                <div
                  onClick={(e) => handleElementClick(e, config.profileClickUrl, 'Profile')}
                  className={`flex items-center px-3 py-2 shrink-0 transition-all ${
                    is916
                      ? 'absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/80 via-black/30 to-transparent text-white'
                      : 'bg-white text-black border-b border-gray-100'
                  }`}
                >
                  {/* Story Ring or Collab Overlapping Avatars */}
                  {config.isCollab ? (
                    <div className="relative shrink-0 w-[38px] h-[38px]">
                      <img
                        src={config.collabProfilePicDataUrl || config.profilePicDataUrl}
                        alt="Collab Profile"
                        className="w-[24px] h-[24px] rounded-full object-cover absolute top-0 right-0 shadow-xs border border-white/50"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://placehold.co/100x100/e2e8f0/64748b?text=Collab';
                        }}
                      />
                      <img
                        src={config.profilePicDataUrl}
                        alt="Profile"
                        className={`w-[24px] h-[24px] rounded-full object-cover absolute bottom-0 left-0 ring-2 ${is916 ? 'ring-black' : 'ring-white'} shadow-xs z-10`}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://placehold.co/100x100/e2e8f0/64748b?text=User';
                        }}
                      />
                    </div>
                  ) : (
                    <div className="relative shrink-0 w-[38px] h-[38px] flex items-center justify-center">
                      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 38 38" fill="none">
                        <defs>
                          <linearGradient id="instaStoryGradPreview" x1="0%" y1="100%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#FCAF45" />
                            <stop offset="50%" stopColor="#FD1D1D" />
                            <stop offset="100%" stopColor="#C13584" />
                          </linearGradient>
                        </defs>
                        <circle cx="19" cy="19" r="17.5" stroke="url(#instaStoryGradPreview)" strokeWidth="1.8" fill="none" />
                      </svg>
                      <img
                        src={config.profilePicDataUrl}
                        alt="Profile"
                        className="w-[30px] h-[30px] rounded-full object-cover relative z-10 block"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://placehold.co/100x100/e2e8f0/64748b?text=User';
                        }}
                      />
                    </div>
                  )}

                  {/* Profile Name & Verified */}
                  {config.isCollab ? (
                    <div className="ml-2 flex flex-col justify-center flex-1 min-w-0 mr-1 leading-tight">
                      <div className="flex items-center gap-1 min-w-0">
                        <span
                          className={`font-sans text-[12px] font-bold tracking-tight truncate ${
                            is916 ? 'text-white' : 'text-black'
                          }`}
                        >
                          {cleanProfileName}
                        </span>
                        {config.isVerified !== false && <VerifiedBadge className="w-[12px] h-[12px]" />}
                        <span className={`text-[11px] font-normal ${is916 ? 'text-white/80' : 'text-slate-500'}`}>and</span>
                      </div>
                      <div className="flex items-center gap-1 min-w-0">
                        <span
                          className={`font-sans text-[12px] font-bold tracking-tight truncate ${
                            is916 ? 'text-white' : 'text-black'
                          }`}
                        >
                          {cleanCollabProfileName}
                        </span>
                        {config.collabIsVerified !== false && <VerifiedBadge className="w-[12px] h-[12px]" />}
                      </div>
                    </div>
                  ) : (
                    <div className="ml-2 flex items-center flex-1 min-w-0 mr-1">
                      <span
                        className={`font-sans text-[13.5px] font-semibold tracking-tight truncate ${
                          is916 ? 'text-white' : 'text-black'
                        }`}
                      >
                        {cleanProfileName}
                      </span>
                      {config.isVerified !== false && <VerifiedBadge className="w-[14px] h-[14px] ml-1 flex-shrink-0" />}
                    </div>
                  )}

                  {/* Tombol Follow */}
                  {config.showFollowButton && (
                    <button
                      onClick={(e) => handleElementClick(e, config.followClickUrl, 'Follow')}
                      className={`ml-auto flex-shrink-0 px-2.5 py-0.5 text-[11px] font-semibold rounded-[6px] transition-colors ${
                        is916
                          ? 'text-white border border-white/50 bg-black/20 hover:bg-black/40'
                          : 'text-black border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      Follow
                    </button>
                  )}
                </div>

                {/* === GAMBAR UTAMA / VIDEO (Main KV) & CTA === */}
                {(() => {
                  const ratio = config.mainKvAspectRatio || '4:5';
                  let heightClass = 'h-[375px]'; // default 4:5
                  if (ratio === '1:1') heightClass = 'h-[300px]';
                  if (ratio === '16:9') heightClass = 'h-[169px]';
                  if (is916) heightClass = 'h-[533px]';

                  const ctaOverlayBg = hexToRgba(config.ctaBgColor || '#0ea5e9', 0.85);

                  const isCarouselActive = config.isCarousel && (ratio === '4:5' || ratio === '1:1');
                  const carouselSlides = config.carouselImages && config.carouselImages.length > 0
                    ? config.carouselImages
                    : [{ dataUrl: config.mainKvDataUrl, filename: config.mainKvFilename || 'slide1.jpg' }];
                  const currentSlide = carouselSlides[activeSlideIndex % carouselSlides.length] || carouselSlides[0];

                  return (
                    <>
                      <div className={`w-full ${heightClass} ${fitMode === 'contain' ? 'bg-slate-900' : 'bg-transparent'} shrink-0 relative overflow-hidden transition-all duration-300 flex items-center justify-center group`}>
                        {isCarouselActive ? (
                          <div
                            className="relative w-full h-full select-none cursor-grab active:cursor-grabbing overflow-hidden"
                            onTouchStart={(e) => { touchStartXRef.current = e.touches[0].clientX; }}
                            onTouchEnd={(e) => { handleSwipeEnd(e.changedTouches[0].clientX, carouselSlides.length); }}
                            onMouseDown={(e) => { touchStartXRef.current = e.clientX; }}
                            onMouseUp={(e) => { handleSwipeEnd(e.clientX, carouselSlides.length); }}
                          >
                            {/* Horizontal Sliding Track */}
                            <div
                              className="flex w-full h-full transition-transform duration-300 ease-[cubic-bezier(0.25,1,0.5,1)]"
                              style={{ transform: `translateX(-${(activeSlideIndex % carouselSlides.length) * 100}%)` }}
                            >
                              {carouselSlides.map((slide, idx) => (
                                <div key={idx} className="w-full h-full shrink-0 flex items-center justify-center">
                                  <img
                                    src={slide.dataUrl}
                                    alt={`Slide ${idx + 1}`}
                                    className={`w-full h-full ${fitClass} pointer-events-none select-none`}
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = `https://placehold.co/300x375/e2e8f0/64748b?text=Slide+${idx + 1}`;
                                    }}
                                  />
                                </div>
                              ))}
                            </div>

                            {/* Small, subtle, non-intrusive arrows */}
                            {activeSlideIndex > 0 && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveSlideIndex((prev) => Math.max(0, prev - 1));
                                }}
                                className="absolute left-1 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-black/25 hover:bg-black/60 text-white/80 hover:text-white flex items-center justify-center transition z-20 cursor-pointer opacity-40 hover:opacity-100 shadow-2xs border-none"
                              >
                                <ChevronLeft className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {activeSlideIndex < carouselSlides.length - 1 && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveSlideIndex((prev) => Math.min(carouselSlides.length - 1, prev + 1));
                                }}
                                className="absolute right-1 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-black/25 hover:bg-black/60 text-white/80 hover:text-white flex items-center justify-center transition z-20 cursor-pointer opacity-40 hover:opacity-100 shadow-2xs border-none"
                              >
                                <ChevronRight className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {/* Carousel Pagination Dots (Instagram style) */}
                            <div className="absolute bottom-2 left-0 right-0 flex items-center justify-center gap-1 z-20 pointer-events-auto">
                              {carouselSlides.map((_, idx) => (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveSlideIndex(idx);
                                  }}
                                  className={`h-1.5 rounded-full transition-all cursor-pointer border-none p-0 ${
                                    idx === (activeSlideIndex % carouselSlides.length)
                                      ? 'w-3.5 bg-white shadow-xs'
                                      : 'w-1.5 bg-white/50 hover:bg-white/80'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        ) : isVideo ? (
                          <video
                            src={config.mainKvDataUrl}
                            autoPlay
                            loop
                            muted
                            playsInline
                            className={`w-full h-full ${fitClass}`}
                          />
                        ) : (
                          <img
                            src={config.mainKvDataUrl}
                            alt="Main Promo"
                            className={`w-full h-full ${fitClass}`}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = `https://placehold.co/300x533/e2e8f0/64748b?text=Main+KV+(${ratio})`;
                            }}
                          />
                        )}

                        {/* If 9:16 Feed, render CTA button on bottom layer */}
                        {is916 && (
                          <div
                            onClick={(e) => handleElementClick(e, config.ctaClickUrl, 'CTA Button')}
                            className={`absolute bottom-0 left-0 right-0 h-8 flex items-center justify-between px-4 z-10 backdrop-blur-[2px] transition-all ${getAnimationClass()}`}
                            style={{
                              backgroundColor: ctaOverlayBg,
                              color: config.ctaTextColor || '#ffffff',
                            }}
                          >
                            <span className="font-['Instagram_Sans',-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,Helvetica,Arial,sans-serif] text-[13px] font-semibold tracking-tight truncate">
                              {cleanCtaText}
                            </span>
                            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"></path>
                            </svg>
                          </div>
                        )}
                      </div>

                      {/* Standard CTA button bar (when NOT 9:16) */}
                      {!is916 && (
                        <div
                          onClick={(e) => handleElementClick(e, config.ctaClickUrl, 'CTA Button')}
                          className={`w-full h-8 flex items-center justify-between px-4 shrink-0 transition-all ${getAnimationClass()}`}
                          style={{
                            background: config.ctaBgColor || '#0ea5e9',
                            color: config.ctaTextColor || '#ffffff',
                          }}
                        >
                          <span className="font-['Instagram_Sans',-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,Helvetica,Arial,sans-serif] text-[13px] font-semibold tracking-tight truncate">
                            {cleanCtaText}
                          </span>
                          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"></path>
                          </svg>
                        </div>
                      )}
                    </>
                  );
                })()}

                {/* === ICONS BAR & ANGKA === */}
                <div className="flex items-center px-3 pt-1.5 pb-0 gap-2.5 shrink-0 text-black">
                  {/* Like */}
                  <div
                    onClick={(e) => handleElementClick(e, config.likeClickUrl, 'Like')}
                    className="flex items-center gap-1 hover:text-rose-600 transition"
                    title="Like button"
                  >
                    <svg aria-label="Like" className="w-[19px] h-[19px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                      <path d="M16.792 3.904A4.989 4.989 0 0 1 21.5 9.122c0 3.072-2.652 4.959-5.197 7.222-2.512 2.243-3.865 3.469-4.303 3.752-.477-.265-2.143-1.821-4.303-3.752C5.141 14.072 2.5 12.167 2.5 9.122a4.989 4.989 0 0 1 4.708-5.218 4.21 4.21 0 0 1 3.675 1.941c.84 1.174 2.381 1.174 3.234 0a4.203 4.203 0 0 1 3.675-1.941z"></path>
                    </svg>
                    <span className="text-[11px] font-semibold">{config.likesCount || '0'}</span>
                  </div>

                  {/* Comment */}
                  <div
                    onClick={(e) => handleElementClick(e, config.commentClickUrl, 'Comment')}
                    className="flex items-center gap-1 hover:text-blue-600 transition"
                    title="Comment button"
                  >
                    <svg aria-label="Comment" className="w-[19px] h-[19px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinejoin="round">
                      <path d="M20.656 17.008a9.993 9.993 0 1 0-3.59 3.615L22 22Z"></path>
                    </svg>
                    <span className="text-[11px] font-semibold">{config.commentsCount || '0'}</span>
                  </div>

                  {/* Repost */}
                  <div
                    onClick={(e) => handleElementClick(e, config.repostClickUrl, 'Repost')}
                    className="flex items-center gap-1 hover:text-amber-600 transition"
                    title="Repost button"
                  >
                    <svg aria-label="Repost" className="w-[17px] h-[17px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 12V7a2 2 0 0 1 2-2h12m0 0l-3-3m3 3l-3 3M20 12v5a2 2 0 0 1-2 2H6m0 0l3 3m-3-3l3-3"></path>
                    </svg>
                    <span className="text-[11px] font-semibold">{config.repostCount || '0'}</span>
                  </div>

                  {/* Share */}
                  <div
                    onClick={(e) => handleElementClick(e, config.shareClickUrl, 'Share')}
                    className="flex items-center hover:text-emerald-600 transition"
                    title="Share button"
                  >
                    <svg aria-label="Share Post" className="w-[19px] h-[19px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinejoin="round">
                      <line fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="2" x1="22" x2="9.218" y1="3" y2="10.083"></line>
                      <polygon fill="none" points="11.698 20.334 22 3.001 2 3.001 9.218 10.084 11.698 20.334" stroke="currentColor" strokeLinejoin="round" strokeWidth="2"></polygon>
                    </svg>
                  </div>

                  {/* Save */}
                  <div
                    onClick={(e) => handleElementClick(e, config.saveClickUrl, 'Save')}
                    className="ml-auto flex-shrink-0 hover:text-purple-600 transition"
                    title="Save button"
                  >
                    <svg aria-label="Save" className="w-[19px] h-[19px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                      <polygon points="20 21 12 13.44 4 21 4 3 20 3 20 21" strokeLinejoin="round"></polygon>
                    </svg>
                  </div>
                </div>

                {/* === CAPTION === */}
                <div className="px-3 pt-0.5 pb-2.5 flex-grow flex flex-col justify-start overflow-hidden">
                  <p className="text-[11px] leading-[15px] font-normal text-black line-clamp-6 whitespace-pre-line break-words m-0 p-0">{(config.caption || '').trim()}</p>
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      {/* Footer Info Badge */}
      <div className="w-full bg-white border-t border-slate-200 px-4 py-2 flex items-center justify-between text-[11px] text-slate-500 shrink-0">
        <span className="flex items-center gap-1.5 truncate mr-2">
          <Sparkles className="w-3.5 h-3.5 text-[#004526] shrink-0" />
          <span>Clicking banner elements opens designated landing pages in new tab</span>
        </span>
        <span className="font-mono text-slate-400 shrink-0">300×600 px</span>
      </div>
    </div>
  );
};
