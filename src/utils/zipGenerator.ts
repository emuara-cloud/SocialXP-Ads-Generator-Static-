import JSZip from 'jszip';
import { BannerConfig } from '../types';

// Helper to convert base64 or DataURL to Uint8Array for JSZip
function dataURLtoUint8Array(dataUrl: string): { data: Uint8Array; extension: string } {
  let mimeType = 'image/jpeg';
  let base64String = '';

  if (dataUrl.startsWith('data:')) {
    const matches = dataUrl.match(/^data:([^;]+);base64,(.*)$/);
    if (matches && matches.length === 3) {
      mimeType = matches[1];
      base64String = matches[2];
    } else {
      // SVG or plain data URL
      const svgMatch = dataUrl.match(/^data:image\/svg\+xml;base64,(.*)$/);
      if (svgMatch) {
        mimeType = 'image/svg+xml';
        base64String = svgMatch[1];
      }
    }
  }

  // Determine file extension
  let extension = 'jpg';
  if (mimeType.includes('png')) extension = 'png';
  else if (mimeType.includes('mp4') || mimeType.includes('video')) extension = 'mp4';
  else if (mimeType.includes('gif')) extension = 'gif';
  else if (mimeType.includes('svg')) extension = 'svg';
  else if (mimeType.includes('webp')) extension = 'webp';

  if (!base64String) {
    // Fallback if dataUrl is plain text or raw SVG
    const encoder = new TextEncoder();
    return { data: encoder.encode(dataUrl), extension };
  }

  const binaryString = atob(base64String);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return { data: bytes, extension };
}

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

