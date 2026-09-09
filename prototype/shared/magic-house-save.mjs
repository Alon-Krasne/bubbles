export function snapshotHouseRound(state) {
  return {
    requestIds: state.requests.map(request => request.id),
    objectIds: state.objects.map(object => object.id),
    completedRequests: state.completedRequests,
    helpLevel: state.completedRequests > state.requestIndex ? 0 : state.helpLevel,
    mistakes: state.mistakes,
    placements: [...state.placedZoneByObjectId],
  };
}

export function restoreHouseRound(snapshot, requests, objects) {
  return {
    requests: snapshot.requestIds.map(id => requests.find(request => request.id === id)),
    objects: snapshot.objectIds.map(id => objects.find(object => object.id === id)),
    requestIndex: Math.min(snapshot.completedRequests, snapshot.requestIds.length - 1),
    completedRequests: snapshot.completedRequests,
    helpLevel: snapshot.helpLevel,
    mistakes: snapshot.mistakes,
    placedObjectIds: new Set(snapshot.placements.map(([id]) => id)),
    placedZoneByObjectId: new Map(snapshot.placements),
    locked: snapshot.completedRequests === snapshot.requestIds.length,
  };
}
