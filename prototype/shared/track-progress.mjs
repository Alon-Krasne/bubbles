export function createTrackProgress(currentStage, stageCount) {  if (!Number.isInteger(stageCount) || stageCount < 1) {
    throw new Error(`Invalid track stage count ${stageCount}`);
  }
  if (!Number.isInteger(currentStage) || currentStage < 1 || currentStage > stageCount) {
    throw new Error(`Invalid track stage ${currentStage}`);
  }

  return {
    currentStage,
    progress: Object.fromEntries(
      Array.from({ length: currentStage - 1 }, (_, index) => [index + 1, 3]),
    ),
  };
}

export function migrateTrackProgress(progress, changedStage, stageCount) {
  if (!progress
    || !Number.isInteger(progress.currentStage)
    || progress.currentStage < 1
    || progress.currentStage > stageCount
    || !progress.progress
    || typeof progress.progress !== 'object'
    || Array.isArray(progress.progress)) {
    throw new Error('Invalid legacy track progress');
  }
  if (!Number.isInteger(changedStage) || changedStage < 1 || changedStage > stageCount) {
    throw new Error(`Invalid changed track stage ${changedStage}`);
  }

  if (progress.currentStage >= changedStage || progress.progress[changedStage] > 0) {
    return {
      currentStage: changedStage,
      progress: Object.fromEntries(
        Object.entries(progress.progress).filter(([stageId]) => Number(stageId) < changedStage),
      ),
    };
  }
  return {
    currentStage: progress.currentStage,
    progress: { ...progress.progress },
  };
}

// A stage opens only once the player has cleared every stage before it, so the
// current stage is the frontier and anything past it stays locked.
export function isStageUnlocked(stage, currentStage) {
  return Boolean(stage)
    && stage.available === true
    && Number.isInteger(stage.id)
    && stage.id <= currentStage;
}

export const TRAIL_CONTENT_VERSION = 2;

// The generated route reuses stage ids 1..N for different challenges, so stars
// saved by the legacy 15-stage trail would silently attach to replacement
// content. Reset that legacy progress once, but leave alone anything that has
// already advanced past the legacy trail (generated-era players).
export function normalizeTrackProgress(saved, { stageCount, legacyStageCount }) {
  if (saved && saved.contentVersion === TRAIL_CONTENT_VERSION) {
    return saved;
  }
  if (saved
    && Number.isInteger(saved.currentStage)
    && saved.currentStage > legacyStageCount
    && saved.currentStage <= stageCount) {
    return {
      currentStage: saved.currentStage,
      progress: { ...(saved.progress || {}) },
      contentVersion: TRAIL_CONTENT_VERSION,
    };
  }
  return {
    ...createTrackProgress(1, stageCount),
    contentVersion: TRAIL_CONTENT_VERSION,
  };
}
