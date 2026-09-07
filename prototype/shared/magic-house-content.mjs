export const MAGIC_HOUSE_OBJECTS = Object.freeze([
  Object.freeze({ id: 'pillow', labels: Object.freeze({ en: 'pillow', he: 'כרית' }), sprite: Object.freeze(['0%', '0%']) }),
  Object.freeze({ id: 'ball', labels: Object.freeze({ en: 'ball', he: 'כדור' }), sprite: Object.freeze(['33.333%', '0%']) }),
  Object.freeze({ id: 'book', labels: Object.freeze({ en: 'blue book', he: 'ספר כחול' }), sprite: Object.freeze(['66.667%', '0%']) }),
  Object.freeze({ id: 'shoes', labels: Object.freeze({ en: 'shoes', he: 'נעליים' }), sprite: Object.freeze(['100%', '0%']) }),
  Object.freeze({ id: 'yellow-lamp', labels: Object.freeze({ en: 'yellow lamp', he: 'מנורה צהובה' }), sprite: Object.freeze(['0%', '100%']) }),
  Object.freeze({ id: 'apple', labels: Object.freeze({ en: 'red apple', he: 'תפוח אדום' }), sprite: Object.freeze(['33.333%', '100%']) }),
  Object.freeze({ id: 'teddy', labels: Object.freeze({ en: 'teddy bear', he: 'דובי' }), sprite: Object.freeze(['66.667%', '100%']) }),
  Object.freeze({ id: 'blue-lamp', labels: Object.freeze({ en: 'blue lamp', he: 'מנורה כחולה' }), sprite: Object.freeze(['100%', '100%']) }),
]);

export const MAGIC_HOUSE_REQUESTS = Object.freeze([
  Object.freeze({
    id: 'request-1',
    targets: Object.freeze([Object.freeze({ objectId: 'pillow', zoneId: 'bed' })]),
    en: Object.freeze({
      sentence: 'Put the pillow on the bed.',
      helpKeywords: Object.freeze(['pillow', 'on', 'bed']),
      translations: Object.freeze({ put: 'לשים', the: 'ה־', pillow: 'כרית', on: 'על', bed: 'מיטה' }),
    }),
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
    en: Object.freeze({
      sentence: 'Put the ball in the toy box.',
      helpKeywords: Object.freeze(['ball', 'in', 'toy box']),
      translations: Object.freeze({ put: 'לשים', the: 'ה־', ball: 'כדור', in: 'בתוך', 'toy box': 'קופסת צעצועים' }),
    }),
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
    en: Object.freeze({
      sentence: 'Put the blue book on the shelf.',
      helpKeywords: Object.freeze(['blue book', 'on', 'shelf']),
      translations: Object.freeze({ put: 'לשים', the: 'ה־', 'blue book': 'ספר כחול', on: 'על', shelf: 'מדף' }),
    }),
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
    en: Object.freeze({
      sentence: 'Put the shoes under the bed.',
      helpKeywords: Object.freeze(['shoes', 'under', 'bed']),
      translations: Object.freeze({ put: 'לשים', the: 'ה־', shoes: 'נעליים', under: 'מתחת', bed: 'מיטה' }),
    }),
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
    en: Object.freeze({
      sentence: 'Put the yellow lamp next to the bed.',
      helpKeywords: Object.freeze(['yellow lamp', 'next to', 'bed']),
      translations: Object.freeze({ put: 'לשים', the: 'ה־', 'yellow lamp': 'מנורה צהובה', 'next to': 'ליד', bed: 'מיטה' }),
    }),
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
      helpKeywords: Object.freeze(['red apple', 'table', 'teddy bear', 'bed']),
      translations: Object.freeze({ put: 'לשים', the: 'ה־', 'red apple': 'תפוח אדום', on: 'על', table: 'שולחן', and: 'ו־', 'teddy bear': 'דובי', bed: 'מיטה' }),
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
    en: Object.freeze({
      sentence: 'Put the teddy bear in the toy box.',
      helpKeywords: Object.freeze(['teddy bear', 'in', 'toy box']),
      translations: Object.freeze({ put: 'לשים', the: 'ה־', 'teddy bear': 'דובי', in: 'בתוך', 'toy box': 'קופסת צעצועים' }),
    }),
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
    en: Object.freeze({
      sentence: 'Put the ball next to the bed.',
      helpKeywords: Object.freeze(['ball', 'next to', 'bed']),
      translations: Object.freeze({ put: 'לשים', the: 'ה־', ball: 'כדור', 'next to': 'ליד', bed: 'מיטה' }),
    }),
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
    en: Object.freeze({
      sentence: 'Put the blue book on the table.',
      helpKeywords: Object.freeze(['blue book', 'on', 'table']),
      translations: Object.freeze({ put: 'לשים', the: 'ה־', 'blue book': 'ספר כחול', on: 'על', table: 'שולחן' }),
    }),
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
    en: Object.freeze({
      sentence: 'Put the shoes on the nightstand.',
      helpKeywords: Object.freeze(['shoes', 'on', 'nightstand']),
      translations: Object.freeze({ put: 'לשים', the: 'ה־', shoes: 'נעליים', on: 'על', nightstand: 'שידה' }),
    }),
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
    en: Object.freeze({
      sentence: 'Put the blue lamp on the shelf.',
      helpKeywords: Object.freeze(['blue lamp', 'on', 'shelf']),
      translations: Object.freeze({ put: 'לשים', the: 'ה־', 'blue lamp': 'מנורה כחולה', on: 'על', shelf: 'מדף' }),
    }),
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
      helpKeywords: Object.freeze(['red apple', 'table', 'pillow', 'bed']),
      translations: Object.freeze({ put: 'לשים', the: 'ה־', 'red apple': 'תפוח אדום', on: 'על', table: 'שולחן', and: 'ו־', pillow: 'כרית', bed: 'מיטה' }),
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
