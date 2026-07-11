export const ACTIVITY_MESSAGE_VERSION = 1;

export type HostedActivityId = 'memory-garden' | 'listening-shop';

export interface HostedActivityContext {
  activityId: HostedActivityId;
  levelId: string;
  profileId: string;
  profileName: string;
  profileEmoji: string;
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
  const stageId = Number(params.get('stage'));
  const supportedActivities = new Set<HostedActivityId>(['memory-garden', 'listening-shop']);

  if (host !== 'world-map'
    || !supportedActivities.has(activityId as HostedActivityId)
    || !levelId
    || !profileId
    || !profileName
    || !profileEmoji
    || !Number.isInteger(stageId)
    || stageId < 1) {
    throw new Error('Invalid hosted activity context');
  }

  return {
    activityId: activityId as HostedActivityId,
    levelId,
    profileId,
    profileName,
    profileEmoji,
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
