import { REEF_ACTIVITIES, REEF_CHAPTERS, REEF_ROUTE_PATH, REEF_STAGES, REEF_STORIES, getReefStage } from './shared/reef-map.mjs';
import { REEF_TRAIL_STAGES } from './shared/trail-catalog.mjs';
import { FOREST_CHARACTERS } from './shared/destinations.mjs';
import { isForestFinalePending, isReefUnlocked, readReefForestRoute, openReefRoute, completeReefStage, markReefStorySeen, pendingReefStory } from './shared/reef-progress.mjs';
import { REEF_CAPTIONS } from './shared/reef-captions.mjs';
import { saveStorage } from './shared/saves.mjs';

const profileKey = 'bubble_world_map_profiles_v1';
const activeProfileId = localStorage.getItem('bubble_world_map_profile_v1');
const profiles = JSON.parse(saveStorage.getItem(profileKey));
const profile = profiles?.find(item => item.id === activeProfileId);
if (!profile) {
  location.replace('./world-map.html');
} else if (!isReefUnlocked(profile, saveStorage)) {
  document.getElementById('reef-locked').hidden = false;
} else {
  const forest = readReefForestRoute(profile, saveStorage);
  if (isForestFinalePending(forest)) {
    location.replace('./world-map.html');
  } else {
    if (!Object.hasOwn(FOREST_CHARACTERS, forest.character)) throw new Error('Choose a journey friend in the Forest first');
    startReef(profile, forest.character);
  }
}

