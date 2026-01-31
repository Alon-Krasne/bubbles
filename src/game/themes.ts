// Theme background image imports
import imagineImg from '../assets/themes/imagine.jpg';
import unicornImg from '../assets/themes/unicorn.jpg';
import dinosaurImg from '../assets/themes/dinosaur.jpg';
import blueworldImg from '../assets/themes/blue-world.png';
import offroadImg from '../assets/themes/4x4-cars.png';
import rainbowImg from '../assets/themes/rainbow-world.png';
import castleImg from '../assets/themes/castle.jpg';

import { WeatherConfig, ParticleBehavior, ParticleShape } from '../scenes/WeatherParticles';
import { WEATHER_PARTICLE_COUNT } from './config';

export interface ThemeDefinition {
  name: string;
  icon: string;
  hasImage: boolean;
  imagePath?: string;
  skyTop: number;
  skyMiddle: number;
  skyBottom: number;
  grassTop: number;
  grassMiddle: number;
  grassBottom: number;
  isDark: boolean;
  weather: WeatherConfig;
}

export const THEMES: Record<string, ThemeDefinition> = {
  classic: {
    name: 'קלאסי',
    icon: '☀️',
    hasImage: false,
    skyTop: 0x1e90ff,
    skyMiddle: 0x87ceeb,
    skyBottom: 0xe8f4ff,
    grassTop: 0x90ee90,
    grassMiddle: 0x7ec850,
    grassBottom: 0x5a9e3a,
    isDark: false,
    weather: {
      particleCount: WEATHER_PARTICLE_COUNT,
      colors: [0xffffff, 0xffd700, 0xffb6c1],
      sizeRange: [3, 6],
      behavior: 'float-up',
      speed: [0.3, 0.6],
      opacity: [0.4, 0.8],
      glow: true,
      shape: 'star',
      rotates: true,
    },
  },
  imagine: {
    name: 'ארץ דמיון',
    icon: '💎',
    hasImage: true,
    imagePath: imagineImg,
    skyTop: 0x1e90ff,
    skyMiddle: 0x87ceeb,
    skyBottom: 0xe8f4ff,
    grassTop: 0xa8e6cf,
    grassMiddle: 0x88d8b0,
    grassBottom: 0x6bc5a0,
    isDark: false,
    weather: {
      particleCount: WEATHER_PARTICLE_COUNT,
      colors: [0xff6b6b, 0xfeca57, 0x48dbfb, 0x1dd1a1, 0xff9ff3, 0x54a0ff],
      sizeRange: [4, 8],
      behavior: 'fall-down',
      speed: [0.4, 0.8],
      opacity: [0.5, 0.9],
      glow: false,
      shape: 'diamond',
      rotates: true,
    },
  },
  unicorn: {
    name: 'ארץ החד-קרן',
    icon: '🦄',
    hasImage: true,
    imagePath: unicornImg,
    skyTop: 0x1e90ff,
    skyMiddle: 0x87ceeb,
    skyBottom: 0xe8f4ff,
    grassTop: 0xf8bbd9,
    grassMiddle: 0xf48fb1,
    grassBottom: 0xec6a9c,
    isDark: false,
    weather: {
      particleCount: WEATHER_PARTICLE_COUNT,
      colors: [0xff69b4, 0x9370db, 0xffd700, 0xffffff],
      sizeRange: [3, 7],
      behavior: 'spiral',
      speed: [0.3, 0.5],
      opacity: [0.5, 0.9],
      glow: true,
      shape: ['star', 'heart'],
      rotates: true,
    },
  },
  dinosaur: {
    name: 'ארץ הדינוזאורים',
    icon: '🦕',
    hasImage: true,
    imagePath: dinosaurImg,
    skyTop: 0x1e90ff,
    skyMiddle: 0x87ceeb,
    skyBottom: 0xe8f4ff,
    grassTop: 0xaed581,
    grassMiddle: 0x8bc34a,
    grassBottom: 0x689f38,
    isDark: false,
    weather: {
      particleCount: Math.floor(WEATHER_PARTICLE_COUNT * 0.7),
      colors: [0x8bc34a, 0xff9800, 0x795548, 0xa5d6a7],
      sizeRange: [5, 10],
      behavior: 'fall-down',
      speed: [0.2, 0.5],
      opacity: [0.6, 0.9],
      glow: false,
      shape: 'leaf',
      rotates: true,
    },
  },
  blueworld: {
    name: 'עולם הכחול',
    icon: '💙',
    hasImage: true,
    imagePath: blueworldImg,
    skyTop: 0x1e90ff,
    skyMiddle: 0x87ceeb,
    skyBottom: 0xe8f4ff,
    grassTop: 0x7eb8d8,
    grassMiddle: 0x5a9fc8,
    grassBottom: 0x4080a8,
    isDark: false,
    weather: {
      particleCount: WEATHER_PARTICLE_COUNT,
      colors: [0x87ceeb, 0xe0f7fa, 0xffffff, 0xb3e5fc],
      sizeRange: [3, 8],
      behavior: 'rise-wobble',
      speed: [0.2, 0.4],
      opacity: [0.3, 0.7],
      glow: true,
      shape: 'circle',
      rotates: false,
    },
  },
  offroad: {
    name: 'עולם הג׳יפים',
    icon: '🚙',
    hasImage: true,
    imagePath: offroadImg,
    skyTop: 0x1e90ff,
    skyMiddle: 0x87ceeb,
    skyBottom: 0xe8f4ff,
    grassTop: 0xc9a86c,
    grassMiddle: 0xb8956a,
    grassBottom: 0xa67c52,
    isDark: false,
    weather: {
      particleCount: Math.floor(WEATHER_PARTICLE_COUNT * 0.6),
      colors: [0xd4a574, 0xf5deb3, 0xfff8dc, 0xffe4b5],
      sizeRange: [2, 5],
      behavior: 'drift',
      speed: [0.15, 0.35],
      opacity: [0.3, 0.6],
      glow: false,
      shape: 'circle',
      rotates: false,
    },
  },
  rainbow: {
    name: 'עולם הקשת',
    icon: '🌈',
    hasImage: true,
    imagePath: rainbowImg,
    skyTop: 0x1e90ff,
    skyMiddle: 0x87ceeb,
    skyBottom: 0xe8f4ff,
    grassTop: 0xf8bbd9,
    grassMiddle: 0xb3e5fc,
    grassBottom: 0xc8e6c9,
    isDark: false,
    weather: {
      particleCount: WEATHER_PARTICLE_COUNT,
      colors: [0xff0000], // Will be overridden by hueCycle
      sizeRange: [3, 6],
      behavior: 'float-up',
      speed: [0.25, 0.5],
      opacity: [0.5, 0.85],
      glow: true,
      shape: 'star',
      rotates: true,
      hueCycle: true,
    },
  },
  castle: {
    name: 'טירת החלומות',
    icon: '🏰',
    hasImage: true,
    imagePath: castleImg,
    skyTop: 0x1a1a2e,
    skyMiddle: 0x16213e,
    skyBottom: 0x0f3460,
    grassTop: 0x7986cb,
    grassMiddle: 0x5c6bc0,
    grassBottom: 0x3f51b5,
    isDark: true,
    weather: {
      particleCount: Math.floor(WEATHER_PARTICLE_COUNT * 0.8),
      colors: [0xffd54f, 0x81d4fa, 0xffffff],
      sizeRange: [4, 9],
      behavior: 'wander',
      speed: [0.1, 0.3],
      opacity: [0.4, 0.9],
      glow: true,
      pulseGlow: true,
      shape: 'circle',
      rotates: false,
    },
  },
};

export function getTheme(name: string): ThemeDefinition {
  return THEMES[name] || THEMES.classic;
}
