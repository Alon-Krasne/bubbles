export function createTrackProgress(currentStage, stageCount) {
  if (!Number.isInteger(stageCount) || stageCount < 1) {
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
