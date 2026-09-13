import { SHOP_ART_IDS } from '../prototype/shared/shop-art-ids.mjs';

export { SHOP_ART_IDS };

const COLORS: Record<string, string> = {
  red: '#e44d56', blue: '#498cdf', yellow: '#ffda51', green: '#68b96b',
  purple: '#ad71d0', orange: '#f59a3d', brown: '#916146', white: '#fffaf0',
};

export function createShopItemArt(id: string): HTMLSpanElement {
  const art = document.createElement('span');
  art.className = 'shop-item-art';
  art.setAttribute('aria-hidden', 'true');
  const [color, shape] = id.split('-');
  if (color in COLORS) {
    art.classList.add('shop-colored-item', `shop-colored-${shape}`);
    art.style.setProperty('--item-color', COLORS[color]);
    if (shape === 'heart') art.textContent = '♥';
    return art;
  }
  const index = SHOP_ART_IDS.indexOf(id);
  if (index === -1) throw new Error(`Missing Shop artwork: ${id}`);
  const cell = index % 16;
  art.style.backgroundImage = `url("/prototype/assets/shop/products-${Math.floor(index / 16) + 1}.webp")`;
  art.style.backgroundPosition = `${cell % 4 / 3 * 100}% ${Math.floor(cell / 4) / 3 * 100}%`;
  return art;
}
