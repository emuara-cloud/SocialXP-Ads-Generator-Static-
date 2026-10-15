export interface BannerConfig {
  profileName: string;
  isVerified: boolean;
  followText: string;
  showFollowButton: boolean;
  ctaText: string;
  ctaBgColor: string;
  ctaTextColor: string;
  animationStyle: 'blink' | 'none';
  clickTagUrl: string;

  // Custom Landing Page URLs for interactive elements
  profileClickUrl?: string; // Profile pic and profile name
  followClickUrl?: string;  // Follow button
  ctaClickUrl?: string;     // CTA button
  likeClickUrl?: string;    // Like button
  commentClickUrl?: string; // Comment button
  repostClickUrl?: string;  // Repost button
  shareClickUrl?: string;   // Share button
  saveClickUrl?: string;    // Save button

  likesCount: string;
  commentsCount: string;
  shareCount: string;
  repostCount: string;
  caption: string;
  
  // Profile picture
  profilePicDataUrl: string; // Base64 or ObjectURL for display & zip export
  profilePicFilename: string; // e.g. "profile-pic.jpg"
  
  // Main KV image / video
  mainKvDataUrl: string; // Base64 or ObjectURL for display & zip export
  mainKvFilename: string; // e.g. "main-kv.jpg" or "main-kv.mp4"
  mainKvAspectRatio?: '4:5' | '1:1' | '16:9' | '9:16';
  mainKvMediaType?: 'image' | 'video';
  mainKvObjectFit?: 'cover' | 'contain';
  layoutMode?: 'feed' | 'reels' | 'tiktok';
  
  // Carousel options (available for 4:5 and 1:1)
  isCarousel?: boolean;
  carouselImages?: { dataUrl: string; filename: string }[];
  carouselAutoSlide?: boolean; // Auto slide transition toggle
  carouselAutoSlideInterval?: number; // Auto slide interval in seconds

  // Collab Post options (two profiles)
  isCollab?: boolean;
  collabProfileName?: string;
  collabIsVerified?: boolean;
  collabProfilePicDataUrl?: string;
  collabProfilePicFilename?: string;
  collabProfileClickUrl?: string;
}

export interface Preset {
  id: string;
  name: string;
  description: string;
  config: Partial<BannerConfig>;
}
