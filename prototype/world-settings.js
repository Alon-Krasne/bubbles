import { REEF_CAPTIONS } from './shared/reef-captions.mjs';
import { REEF_STORIES } from './shared/reef-map.mjs';

export function bindWorldSettings({ canEnterReef, enterWorld, getLearningLanguage }) {
  const settings = document.getElementById('world-settings');
  const visit = document.getElementById('reef-art-visit');
  const map = document.getElementById('reef-visit-map');
  const storyButton = document.getElementById('reef-visit-story');
  const video = document.getElementById('reef-visit-video');
  const opening = REEF_STORIES.find(story => story.after === 0);
  const tracks = Object.fromEntries([['he', 'עברית'], ['en', 'English']].map(([language, label]) => {
    const track = video.addTextTrack('captions', label, language);
    for (const cue of REEF_CAPTIONS[opening.id]) track.addCue(new VTTCue(cue.start, cue.end, cue[language]));
    return [language, track];
  }));

  function showOpening(show) {
    if (show && !video.hasAttribute('src')) {
      video.poster = opening.poster;
      video.src = opening.src;
    }
    if (!show) video.pause();
    video.hidden = !show;
    map.hidden = show;
    storyButton.textContent = show ? 'חזרה למפה ←' : '▶ סיפור הפתיחה';
    storyButton.setAttribute('aria-expanded', String(show));
  }

  for (const id of ['world-settings-button', 'destination-settings-button']) {
    document.getElementById(id).addEventListener('click', () => settings.showModal());
  }
  document.getElementById('world-settings-close').addEventListener('click', () => settings.close());
  settings.querySelectorAll('[data-settings-world]').forEach(button => {
    button.addEventListener('click', () => {
      const world = button.dataset.settingsWorld;
      settings.close();
      if (world !== 'reef' || canEnterReef()) {
        enterWorld(world);
        return;
      }
      const language = getLearningLanguage();
      for (const [id, track] of Object.entries(tracks)) track.mode = id === language ? 'showing' : 'hidden';
      visit.showModal();
      map.scrollTo(map.scrollWidth, map.scrollHeight);
    });
  });

  storyButton.addEventListener('click', () => showOpening(video.hidden));
  document.getElementById('reef-visit-close').addEventListener('click', () => visit.close());
  visit.addEventListener('close', () => {
    showOpening(false);
    if (video.hasAttribute('src')) {
      video.removeAttribute('src');
      video.load();
    }
  });
}
