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
    targets: Object.freeze([Object.freeze({ objectId: 'yellow-lamp', zoneId: 'bedside-floor' })]),
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
  Object.freeze({
    id: 'request-7',
    targets: Object.freeze([Object.freeze({ objectId: 'teddy', zoneId: 'toy-box' })]),
    en: Object.freeze({ sentence: 'Put the teddy bear in the toy box.', keywords: Object.freeze(['teddy bear', 'in', 'toy box']) }),
    success: Object.freeze({ en: 'The teddy bear is in the toy box!', he: 'הדובי בקופסת הצעצועים!' }),
    he: Object.freeze({
      male: 'שים את הדובי בקופסת הצעצועים.',
      female: 'שימי את הדובי בקופסת הצעצועים.',
      keywords: Object.freeze(['הדובי', 'בקופסת הצעצועים']),
    }),
  }),
  Object.freeze({
    id: 'request-8',
    targets: Object.freeze([Object.freeze({ objectId: 'ball', zoneId: 'bedside-floor' })]),
    en: Object.freeze({ sentence: 'Put the ball next to the bed.', keywords: Object.freeze(['ball', 'next to', 'bed']) }),
    success: Object.freeze({ en: 'The ball is next to the bed!', he: 'הכדור ליד המיטה!' }),
    he: Object.freeze({
      male: 'שים את הכדור ליד המיטה.',
      female: 'שימי את הכדור ליד המיטה.',
      keywords: Object.freeze(['הכדור', 'ליד', 'המיטה']),
    }),
  }),
  Object.freeze({
    id: 'request-9',
    targets: Object.freeze([Object.freeze({ objectId: 'book', zoneId: 'table' })]),
    en: Object.freeze({ sentence: 'Put the blue book on the table.', keywords: Object.freeze(['blue book', 'on', 'table']) }),
    success: Object.freeze({ en: 'The blue book is on the table!', he: 'הספר הכחול על השולחן!' }),
    he: Object.freeze({
      male: 'שים את הספר הכחול על השולחן.',
      female: 'שימי את הספר הכחול על השולחן.',
      keywords: Object.freeze(['הספר הכחול', 'על', 'השולחן']),
    }),
  }),
  Object.freeze({
    id: 'request-10',
    targets: Object.freeze([Object.freeze({ objectId: 'shoes', zoneId: 'nightstand' })]),
    en: Object.freeze({ sentence: 'Put the shoes on the nightstand.', keywords: Object.freeze(['shoes', 'on', 'nightstand']) }),
    success: Object.freeze({ en: 'The shoes are on the nightstand!', he: 'הנעליים על השידה!' }),
    he: Object.freeze({
      male: 'שים את הנעליים על השידה.',
      female: 'שימי את הנעליים על השידה.',
      keywords: Object.freeze(['הנעליים', 'על', 'השידה']),
    }),
  }),
  Object.freeze({
    id: 'request-11',
    targets: Object.freeze([Object.freeze({ objectId: 'blue-lamp', zoneId: 'shelf' })]),
    en: Object.freeze({ sentence: 'Put the blue lamp on the shelf.', keywords: Object.freeze(['blue lamp', 'on', 'shelf']) }),
    success: Object.freeze({ en: 'The blue lamp is on the shelf!', he: 'המנורה הכחולה על המדף!' }),
    he: Object.freeze({
      male: 'שים את המנורה הכחולה על המדף.',
      female: 'שימי את המנורה הכחולה על המדף.',
      keywords: Object.freeze(['המנורה הכחולה', 'על', 'המדף']),
    }),
  }),
  Object.freeze({
    id: 'request-12',
    targets: Object.freeze([
      Object.freeze({ objectId: 'apple', zoneId: 'table' }),
      Object.freeze({ objectId: 'pillow', zoneId: 'bed' }),
    ]),
    en: Object.freeze({
      sentence: 'Put the red apple on the table and the pillow on the bed.',
      keywords: Object.freeze(['red apple', 'table', 'pillow', 'bed']),
    }),
    success: Object.freeze({ en: 'The room looks wonderful!', he: 'החדר נראה נפלא!' }),
    he: Object.freeze({
      male: 'שים את התפוח האדום על השולחן ואת הכרית על המיטה.',
      female: 'שימי את התפוח האדום על השולחן ואת הכרית על המיטה.',
      keywords: Object.freeze(['התפוח האדום', 'השולחן', 'הכרית', 'המיטה']),
    }),
  }),
]);

export const MAGIC_HOUSE_REQUEST_LAYOUTS = Object.freeze([
  Object.freeze(['request-1', 'request-2', 'request-3', 'request-4', 'request-5', 'request-6']),
  Object.freeze(['request-7', 'request-8', 'request-9', 'request-10', 'request-11', 'request-12']),
]);