function startReef(profile, friend) {
  const screen = document.getElementById('reef-screen');
  const viewport = document.getElementById('map-viewport');
  const map = document.getElementById('map-stage');
  const dialog = document.getElementById('story-dialog');
  const video = document.getElementById('story-video');
  const list = document.getElementById('story-list');
  const activity = document.getElementById('reef-activity');
  const frame = document.getElementById('activity-frame');
  const play = document.getElementById('play-stage');
  const captionLanguage = document.getElementById('caption-language');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let progress = openReefRoute(profile, saveStorage);
  let selected = progress.currentStage;
  let returnFocus = play;
  let activeStory = null;
  let pendingStoryId = null;
  let launch = null;
  const tracks = Object.fromEntries(['he', 'en'].map(language => [language, video.addTextTrack('subtitles', language === 'he' ? 'עברית' : 'English', language)]));
  for (const track of Object.values(tracks)) track.mode = 'hidden';
  captionLanguage.value = profile.learningLanguage;
  document.getElementById('journey-title').textContent = `המסע של ${profile.name} · ${profile.learningLanguage === 'he' ? 'לומדים עברית' : 'לומדים אנגלית'}`;
  document.querySelector('.traveller img').src = `./assets/reef/${friend}.webp`;
  document.querySelector('.traveller span').textContent = FOREST_CHARACTERS[friend].name;
  screen.inert = false;
  screen.hidden = false;

  function icon(name) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('aria-hidden', 'true');
    const use = document.createElementNS(svg.namespaceURI, 'use');
    use.setAttribute('href', `#icon-${name}`);
    svg.append(use);
    return svg;
  }

  document.querySelectorAll('.route-art path').forEach(path => path.setAttribute('d', REEF_ROUTE_PATH));
  for (const chapter of REEF_CHAPTERS) {
    const label = document.createElement('div');
    label.className = 'chapter-label';
    label.style.left = `${chapter.label.x}%`;
    label.style.top = `${chapter.label.y}%`;
    const title = document.createElement('span'); title.textContent = chapter.title;
    const range = document.createElement('small'); range.textContent = `תחנות ⁦${(chapter.id - 1) * 6 + 1}–${chapter.id * 6}⁩`;
    label.append(title, range);
    document.getElementById('chapter-labels').append(label);
  }

  for (const stage of REEF_STAGES) {
    const button = document.createElement('button');
    button.type = 'button'; button.className = 'stage-stop'; button.dataset.stage = stage.id;
    button.style.left = `${stage.position.x}%`; button.style.top = `${stage.position.y}%`;
    const number = document.createElement('span'); number.className = 'stage-number'; number.textContent = stage.id;
    const badge = document.createElement('span'); badge.className = 'stop-activity'; badge.append(icon(stage.activity));
    button.append(number, badge);
    button.addEventListener('click', () => selectStage(stage.id));
    button.addEventListener('focus', () => { selectStage(stage.id); centerStage(stage.id, false); });
    button.addEventListener('keydown', event => {
      const offset = { ArrowLeft: 1, ArrowUp: 1, ArrowRight: -1, ArrowDown: -1 }[event.key];
      if (offset === undefined) return;
      event.preventDefault();
      document.querySelector(`[data-stage="${Math.max(1, Math.min(36, stage.id + offset))}"]`).focus({ preventScroll: true });
    });
    document.getElementById('stage-stops').append(button);
  }

  for (const story of REEF_STORIES) {
    const button = document.createElement('button');
    button.type = 'button'; button.className = 'story-choice'; button.dataset.story = story.id;
    const title = document.createElement('span'); title.textContent = story.title;
    button.append(title);
    button.addEventListener('click', () => loadStory(story));
    list.append(button);
  }

  function renderProgress() {
    document.querySelectorAll('.stage-stop').forEach(button => {
      const id = Number(button.dataset.stage);
      const stage = getReefStage(id);
      button.classList.toggle('is-locked', id > progress.currentStage);
      button.classList.toggle('is-complete', Boolean(progress.progress[id]));
      button.classList.toggle('is-current', id === progress.currentStage);
      button.setAttribute('aria-label', `שלב ${id}: ${REEF_ACTIVITIES[stage.activity].title}, ${id > progress.currentStage ? 'נעול' : `${progress.progress[id] || 0} כוכבים`}`);
    });
    for (const button of list.querySelectorAll('button')) {
      const story = REEF_STORIES.find(item => item.id === button.dataset.story);
      button.disabled = !progress.unlockedVideos.includes(story.id);
      if (!button.disabled && !button.querySelector('img')) {
        const img = document.createElement('img'); img.src = story.poster; img.alt = ''; img.loading = 'lazy'; button.prepend(img);
      }
    }
    document.getElementById('album-count').textContent = progress.unlockedVideos.length;
    const total = Object.values(progress.progress).reduce((sum, stars) => sum + stars, 0);
    document.getElementById('map-progress').textContent = progress.progress[36] ? `השונית שוב זוהרת! ★ ${total} / 108` : `★ ${total} / 108 · ${Object.keys(progress.progress).length} מתוך 36 תחנות הושלמו`;
    const point = getReefStage(progress.currentStage).position;
    const traveller = document.querySelector('.traveller');
    traveller.style.left = `${point.x + 4}%`; traveller.style.top = `${point.y}%`;
    selectStage(selected);
  }

  function selectStage(id) {
    const stage = getReefStage(id); selected = id;
    const chapter = REEF_CHAPTERS[stage.chapter - 1];
    const game = REEF_ACTIVITIES[stage.activity];
    document.querySelectorAll('.stage-stop').forEach(button => {
      const active = Number(button.dataset.stage) === id;
      button.classList.toggle('selected', active); button.setAttribute('aria-pressed', String(active));
    });
    document.getElementById('stage-kicker').textContent = `שלב ${id} מתוך 36 · ${chapter.title}`;
    document.getElementById('stage-title').textContent = game.title;
    document.getElementById('stage-description').textContent = `${chapter.topic} · ${game.description}`;
    document.getElementById('activity-icon').setAttribute('href', `#icon-${stage.activity}`);
    document.getElementById('activity-token').dataset.color = game.color;
    play.disabled = id > progress.currentStage;
    play.querySelector('span').textContent = play.disabled ? 'שלב נעול' : 'שחקו';
    const stars = progress.progress[id] || 0;
    document.getElementById('stage-stars').textContent = play.disabled ? 'נפתחת אחרי השלמת התחנות הקודמות' : `${'★'.repeat(stars)}${'☆'.repeat(3 - stars)}`;
  }

  function centerStage(id, animate = true) {
    const point = getReefStage(id).position;
    viewport.scrollTo({ left: point.x / 100 * map.clientWidth - viewport.clientWidth / 2, top: point.y / 100 * map.clientHeight - viewport.clientHeight * .53, behavior: animate && !reducedMotion.matches ? 'smooth' : 'instant' });
  }

  function updateCaptions() {
    for (const [language, track] of Object.entries(tracks)) track.mode = captionLanguage.value === language ? 'showing' : 'hidden';
  }

  function loadStory(story) {
    if (!progress.unlockedVideos.includes(story.id)) throw new Error('Story is locked');
    activeStory = story.id; video.pause(); document.getElementById('video-error').hidden = true;
    video.src = story.src; video.poster = story.poster; video.load();
    document.getElementById('story-title').textContent = story.title;
    document.getElementById('story-when').textContent = story.after === null ? 'מהיער אל השונית' : story.after === 0 ? 'כאן הסיפור מתחיל' : `אחרי שלב ${story.after}`;
    list.querySelectorAll('button').forEach(button => button.setAttribute('aria-current', String(button.dataset.story === story.id)));
    for (const [language, track] of Object.entries(tracks)) {
      while (track.cues.length) track.removeCue(track.cues[0]);
      for (const cue of REEF_CAPTIONS[story.id]) track.addCue(new VTTCue(cue.start, cue.end, cue[language]));
    }
    updateCaptions();
    document.getElementById('continue-story').textContent = pendingStoryId ? 'דלגו והמשיכו במסע ←' : 'חזרה למפה ←';
  }

  function openAlbum(story, opener, pending = false) {
    returnFocus = opener;
    pendingStoryId = pending ? story.id : null;
    list.hidden = pending;
    dialog.classList.toggle('is-pending', pending);
    loadStory(story);
    dialog.showModal();
    document.getElementById('continue-story').focus();
  }

  function showPendingStory() {
    const pending = pendingReefStory(progress);
    if (pending) openAlbum(pending, play, true);
  }

  function closeActivity() {
    frame.removeAttribute('src'); activity.hidden = true; screen.inert = false; launch = null; play.focus();
  }

  play.addEventListener('click', () => {
    if (selected > progress.currentStage) throw new Error('Stage is locked');
    const stage = REEF_TRAIL_STAGES.find(item => item.id === selected);
    const emoji = { princess: '🌸', dinosaur: '🫧', puppy: '🐶', unicorn: '🦄' }[profile.character];
    launch = { stageId: stage.id, activityId: stage.activity, levelId: stage.level, profileId: profile.id };
    const params = new URLSearchParams({ host: 'world-map', destination: 'reef', activity: stage.activity, level: stage.level, stage: String(stage.id), profile: profile.id, profileName: profile.name, profileEmoji: emoji, profileLanguage: profile.learningLanguage, profileCharacter: profile.character });
    screen.inert = true; activity.hidden = false; frame.src = `${stage.entry}?${params}`;
  });

  window.addEventListener('message', event => {
    if (!launch || event.origin !== location.origin || event.source !== frame.contentWindow) return;
    const message = event.data;
    if (message.version !== 1 || !['stageId', 'activityId', 'levelId', 'profileId'].every(key => message[key] === launch[key])) throw new Error('Activity result does not match the Reef launch');
    if (message.type === 'bubbles.activity.exit') { closeActivity(); return; }
    if (message.type !== 'bubbles.activity.complete') throw new Error('Unknown Reef activity message');
    const result = completeReefStage(profile, launch.stageId, message.stars, saveStorage);
    closeActivity(); progress = result; selected = progress.currentStage;
    renderProgress(); centerStage(selected); showPendingStory();
  });

  dialog.addEventListener('close', () => {
    video.pause(); video.removeAttribute('src'); video.load();
    if (pendingStoryId) progress = markReefStorySeen(profile, pendingStoryId, saveStorage);
    const wasPending = pendingStoryId !== null;
    pendingStoryId = null; activeStory = null;
    renderProgress(); returnFocus.focus({ preventScroll: true });
    if (wasPending) queueMicrotask(showPendingStory);
  });
  document.getElementById('close-album').addEventListener('click', () => dialog.close());
  document.getElementById('continue-story').addEventListener('click', () => dialog.close());
  document.getElementById('open-album').addEventListener('click', event => openAlbum(REEF_STORIES.find(story => story.id === progress.unlockedVideos.at(-1)), event.currentTarget));
  captionLanguage.addEventListener('change', updateCaptions);
  video.addEventListener('ended', () => {
    if (!pendingStoryId) return;
    progress = markReefStorySeen(profile, pendingStoryId, saveStorage);
    document.getElementById('continue-story').textContent = 'ממשיכים במסע ←';
  });
  video.addEventListener('error', () => { if (activeStory) document.getElementById('video-error').hidden = false; });
  document.getElementById('go-start').addEventListener('click', () => { selectStage(1); centerStage(1); });
  document.getElementById('go-finish').addEventListener('click', () => { selectStage(36); centerStage(36); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && launch) closeActivity(); });
  window.addEventListener('resize', () => centerStage(selected, false));
  renderProgress(); requestAnimationFrame(() => { centerStage(selected, false); showPendingStory(); });
}
