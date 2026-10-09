import { GAME_LEVELS, TRAIL_STAGES } from '../prototype/shared/trail-catalog.mjs';

export const ACTIVITY_MESSAGE_VERSION = 1;

export type HostedActivityId = 'memory-garden' | 'listening-shop' | 'magic-reveal' | 'magic-painter' | 'magic-letters';
export type ProfileLanguage = 'en' | 'he';
export type ProfileCharacter = 'princess' | 'dinosaur' | 'puppy' | 'unicorn';

const PROFILE_EMOJI_BY_CHARACTER: Record<ProfileCharacter, string> = {
  princess: '🌸',
  dinosaur: '🫧',
  puppy: '🐶',
  unicorn: '🦄',
};

const PROFILE_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/i;

export interface HostedActivityContext {
  activityId: HostedActivityId;
  levelId: string;
  profileId: string;
  profileName: string;
  profileEmoji: string;
  profileLanguage: ProfileLanguage;
  profileCharacter: ProfileCharacter;
  stageId: number;
  destination: 'wonder' | 'forest';
}

export interface HostedActivitySession {
  context: HostedActivityContext;
  complete: (stars: number) => void;
  exit: () => void;
}

export function readHostedActivityContext(): HostedActivityContext | null {
  const params = new URLSearchParams(window.location.search);
  const host = params.get('host');
  const activityId = params.get('activity');

  if (!host && activityId === 'magic-letters') {
    const lang = (params.get('lang') === 'en' ? 'en' : 'he') as ProfileLanguage;
    return {
      activityId: 'magic-letters',
      levelId: 'letters-poc',
      profileId: 'poc-player',
      profileName: lang === 'en' ? 'Lotem' : 'לוטם',
      profileEmoji: '🌸',
      profileLanguage: lang,
      profileCharacter: 'princess',
      stageId: 1,
      destination: 'wonder',
    };
  }

  if (!host) {
    return null;
  }

  const levelId = params.get('level');
  const profileId = params.get('profile');
  const profileName = params.get('profileName');
  const profileEmoji = params.get('profileEmoji');
  const profileLanguage = params.get('profileLanguage');
  const profileCharacter = params.get('profileCharacter');
  const stageId = Number(params.get('stage'));
  const destination = params.get('destination');
  const supportedActivities = new Set<HostedActivityId>(['memory-garden', 'listening-shop', 'magic-reveal', 'magic-painter', 'magic-letters']);
  const supportedLanguages = new Set<ProfileLanguage>(['en', 'he']);
  const supportedCharacters = new Set<ProfileCharacter>(['princess', 'dinosaur', 'puppy', 'unicorn']);
  const gameByActivity = {
    'memory-garden': 'memory',
    'listening-shop': 'shop',
    'magic-reveal': 'reveal',
    'magic-painter': 'painter',
    'magic-letters': 'letters',
  } as const;
  const game = gameByActivity[activityId as HostedActivityId];

  if ((destination !== 'wonder' && destination !== 'forest')
    || host !== 'world-map'
    || !supportedActivities.has(activityId as HostedActivityId)
    || !levelId
    || !profileId
    || profileId.length > 64
    || !PROFILE_ID_PATTERN.test(profileId)
    || !profileName
    || profileName.length > 12
    || profileName !== profileName.trim()
    || !profileEmoji
    || !supportedLanguages.has(profileLanguage as ProfileLanguage)
    || !supportedCharacters.has(profileCharacter as ProfileCharacter)
    || !Number.isInteger(stageId)
    || (!TRAIL_STAGES.some(stage => stage.id === stageId) && activityId !== 'magic-letters')
    || (activityId !== 'magic-letters' && !GAME_LEVELS[game]?.some(level => level.id === levelId))
    || PROFILE_EMOJI_BY_CHARACTER[profileCharacter as ProfileCharacter] !== profileEmoji) {
    throw new Error('Invalid hosted activity context');
  }

  return {
    activityId: activityId as HostedActivityId,
    levelId,
    profileId,
    profileName,
    profileEmoji,
    profileLanguage: profileLanguage as ProfileLanguage,
    profileCharacter: profileCharacter as ProfileCharacter,
    stageId,
    destination,
  };
}

export function createHostedActivitySession(context: HostedActivityContext): HostedActivitySession {
  let resultSent = false;

  function postResult(type: 'bubbles.activity.complete' | 'bubbles.activity.exit', stars?: number) {
    if (resultSent) {
      return;
    }

    resultSent = true;
    window.parent.postMessage({
      type,
      version: ACTIVITY_MESSAGE_VERSION,
      stageId: context.stageId,
      activityId: context.activityId,
      levelId: context.levelId,
      profileId: context.profileId,
      ...(stars ? { stars } : {}),
    }, window.location.origin);
  }

  return {
    context,
    complete(stars) {
      if (!Number.isInteger(stars) || stars < 1 || stars > 3) {
        throw new Error(`Invalid hosted activity star result ${stars}`);
      }
      postResult('bubbles.activity.complete', stars);
    },
    exit() {
      postResult('bubbles.activity.exit');
    },
  };
}
