// Story captions, not learning prompts or transcriptions. Times match the masters.
const cues = (cuts, lines) => cuts.map((cut, i) => ({ start: cut[0], end: cut[1], he: lines[i][0], en: lines[i][1] }));
export const REEF_CAPTIONS = Object.freeze({
  'bridge-forest-reef': cues([[.5,7.5],[8.5,13],[15,22]], [['אור קטן קורא לנו מרחוק.','A little light calls from far away.'],['הנהר מוביל אותנו אל הים.','The river takes us to the sea.'],['יחד, צוללים לשונית חדשה.','Together, we enter a new reef.']]),
  'reef-video-01': cues([[.5,7.5],[8.5,14],[15,22]], [['איזה עולם נפלא מתחת למים!','What a wonderful world under the sea!'],['מה חסר לחבר החדש?','What does our new friend need?'],['חוט של אור מוביל אל המגדלור.','A thread of light leads to the lighthouse.']]),
  'reef-video-02': cues([[.5,7.5],[8.5,15.5],[16.5,23.5]], [['הבאנו את מה שהיה חסר.','We brought what was missing.'],['בתוך הספינה מסתתר כפר.','A village is hidden inside the ship.'],['אפשר לעזור לסדר את המזווה.','We can help tidy the pantry.']]),
  'reef-video-03': cues([[.5,7.5],[8.5,14]], [['המזווה מסודר והאורות נדלקים.','The pantry is tidy and the lights come on.'],['גם הפנסים של החבר החדש צריכים עזרה.','Our new friend needs help with the lanterns too.']]),
  'reef-video-04': cues([[.5,6],[7,14]], [['לפעמים יוצא קצף במקום צליל!','Sometimes foam comes out instead of a note!'],['שני זרמים מוארים. אחד עוד מחכה.','Two currents shine. One is still waiting.']]),
  'reef-video-05': cues([[.5,7.5],[8.5,15.5]], [['מישהו מחכה מעבר לתהום.','Someone is waiting across the trench.'],['המפרש פותח גשר של אור.','The sail opens a bridge of light.']]),
  'reef-video-06': cues([[.5,7.8],[8.7,17.5]], [['במגדלור יש מקום לכל החברים.','There is room for all our friends in the lighthouse.'],['שולחים הזמנות לאורך הזרמים.','We send invitations along the currents.']]),
  'reef-video-07': cues([[.5,9],[10,19]], [['כל החברים מגיעים למגדלור.','All our friends arrive at the lighthouse.'],['עוד מקום אחד מחכה לנו.','One more place is waiting for us.']]),
  'reef-video-08': cues([[.5,8],[9,18]], [['הפנינה כמעט מאירה.','The pearl almost shines.'],['עוד קצת עזרה, וכולם יהיו מוכנים.','A little more help, and everyone will be ready.']]),
  'reef-video-09': cues([[.5,7.5],[8.5,16],[17,24]], [['עכשיו יש מקום לכולם.','Now there is a place for everyone.'],['הפנינה מאירה שוב!','The pearl shines again!'],['ביחד, החזרנו את האור לשונית.','Together, we brought the light back to the reef.']]),
});
