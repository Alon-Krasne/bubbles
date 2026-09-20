function shuffle(values, random) {
  const result = [...values];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(random() * (index + 1));
    [result[index], result[swap]] = [result[swap], result[index]];
  }
  return result;
}

export function createJourneyOrder(stages, random = Math.random) {
  const order = [];
  const gameById = new Map(stages.map(stage => [stage.id, stage.game]));
  const chapters = [...new Set(stages.map(stage => stage.chapterIndex))];

  for (const chapterIndex of chapters) {
    const chapter = stages.filter(stage => stage.chapterIndex === chapterIndex);
    const queues = new Map();
    for (const stage of chapter) {
      if (!queues.has(stage.game)) queues.set(stage.game, []);
      queues.get(stage.game).push(stage.id);
    }

    const chooseGames = (chosen) => {
      if (chosen.length === chapter.length) return chosen;
      const candidates = shuffle([...queues.keys()], random);
      for (const game of candidates) {
        const used = chosen.filter(item => item === game).length;
        if (used === queues.get(game).length) continue;
        const previous = [...order.slice(-2).map(id => gameById.get(id)), ...chosen].slice(-2);
        if (previous.length === 2 && previous.every(item => item === game)) continue;
        const completed = chooseGames([...chosen, game]);
        if (completed) return completed;
      }
      return null;
    };

    const games = chooseGames([]);
    if (!games) throw new Error(`No valid journey order for chapter ${chapterIndex}`);
    for (const game of games) order.push(queues.get(game).shift());
  }

  return order;
}

export function applyJourneyOrder(stages, order) {
  if (!Array.isArray(order) || order.length !== stages.length || new Set(order).size !== stages.length) {
    throw new Error('Invalid journey order');
  }
  const byId = new Map(stages.map(stage => [stage.id, stage]));
  const arranged = stages.map((slot, index) => {
    const source = byId.get(order[index]);
    if (!source || source.chapterIndex !== slot.chapterIndex) throw new Error('Invalid journey order');
    return Object.freeze({
      ...slot,
      game: source.game,
      level: source.level,
      activity: source.activity,
      entry: source.entry,
      gameLabel: source.gameLabel,
      difficultyRank: source.difficultyRank,
      difficultyLabel: source.difficultyLabel,
      sourceStageId: source.id,
    });
  });
  for (let index = 2; index < arranged.length; index += 1) {
    if (arranged[index].game === arranged[index - 1].game && arranged[index].game === arranged[index - 2].game) {
      throw new Error('Invalid journey order');
    }
  }
  return Object.freeze(arranged);
}
