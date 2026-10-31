import { REEF_ACTIVITIES, REEF_CHAPTERS, REEF_ROUTE_PATH, REEF_STAGES, REEF_STORIES, getReefStage, getStoryBeforeReefStage } from './shared/reef-map.mjs';

const viewport = document.getElementById('map-viewport');
const map = document.getElementById('map-stage');
const dialog = document.getElementById('story-dialog');
const video = document.getElementById('story-video');
const list = document.getElementById('story-list');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
let selected = 1;
let returnFocus = null;

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
  const title = document.createElement('span');
  title.textContent = chapter.title;
  const range = document.createElement('small');
  range.textContent = `תחנות ⁦${(chapter.id - 1) * 6 + 1}–${chapter.id * 6}⁩`;
  label.append(title, range);
  document.getElementById('chapter-labels').append(label);
}

for (const stage of REEF_STAGES) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'stage-stop';
  if (REEF_STORIES.some(story => story.after === stage.id)) button.classList.add('has-story');
  button.dataset.stage = stage.id;
  button.style.left = `${stage.position.x}%`;
  button.style.top = `${stage.position.y}%`;
  button.setAttribute('aria-label', `תחנה ${stage.id}: ${REEF_ACTIVITIES[stage.activity].title}, ${REEF_CHAPTERS[stage.chapter - 1].title}. פרטי השלב בתצוגה מקדימה`);
  button.setAttribute('aria-pressed', 'false');
  const number = document.createElement('span');
  number.className = 'stage-number';
  number.textContent = stage.id;
  const activity = document.createElement('span');
  activity.className = 'stop-activity';
  activity.append(icon(stage.activity));
  button.append(number, activity);
  button.addEventListener('click', () => selectStage(stage.id));
  button.addEventListener('focus', () => {
    selectStage(stage.id);
    centerStage(stage.id, false);
  });
  button.addEventListener('keydown', event => {
    const offset = { ArrowLeft: 1, ArrowUp: 1, ArrowRight: -1, ArrowDown: -1 }[event.key];
    if (offset === undefined) return;
    event.preventDefault();
    const next = Math.max(1, Math.min(36, stage.id + offset));
    document.querySelector(`[data-stage="${next}"]`).focus({ preventScroll: true });
  });
  document.getElementById('stage-stops').append(button);
}

function selectStage(id) {
  const stage = getReefStage(id);
  selected = id;
  const chapter = REEF_CHAPTERS[stage.chapter - 1];
  const activity = REEF_ACTIVITIES[stage.activity];
  document.querySelectorAll('.stage-stop').forEach(button => {
    const active = Number(button.dataset.stage) === id;
    button.classList.toggle('selected', active);
    button.setAttribute('aria-pressed', String(active));
  });
  document.getElementById('stage-kicker').textContent = `תחנה ${id} מתוך 36 · ${chapter.title}`;
  document.getElementById('stage-title').textContent = activity.title;
  document.getElementById('stage-description').textContent = `${chapter.topic} · ${activity.description}`;
  document.getElementById('activity-icon').setAttribute('href', `#icon-${stage.activity}`);
  document.getElementById('activity-token').dataset.color = activity.color;
}

function centerStage(id, animate = true) {
  const { position } = getReefStage(id);
  viewport.scrollTo({
    left: position.x / 100 * map.clientWidth - viewport.clientWidth / 2,
    top: position.y / 100 * map.clientHeight - viewport.clientHeight * .53,
    behavior: animate && !reducedMotion.matches ? 'smooth' : 'instant',
  });
}

function loadStory(story) {
  video.pause();
  document.getElementById('video-error').hidden = true;
  video.src = story.src;
  video.poster = story.poster;
  video.load();
  document.getElementById('story-title').textContent = story.title;
  document.getElementById('story-when').textContent = story.after === null ? 'מהיער אל השונית' : story.after === 0 ? 'כאן הסיפור מתחיל' : `אחרי תחנה ${story.after}`;
  list.querySelectorAll('button').forEach(button => button.setAttribute('aria-current', String(button.dataset.story === story.id)));
}

function openAlbum(story, opener) {
  returnFocus = opener;
  loadStory(story);
  dialog.showModal();
  document.getElementById('close-album').focus();
}

for (const story of REEF_STORIES) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'story-choice';
  button.dataset.story = story.id;
  button.setAttribute('aria-current', 'false');
  const poster = document.createElement('img');
  poster.src = story.poster;
  poster.alt = '';
  poster.loading = 'lazy';
  const title = document.createElement('span');
  title.textContent = story.title;
  button.append(poster, title);
  button.addEventListener('click', () => loadStory(story));
  list.append(button);
}

document.getElementById('open-album').addEventListener('click', event => openAlbum(REEF_STORIES[0], event.currentTarget));
document.getElementById('stage-story').addEventListener('click', event => openAlbum(getStoryBeforeReefStage(selected), event.currentTarget));
document.getElementById('close-album').addEventListener('click', () => dialog.close());
dialog.addEventListener('close', () => {
  video.pause();
  video.removeAttribute('src');
  video.load();
  returnFocus.focus({ preventScroll: true });
});
video.addEventListener('error', () => { document.getElementById('video-error').hidden = false; });
document.getElementById('go-start').addEventListener('click', () => { selectStage(1); centerStage(1); });
document.getElementById('go-finish').addEventListener('click', () => { selectStage(36); centerStage(36); });
window.addEventListener('resize', () => centerStage(selected, false));
selectStage(1);
requestAnimationFrame(() => centerStage(1, false));
