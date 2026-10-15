import React, { useState, useEffect } from 'react';
import { BannerConfig } from '../types';
import { extractDominantColors } from '../utils/colorExtractor';
import { formatSocialNumber } from '../utils/formatters';
import { DynamizeLogo } from './DynamizeLogo';
import {
  Image as ImageIcon,
  User,
  Link,
  MessageSquare,
  Upload,
  CheckCircle2,
  Share2,
  Heart,
  Repeat,
  Download,
  Code,
  Palette,
  Dices,
  RefreshCw,
  Wand2,
  Pipette,
  Info,
  Instagram,
  Plus,
  Trash2,
  Layers,
  ChevronUp,
  ChevronDown,
  Users,
} from 'lucide-react';

const TikTokIcon: React.FC<{ className?: string }> = ({ className = 'w-3.5 h-3.5' }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-5.201 1.743l-.002-.001.002.001a2.895 2.895 0 0 1 3.183-4.51v-3.5a6.329 6.329 0 0 0-5.394 2.138 6.332 6.332 0 0 0 1.258 8.922 6.334 6.334 0 0 0 7.596-.28 6.332 6.332 0 0 0 2.112-4.664V9.083a8.232 8.232 0 0 0 4.664 1.442V7.08a4.787 4.787 0 0 1-1.003-.394z" />
  </svg>
);

interface EditorControlsProps {
  config: BannerConfig;
  onChange: (updated: Partial<BannerConfig>) => void;
  onDownloadZip: () => void;
  onOpenCodeModal: () => void;
  onResetToDefault: () => void;
  isDownloading: boolean;
}

