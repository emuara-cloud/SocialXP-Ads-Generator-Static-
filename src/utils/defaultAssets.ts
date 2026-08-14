import { BannerConfig } from '../types';

// Default placeholder images generated via Canvas / SVG Data URLs

// Helper to safely convert SVG string with UTF-8 characters to Base64
function safeSvgToBase64(svg: string): string {
  const bytes = new TextEncoder().encode(svg);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return `data:image/svg+xml;base64,${btoa(binary)}`;
}

export const DEFAULT_PROFILE_PIC = (() => {
  // SVG Data URL for a clean, plain, clear user avatar silhouette
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
    <rect width="200" height="200" fill="#e2e8f0" />
    <circle cx="100" cy="75" r="38" fill="#64748b" />
    <path d="M 30 180 C 30 128, 170 128, 170 180 Z" fill="#64748b" />
  </svg>`;
  return safeSvgToBase64(svg);
})();

export const DEFAULT_MAIN_KV = (() => {
  // SVG Data URL for a clean, plain (polos) background canvas
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="750" viewBox="0 0 600 750">
    <rect width="600" height="750" fill="#2d3748" />
    <rect x="20" y="20" width="560" height="710" rx="16" fill="none" stroke="#4a5568" stroke-width="2" stroke-dasharray="8 8" opacity="0.4" />
    <!-- Subtle center image icon placeholder -->
    <g transform="translate(250, 325)" fill="#718096" opacity="0.5">
      <path d="M 20 0 L 80 0 C 90 0, 100 10, 100 20 L 100 80 C 100 90, 90 100, 80 100 L 20 100 C 10 100, 0 90, 0 80 L 0 20 C 0 10, 10 0, 20 0 Z" fill="none" stroke="#a0aec0" stroke-width="4"/>
      <circle cx="35" cy="35" r="12" fill="#a0aec0"/>
      <polygon points="15,80 40,50 60,70 75,55 90,80" fill="#a0aec0"/>
    </g>
  </svg>`;
  return safeSvgToBase64(svg);
})();

export const INITIAL_BANNER_CONFIG: BannerConfig = {
  profileName: 'brand',
  isVerified: true,
  followText: 'Follow',
  showFollowButton: true,
  ctaText: 'Shop now',
  ctaBgColor: '#00C838',
  ctaTextColor: '#ffffff',
  animationStyle: 'blink',
  clickTagUrl: 'https://leverategroup.asia/',
  profileClickUrl: '',
  followClickUrl: '',
  ctaClickUrl: '',
  likeClickUrl: '',
  commentClickUrl: '',
  repostClickUrl: '',
  shareClickUrl: '',
  saveClickUrl: '',
  likesCount: '1,350',
  commentsCount: '850',
  shareCount: '1,120',
  repostCount: '940',
  caption: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
  profilePicDataUrl: DEFAULT_PROFILE_PIC,
  profilePicFilename: 'profile-pic.jpg',
  mainKvDataUrl: DEFAULT_MAIN_KV,
  mainKvFilename: 'main-kv.jpg',
  mainKvAspectRatio: '4:5',
  mainKvMediaType: 'image',
  mainKvObjectFit: 'cover',
  layoutMode: 'reels',
};