export function generateHtmlOutput(
  config: BannerConfig,
  profilePicAssetFilename: string,
  mainKvAssetFilename: string,
  carouselFilenames: string[] = [],
  collabPicAssetFilename: string = ''
): string {
  // Generate animation CSS based on chosen style
  let animationCss = '';
  let animationClass = '';

  if (config.animationStyle === 'blink') {
    animationCss = `
    @keyframes blink-cta {
      0% { opacity: 1; } 
      50% { opacity: 0.7; } 
      100% { opacity: 1; }
    }
    .animate-cta {
      animation: blink-cta 2s ease-in-out infinite;
    }`;
    animationClass = 'animate-cta';
  }

  const verifiedBadgeSvg = config.isVerified !== false ? `<svg aria-label="Verified" class="w-[13px] h-[13px] shrink-0 inline-block translate-y-[0.5px]" viewBox="-1 -1 42 42" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path fill="#0095F6" d="M20 0L24.3 2.8L29.3 1.5L31.9 5.8L37 7.2L37 12.3L40 16.3L37.5 20L40 23.7L37 27.7L37 32.8L31.9 34.2L29.3 38.5L24.3 37.2L20 40L15.7 37.2L10.7 38.5L8.1 34.2L3 32.8L3 27.7L0 23.7L2.5 20L0 16.3L3 12.3L3 7.2L8.1 5.8L10.7 1.5L15.7 2.8L20 0Z"/>
          <path fill="white" d="M18.3 26L11.5 19.3L13.6 17.2L18.3 21.8L27.6 12.5L29.7 14.6L18.3 26Z"/>
        </svg>` : '';

  const collabVerifiedBadgeSvg = config.collabIsVerified !== false ? `<svg aria-label="Verified" class="w-[13px] h-[13px] shrink-0 inline-block translate-y-[0.5px]" viewBox="-1 -1 42 42" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path fill="#0095F6" d="M20 0L24.3 2.8L29.3 1.5L31.9 5.8L37 7.2L37 12.3L40 16.3L37.5 20L40 23.7L37 27.7L37 32.8L31.9 34.2L29.3 38.5L24.3 37.2L20 40L15.7 37.2L10.7 38.5L8.1 34.2L3 32.8L3 27.7L0 23.7L2.5 20L0 16.3L3 12.3L3 7.2L8.1 5.8L10.7 1.5L15.7 2.8L20 0Z"/>
          <path fill="white" d="M18.3 26L11.5 19.3L13.6 17.2L18.3 21.8L27.6 12.5L29.7 14.6L18.3 26Z"/>
        </svg>` : '';

  const defaultUrl = escapeHtml(config.clickTagUrl || 'https://leverategroup.asia/');
  const profileUrl = escapeHtml(config.profileClickUrl || config.clickTagUrl || 'https://leverategroup.asia/');
  const followUrl = escapeHtml(config.followClickUrl || config.clickTagUrl || 'https://leverategroup.asia/');
  const ctaUrl = escapeHtml(config.ctaClickUrl || config.clickTagUrl || 'https://leverategroup.asia/');
  const likeUrl = escapeHtml(config.likeClickUrl || config.clickTagUrl || 'https://leverategroup.asia/');
  const commentUrl = escapeHtml(config.commentClickUrl || config.clickTagUrl || 'https://leverategroup.asia/');
  const repostUrl = escapeHtml(config.repostClickUrl || config.clickTagUrl || 'https://leverategroup.asia/');
  const shareUrl = escapeHtml(config.shareClickUrl || config.clickTagUrl || 'https://leverategroup.asia/');
  const saveUrl = escapeHtml(config.saveClickUrl || config.clickTagUrl || 'https://leverategroup.asia/');

  const is916Ratio = (config.mainKvAspectRatio || '4:5') === '9:16';
  const isTikTokMode = is916Ratio && config.layoutMode === 'tiktok';
  const isReelsMode = is916Ratio && (config.layoutMode === 'reels' || (!config.layoutMode && !isTikTokMode));
  const isVideo = config.mainKvMediaType === 'video' || mainKvAssetFilename.toLowerCase().endsWith('.mp4');
  const fitMode = config.mainKvObjectFit || 'cover';
  const fitClass = fitMode === 'contain' ? 'object-contain' : 'object-cover';

  const ctaTextClean = escapeHtml(
    (config.ctaText || 'Shop now')
      .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{2300}-\u{23FF}\u{2B50}\u{2B55}\u{203C}\u{2049}\u{2122}\u{2139}\u{2194}-\u{2199}\u{21A9}-\u{21AA}\u{2934}-\u{2935}\u{3030}\u{303D}\u{3297}\u{3299}]/gu, '')
      .slice(0, 20)
  );

  const cleanProfileName = escapeHtml(
    (config.profileName || 'username')
      .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{2300}-\u{23FF}\u{2B50}\u{2B55}\u{203C}\u{2049}\u{2122}\u{2139}\u{2194}-\u{2199}\u{21A9}-\u{21AA}\u{2934}-\u{2935}\u{3030}\u{303D}\u{3297}\u{3299}]/gu, '')
      .slice(0, 25)
  );

  const cleanCollabProfileName = escapeHtml(
    (config.collabProfileName || 'partner')
      .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{2300}-\u{23FF}\u{2B50}\u{2B55}\u{203C}\u{2049}\u{2122}\u{2139}\u{2194}-\u{2199}\u{21A9}-\u{21AA}\u{2934}-\u{2935}\u{3030}\u{303D}\u{3297}\u{3299}]/gu, '')
      .slice(0, 25)
  );

  const followBtnHtml = config.showFollowButton
    ? `<button onclick="openLanding(clickTagFollow, event)" class="ml-auto flex-shrink-0 px-2.5 py-0.5 text-[11px] font-semibold rounded-[6px] transition-colors ${
        is916Ratio
          ? 'text-white border border-white/60 bg-black/20'
          : 'text-black border border-gray-300 hover:bg-gray-50'
      }">
        Follow
      </button>`
    : '';

  // Generate Inner Body Content based on Layout Mode
  let bannerBodyInnerHtml = '';
  let carouselScript = '';

  if (isTikTokMode) {
    const tiktokVerifiedBadge = config.isVerified !== false ? `<svg aria-label="Verified" class="w-[14px] h-[14px] shrink-0 fill-[#20d5ec]" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>` : '';

    bannerBodyInnerHtml = `
  <!-- Area Utama Banner 300x600 (TikTok FYP Format) -->
  <div class="relative w-[300px] h-[600px] flex items-center justify-center cursor-pointer overflow-hidden bg-transparent select-none" onclick="openLanding(clickTag, event)">

    <!-- Video/Image Card Wrapper (300x533 = 9:16 ratio) -->
    <div class="relative w-[300px] h-[533px] rounded-[12px] overflow-hidden bg-black flex items-center justify-center">
      <!-- Background Media -->
      ${
        isVideo
          ? `<video src="${mainKvAssetFilename}" autoplay loop muted playsinline class="w-full h-full object-cover"></video>`
          : `<img src="${mainKvAssetFilename}" alt="Main Promo" class="w-full h-full object-cover">`
      }

      <!-- Dark Gradient Overlays for contrast -->
      <div class="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-black/70 to-transparent pointer-events-none z-10"></div>
      <div class="absolute bottom-0 left-0 right-0 h-60 bg-gradient-to-t from-black/90 via-black/50 to-transparent pointer-events-none z-10"></div>

      <!-- Right Side Vertical Action Stack (TikTok FYP) -->
      <div class="absolute right-2.5 bottom-2.5 z-20 flex flex-col items-center gap-3 text-white">
        <!-- 1. Profile Avatar + Red Plus Badge -->
        <div class="w-10 flex flex-col items-center justify-center">
          <div onclick="openLanding(clickTagProfile, event)" class="relative cursor-pointer mb-0.5">
            ${
              config.isCollab
                ? `<div class="relative w-[40px] h-[40px]">
                    <img src="${collabPicAssetFilename || profilePicAssetFilename}" alt="Collab Profile" class="w-[24px] h-[24px] rounded-full object-cover border border-white/80 shadow-md absolute top-0 right-0">
                    <img src="${profilePicAssetFilename}" alt="Profile" class="w-[24px] h-[24px] rounded-full object-cover ring-2 ring-black shadow-md absolute bottom-0 left-0 z-10">
                  </div>`
                : `<img src="${profilePicAssetFilename}" alt="Profile" class="w-[38px] h-[38px] rounded-full object-cover border border-white/90 shadow-md">`
            }
            ${
              config.showFollowButton
                ? `<div onclick="openLanding(clickTagFollow, event)" class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#ff2c55] text-white rounded-full flex items-center justify-center shadow-md border border-white cursor-pointer z-20"><svg class="w-2.5 h-2.5 text-white stroke-[3]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/></svg></div>`
                : ''
            }
          </div>
        </div>

        <!-- 2. TikTok Heart (Like) -->
        <div onclick="openLanding(clickTagLike, event)" class="w-10 flex flex-col items-center justify-center cursor-pointer text-center">
          <div class="w-7 h-7 flex items-center justify-center">
            <svg class="w-6 h-6 text-white drop-shadow-md fill-white" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          </div>
          <span class="text-[9.5px] font-semibold text-white drop-shadow-sm tracking-tight text-center leading-none mt-0.5 w-full block">${escapeHtml(config.likesCount || '538')}</span>
        </div>

        <!-- 3. TikTok Comment Bubble -->
        <div onclick="openLanding(clickTagComment, event)" class="w-10 flex flex-col items-center justify-center cursor-pointer text-center">
          <div class="w-7 h-7 flex items-center justify-center">
            <svg class="w-6 h-6 text-white drop-shadow-md fill-white" viewBox="0 0 24 24">
              <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
            </svg>
          </div>
          <span class="text-[9.5px] font-semibold text-white drop-shadow-sm tracking-tight text-center leading-none mt-0.5 w-full block">${escapeHtml(config.commentsCount || '277')}</span>
        </div>

        <!-- 4. TikTok Save / Bookmark Ribbon -->
        <div onclick="openLanding(clickTagSave, event)" class="w-10 flex flex-col items-center justify-center cursor-pointer text-center">
          <div class="w-7 h-7 flex items-center justify-center">
            <svg class="w-6 h-6 text-white drop-shadow-md fill-white" viewBox="0 0 24 24">
              <path d="M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2z"/>
            </svg>
          </div>
          <span class="text-[9.5px] font-semibold text-white drop-shadow-sm tracking-tight text-center leading-none mt-0.5 w-full block">${escapeHtml(config.repostCount || '120')}</span>
        </div>

        <!-- 5. TikTok Share Arrow -->
        <div onclick="openLanding(clickTagShare, event)" class="w-10 flex flex-col items-center justify-center cursor-pointer text-center">
          <div class="w-7 h-7 flex items-center justify-center">
            <svg class="w-6 h-6 text-white drop-shadow-md fill-white" viewBox="0 0 24 24">
              <path d="M13.5 8.5V5L20 11.5L13.5 18V14.5C8.5 14.5 5 16 3 19.5C4 14.5 7 9.5 13.5 8.5Z"/>
            </svg>
          </div>
          <span class="text-[9.5px] font-semibold text-white drop-shadow-sm tracking-tight text-center leading-none mt-0.5 w-full block">${escapeHtml(config.shareCount || '188')}</span>
        </div>

        <!-- 6. TikTok Spinning Vinyl Disc / Turntable Sound Icon -->
        <div class="w-10 flex items-center justify-center">
          <div class="w-[32px] h-[32px] rounded-full bg-[#121212] border border-neutral-700/80 shadow-md flex items-center justify-center relative overflow-hidden animate-[spin_3s_linear_infinite] mt-0.5 cursor-pointer">
            <div class="absolute inset-1 rounded-full border border-white/10 pointer-events-none"></div>
            <div class="absolute inset-2 rounded-full border border-white/5 pointer-events-none"></div>
            <div class="w-[14px] h-[14px] rounded-full bg-[#ff2c55] border border-black/40 flex items-center justify-center z-10 shadow-xs">
              <svg class="w-2.5 h-2.5 text-white fill-current" viewBox="0 0 24 24">
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom Left Profile & Caption Section -->
      <div class="absolute left-2.5 right-14 bottom-2.5 z-20 flex flex-col gap-1 text-white">
        <!-- Profile Row -->
        <div onclick="openLanding(clickTagProfile, event)" class="flex items-center gap-1 cursor-pointer max-w-full overflow-hidden">
          ${
            config.isCollab
              ? `<div class="flex flex-col justify-center min-w-0 leading-tight">
                  <div class="flex items-center gap-1 min-w-0">
                    <span class="font-sans text-[12px] font-bold text-white tracking-tight drop-shadow-md truncate max-w-[145px]">${cleanProfileName}</span>
                    ${config.isVerified !== false ? `<svg aria-label="Verified" class="w-[12px] h-[12px] shrink-0 fill-[#20d5ec]" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>` : ''}
                    <span class="text-[10.5px] text-white/80 font-normal">and</span>
                  </div>
                  <div class="flex items-center gap-1 min-w-0">
                    <span class="font-sans text-[12px] font-bold text-white tracking-tight drop-shadow-md truncate max-w-[145px]">${cleanCollabProfileName}</span>
                    ${config.collabIsVerified !== false ? `<svg aria-label="Verified" class="w-[12px] h-[12px] shrink-0 fill-[#20d5ec]" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>` : ''}
                  </div>
                </div>`
              : `<span class="font-sans text-[13px] font-bold text-white tracking-tight drop-shadow-md leading-tight truncate shrink-0 max-w-[165px]">
                  ${cleanProfileName}
                </span>
                ${tiktokVerifiedBadge}`
          }
        </div>

        <!-- Caption -->
        <div class="pr-1 max-h-[42px] overflow-hidden">
          <p class="text-[11px] leading-[14px] text-white/95 font-normal caption-custom drop-shadow-md m-0 p-0">${escapeHtml((config.caption || '').trim())}</p>
        </div>

        <!-- TikTok Slim CTA Button -->
        <div onclick="openLanding(clickTagCta, event)" class="w-full h-7 rounded-[8px] flex items-center justify-center px-3 z-20 shadow-lg ${animationClass} mt-0.5" style="background-color: ${config.ctaBgColor || '#ff2c55'}; color: ${config.ctaTextColor || '#ffffff'};">
          <span class="font-sans text-[12px] font-bold tracking-tight text-center truncate">${ctaTextClean}</span>
        </div>
      </div>
    </div>

  </div>`;
  } else if (isReelsMode) {
    bannerBodyInnerHtml = `
  <!-- Area Utama Banner 300x600 (IG Reels Format) -->
  <div class="relative w-[300px] h-[600px] flex items-center justify-center cursor-pointer overflow-hidden bg-transparent select-none" onclick="openLanding(clickTag, event)">

    <!-- Video/Image Card Wrapper (300x533 = 9:16 ratio) -->
    <div class="relative w-[300px] h-[533px] rounded-[12px] overflow-hidden bg-black flex items-center justify-center">
      <!-- Background Media (No stroke/outline, fills frame) -->
      ${
        isVideo
          ? `<video src="${mainKvAssetFilename}" autoplay loop muted playsinline class="w-full h-full object-cover"></video>`
          : `<img src="${mainKvAssetFilename}" alt="Main Promo" class="w-full h-full object-cover">`
      }

      <!-- Dark Gradient Overlays for contrast -->
      <div class="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-black/75 via-black/30 to-transparent pointer-events-none z-10"></div>
      <div class="absolute bottom-0 left-0 right-0 h-56 bg-gradient-to-t from-black/90 via-black/60 to-transparent pointer-events-none z-10"></div>

      <!-- Right Side Vertical Action Stack -->
      <div class="absolute right-2.5 bottom-2.5 z-20 flex flex-col items-center gap-2.5 text-white">
        <!-- Like -->
        <div onclick="openLanding(clickTagLike, event)" class="flex flex-col items-center cursor-pointer">
          <div class="p-1">
            <svg aria-label="Like" class="w-5.5 h-5.5 text-white drop-shadow-md" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path d="M16.792 3.904A4.989 4.989 0 0 1 21.5 9.122c0 3.072-2.652 4.959-5.197 7.222-2.512 2.243-3.865 3.469-4.303 3.752-.477-.265-2.143-1.821-4.303-3.752C5.141 14.072 2.5 12.167 2.5 9.122a4.989 4.989 0 0 1 4.708-5.218 4.21 4.21 0 0 1 3.675 1.941c.84 1.174 2.381 1.174 3.234 0a4.203 4.203 0 0 1 3.675-1.941z"></path>
            </svg>
          </div>
          <span class="text-[9.5px] font-semibold text-white drop-shadow-sm tracking-tight">${escapeHtml(config.likesCount || '1,777')}</span>
        </div>

        <!-- Comment -->
        <div onclick="openLanding(clickTagComment, event)" class="flex flex-col items-center cursor-pointer">
          <div class="p-1">
            <svg aria-label="Comment" class="w-5.5 h-5.5 text-white drop-shadow-md" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" viewBox="0 0 24 24">
              <path d="M20.656 17.008a9.993 9.993 0 1 0-3.59 3.615L22 22Z"></path>
            </svg>
          </div>
          <span class="text-[9.5px] font-semibold text-white drop-shadow-sm tracking-tight">${escapeHtml(config.commentsCount || '885')}</span>
        </div>

        <!-- Share -->
        <div onclick="openLanding(clickTagShare, event)" class="flex flex-col items-center cursor-pointer">
          <div class="p-1">
            <svg aria-label="Share" class="w-5.5 h-5.5 text-white drop-shadow-md" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" viewBox="0 0 24 24">
              <line x1="22" y1="3" x2="9.218" y2="10.083"></line>
              <polygon points="11.698 20.334 22 3.001 2 3.001 9.218 10.084 11.698 20.334"></polygon>
            </svg>
          </div>
          <span class="text-[9.5px] font-semibold text-white drop-shadow-sm tracking-tight">${escapeHtml(config.shareCount || config.repostCount || '433')}</span>
        </div>

        <!-- 3 Dots Menu -->
        <div class="flex flex-col items-center cursor-pointer opacity-80">
          <div class="p-1">
            <svg class="w-4.5 h-4.5 text-white drop-shadow-md" fill="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="5" r="2"/>
              <circle cx="12" cy="12" r="2"/>
              <circle cx="12" cy="19" r="2"/>
            </svg>
          </div>
        </div>
      </div>

      <!-- Bottom Left Profile & Caption Info Section -->
      <div class="absolute left-2.5 right-16 bottom-12 z-20 flex flex-col gap-1.5 text-white">
        <!-- Profile Row -->
        <div onclick="openLanding(clickTagProfile, event)" class="flex items-center gap-1.5 flex-wrap cursor-pointer">
          <div class="relative shrink-0 w-[32px] h-[32px] flex items-center justify-center">
            <svg class="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 38 38" fill="none">
              <defs>
                <linearGradient id="instaStoryGradZipReels" x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%" stop-color="#FCAF45"/>
                  <stop offset="50%" stop-color="#FD1D1D"/>
                  <stop offset="100%" stop-color="#C13584"/>
                </linearGradient>
              </defs>
              <circle cx="19" cy="19" r="17.5" stroke="url(#instaStoryGradZipReels)" stroke-width="2" fill="none"/>
            </svg>
            <img src="${profilePicAssetFilename}" alt="Profile" class="w-[25px] h-[25px] rounded-full object-cover relative z-10 block">
          </div>

          <span class="font-sans text-[12.5px] font-bold text-white tracking-tight truncate drop-shadow-md">
            ${escapeHtml(
              (config.profileName || 'username')
                .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{2300}-\u{23FF}\u{2B50}\u{2B55}\u{203C}\u{2049}\u{2122}\u{2139}\u{2194}-\u{2199}\u{21A9}-\u{21AA}\u{2934}-\u{2935}\u{3030}\u{303D}\u{3297}\u{3299}]/gu, '')
                .slice(0, 25)
            )}
          </span>

          ${verifiedBadgeSvg}

          ${
            config.showFollowButton
              ? `<button onclick="openLanding(clickTagFollow, event)" class="ml-1 px-2.5 py-0.5 text-[10.5px] font-semibold text-white border border-white/80 bg-black/30 rounded-lg transition-all backdrop-blur-xs">Follow</button>`
              : ''
          }
        </div>

        <!-- Caption -->
        <div class="pr-2 max-h-[44px] overflow-hidden">
          <p class="text-[11px] leading-[14.5px] text-white/95 font-normal caption-custom drop-shadow-md m-0 p-0">${escapeHtml((config.caption || '').trim())}</p>
        </div>
      </div>

      <!-- Bottom CTA Bar (Slimmer h-8) -->
      <div onclick="openLanding(clickTagCta, event)" class="absolute bottom-2.5 left-2.5 right-16 h-8 rounded-[6px] flex items-center justify-between px-3 z-20 shadow-md ${animationClass}" style="background-color: ${config.ctaBgColor || '#0ea5e9'}; color: ${config.ctaTextColor || '#ffffff'};">
        <span class="font-['Instagram_Sans',-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,Helvetica,Arial,sans-serif] text-[12px] font-semibold tracking-tight truncate">${ctaTextClean}</span>
        <svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"></path>
        </svg>
      </div>
    </div>

  </div>`;
  } else {
    // Standard Feed Layout
    const ratio = config.mainKvAspectRatio || '4:5';
    let heightClass = 'h-[375px]';
    if (ratio === '1:1') heightClass = 'h-[300px]';
    if (ratio === '16:9') heightClass = 'h-[169px]';
    if (is916Ratio) heightClass = 'h-[533px]';

    const ctaOverlayBg = hexToRgba(config.ctaBgColor || '#0ea5e9', 0.85);

    const isCarouselExport = config.isCarousel && (ratio === '4:5' || ratio === '1:1') && carouselFilenames.length > 0;

    let mediaHtml = '';

    if (isCarouselExport) {
      const slideImgs = carouselFilenames.map((fn, i) => `
        <div class="w-full h-full shrink-0 flex items-center justify-center">
          <img src="${fn}" alt="Slide ${i + 1}" class="w-full h-full ${fitClass} select-none pointer-events-none">
        </div>
      `).join('');

      const dots = carouselFilenames.map((_, i) => `
        <button id="carousel-dot-${i}" onclick="goToSlide(${i}, event)" class="h-1.5 rounded-full transition-all duration-300 cursor-pointer" style="width: ${i === 0 ? '14px' : '6px'}; background-color: rgba(255,255,255,${i === 0 ? '1' : '0.5'}); border: none; padding: 0;"></button>
      `).join('');

      mediaHtml = `
        <div id="carousel-container" class="relative w-full h-full flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing select-none">
          <div id="carousel-track" class="flex w-full h-full transition-transform duration-300 ease-[cubic-bezier(0.25,1,0.5,1)]" style="transform: translateX(0%);">
            ${slideImgs}
          </div>

          <!-- Subtle Nav Arrows -->
          <button id="carousel-btn-prev" onclick="prevSlide(event)" class="absolute left-1 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-black/25 hover:bg-black/60 text-white/80 hover:text-white flex items-center justify-center transition z-20 shadow-2xs cursor-pointer border-none opacity-40 hover:opacity-100" style="display: none;">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/></svg>
          </button>
          <button id="carousel-btn-next" onclick="nextSlide(event)" class="absolute right-1 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-black/25 hover:bg-black/60 text-white/80 hover:text-white flex items-center justify-center transition z-20 shadow-2xs cursor-pointer border-none opacity-40 hover:opacity-100">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg>
          </button>

          <!-- Instagram-style Dots Pagination -->
          <div class="absolute bottom-2 left-0 right-0 flex items-center justify-center gap-1 z-20">
            ${dots}
          </div>
        </div>
      `;

      carouselScript = `
  <script>
    var activeSlide = 0;
    var totalSlides = ${carouselFilenames.length};
    function updateSlide(index) {
      activeSlide = Math.max(0, Math.min(index, totalSlides - 1));
      var track = document.getElementById('carousel-track');
      if (track) {
        track.style.transform = 'translateX(-' + (activeSlide * 100) + '%)';
      }
      for (var i = 0; i < totalSlides; i++) {
        var dot = document.getElementById('carousel-dot-' + i);
        if (dot) {
          dot.style.width = (i === activeSlide) ? '14px' : '6px';
          dot.style.backgroundColor = (i === activeSlide) ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,0.5)';
        }
      }
      var btnPrev = document.getElementById('carousel-btn-prev');
      var btnNext = document.getElementById('carousel-btn-next');
      if (btnPrev) btnPrev.style.display = (activeSlide > 0) ? 'flex' : 'none';
      if (btnNext) btnNext.style.display = (activeSlide < totalSlides - 1) ? 'flex' : 'none';
    }
    function nextSlide(e) {
      if (e) e.stopPropagation();
      updateSlide(activeSlide + 1);
    }
    function prevSlide(e) {
      if (e) e.stopPropagation();
      updateSlide(activeSlide - 1);
    }
    function goToSlide(index, e) {
      if (e) e.stopPropagation();
      updateSlide(index);
    }

    // Touch & Drag Swipe Gesture Handling
    var touchStartX = 0;
    var carouselElem = document.getElementById('carousel-container');
    if (carouselElem) {
      carouselElem.addEventListener('touchstart', function(e) {
        touchStartX = e.changedTouches[0].screenX;
      }, { passive: true });
      carouselElem.addEventListener('touchend', function(e) {
        var diff = touchStartX - e.changedTouches[0].screenX;
        if (Math.abs(diff) > 25) {
          if (diff > 0) nextSlide();
          else prevSlide();
        }
      }, { passive: true });

      carouselElem.addEventListener('mousedown', function(e) {
        touchStartX = e.clientX;
      });
      carouselElem.addEventListener('mouseup', function(e) {
        var diff = touchStartX - e.clientX;
        if (Math.abs(diff) > 25) {
          if (diff > 0) nextSlide();
          else prevSlide();
        }
      });
    }

    ${config.carouselAutoSlide ? `
    // Auto slide timer
    var autoSlideTimer = setInterval(function() {
      if (activeSlide >= totalSlides - 1) {
        updateSlide(0);
      } else {
        updateSlide(activeSlide + 1);
      }
    }, ${(config.carouselAutoSlideInterval || 3.5) * 1000});
    ` : ''}
  </script>`;
    } else {
      mediaHtml = isVideo
        ? `<video src="${mainKvAssetFilename}" autoplay loop muted playsinline class="w-full h-full ${fitClass}"></video>`
        : `<img src="${mainKvAssetFilename}" alt="Main Promo" class="w-full h-full ${fitClass}">`;
    }

    const ctaOverlayHtml = is916Ratio
      ? `<div onclick="openLanding(clickTagCta, event)" class="absolute bottom-0 left-0 right-0 h-8 flex items-center justify-between px-4 z-10 backdrop-blur-[2px] ${animationClass}" style="background-color: ${ctaOverlayBg}; color: ${config.ctaTextColor || '#ffffff'};">
          <span class="font-['Instagram_Sans',-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,Helvetica,Arial,sans-serif] text-[13px] font-semibold tracking-tight truncate">${ctaTextClean}</span>
          <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"></path>
          </svg>
        </div>`
      : '';

    const standardCtaBarHtml = !is916Ratio
      ? `<div onclick="openLanding(clickTagCta, event)" class="w-full h-8 flex items-center justify-between px-4 shrink-0 ${animationClass}" style="background-color: ${config.ctaBgColor || '#0ea5e9'}; color: ${config.ctaTextColor || '#ffffff'};">
          <span class="font-['Instagram_Sans',-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,Helvetica,Arial,sans-serif] text-[13px] font-semibold tracking-tight truncate">${ctaTextClean}</span>
          <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"></path>
          </svg>
        </div>`
      : '';

    bannerBodyInnerHtml = `
  <!-- Area Utama Banner 300x600 (Standard IG Feed Format) -->
  <div class="relative w-[300px] h-[600px] border border-gray-200 rounded-[12px] flex flex-col cursor-pointer overflow-hidden bg-white shadow-sm select-none" onclick="openLanding(clickTag, event)">
    
    <!-- === HEADER === -->
    <div onclick="openLanding(clickTagProfile, event)" class="flex items-center px-3 py-2 shrink-0 transition-all ${
      is916Ratio
        ? 'absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/80 via-black/30 to-transparent text-white'
        : 'bg-white text-black border-b border-gray-100'
    }">
      ${
        config.isCollab
          ? `<div class="relative shrink-0 w-[42px] h-[42px]">
              <img src="${collabPicAssetFilename || profilePicAssetFilename}" alt="Collab Profile" class="w-[26px] h-[26px] rounded-full object-cover border border-white shadow-xs absolute top-0 right-0">
              <img src="${profilePicAssetFilename}" alt="Profile" class="w-[26px] h-[26px] rounded-full object-cover ring-2 ${is916Ratio ? 'ring-black' : 'ring-white'} shadow-xs absolute bottom-0 left-0 z-10">
            </div>
            <div class="ml-2 flex flex-col justify-center flex-1 min-w-0 mr-1 leading-tight">
              <div class="flex items-center gap-1 min-w-0">
                <span class="font-sans text-[12px] font-bold tracking-tight truncate ${is916Ratio ? 'text-white' : 'text-black'}">${cleanProfileName}</span>
                ${config.isVerified !== false ? verifiedBadgeSvg : ''}
                <span class="text-[11px] font-normal ${is916Ratio ? 'text-white/80' : 'text-slate-500'}">and</span>
              </div>
              <div class="flex items-center gap-1 min-w-0">
                <span class="font-sans text-[12px] font-bold tracking-tight truncate ${is916Ratio ? 'text-white' : 'text-black'}">${cleanCollabProfileName}</span>
                ${config.collabIsVerified !== false ? collabVerifiedBadgeSvg : ''}
              </div>
            </div>`
          : `<div class="relative shrink-0 w-[38px] h-[38px] flex items-center justify-center">
              <svg class="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 38 38" fill="none">
                <defs>
                  <linearGradient id="instaStoryGradZip" x1="0%" y1="100%" x2="100%" y2="0%">
                    <stop offset="0%" stop-color="#FCAF45"/>
                    <stop offset="50%" stop-color="#FD1D1D"/>
                    <stop offset="100%" stop-color="#C13584"/>
                  </linearGradient>
                </defs>
                <circle cx="19" cy="19" r="17.5" stroke="url(#instaStoryGradZip)" stroke-width="1.8" fill="none"/>
              </svg>
              <img src="${profilePicAssetFilename}" alt="Profile" class="w-[30px] h-[30px] rounded-full object-cover relative z-10 block">
            </div>
            
            <div class="ml-2 flex items-center flex-1 min-w-0 mr-1">
              <span class="font-sans text-[13.5px] font-semibold tracking-tight truncate ${
                is916Ratio ? 'text-white' : 'text-black'
              }">${cleanProfileName}</span>
              ${verifiedBadgeSvg}
            </div>`
      }

      ${followBtnHtml}
    </div>

    <!-- === GAMBAR / VIDEO UTAMA (Main KV) === -->
    <div class="w-full ${heightClass} ${fitMode === 'contain' ? 'bg-slate-900' : 'bg-transparent'} shrink-0 relative overflow-hidden flex items-center justify-center">
      ${mediaHtml}
      ${ctaOverlayHtml}
    </div>

    <!-- === CTA BUTTON BAR === -->
    ${standardCtaBarHtml}

    <!-- === ICONS BAR & ANGKA === -->
    <div class="flex items-center px-3 pt-1.5 pb-0 gap-2.5 shrink-0 text-black">
      <div onclick="openLanding(clickTagLike, event)" class="flex items-center gap-1">
        <svg aria-label="Like" class="w-[19px] h-[19px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
            <path d="M16.792 3.904A4.989 4.989 0 0 1 21.5 9.122c0 3.072-2.652 4.959-5.197 7.222-2.512 2.243-3.865 3.469-4.303 3.752-.477-.265-2.143-1.821-4.303-3.752C5.141 14.072 2.5 12.167 2.5 9.122a4.989 4.989 0 0 1 4.708-5.218 4.21 4.21 0 0 1 3.675 1.941c.84 1.174 2.381 1.174 3.234 0a4.203 4.203 0 0 1 3.675-1.941z"></path>
        </svg>
        <span class="text-[11px] font-semibold">${escapeHtml(config.likesCount)}</span>
      </div>

      <div onclick="openLanding(clickTagComment, event)" class="flex items-center gap-1">
        <svg aria-label="Comment" class="w-[19px] h-[19px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" stroke-linejoin="round">
            <path d="M20.656 17.008a9.993 9.993 0 1 0-3.59 3.615L22 22Z"></path>
        </svg>
        <span class="text-[11px] font-semibold">${escapeHtml(config.commentsCount)}</span>
      </div>

      <div onclick="openLanding(clickTagRepost, event)" class="flex items-center gap-1">
        <svg aria-label="Repost" class="w-[17px] h-[17px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 12V7a2 2 0 0 1 2-2h12m0 0l-3-3m3 3l-3 3M20 12v5a2 2 0 0 1-2 2H6m0 0l3 3m-3-3l3-3"></path>
        </svg>
        <span class="text-[11px] font-semibold">${escapeHtml(config.repostCount)}</span>
      </div>

      <div onclick="openLanding(clickTagShare, event)" class="flex items-center">
        <svg aria-label="Share Post" class="w-[19px] h-[19px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" stroke-linejoin="round">
            <line fill="none" stroke="currentColor" stroke-linejoin="round" stroke-width="2" x1="22" x2="9.218" y1="3" y2="10.083"></line>
            <polygon fill="none" points="11.698 20.334 22 3.001 2 3.001 9.218 10.084 11.698 20.334" stroke="currentColor" stroke-linejoin="round" stroke-width="2"></polygon>
        </svg>
      </div>

      <div onclick="openLanding(clickTagSave, event)" class="ml-auto flex-shrink-0">
        <svg aria-label="Save" class="w-[19px] h-[19px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
            <polygon points="20 21 12 13.44 4 21 4 3 20 3 20 21" stroke-linejoin="round"></polygon>
        </svg>
      </div>
    </div>

    <!-- === CAPTION === -->
    <div class="px-3 pt-0.5 pb-2.5 flex-grow flex flex-col justify-start overflow-hidden">
      <p class="text-[11px] leading-[15px] font-normal text-black caption-custom line-clamp-6 m-0 p-0">${escapeHtml((config.caption || '').trim())}</p>
    </div>

  </div>`;
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>DV360 Rich Media Banner (300x600)</title>
  
  <!-- Syarat Wajib DV360: Meta Ad Size -->
  <meta name="ad.size" content="width=300,height=600">

  <!-- Landing Page ClickTags untuk DV360 -->
  <script type="text/javascript">
    var clickTag = "${defaultUrl}";
    var clickTagProfile = "${profileUrl}";
    var clickTagFollow = "${followUrl}";
    var clickTagCta = "${ctaUrl}";
    var clickTagLike = "${likeUrl}";
    var clickTagComment = "${commentUrl}";
    var clickTagRepost = "${repostUrl}";
    var clickTagShare = "${shareUrl}";
    var clickTagSave = "${saveUrl}";

    function openLanding(targetUrl, evt) {
      if (evt && evt.stopPropagation) evt.stopPropagation();
      window.open(targetUrl || clickTag, '_blank');
    }
  </script>

  <!-- Memuat Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      margin: 0;
      padding: 0;
      overflow: hidden;
      user-select: none;
    }
    ::-webkit-scrollbar {
      display: none !important;
      width: 0 !important;
      height: 0 !important;
    }
    * {
      -ms-overflow-style: none !important;
      scrollbar-width: none !important;
    }
    ${animationCss}
    .caption-custom {
      white-space: pre-line;
      word-break: break-word;
    }
    .line-clamp-3 {
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .line-clamp-6 {
      display: -webkit-box;
      -webkit-line-clamp: 6;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  </style>
</head>

<body class="bg-transparent w-full h-screen flex items-center justify-center m-0">

${bannerBodyInnerHtml}

${carouselScript}
</body>
</html>`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export async function downloadBannerZip(config: BannerConfig): Promise<void> {
  const zip = new JSZip();

  // Extract Profile Pic Asset
  const profileAsset = dataURLtoUint8Array(config.profilePicDataUrl);
  const profilePicFilename = `profile-pic.${profileAsset.extension}`;

  // Extract Main KV Asset
  const mainKvAsset = dataURLtoUint8Array(config.mainKvDataUrl);
  const mainKvFilename = `main-kv.${mainKvAsset.extension}`;

  const carouselFilenames: string[] = [];
  const ratio = config.mainKvAspectRatio || '4:5';
  if (config.isCarousel && (ratio === '4:5' || ratio === '1:1') && config.carouselImages && config.carouselImages.length > 0) {
    config.carouselImages.forEach((imgObj, idx) => {
      const slideAsset = dataURLtoUint8Array(imgObj.dataUrl);
      const slideFn = `carousel-slide-${idx + 1}.${slideAsset.extension}`;
      carouselFilenames.push(slideFn);
      zip.file(slideFn, slideAsset.data);
    });
  }

  // Extract Collab Profile Pic Asset if enabled
  let collabPicFilename = '';
  if (config.isCollab && config.collabProfilePicDataUrl) {
    const collabAsset = dataURLtoUint8Array(config.collabProfilePicDataUrl);
    collabPicFilename = `collab-profile-pic.${collabAsset.extension}`;
    zip.file(collabPicFilename, collabAsset.data);
  }

  // Generate HTML content
  const htmlContent = generateHtmlOutput(config, profilePicFilename, mainKvFilename, carouselFilenames, collabPicFilename);

  // Add files to Zip package
  zip.file('index.html', htmlContent);
  zip.file(profilePicFilename, profileAsset.data);
  zip.file(mainKvFilename, mainKvAsset.data);

  // Generate blob & trigger browser download
  const blob = await zip.generateAsync({ type: 'blob' });
  const downloadUrl = URL.createObjectURL(blob);

  // Construct standard clean filename: socialxp-[profilename]-[layoutformat]-[aspectratio]-[ddmmyy]-[hhmm].zip
  const now = new Date();
  const dd = String(now.getDate()).padStart(2, '0');
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const yy = String(now.getFullYear()).slice(-2);
  const hour = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');
  const ddmmyy = `${dd}${mm}${yy}`;
  const hhmm = `${hour}${min}`;

  const safeProfileName = (config.profileName || 'username')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '') || 'username';

  let layoutFormat = 'igfeed';
  if (config.layoutMode === 'tiktok') {
    layoutFormat = 'tiktokfyp';
  } else if (config.layoutMode === 'reels') {
    layoutFormat = 'igreels';
  } else if (config.layoutMode === 'feed') {
    layoutFormat = 'igfeed';
  } else if (ratio === '9:16') {
    layoutFormat = 'igreels';
  }

  const safeRatio = ratio.replace(':', 'x');
  const zipFileName = `socialxp-${safeProfileName}-${layoutFormat}-${safeRatio}-${ddmmyy}-${hhmm}.zip`;

  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = zipFileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
}