export const EditorControls: React.FC<EditorControlsProps> = ({
  config,
  onChange,
  onDownloadZip,
  onOpenCodeModal,
  onResetToDefault,
  isDownloading,
}) => {
  // Extracted dominant color tones from uploaded images
  const [mainKvTone, setMainKvTone] = useState<string | null>(null);
  const [profileTone, setProfileTone] = useState<string | null>(null);

  // Extract color tone when Main KV changes
  useEffect(() => {
    if (config.mainKvDataUrl) {
      extractDominantColors(config.mainKvDataUrl, 2).then((colors) => {
        if (colors && colors.length > 0) {
          setMainKvTone(colors[0]);
        }
      });
    }
  }, [config.mainKvDataUrl]);

  // Extract color tone when Profile Pic changes
  useEffect(() => {
    if (config.profilePicDataUrl) {
      extractDominantColors(config.profilePicDataUrl, 2).then((colors) => {
        if (colors && colors.length > 0) {
          setProfileTone(colors[0]);
        }
      });
    }
  }, [config.profilePicDataUrl]);

  // Image Upload handler for Profile Pic
  const handleProfilePicUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        if (event.target?.result) {
          const dataUrl = event.target.result as string;
          const colors = await extractDominantColors(dataUrl, 1);
          const autoColor = colors[0] || '#00C838';
          setProfileTone(autoColor);
          onChange({
            profilePicDataUrl: dataUrl,
            profilePicFilename: file.name,
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Upload handler for Main KV (Image only)
  const handleMainKvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        if (event.target?.result) {
          const dataUrl = event.target.result as string;
          const colors = await extractDominantColors(dataUrl, 1);
          if (colors && colors.length > 0) {
            setMainKvTone(colors[0]);
          }
          onChange({
            mainKvDataUrl: dataUrl,
            mainKvFilename: file.name,
            mainKvMediaType: 'image',
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Color Swatches
  const colorSwatches = [
    { name: 'Dynamize Green', hex: '#00C838' },
    { name: 'Dynamize Dark', hex: '#242424' },
    { name: 'Leverate Blue', hex: '#2563eb' },
    { name: 'Mint Green', hex: '#10b981' },
    { name: 'Fashion Purple', hex: '#a855f7' },
    { name: 'Pure White', hex: '#ffffff' },
  ];

  // Image Upload handler for Collab Profile Pic
  const handleCollabProfilePicUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        if (event.target?.result) {
          const dataUrl = event.target.result as string;
          onChange({
            collabProfilePicDataUrl: dataUrl,
            collabProfilePicFilename: file.name,
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Helper to parse numeric value from formatted strings like "18.4K", "1,250", etc.
  const parseSocialValue = (str: string, fallback: number = 18000): number => {
    if (!str) return fallback;
    const clean = str.trim().toUpperCase();
    if (clean.endsWith('K')) {
      const n = parseFloat(clean.replace('K', ''));
      return isNaN(n) ? fallback : Math.round(n * 1000);
    }
    if (clean.endsWith('M')) {
      const n = parseFloat(clean.replace('M', ''));
      return isNaN(n) ? fallback : Math.round(n * 1000000);
    }
    const digits = parseInt(clean.replace(/[^0-9]/g, ''), 10);
    return isNaN(digits) ? fallback : digits;
  };

  // Realistic Social Media Metrics Randomizer
  // Logic: Likes must always be significantly higher than Comments, Shares, and Reposts/Saves
  // Likes: 4,500 - 48,000
  // Comments: 1.5% - 4.5% of Likes
  // Shares: 2.5% - 8% of Likes
  // Reposts: 3% - 9% of Likes
  const generateRandomLikes = (): number => {
    return Math.floor(Math.random() * (48000 - 4500 + 1)) + 4500;
  };

  const handleRandomizeAll = () => {
    const likes = generateRandomLikes();
    const comments = Math.max(35, Math.round(likes * (0.015 + Math.random() * 0.03)));
    const shares = Math.max(60, Math.round(likes * (0.025 + Math.random() * 0.055)));
    const reposts = Math.max(75, Math.round(likes * (0.03 + Math.random() * 0.06)));

    onChange({
      likesCount: formatSocialNumber(likes),
      commentsCount: formatSocialNumber(comments),
      shareCount: formatSocialNumber(shares),
      repostCount: formatSocialNumber(reposts),
    });
  };

  const handleRandomizeLikes = () => {
    const newLikes = generateRandomLikes();
    onChange({ likesCount: formatSocialNumber(newLikes) });
  };

  const handleRandomizeComments = () => {
    const curLikes = parseSocialValue(config.likesCount, 18000);
    const comments = Math.max(35, Math.round(curLikes * (0.015 + Math.random() * 0.03)));
    onChange({ commentsCount: formatSocialNumber(comments) });
  };

  const handleRandomizeShares = () => {
    const curLikes = parseSocialValue(config.likesCount, 18000);
    const shares = Math.max(60, Math.round(curLikes * (0.025 + Math.random() * 0.055)));
    onChange({ shareCount: formatSocialNumber(shares) });
  };

  const handleRandomizeReposts = () => {
    const curLikes = parseSocialValue(config.likesCount, 18000);
    const reposts = Math.max(75, Math.round(curLikes * (0.03 + Math.random() * 0.06)));
    onChange({ repostCount: formatSocialNumber(reposts) });
  };

  // Carousel Slide Upload Handlers
  const handleCarouselSlideUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const dataUrl = event.target.result as string;
          const currentSlides = [...(config.carouselImages || [
            { dataUrl: config.mainKvDataUrl, filename: config.mainKvFilename || 'slide1.jpg' },
            { dataUrl: config.mainKvDataUrl, filename: 'slide2.jpg' },
          ])];
          currentSlides[index] = { dataUrl, filename: file.name };
          const updates: Partial<BannerConfig> = { carouselImages: currentSlides };
          if (index === 0) {
            updates.mainKvDataUrl = dataUrl;
            updates.mainKvFilename = file.name;
          }
          onChange(updates);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddCarouselSlide = () => {
    const currentSlides = [...(config.carouselImages || [
      { dataUrl: config.mainKvDataUrl, filename: config.mainKvFilename || 'slide1.jpg' },
      { dataUrl: config.mainKvDataUrl, filename: 'slide2.jpg' },
    ])];
    if (currentSlides.length < 6) {
      currentSlides.push({
        dataUrl: config.mainKvDataUrl,
        filename: `slide_${currentSlides.length + 1}.jpg`,
      });
      onChange({ carouselImages: currentSlides });
    }
  };

  const handleRemoveCarouselSlide = (index: number) => {
    const currentSlides = [...(config.carouselImages || [])];
    if (currentSlides.length > 2) {
      currentSlides.splice(index, 1);
      const updates: Partial<BannerConfig> = { carouselImages: currentSlides };
      if (index === 0 && currentSlides.length > 0) {
        updates.mainKvDataUrl = currentSlides[0].dataUrl;
        updates.mainKvFilename = currentSlides[0].filename;
      }
      onChange(updates);
    }
  };

  const handleMoveCarouselSlide = (index: number, direction: 'up' | 'down') => {
    const currentSlides = [...(config.carouselImages || [
      { dataUrl: config.mainKvDataUrl, filename: config.mainKvFilename || 'slide1.jpg' },
      { dataUrl: config.mainKvDataUrl, filename: 'slide2.jpg' },
    ])];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex >= 0 && targetIndex < currentSlides.length) {
      const temp = currentSlides[index];
      currentSlides[index] = currentSlides[targetIndex];
      currentSlides[targetIndex] = temp;
      const updates: Partial<BannerConfig> = { carouselImages: currentSlides };
      if (currentSlides.length > 0) {
        updates.mainKvDataUrl = currentSlides[0].dataUrl;
        updates.mainKvFilename = currentSlides[0].filename;
      }
      onChange(updates);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white text-slate-800 border-r border-slate-200 w-full overflow-hidden">
      {/* Header Bar with Dynamize Logo */}
      <div className="p-3.5 px-4 border-b border-slate-200 bg-white flex items-center justify-between shrink-0 shadow-xs">
        <div className="flex items-center gap-2.5">
          <DynamizeLogo height={24} />
          <span className="text-[13px] font-bold text-slate-800 tracking-wide font-['Outfit',sans-serif]">
            SocialXP Ads Generator
          </span>
        </div>

        <button
          type="button"
          onClick={onResetToDefault}
          className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition font-semibold border border-slate-200 shadow-2xs active:scale-95 cursor-pointer"
          title="Reset to default values"
        >
          <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
          <span>Reset</span>
        </button>
      </div>

      {/* Main Form Fields (Stacked Vertically) */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 text-xs">
        
        {/* SECTION 1: MEDIA FILES */}
        <section className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5 font-bold text-slate-800 text-xs uppercase tracking-wider">
            <ImageIcon className="w-4 h-4 text-[#00C838]" />
            <span>1. Media Assets</span>
          </div>

          <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/80 space-y-3">
            <label className="block font-semibold text-slate-800 flex items-center justify-between">
              <span>Profile Picture</span>
              <span className="text-[10px] text-slate-400 font-normal">1:1 Square</span>
            </label>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#00C838] shrink-0 bg-white shadow-sm">
                <img src={config.profilePicDataUrl} alt="Preview" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <label className="flex items-center justify-center gap-2 w-full px-3 py-2 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg cursor-pointer text-slate-700 transition font-medium shadow-2xs">
                  <Upload className="w-3.5 h-3.5 text-[#00C838]" />
                  <span>Upload Profile Image</span>
                  <input type="file" accept="image/*" onChange={handleProfilePicUpload} className="hidden" />
                </label>
                <p className="text-[10px] text-slate-500 mt-1 truncate">
                  File: <span className="text-slate-700 font-mono">{config.profilePicFilename}</span>
                </p>
              </div>
            </div>
          </div>

          <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-slate-800">
                Main Key Visual
              </label>
              <span className="text-[10px] text-slate-400 font-normal">PNG, JPG, WEBP</span>
            </div>

            {/* Aspect Ratio Selector */}
            <div className="space-y-1">
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
                Select Media Aspect Ratio:
              </span>
              <div className="grid grid-cols-4 gap-1.5">
                {(['4:5', '1:1', '16:9', '9:16'] as const).map((ratio) => {
                  const active = (config.mainKvAspectRatio || '4:5') === ratio;
                  return (
                    <button
                      key={ratio}
                      type="button"
                      onClick={() =>
                        onChange({
                          mainKvAspectRatio: ratio,
                          mainKvObjectFit: config.mainKvObjectFit || (ratio === '9:16' ? 'cover' : 'cover'),
                          layoutMode: ratio === '9:16' ? (config.layoutMode || 'reels') : config.layoutMode,
                          isCarousel: (ratio === '4:5' || ratio === '1:1') ? config.isCarousel : false,
                        })
                      }
                      className={`py-1.5 px-2 text-[11px] font-semibold rounded-md border text-center transition cursor-pointer ${
                        active
                          ? 'bg-[#00C838] text-white border-[#00C838] shadow-2xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {ratio}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Post Format Option: Single Post vs Carousel Post (ONLY AVAILABLE IN 4:5 and 1:1 RATIO) */}
            {((config.mainKvAspectRatio || '4:5') === '4:5' || config.mainKvAspectRatio === '1:1') && (
              <div className="pt-2 border-t border-slate-200/80 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider block">
                    Post Format:
                  </span>
                  <span className="text-[9px] font-semibold text-[#00C838] bg-emerald-50 border border-emerald-200/80 px-1.5 py-0.5 rounded-md">
                    4:5 &amp; 1:1 Carousel Ready
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => onChange({ isCarousel: false })}
                    className={`py-1.5 px-2 text-[10px] font-bold rounded-lg border text-center transition cursor-pointer flex items-center justify-center gap-1 ${
                      !config.isCarousel
                        ? 'bg-[#00C838] text-white border-[#00C838] shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span>🖼️ Single Image</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const slides = config.carouselImages && config.carouselImages.length >= 2
                        ? config.carouselImages
                        : [
                            { dataUrl: config.mainKvDataUrl, filename: config.mainKvFilename || 'slide1.jpg' },
                            { dataUrl: config.mainKvDataUrl, filename: 'slide2.jpg' },
                          ];
                      onChange({ isCarousel: true, carouselImages: slides });
                    }}
                    className={`py-1.5 px-2 text-[10px] font-bold rounded-lg border text-center transition cursor-pointer flex items-center justify-center gap-1 ${
                      config.isCarousel
                        ? 'bg-gradient-to-r from-[#00C838] to-emerald-600 text-white border-transparent shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span>🎠 Carousel Post</span>
                  </button>
                </div>
              </div>
            )}

            {/* 9:16 Layout Format Option (IG Reels vs TikTok FYP vs IG Feed) */}
            {(config.mainKvAspectRatio || '4:5') === '9:16' && (
              <div className="pt-2 border-t border-slate-200/80 space-y-1.5">
                <span className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider block">
                  9:16 Layout Format:
                </span>
                <div className="grid grid-cols-3 gap-1">
                  <button
                    type="button"
                    onClick={() => onChange({ layoutMode: 'reels', ctaBgColor: '#00C838' })}
                    className={`py-1.5 px-1 text-[10px] font-bold rounded-lg border text-center transition cursor-pointer flex items-center justify-center gap-1 ${
                      (config.layoutMode || 'reels') === 'reels'
                        ? 'bg-gradient-to-r from-[#00C838] to-emerald-600 text-white border-transparent shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span>🎬 IG Reels</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onChange({ layoutMode: 'tiktok', ctaBgColor: '#ff2c55' })}
                    className={`py-1.5 px-1 text-[10px] font-bold rounded-lg border text-center transition cursor-pointer flex items-center justify-center gap-1 ${
                      config.layoutMode === 'tiktok'
                        ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white border-transparent shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span>🎵 TikTok FYP</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onChange({ layoutMode: 'feed', ctaBgColor: '#00C838' })}
                    className={`py-1.5 px-1 text-[10px] font-semibold rounded-lg border text-center transition cursor-pointer flex items-center justify-center gap-1 ${
                      config.layoutMode === 'feed'
                        ? 'bg-[#00C838] text-white border-[#00C838] shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span>🖼️ IG Feed</span>
                  </button>
                </div>
              </div>
            )}

            {/* Media Display Mode (Object Fit - Only shown in IG Feed Mode) */}
            {!((config.mainKvAspectRatio || '4:5') === '9:16' && (config.layoutMode === 'reels' || config.layoutMode === 'tiktok' || !config.layoutMode)) && (
              <div className="space-y-1">
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Media Display Mode (Object Fit):
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => onChange({ mainKvObjectFit: 'contain' })}
                    className={`py-1 px-2 text-[10px] font-semibold rounded border text-center transition cursor-pointer ${
                      (config.mainKvObjectFit || 'cover') === 'contain'
                        ? 'bg-[#00C838] text-white border-[#00C838]'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Contain (Fit Full)
                  </button>
                  <button
                    type="button"
                    onClick={() => onChange({ mainKvObjectFit: 'cover' })}
                    className={`py-1 px-2 text-[10px] font-semibold rounded border text-center transition cursor-pointer ${
                      (config.mainKvObjectFit || 'cover') === 'cover'
                        ? 'bg-[#00C838] text-white border-[#00C838]'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Cover (Fill Area)
                  </button>
                </div>
              </div>
            )}

            {/* Main KV Upload - Only shown for Single Image / Non-carousel mode */}
            {!config.isCarousel && (
              <div className="space-y-2">
                <div className="w-full h-36 rounded-lg overflow-hidden border border-slate-300 bg-slate-900 relative group flex items-center justify-center">
                  <img
                    src={config.mainKvDataUrl}
                    alt="Main KV"
                    className={`w-full h-full ${
                      (config.mainKvObjectFit || (config.mainKvAspectRatio === '9:16' ? 'contain' : 'cover')) === 'contain'
                        ? 'object-contain'
                        : 'object-cover'
                    }`}
                  />
                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition pointer-events-none">
                    <span className="text-[11px] text-white font-medium">
                      Preview Aspect Ratio {config.mainKvAspectRatio || '4:5'} (
                      {(config.mainKvObjectFit || (config.mainKvAspectRatio === '9:16' ? 'contain' : 'cover')) === 'contain' ? 'Contain' : 'Cover'})
                    </span>
                  </div>
                </div>

                <label className="flex items-center justify-center gap-2 w-full px-3 py-2 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg cursor-pointer text-slate-700 transition font-medium shadow-2xs">
                  <Upload className="w-3.5 h-3.5 text-[#00C838]" />
                  <span>Upload Main KV (PNG, JPG, WEBP)</span>
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/jpg, image/webp, image/gif"
                    onChange={handleMainKvUpload}
                    className="hidden"
                  />
                </label>
                <p className="text-[10px] text-slate-500 mt-1">
                  File: <span className="text-slate-700 font-mono">{config.mainKvFilename}</span>
                </p>
              </div>
            )}

            {/* Carousel Slides Manager (When Carousel mode is active for 4:5 or 1:1) */}
            {config.isCarousel && ((config.mainKvAspectRatio || '4:5') === '4:5' || config.mainKvAspectRatio === '1:1') && (
              <div className="pt-2 border-t border-slate-200/80 space-y-3">
                {/* Auto Slide Toggle */}
                <div className="flex items-center justify-between p-2.5 bg-slate-100/90 rounded-lg border border-slate-200/80">
                  <div>
                    <span className="font-semibold text-slate-800 text-[11px] block">Auto Slide Carousel</span>
                    <span className="text-[10px] text-slate-500">Automatically transitions slides every 3.5s</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={config.carouselAutoSlide !== false}
                    onChange={(e) => onChange({ carouselAutoSlide: e.target.checked })}
                    className="w-4 h-4 accent-[#00C838] cursor-pointer rounded"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5 text-[#00C838]" />
                    Carousel Cards ({config.carouselImages?.length || 2}):
                  </span>
                  <span className="text-[10px] text-slate-400 font-normal">
                    Swipeable Instagram Cards
                  </span>
                </div>

                <div className="space-y-2">
                  {(config.carouselImages || [
                    { dataUrl: config.mainKvDataUrl, filename: config.mainKvFilename || 'slide1.jpg' },
                    { dataUrl: config.mainKvDataUrl, filename: 'slide2.jpg' },
                  ]).map((slide, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200 shadow-2xs">
                      <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 font-bold text-[10px] flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <img
                        src={slide.dataUrl}
                        alt={`Card ${idx + 1}`}
                        className="w-10 h-10 rounded object-cover border border-slate-300 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-semibold text-slate-700 truncate">Card {idx + 1}</p>
                        <p className="text-[9px] text-slate-400 font-mono truncate">{slide.filename}</p>
                      </div>

                      {/* Reorder Up/Down Buttons */}
                      <div className="flex flex-col gap-0.5 shrink-0">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => handleMoveCarouselSlide(idx, 'up')}
                          className="p-0.5 text-slate-500 hover:text-slate-800 disabled:opacity-20 hover:bg-slate-200 rounded cursor-pointer transition disabled:cursor-not-allowed"
                          title="Move Card Up"
                        >
                          <ChevronUp className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === (config.carouselImages?.length || 2) - 1}
                          onClick={() => handleMoveCarouselSlide(idx, 'down')}
                          className="p-0.5 text-slate-500 hover:text-slate-800 disabled:opacity-20 hover:bg-slate-200 rounded cursor-pointer transition disabled:cursor-not-allowed"
                          title="Move Card Down"
                        >
                          <ChevronDown className="w-3 h-3" />
                        </button>
                      </div>

                      <label className="p-1 text-slate-600 hover:text-[#00C838] hover:bg-white rounded cursor-pointer transition shrink-0" title="Upload / Replace Image">
                        <Upload className="w-3.5 h-3.5" />
                        <input
                          type="file"
                          accept="image/png, image/jpeg, image/jpg, image/webp"
                          onChange={(e) => handleCarouselSlideUpload(idx, e)}
                          className="hidden"
                        />
                      </label>
                      {(config.carouselImages?.length || 2) > 2 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveCarouselSlide(idx)}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition shrink-0 cursor-pointer"
                          title="Remove Card"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Add Slide button placed below the last carousel card */}
                {(config.carouselImages?.length || 2) < 10 && (
                  <button
                    type="button"
                    onClick={handleAddCarouselSlide}
                    className="w-full py-2 px-3 border-2 border-dashed border-emerald-300 hover:border-[#00C838] bg-emerald-50/50 hover:bg-emerald-50 text-[#00C838] font-bold text-[11px] rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Slide (Card {(config.carouselImages?.length || 2) + 1})</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </section>

        {/* SECTION 2: HEADER PROFILE */}
        <section className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5 font-bold text-slate-800 text-xs uppercase tracking-wider">
            <User className="w-4 h-4 text-[#00C838]" />
            <span>2. Header Profile</span>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-semibold text-slate-700">Profile Name</label>
              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${config.profileName.length >= 25 ? 'bg-amber-100 text-amber-700 font-bold' : 'text-slate-500'}`}>
                {config.profileName.length} / 25 chars
              </span>
            </div>
            <input
              type="text"
              maxLength={25}
              value={config.profileName}
              onChange={(e) => {
                const cleaned = e.target.value
                  .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{2300}-\u{23FF}\u{2B50}\u{2B55}\u{203C}\u{2049}\u{2122}\u{2139}\u{2194}-\u{2199}\u{21A9}-\u{21AA}\u{2934}-\u{2935}\u{3030}\u{303D}\u{3297}\u{3299}]/gu, '')
                  .slice(0, 25);
                onChange({ profileName: cleaned });
              }}
              placeholder="e.g. brand"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00C838] focus:bg-white font-mono text-xs"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Max 25 characters & no emojis/icons.
            </p>
          </div>

          {/* Main Account Verified Badge Toggle */}
          <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/80 flex items-center justify-between">
            <div>
              <span className="font-semibold text-slate-800 block text-[11px]">Verified Badge</span>
              <span className="text-[10px] text-slate-500 font-normal">Blue checkmark on main profile</span>
            </div>
            <input
              type="checkbox"
              checked={config.isVerified !== false}
              onChange={(e) => onChange({ isVerified: e.target.checked })}
              className="w-4 h-4 accent-[#0095F6] cursor-pointer rounded"
            />
          </div>

          {/* Collab Post Toggle (2 Profiles) */}
          <div className="p-3.5 bg-indigo-50/60 rounded-xl border border-indigo-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-600" />
                <div>
                  <span className="font-semibold text-slate-800 block text-[11px]">Collab Post (2 Profiles)</span>
                  <span className="text-[10px] text-slate-500">Instagram-style co-authored post</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={!!config.isCollab}
                onChange={(e) => onChange({ isCollab: e.target.checked })}
                className="w-4 h-4 accent-indigo-600 cursor-pointer rounded"
              />
            </div>

            {config.isCollab && (
              <div className="pt-2.5 border-t border-indigo-200/70 space-y-3">
                {/* Collab Profile Pic Upload */}
                <div>
                  <label className="block font-semibold text-slate-800 text-[11px] mb-1.5 flex items-center justify-between">
                    <span>Collab Profile Picture</span>
                    <span className="text-[10px] text-slate-400 font-normal">2nd Account</span>
                  </label>
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-indigo-500 shrink-0 bg-white shadow-xs">
                      <img
                        src={config.collabProfilePicDataUrl || config.profilePicDataUrl}
                        alt="Collab Pic"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="flex items-center justify-center gap-1.5 w-full px-2.5 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg cursor-pointer text-slate-700 transition font-medium text-[11px] shadow-2xs">
                        <Upload className="w-3 h-3 text-indigo-600" />
                        <span>Upload Collab Photo</span>
                        <input type="file" accept="image/*" onChange={handleCollabProfilePicUpload} className="hidden" />
                      </label>
                      <p className="text-[9px] text-slate-500 mt-0.5 truncate font-mono">
                        {config.collabProfilePicFilename || 'collab-profile-pic.jpg'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Collab Profile Name */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-semibold text-slate-700 text-[11px]">Collab Account Name</label>
                    <span className={`text-[9px] font-mono px-1 rounded ${(config.collabProfileName || '').length >= 25 ? 'bg-amber-100 text-amber-700 font-bold' : 'text-slate-500'}`}>
                      {(config.collabProfileName || '').length} / 25
                    </span>
                  </div>
                  <input
                    type="text"
                    maxLength={25}
                    value={config.collabProfileName || ''}
                    onChange={(e) => {
                      const cleaned = e.target.value
                        .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{2300}-\u{23FF}\u{2B50}\u{2B55}\u{203C}\u{2049}\u{2122}\u{2139}\u{2194}-\u{2199}\u{21A9}-\u{21AA}\u{2934}-\u{2935}\u{3030}\u{303D}\u{3297}\u{3299}]/gu, '')
                        .slice(0, 25);
                      onChange({ collabProfileName: cleaned });
                    }}
                    placeholder="e.g. partner"
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-xs"
                  />
                </div>

                {/* Collab Verified Checkbox */}
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-700">Collab Verified Badge</span>
                  <input
                    type="checkbox"
                    checked={config.collabIsVerified !== false}
                    onChange={(e) => onChange({ collabIsVerified: e.target.checked })}
                    className="w-4 h-4 accent-indigo-600 cursor-pointer rounded"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/80 flex items-center justify-between">
            <div>
              <span className="font-semibold text-slate-800 block">Follow Button</span>
              <span className="text-[10px] text-slate-500 font-normal">Display Follow button in header</span>
            </div>
            <input
              type="checkbox"
              checked={config.showFollowButton}
              onChange={(e) => onChange({ showFollowButton: e.target.checked })}
              className="w-4 h-4 accent-[#00C838] cursor-pointer rounded"
            />
          </div>
        </section>

        {/* SECTION 3: CTA & LINK */}
        <section className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5 font-bold text-slate-800 text-xs uppercase tracking-wider">
            <Link className="w-4 h-4 text-[#00C838]" />
            <span>3. CTA & Landing Link</span>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              <span>Landing Page URL</span>
            </label>
            <input
              type="url"
              value={config.clickTagUrl}
              onChange={(e) => onChange({ clickTagUrl: e.target.value })}
              placeholder="https://leverategroup.asia/"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00C838] focus:bg-white font-mono"
            />
            <p className="text-[10px] text-slate-500 mt-1">
              Default landing page URL for all banner clicks.
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-semibold text-slate-700">CTA Button Text</label>
              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${config.ctaText.length >= 20 ? 'bg-amber-100 text-amber-700 font-bold' : 'text-slate-500'}`}>
                {config.ctaText.length} / 20 chars
              </span>
            </div>
            <input
              type="text"
              maxLength={20}
              value={config.ctaText}
              onChange={(e) => {
                // Strip emojis and icon symbols, limit to max 20 characters
                const cleaned = e.target.value
                  .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{2300}-\u{23FF}\u{2B50}\u{2B55}\u{203C}\u{2049}\u{2122}\u{2139}\u{2194}-\u{2199}\u{21A9}-\u{21AA}\u{2934}-\u{2935}\u{3030}\u{303D}\u{3297}\u{3299}]/gu, '')
                  .slice(0, 20);
                onChange({ ctaText: cleaned });
              }}
              placeholder="e.g. Shop now"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00C838] focus:bg-white text-xs"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Max 20 characters & no emojis/icons.
            </p>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-[#00C838]" /> CTA Button Color Choices
              </span>
            </label>

            {/* Quick Preset Buttons */}
            {(() => {
              const isInstagram = config.ctaBgColor === '#0095F6' || (config.ctaBgColor || '').includes('833ab4');
              const isTikTok = config.ctaBgColor === '#FF2C55' || config.ctaBgColor === '#ff2c55';
              const isCustom = !isInstagram && !isTikTok;

              return (
                <div>
                  <div className="grid grid-cols-3 gap-1.5 mb-2.5">
                    {/* Instagram Button */}
                    <button
                      type="button"
                      onClick={() => onChange({ ctaBgColor: '#0095F6' })}
                      className={`py-1.5 px-2 rounded-lg text-xs font-semibold border flex items-center justify-center gap-1.5 transition cursor-pointer ${
                        isInstagram
                          ? 'bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] text-white border-transparent shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <Instagram className="w-3.5 h-3.5" />
                      <span>Instagram</span>
                    </button>

                    {/* TikTok Button */}
                    <button
                      type="button"
                      onClick={() => onChange({ ctaBgColor: '#FF2C55' })}
                      className={`py-1.5 px-2 rounded-lg text-xs font-semibold border flex items-center justify-center gap-1.5 transition cursor-pointer ${
                        isTikTok
                          ? 'bg-[#FF2C55] text-white border-[#FF2C55] shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <TikTokIcon className="w-3.5 h-3.5" />
                      <span>TikTok</span>
                    </button>

                    {/* Custom Button */}
                    <button
                      type="button"
                      onClick={() => {
                        if (isInstagram || isTikTok) {
                          onChange({ ctaBgColor: '#00C838' });
                        }
                      }}
                      className={`py-1.5 px-2 rounded-lg text-xs font-semibold border flex items-center justify-center gap-1.5 transition cursor-pointer ${
                        isCustom
                          ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <Palette className="w-3.5 h-3.5 text-[#00C838]" />
                      <span>Custom</span>
                    </button>
                  </div>

                  {/* Instagram Sub-bar (Only IG Blue & IG Gradient, NO IG Pink & NO custom input) */}
                  {isInstagram && (
                    <div className="flex items-center gap-1.5 mb-2 bg-slate-50 p-1.5 rounded-lg border border-slate-200 flex-wrap">
                      <span className="text-[10px] font-semibold text-slate-500 pl-1">Varian Instagram:</span>
                      <button
                        type="button"
                        onClick={() => onChange({ ctaBgColor: '#0095F6' })}
                        className={`px-2.5 py-1 text-[10px] font-semibold rounded cursor-pointer ${
                          config.ctaBgColor === '#0095F6'
                            ? 'bg-[#0095F6] text-white shadow-2xs'
                            : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        IG Blue (#0095F6)
                      </button>
                      <button
                        type="button"
                        onClick={() => onChange({ ctaBgColor: 'linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)' })}
                        className={`px-2.5 py-1 text-[10px] font-semibold rounded cursor-pointer ${
                          (config.ctaBgColor || '').includes('833ab4')
                            ? 'bg-gradient-to-r from-[#833ab4] to-[#fcb045] text-white shadow-2xs'
                            : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        IG Gradient
                      </button>
                    </div>
                  )}

                  {/* Custom Color Field (Only shown when Custom preset is active) */}
                  {isCustom && (
                    <div className="space-y-1 bg-slate-50 p-2 rounded-lg border border-slate-200">
                      <span className="text-[10px] font-semibold text-slate-600 block">Color Code / Hex / Gradient:</span>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={config.ctaBgColor.startsWith('#') ? config.ctaBgColor : '#00C838'}
                          onChange={(e) => onChange({ ctaBgColor: e.target.value })}
                          className="w-8 h-8 rounded-md bg-white border border-slate-300 cursor-pointer p-0.5 shrink-0"
                          title="Pilih warna custom"
                        />
                        <input
                          type="text"
                          value={config.ctaBgColor}
                          onChange={(e) => onChange({ ctaBgColor: e.target.value })}
                          placeholder="e.g. #00C838, #123456, linear-gradient(...)"
                          className="flex-1 bg-white border border-slate-200 rounded-md px-2.5 py-1 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00C838] font-mono text-xs"
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">CTA Animation Style</label>
            <select
              value={config.animationStyle}
              onChange={(e) => onChange({ animationStyle: e.target.value as any })}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00C838] focus:bg-white cursor-pointer text-xs"
            >
              <option value="blink">Blink / Flash (Default)</option>
              <option value="none">Static (No Animation)</option>
            </select>
          </div>

          {/* Custom Landing Pages for Interactive Elements */}
          <div className="pt-3 border-t border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                <Link className="w-3.5 h-3.5 text-[#00C838]" />
                Customize Click Destinations
              </span>
              <span className="text-[10px] text-slate-400">Optional</span>
            </div>
            <p className="text-[10px] text-slate-500 leading-tight">
              Specify custom landing page URLs for specific interactive banner elements. If left empty, the default Landing Page URL will be used.
            </p>

            <div className="space-y-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 text-[11px]">
              <div>
                <label className="font-semibold text-slate-700 block mb-0.5">Profile Pic & Profile Name</label>
                <input
                  type="url"
                  value={config.profileClickUrl || ''}
                  onChange={(e) => onChange({ profileClickUrl: e.target.value })}
                  placeholder={config.clickTagUrl || 'https://...'}
                  className="w-full bg-white border border-slate-200 rounded-md px-2.5 py-1 text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#00C838] font-mono text-[10px]"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-0.5">Follow Button</label>
                <input
                  type="url"
                  value={config.followClickUrl || ''}
                  onChange={(e) => onChange({ followClickUrl: e.target.value })}
                  placeholder={config.clickTagUrl || 'https://...'}
                  className="w-full bg-white border border-slate-200 rounded-md px-2.5 py-1 text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#00C838] font-mono text-[10px]"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-0.5">CTA Button Bar</label>
                <input
                  type="url"
                  value={config.ctaClickUrl || ''}
                  onChange={(e) => onChange({ ctaClickUrl: e.target.value })}
                  placeholder={config.clickTagUrl || 'https://...'}
                  className="w-full bg-white border border-slate-200 rounded-md px-2.5 py-1 text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#00C838] font-mono text-[10px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200/60">
                <div>
                  <label className="font-semibold text-slate-700 block mb-0.5">Like Button</label>
                  <input
                    type="url"
                    value={config.likeClickUrl || ''}
                    onChange={(e) => onChange({ likeClickUrl: e.target.value })}
                    placeholder={config.clickTagUrl || 'https://...'}
                    className="w-full bg-white border border-slate-200 rounded-md px-2 py-1 text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#00C838] font-mono text-[10px]"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-0.5">Comment Button</label>
                  <input
                    type="url"
                    value={config.commentClickUrl || ''}
                    onChange={(e) => onChange({ commentClickUrl: e.target.value })}
                    placeholder={config.clickTagUrl || 'https://...'}
                    className="w-full bg-white border border-slate-200 rounded-md px-2 py-1 text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#00C838] font-mono text-[10px]"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-0.5">Repost Button</label>
                  <input
                    type="url"
                    value={config.repostClickUrl || ''}
                    onChange={(e) => onChange({ repostClickUrl: e.target.value })}
                    placeholder={config.clickTagUrl || 'https://...'}
                    className="w-full bg-white border border-slate-200 rounded-md px-2 py-1 text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#00C838] font-mono text-[10px]"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-0.5">Share Button</label>
                  <input
                    type="url"
                    value={config.shareClickUrl || ''}
                    onChange={(e) => onChange({ shareClickUrl: e.target.value })}
                    placeholder={config.clickTagUrl || 'https://...'}
                    className="w-full bg-white border border-slate-200 rounded-md px-2 py-1 text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#00C838] font-mono text-[10px]"
                  />
                </div>
              </div>

              {config.isCollab && (
                <div>
                  <label className="font-semibold text-indigo-700 block mb-0.5">Collab Profile Link</label>
                  <input
                    type="url"
                    value={config.collabProfileClickUrl || ''}
                    onChange={(e) => onChange({ collabProfileClickUrl: e.target.value })}
                    placeholder={config.clickTagUrl || 'https://...'}
                    className="w-full bg-white border border-indigo-200 rounded-md px-2.5 py-1 text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono text-[10px]"
                  />
                </div>
              )}

              <div>
                <label className="font-semibold text-slate-700 block mb-0.5">Save Button</label>
                <input
                  type="url"
                  value={config.saveClickUrl || ''}
                  onChange={(e) => onChange({ saveClickUrl: e.target.value })}
                  placeholder={config.clickTagUrl || 'https://...'}
                  className="w-full bg-white border border-slate-200 rounded-md px-2.5 py-1 text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#00C838] font-mono text-[10px]"
                />
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 4: SOCIAL INDICATOR */}
        <section className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-2 font-bold text-slate-800 text-xs uppercase tracking-wider">
              <Heart className="w-4 h-4 text-rose-500" />
              <span>4. Social Indicator</span>
            </div>
            <button
              onClick={handleRandomizeAll}
              type="button"
              className="flex items-center gap-1 px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 text-[10px] font-semibold rounded-md border border-rose-200 transition cursor-pointer active:scale-95"
              title="Generate balanced realistic metrics (Likes > Saves > Shares > Comments)"
            >
              <Dices className="w-3.5 h-3.5 text-rose-600" />
              <span>Randomize All</span>
            </button>
          </div>

          <p className="text-[11px] text-slate-500">
            Customize social proof metrics. Likes are automatically kept proportionally higher than comments, shares, and reposts for realistic organic engagement:
          </p>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50/80 p-2.5 rounded-xl border border-slate-200/80">
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-slate-700 flex items-center gap-1">
                  <Heart className="w-3.5 h-3.5 text-rose-500" /> Likes
                </label>
                <button
                  type="button"
                  onClick={handleRandomizeLikes}
                  className="p-1 text-slate-400 hover:text-rose-600 transition rounded hover:bg-slate-200/60 cursor-pointer"
                  title="Generate random high likes (4,500 - 48,000)"
                >
                  <RefreshCw className="w-3 h-3" />
                </button>
              </div>
              <input
                type="text"
                value={config.likesCount}
                onChange={(e) => onChange({ likesCount: e.target.value })}
                onBlur={(e) => onChange({ likesCount: formatSocialNumber(e.target.value) })}
                placeholder="e.g. 40,000 or 40K"
                className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-[#00C838]"
              />
            </div>

            <div className="bg-slate-50/80 p-2.5 rounded-xl border border-slate-200/80">
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-slate-700 flex items-center gap-1">
                  <MessageSquare className="w-3.5 h-3.5 text-[#00C838]" /> Comments
                </label>
                <button
                  type="button"
                  onClick={handleRandomizeComments}
                  className="p-1 text-slate-400 hover:text-[#00C838] transition rounded hover:bg-slate-200/60 cursor-pointer"
                  title="Generate proportional comments (~2% of likes)"
                >
                  <RefreshCw className="w-3 h-3" />
                </button>
              </div>
              <input
                type="text"
                value={config.commentsCount}
                onChange={(e) => onChange({ commentsCount: e.target.value })}
                onBlur={(e) => onChange({ commentsCount: formatSocialNumber(e.target.value) })}
                placeholder="e.g. 1,250"
                className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-[#00C838]"
              />
            </div>

            <div className="bg-slate-50/80 p-2.5 rounded-xl border border-slate-200/80">
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-slate-700 flex items-center gap-1">
                  <Share2 className="w-3.5 h-3.5 text-emerald-600" /> Shares
                </label>
                <button
                  type="button"
                  onClick={handleRandomizeShares}
                  className="p-1 text-slate-400 hover:text-emerald-600 transition rounded hover:bg-slate-200/60 cursor-pointer"
                  title="Generate proportional shares (~4% of likes)"
                >
                  <RefreshCw className="w-3 h-3" />
                </button>
              </div>
              <input
                type="text"
                value={config.shareCount}
                onChange={(e) => onChange({ shareCount: e.target.value })}
                onBlur={(e) => onChange({ shareCount: formatSocialNumber(e.target.value) })}
                placeholder="e.g. 1,009"
                className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-[#00C838]"
              />
            </div>

            <div className="bg-slate-50/80 p-2.5 rounded-xl border border-slate-200/80">
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-slate-700 flex items-center gap-1">
                  <Repeat className="w-3.5 h-3.5 text-amber-600" /> Reposts / Saves
                </label>
                <button
                  type="button"
                  onClick={handleRandomizeReposts}
                  className="p-1 text-slate-400 hover:text-amber-600 transition rounded hover:bg-slate-200/60 cursor-pointer"
                  title="Generate proportional reposts (~5% of likes)"
                >
                  <RefreshCw className="w-3 h-3" />
                </button>
              </div>
              <input
                type="text"
                value={config.repostCount}
                onChange={(e) => onChange({ repostCount: e.target.value })}
                onBlur={(e) => onChange({ repostCount: formatSocialNumber(e.target.value) })}
                placeholder="e.g. 950"
                className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-[#00C838]"
              />
            </div>
          </div>
        </section>

        {/* SECTION 5: CAPTION */}
        <section className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5 font-bold text-slate-800 text-xs uppercase tracking-wider">
            <MessageSquare className="w-4 h-4 text-[#00C838]" />
            <span>5. Post Caption</span>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-semibold text-slate-700">Post Caption Text</label>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded text-slate-500">
                {config.caption.length} chars
              </span>
            </div>
            <textarea
              value={config.caption}
              onChange={(e) => onChange({ caption: e.target.value })}
              placeholder="Type banner caption here..."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00C838] focus:bg-white leading-relaxed text-xs min-h-[100px]"
            />

            {/* Recommendation Note */}
            <div className="mt-2.5 p-3 bg-emerald-50/90 border border-emerald-200/80 rounded-xl flex items-start gap-2.5 text-[11px] text-emerald-950">
              <Info className="w-4 h-4 text-[#00C838] shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold text-emerald-950">Caption Recommendation:</p>
                <ul className="list-disc list-inside space-y-0.5 text-emerald-800 text-[10.5px]">
                  <li>
                    For <strong>IG Reels</strong> & <strong>TikTok FYP</strong> versions: Recommended to use <strong>2 lines</strong> of caption.
                  </li>
                  <li>
                    For <strong>IG Feed</strong> version (with 9:16 ratio): Recommended to use <strong>1 line</strong> of caption.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

      </div>

      {/* Export & Download Action Footer */}
      <div className="p-4 border-t border-slate-200 bg-slate-50 shrink-0 space-y-2">
        <button
          onClick={onDownloadZip}
          disabled={isDownloading}
          className="w-full bg-gradient-to-r from-[#00C838] to-emerald-600 hover:from-[#00b032] hover:to-emerald-700 text-white font-bold py-3 px-4 rounded-xl shadow-sm flex items-center justify-center gap-2 transition disabled:opacity-50 cursor-pointer active:scale-[0.98]"
        >
          <Download className="w-4 h-4" />
          <span>{isDownloading ? 'Building ZIP Package...' : 'Download .ZIP Package'}</span>
        </button>

        <button
          onClick={onOpenCodeModal}
          className="w-full bg-white hover:bg-slate-100 text-slate-700 font-semibold py-2 px-4 rounded-xl flex items-center justify-center gap-2 transition text-xs cursor-pointer border border-slate-300 shadow-sm"
        >
          <Code className="w-3.5 h-3.5 text-[#00C838]" />
          <span>Inspect Output HTML Code</span>
        </button>
      </div>
    </div>
  );
};
