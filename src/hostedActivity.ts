import { TRAIL_STAGES } from '../prototype/shared/trail-catalog.mjs';

export const ACTIVITY_MESSAGE_VERSION = 1;

export type HostedActivityId = 'memory-garden' | 'listening-shop' | 'busy-park';
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
}

export interface HostedActivitySession {
  context: HostedActivityContext;
  complete: (stars: number) => void;
  exit: () => void;
}

export function readHostedActivityContext(): HostedActivityContext | null {
  const params = new URLSearchParams(window.location.search);
  const host = params.get('host');
  if (!host) {
    return null;
  }

  const activityId = params.get('activity');
  const levelId = params.get('level');
  const profileId = params.get('profile');
  const profileName = params.get('profileName');
  const profileEmoji = params.get('profileEmoji');
  const profileLanguage = params.get('profileLanguage');
  const profileCharacter = params.get('profileCharacter');
  const stageId = Number(params.get('stage'));
  const supportedActivities = new Set<HostedActivityId>(['memory-garden', 'listening-shop', 'busy-park']);
  const supportedLanguages = new Set<ProfileLanguage>(['en', 'he']);
  const supportedCharacters = new Set<ProfileCharacter>(['princess', 'dinosaur', 'puppy', 'unicorn']);
  const expectedStage = TRAIL_STAGES.find((stage) => stage.id === stageId);

  if (host !== 'world-map'
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
    || expectedStage?.activity !== activityId
    || expectedStage?.level !== levelId
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
