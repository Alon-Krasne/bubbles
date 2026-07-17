export const MAGIC_HOUSE_REQUESTS = Object.freeze([
  Object.freeze({
    id: 'request-1',
    targets: Object.freeze([Object.freeze({ objectId: 'pillow', zoneId: 'bed' })]),
    en: Object.freeze({ sentence: 'Put the pillow on the bed.', keywords: Object.freeze(['pillow', 'on', 'bed']) }),
    success: Object.freeze({ en: 'The pillow is on the bed!', he: 'הכרית על המיטה!' }),
    he: Object.freeze({
      male: 'שים את הכרית על המיטה.',
      female: 'שימי את הכרית על המיטה.',
      keywords: Object.freeze(['הכרית', 'על', 'המיטה']),
    }),
  }),
  Object.freeze({
    id: 'request-2',
    targets: Object.freeze([Object.freeze({ objectId: 'ball', zoneId: 'toy-box' })]),
    en: Object.freeze({ sentence: 'Put the ball in the toy box.', keywords: Object.freeze(['ball', 'in', 'toy box']) }),
    success: Object.freeze({ en: 'The ball is in the toy box!', he: 'הכדור בקופסת הצעצועים!' }),
    he: Object.freeze({
      male: 'שים את הכדור בקופסת הצעצועים.',
      female: 'שימי את הכדור בקופסת הצעצועים.',
      keywords: Object.freeze(['הכדור', 'בקופסת הצעצועים']),
    }),
  }),
  Object.freeze({
    id: 'request-3',
    targets: Object.freeze([Object.freeze({ objectId: 'book', zoneId: 'shelf' })]),
    en: Object.freeze({ sentence: 'Put the blue book on the shelf.', keywords: Object.freeze(['blue book', 'on', 'shelf']) }),
    success: Object.freeze({ en: 'The blue book is on the shelf!', he: 'הספר הכחול על המדף!' }),
    he: Object.freeze({
      male: 'שים את הספר הכחול על המדף.',
      female: 'שימי את הספר הכחול על המדף.',
      keywords: Object.freeze(['הספר הכחול', 'על', 'המדף']),
    }),
  }),
  Object.freeze({
    id: 'request-4',
    targets: Object.freeze([Object.freeze({ objectId: 'shoes', zoneId: 'under-bed' })]),
    en: Object.freeze({ sentence: 'Put the shoes under the bed.', keywords: Object.freeze(['shoes', 'under', 'bed']) }),
    success: Object.freeze({ en: 'The shoes are under the bed!', he: 'הנעליים מתחת למיטה!' }),
    he: Object.freeze({
      male: 'שים את הנעליים מתחת למיטה.',
      female: 'שימי את הנעליים מתחת למיטה.',
      keywords: Object.freeze(['הנעליים', 'מתחת', 'למיטה']),
    }),
  }),
  Object.freeze({
    id: 'request-5',
    targets: Object.freeze([Object.freeze({ objectId: 'yellow-lamp', zoneId: 'nightstand' })]),
    en: Object.freeze({ sentence: 'Put the yellow lamp next to the bed.', keywords: Object.freeze(['yellow lamp', 'next to', 'bed']) }),
    success: Object.freeze({ en: 'The yellow lamp is next to the bed!', he: 'המנורה הצהובה ליד המיטה!' }),
    he: Object.freeze({
      male: 'שים את המנורה הצהובה ליד המיטה.',
      female: 'שימי את המנורה הצהובה ליד המיטה.',
      keywords: Object.freeze(['המנורה הצהובה', 'ליד', 'המיטה']),
    }),
  }),
  Object.freeze({
    id: 'request-6',
    targets: Object.freeze([
      Object.freeze({ objectId: 'apple', zoneId: 'table' }),
      Object.freeze({ objectId: 'teddy', zoneId: 'bed' }),
    ]),
    en: Object.freeze({
      sentence: 'Put the red apple on the table and the teddy bear on the bed.',
      keywords: Object.freeze(['red apple', 'table', 'teddy bear', 'bed']),
    }),
    success: Object.freeze({ en: 'The room looks magical!', he: 'החדר נראה קסום!' }),
    he: Object.freeze({
      male: 'שים את התפוח האדום על השולחן ואת הדובי על המיטה.',
      female: 'שימי את התפוח האדום על השולחן ואת הדובי על המיטה.',
      keywords: Object.freeze(['התפוח האדום', 'השולחן', 'הדובי', 'המיטה']),
    }),
  }),
]);
