// Theme background image imports
import imagineImg from '../assets/themes/imagine.jpg';
import unicornImg from '../assets/themes/unicorn.jpg';
import dinosaurImg from '../assets/themes/dinosaur.jpg';
import blueworldImg from '../assets/themes/blue-world.png';
import offroadImg from '../assets/themes/4x4-cars.png';
import rainbowImg from '../assets/themes/rainbow-world.png';
import castleImg from '../assets/themes/castle.jpg';

export type DynamicElementType = 'sparkles' | 'diamonds' | 'hearts' | 'leaves' | 'lanterns';

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
  dynamicElements: DynamicElementType;
  starCount: number;
  isDark: boolean;
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
    dynamicElements: 'sparkles',
    starCount: 15,
    isDark: false,
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
    dynamicElements: 'diamonds',
    starCount: 20,
    isDark: false,
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
    dynamicElements: 'hearts',
    starCount: 25,
    isDark: false,
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
    dynamicElements: 'leaves',
    starCount: 10,
    isDark: false,
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
    dynamicElements: 'diamonds',
    starCount: 30,
    isDark: false,
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
    dynamicElements: 'leaves',
    starCount: 8,
    isDark: false,
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
    dynamicElements: 'hearts',
    starCount: 35,
    isDark: false,
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
    dynamicElements: 'lanterns',
    starCount: 40,
    isDark: true,
  },
};

export function getTheme(name: string): ThemeDefinition {
  return THEMES[name] || THEMES.classic;
}
