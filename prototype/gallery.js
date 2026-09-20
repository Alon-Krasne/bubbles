import { getGalleryItems } from './shared/gallery.mjs';
import { FOREST_CAPTIONS } from './shared/forest-captions.mjs';

export function openGallery(profile, storage) {
  const items = getGalleryItems(profile.id, storage);
  const dialog = document.createElement('dialog');
  dialog.className = 'collection-gallery';
  dialog.setAttribute('aria-labelledby', 'gallery-title');
  dialog.innerHTML = `<header class="gallery-header"><div><small>אוסף של רגעים קסומים</small><h1 id="gallery-title"></h1><p id="gallery-count"></p></div><button type="button" class="gallery-close" aria-label="סגירת הגלריה">חזרה למסע ←</button></header>
    <section class="gallery-album"><nav class="gallery-filters" aria-label="סוג הפריטים"><button type="button" data-filter="all" aria-pressed="true">הכול</button><button type="button" data-filter="picture" aria-pressed="false">תמונות 🖼️</button><button type="button" data-filter="video" aria-pressed="false">סרטונים ▶</button></nav><p class="gallery-guide">כל גילוי הופך למזכרת. נוגעים בפריט פתוח כדי ליהנות ממנו שוב!</p><div class="gallery-grid"></div></section>
    <section class="gallery-viewer" aria-labelledby="gallery-item-title" hidden><button type="button" class="gallery-back">→ לכל האוסף</button><h2 id="gallery-item-title"></h2><div class="gallery-media"></div><p class="gallery-error" role="status" hidden>לא הצלחנו לטעון את הפריט. חזרו לאוסף ונסו שוב.</p></section>`;
  const $ = selector => dialog.querySelector(selector);
  $('#gallery-title').textContent = `הגלריה של ${profile.name}`;
  const album = $('.gallery-album');
  const viewer = $('.gallery-viewer');
  const media = $('.gallery-media');
  let selectedButton;
  function clearMedia() {
    const video = media.querySelector('video');
    if (video) { video.pause(); video.removeAttribute('src'); video.load(); }
    media.replaceChildren();
    $('.gallery-error').hidden = true;
  }
  function back() {
    clearMedia(); viewer.hidden = true; album.hidden = false; selectedButton.focus();
  }
  function view(item, button) {
    selectedButton = button;
    album.hidden = true; viewer.hidden = false;
    $('#gallery-item-title').textContent = item.title;
    const element = document.createElement(item.type === 'video' ? 'video' : 'img');
    element.src = item.src;
    element.addEventListener('error', () => { $('.gallery-error').hidden = false; });
    if (item.type === 'picture') element.alt = item.title;
    else {
      element.controls = true; element.playsInline = true; element.preload = 'metadata'; element.poster = item.poster;
      element.setAttribute('aria-label', item.title);
      const tracks = {};
      for (const language of ['he', 'en']) {
        const track = element.addTextTrack('captions', language === 'he' ? 'עברית' : 'English', language);
        for (const cue of FOREST_CAPTIONS[item.id]) track.addCue(new VTTCue(cue.start, cue.end, cue[language]));
        track.mode = language === profile.learningLanguage ? 'showing' : 'hidden';
        tracks[language] = track;
      }
      const label = document.createElement('label'); label.className = 'gallery-captions'; label.textContent = 'כתוביות ';
      const select = document.createElement('select');
      for (const [value, text] of [['he', 'עברית'], ['en', 'English'], ['off', 'ללא']]) {
        const option = document.createElement('option'); option.value = value; option.textContent = text; select.append(option);
      }
      select.value = profile.learningLanguage;
      select.onchange = () => { for (const [language, track] of Object.entries(tracks)) track.mode = select.value === language ? 'showing' : 'hidden'; };
      label.append(select); media.append(label);
    }
    media.append(element); $('.gallery-back').focus();
  }
  function render(filter) {
    const visible = items.filter(item => filter === 'all' || item.type === filter)
      .sort((a, b) => Number(b.unlocked) - Number(a.unlocked));
    $('#gallery-count').textContent = `${visible.filter(item => item.unlocked).length} מתוך ${visible.length} כבר באוסף`;
    $('.gallery-grid').replaceChildren(...visible.map(item => {
      const card = document.createElement('button'); card.type = 'button'; card.className = 'gallery-card';
      card.dataset.item = item.id; card.disabled = !item.unlocked;
      const art = document.createElement('span'); art.className = 'gallery-card-art';
      if (item.unlocked) {
        const img = document.createElement('img'); img.src = item.type === 'picture' ? item.src : item.poster; img.alt = ''; img.loading = 'lazy'; art.append(img);
        const badge = document.createElement('span'); badge.className = 'gallery-kind'; badge.textContent = item.type === 'video' ? '▶ סרטון' : '🖼️ תמונה'; art.append(badge);
      } else { art.textContent = '🔒'; art.setAttribute('aria-hidden','true'); }
      const title = document.createElement('strong'); title.textContent = item.title;
      const detail = document.createElement('small'); detail.textContent = item.unlocked ? 'פתוח! בואו נציץ שוב' : item.hint;
      card.append(art,title,detail); card.onclick = () => view(item,card); return card;
    }));
    dialog.querySelectorAll('[data-filter]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === filter)));
  }
  dialog.querySelectorAll('[data-filter]').forEach(button => { button.onclick = () => render(button.dataset.filter); });
  $('.gallery-back').onclick = back;
  $('.gallery-close').onclick = () => dialog.close();
  dialog.addEventListener('cancel', event => { if (!viewer.hidden) { event.preventDefault(); back(); } });
  dialog.addEventListener('close', () => { clearMedia(); dialog.remove(); });
  document.body.append(dialog); render('all'); dialog.showModal();
}
