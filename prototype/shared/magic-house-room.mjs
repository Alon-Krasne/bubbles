export const MAGIC_HOUSE_ZONES = Object.freeze([
  Object.freeze({ id: 'bed', labels: Object.freeze({ en: 'bed', he: 'מיטה' }) }),
  Object.freeze({ id: 'toy-box', labels: Object.freeze({ en: 'toy box', he: 'קופסת צעצועים' }) }),
  Object.freeze({ id: 'shelf', labels: Object.freeze({ en: 'shelf', he: 'מדף' }) }),
  Object.freeze({ id: 'under-bed', labels: Object.freeze({ en: 'under the bed', he: 'מתחת למיטה' }) }),
  Object.freeze({ id: 'bedside-floor', labels: Object.freeze({ en: 'next to the bed', he: 'ליד המיטה' }) }),
  Object.freeze({ id: 'nightstand', labels: Object.freeze({ en: 'nightstand', he: 'שידה' }) }),
  Object.freeze({ id: 'table', labels: Object.freeze({ en: 'table', he: 'שולחן' }) }),
]);

export const MAGIC_HOUSE_ZONE_CUE_COLORS = Object.freeze({
  bed: Object.freeze({ color: '#d94fa1', fill: 'rgba(217, 79, 161, 0.1)' }),
  'toy-box': Object.freeze({ color: '#07988b', fill: 'rgba(7, 152, 139, 0.1)' }),
  shelf: Object.freeze({ color: '#7357d9', fill: 'rgba(115, 87, 217, 0.1)' }),
  'under-bed': Object.freeze({ color: '#d3a215', fill: 'rgba(211, 162, 21, 0.1)' }),
  'bedside-floor': Object.freeze({ color: '#e07a2f', fill: 'rgba(224, 122, 47, 0.1)' }),
  nightstand: Object.freeze({ color: '#2877d4', fill: 'rgba(40, 119, 212, 0.1)' }),
  table: Object.freeze({ color: '#2d9b60', fill: 'rgba(45, 155, 96, 0.1)' }),
});

export const MAGIC_HOUSE_ROOM_MAP = Object.freeze({
  zones: Object.freeze({
    bed: Object.freeze({ left: '39.5%', top: '37%', width: '21.5%', height: '21.5%' }),
    'toy-box': Object.freeze({ left: '26%', top: '50%', width: '12.5%', height: '23%' }),
    shelf: Object.freeze({ left: '26%', top: '27%', width: '12.5%', height: '20%' }),
    'bedside-floor': Object.freeze({ left: '38.5%', top: '61%', width: '6.5%', height: '18%' }),
    'under-bed': Object.freeze({ left: '46%', top: '59%', width: '10%', height: '7.5%' }),
    table: Object.freeze({ left: '45.5%', top: '67%', width: '18%', height: '12.5%' }),
    nightstand: Object.freeze({ left: '64%', top: '53%', width: '11.5%', height: '22%' }),
  }),
  placements: Object.freeze({
    'pillow:bed': Object.freeze({ left: '49%', top: '49%', width: '8%' }),
    'ball:toy-box': Object.freeze({ left: '33%', top: '61%', width: '5.5%' }),
    'book:shelf': Object.freeze({ left: '32.5%', top: '35%', width: '6.5%' }),
    'shoes:under-bed': Object.freeze({ left: '51%', top: '62.5%', width: '9%' }),
    'yellow-lamp:bedside-floor': Object.freeze({ left: '42%', top: '69%', width: '7%' }),
    'apple:table': Object.freeze({ left: '59%', top: '70%', width: '6%' }),
    'teddy:bed': Object.freeze({ left: '55%', top: '51%', width: '8%' }),
    'teddy:toy-box': Object.freeze({ left: '32.5%', top: '58%', width: '8%' }),
    'ball:bedside-floor': Object.freeze({ left: '42%', top: '69%', width: '5.5%' }),
    'book:table': Object.freeze({ left: '59%', top: '71.5%', width: '6.5%' }),
    'shoes:nightstand': Object.freeze({ left: '68%', top: '63%', width: '7.5%' }),
    'blue-lamp:shelf': Object.freeze({ left: '32.5%', top: '33%', width: '7%' }),
  }),
});
