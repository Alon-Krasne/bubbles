export const MAGIC_HOUSE_ZONES = Object.freeze([
  Object.freeze({
    id: 'bed',
    labels: Object.freeze({ en: 'bed', he: 'מיטה' }),
    cue: Object.freeze({ color: '#d94fa1', fill: 'rgba(217, 79, 161, 0.1)' }),
    layout: Object.freeze({ left: '19%', top: '39.5%', width: '29.5%', height: '13.5%' }),
  }),
  Object.freeze({
    id: 'toy-box',
    labels: Object.freeze({ en: 'toy box', he: 'קופסת צעצועים' }),
    cue: Object.freeze({ color: '#07988b', fill: 'rgba(7, 152, 139, 0.1)' }),
    layout: Object.freeze({ left: '75.5%', top: '49.5%', width: '19%', height: '18%' }),
  }),
  Object.freeze({
    id: 'shelf',
    labels: Object.freeze({ en: 'shelf', he: 'מדף' }),
    cue: Object.freeze({ color: '#7357d9', fill: 'rgba(115, 87, 217, 0.1)' }),
    layout: Object.freeze({ left: '77%', top: '20%', width: '20%', height: '15%' }),
  }),
  Object.freeze({
    id: 'under-bed',
    labels: Object.freeze({ en: 'under the bed', he: 'מתחת למיטה' }),
    cue: Object.freeze({ color: '#d3a215', fill: 'rgba(211, 162, 21, 0.1)' }),
    layout: Object.freeze({ left: '37.5%', top: '55%', width: '10.5%', height: '7%' }),
  }),
  Object.freeze({
    id: 'bedside-floor',
    labels: Object.freeze({ en: 'next to the bed', he: 'ליד המיטה' }),
    cue: Object.freeze({ color: '#e07a2f', fill: 'rgba(224, 122, 47, 0.1)' }),
    layout: Object.freeze({ left: '49.5%', top: '52%', width: '15%', height: '10%' }),
  }),
  Object.freeze({
    id: 'nightstand',
    labels: Object.freeze({ en: 'nightstand', he: 'שידה' }),
    cue: Object.freeze({ color: '#2877d4', fill: 'rgba(40, 119, 212, 0.1)' }),
    layout: Object.freeze({ left: '6%', top: '40.5%', width: '12%', height: '8%' }),
  }),
  Object.freeze({
    id: 'table',
    labels: Object.freeze({ en: 'table', he: 'שולחן' }),
    cue: Object.freeze({ color: '#2d9b60', fill: 'rgba(45, 155, 96, 0.1)' }),
    layout: Object.freeze({ left: '65%', top: '45%', width: '10.5%', height: '8.5%' }),
  }),
]);

export const MAGIC_HOUSE_PLACEMENTS = Object.freeze({
  'pillow:bed': Object.freeze({ left: '25.5%', top: '42%', width: '8%' }),
  'ball:toy-box': Object.freeze({ left: '85%', top: '52.8%', width: '5%' }),
  'book:shelf': Object.freeze({ left: '86.5%', top: '28.3%', width: '6%' }),
  'shoes:under-bed': Object.freeze({ left: '42%', top: '57.5%', width: '5%' }),
  'yellow-lamp:bedside-floor': Object.freeze({ left: '55%', top: '55%', width: '6%' }),
  'apple:table': Object.freeze({ left: '71%', top: '46.2%', width: '4.5%' }),
  'teddy:bed': Object.freeze({ left: '34%', top: '40.5%', width: '7%' }),
  'teddy:toy-box': Object.freeze({ left: '85%', top: '52%', width: '7%' }),
  'ball:bedside-floor': Object.freeze({ left: '55%', top: '57%', width: '5%' }),
  'book:table': Object.freeze({ left: '71%', top: '46%', width: '5.5%' }),
  'shoes:nightstand': Object.freeze({ left: '12.7%', top: '42.5%', width: '5%' }),
  'blue-lamp:shelf': Object.freeze({ left: '86.5%', top: '27.6%', width: '6%' }),
});
