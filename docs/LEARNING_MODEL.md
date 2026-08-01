# Learning Model

The trail teaches the same vocabulary through different recognition paths without time pressure.

## English path

- Store and Magic House lead with spoken English and semantic image choices.
- In Magic House, selecting an object labels every destination in English with a small Hebrew location gloss so an unfamiliar room word cannot block placement. The second help step identifies the exact object and destination.
- Memory Garden combines written English, optional slower speech, and a Hebrew/image counterpart.
- English answer targets do not show the answer image.
- Memory and Store use committed Google Gemini 3.1 Flash TTS recordings. The same warm voice and slower learning pace are stable across browsers and devices.

## Hebrew path

- Prompts and choices are written in Hebrew.
- Magic House destination labels remain Hebrew-only before the answer.
- Answer images and pre-answer speech are withheld so the child must read.
- Learning material contains no niqqud.

## Reinforcement

- Correct answers reconnect meaning, spelling, and sound through bilingual success feedback.
- Store sentences are assembled from recorded phrase, number, article, word, and plural clips. This varies sentence structure while preserving exact pronunciation.
- Memory and Store keep a coverage deck for each profile and level. The game shuffles every round but exhausts the pool before repeating a word.
- Difficulty grows through board size, choice count, sentence structure, distractors, and reduced help. It never uses a timer.

The expanded topics follow child-relevant vocabulary represented in the [Cambridge English Young Learners word lists](https://www.cambridgeenglish.org/Images/739104-starters-movers-flyers-word-list-2025.pdf): school, places, sports, actions, home, food, clothes, nature, people, and animals.

Audio is generated through Google's documented [Gemini text-to-speech Interactions API](https://ai.google.dev/gemini-api/docs/speech-generation) with `gemini-3.1-flash-tts-preview` and committed under `src/assets/audio/vocabulary`.
