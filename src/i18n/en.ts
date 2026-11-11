import type { Resources } from './fr';

const en: Resources = {
  common: {
    loadError: "Couldn't load the game",
    retry: 'Try again',
    cancel: 'Cancel',
    done: 'Done',
    newGame: 'New game',
    seconds: '{{count}} s',
  },
  web: {
    start: 'Click or press Enter to start',
    menu: 'Menu',
  },
  errors: {
    createFailed: "Couldn't create the game",
    unreachable: 'Server unreachable ({{url}})',
  },
  lobby: {
    creating: 'Creating the game…',
    durationUnknown: 'Length depends on the players',
    duration: 'Game ≈ {{minutes}} min',
    rounds_one: '{{count}} round',
    rounds_other: '{{count}} rounds',
    questions_one: '{{count}} question per theme',
    questions_other: '{{count}} questions per theme',
    timer: '{{count}} s to answer',
    titleStart: "Who's playing ",
    title_morning: 'this morning?',
    title_afternoon: 'this afternoon?',
    title_evening: 'tonight?',
    status: {
      missingPlayers_one: '{{count}} more player and we can start',
      missingPlayers_other: '{{count}} more players and we can start',
      waitingFor: 'Waiting for {{name}} to pick their themes',
      waitingCount: '{{count}} players are still picking their themes',
      ready: "Everyone's ready!",
    },
    joinHighlight: 'Join',
    joinRest: 'the game!',
    orUrl: 'or on {{host}}',
    settings: 'Settings',
    rules: 'Rules',
    launch: 'GO',
  },
  slot: {
    scan: 'Scan!',
  },
  settings: {
    title: 'Settings',
    language: 'Language',
    questionsPerTheme: 'Questions per theme',
    rounds: 'Rounds',
    timer: 'Timer',
    languageLocked: 'Players have joined, so the language is locked. To change it, start a new game.',
  },
  newGame: {
    title: 'New game?',
    text: 'Connected players follow automatically, with their name and color. Themes and scores start from zero.',
    resume: 'Back to the game',
  },
  disclaimer: {
    title: 'A quick word before we play',
    text: 'The questions are written by an AI. It knows a lot, but now and then it gets things wrong with remarkable confidence.',
    fun: "Does an answer look fishy? Argue about it, laugh about it: the main thing is to have fun!",
    ok: "OK, let's play!",
  },
  theme: {
    header: "Round {{number}}/{{total}} · {{master}}'s theme",
    replaced: 'Theme replaced by Claude',
    go: "Let's go",
    preparing: 'Claude is preparing the questions…',
  },
  finalReveal: {
    title: 'FINAL QUESTION',
    searching: 'Claude is picking a mystery theme…',
  },
  question: {
    finalMystery: 'Mystery final question',
    multiplier: 'Points ×{{multiplier}}',
    progress: 'Question {{number}}/{{total}}',
    answered: '{{count}}/{{total}} answered',
    finalTheme: 'Theme: {{theme}}',
    reading: 'Read the question, the answers are coming…',
  },
  results: {
    noAnswer_one: '{{names}} didn’t answer',
    noAnswer_other: '{{names}} didn’t answer',
    podium: 'See the podium',
    roundEnd: 'End of round',
    nextQuestion: 'Next question',
  },
  standings: {
    title: 'Ranking',
    subtitle: 'After the theme “{{theme}}” · Round {{number}}/{{total}}',
  },
  awards: {
    continue: 'Continue',
    next: 'Next',
    plusViteQueSonOmbre: {
      label: 'Faster than their shadow',
      subtitle: 'The fastest correct answer, ahead of the theme master',
      description: 'The fastest correct answer, ahead of the theme master, stole 200 points from them per question, already in the ranking.',
    },
    outsider: {
      label: 'The Outsider',
      subtitle: 'A perfect round',
      description: 'A perfect round: +200.',
    },
    seulContreTous: {
      label: 'One against all',
      subtitle: 'The only one to find the right answer',
      description: 'The only challenger to get a question right (3 players or more): +150 per question.',
    },
    pasMonTruc: {
      label: 'Not my thing after all',
      subtitle: 'The theme master found no answer on their own theme',
      description: 'The theme master misses every question on their own theme: −200.',
    },
    bonnetDane: {
      label: 'Dunce cap',
      subtitle: 'No correct answers in the round',
      description: 'No correct answers in the round: badge only.',
    },
  },
  rules: {
    title: 'The rules',
    page: '{{number}}/{{total}}',
    trophy: 'Trophy',
    next: 'Next',
    close: 'Got it!',
    concept: {
      title: 'To Each Their Thing',
      text: 'In the lobby, everyone secretly picks a theme for the whole group, even the most absurd one. Claude turns it into questions, and each theme stays secret until its round.',
    },
    answers: {
      title: 'Answering fast is a gamble',
      text: 'Everyone answers on their phone. A correct answer is worth 500 points, plus up to 500 for speed. A wrong answer only loses half of that bonus: when in doubt, take a guess!',
    },
    master: {
      title: 'The theme master',
      text: "Whoever picked the theme plays and scores like everyone else. But watch out: on each question, the fastest correct answer ahead of them steals 200 of their points right away!",
    },
    final: {
      title: 'The mystery final question',
      text: "To finish, Claude picks a theme nobody chose. All points are doubled! In case of a tie, the most correct answers wins, then the fastest.",
    },
    trophies: {
      title: 'The trophies',
      text: 'At the end of each round, trophies win (or lose) players some points. Here they are.',
    },
  },
  finale: {
    winner: '{{name}} wins the game!',
    ranking: 'Ranking',
    pointsUnit: 'pts',
  },
};

export default en;
