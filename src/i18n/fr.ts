// French copy, the reference language: other languages follow its keys.
const fr = {
  common: {
    loadError: 'Impossible de charger la partie',
    retry: 'Réessayer',
    cancel: 'Annuler',
    done: 'Terminé',
    newGame: 'Nouvelle partie',
    seconds: '{{count}} s',
  },
  // Browser version only
  web: {
    start: 'Cliquer ou appuyer sur Entrée pour commencer',
    menu: 'Menu',
  },
  errors: {
    createFailed: 'Impossible de créer la partie',
    unreachable: 'Serveur injoignable ({{url}})',
  },
  lobby: {
    creating: 'Création de la partie…',
    durationUnknown: 'Durée selon les joueurs',
    duration: 'Partie ≈ {{minutes}} min',
    rounds_one: '{{count}} tour',
    rounds_other: '{{count}} tours',
    questions: '{{count}} questions',
    titleStart: 'Qui joue ',
    titleHighlight: 'ce soir ?',
    players_one: '{{count}} joueur',
    players_other: '{{count}} joueurs',
    playerRange: '{{min}} à {{max}}',
    missingPlayers_one: 'Encore {{count}} joueur pour lancer la partie.',
    missingPlayers_other: 'Encore {{count}} joueurs pour lancer la partie.',
    allThemesReady: "Tous les thèmes sont prêts. Ils restent secrets jusqu'à leur manche.",
    themesReady_one: "{{count}} joueur sur {{total}} a saisi ses thèmes. Ils restent secrets jusqu'à leur manche.",
    themesReady_other: "{{count}} joueurs sur {{total}} ont saisi leurs thèmes. Ils restent secrets jusqu'à leur manche.",
    joinHighlight: 'Rejoins',
    joinRest: 'la partie !',
    scan: 'Scanne avec ton téléphone',
    nothingToInstall: 'rien à installer',
    orUrl: 'ou sur {{host}}',
    settings: 'Réglages',
    rules: 'Règles',
    launch: 'LANCER !',
  },
  slot: {
    scan: 'Scanne !',
    host: 'Hôte',
    ready: 'Prêt',
    themes: 'Thèmes {{entered}}/{{needed}}',
  },
  settings: {
    title: 'Réglages',
    language: 'Langue',
    questionsPerTheme: 'Questions par thème',
    rounds: 'Tours',
    timer: 'Chrono',
    languageLocked: 'Des joueurs ont rejoint : la langue est bloquée. Pour en changer, lance une nouvelle partie.',
  },
  newGame: {
    title: 'Nouvelle partie ?',
    text: 'Les joueurs connectés suivent automatiquement, avec leur nom et leur couleur. Thèmes et scores repartent de zéro.',
    resume: 'Reprendre la partie',
  },
  disclaimer: {
    title: 'Petit mot avant de jouer',
    text: "Les questions sont écrites par une IA. Elle est très cultivée, mais il lui arrive de se tromper avec un aplomb remarquable.",
    fun: "Une réponse vous paraît louche ? Débattez-en, riez-en : le principal, c'est de s'amuser !",
    ok: "OK, on joue !",
  },
  theme: {
    header: 'Manche {{number}}/{{total}} · Le thème de {{master}}',
    replaced: 'Thème remplacé par Claude',
    go: "C'est parti",
    preparing: 'Claude prépare les questions…',
  },
  finalReveal: {
    title: 'QUESTION FINALE',
    searching: 'Claude choisit un thème mystère…',
  },
  question: {
    finalMystery: 'Question finale mystère',
    multiplier: 'Points ×{{multiplier}}',
    progress: 'Question {{number}}/{{total}}',
    answered: '{{count}}/{{total}} ont répondu',
    finalTheme: 'Thème : {{theme}}',
    reading: 'Lisez bien la question, les réponses arrivent…',
  },
  results: {
    correctAnswer: 'Bonne réponse',
    nobody: 'Personne n’a trouvé',
    ranking: 'Classement',
    podium: 'Voir le podium',
    roundEnd: 'Fin de manche',
    nextQuestion: 'Question suivante',
    breakdown: {
      title: 'Détail des points',
      correct: 'bonne réponse',
      speed: 'rapidité',
      wrong: 'mauvaise réponse, moitié de la rapidité perdue',
      noAnswer: 'pas de réponse',
      steals: 'volés à {{name}}',
      stolen: 'volés par {{name}}',
    },
  },
  awards: {
    roundEnd: 'Fin de manche',
    none: 'Aucune récompense cette fois',
    continue: 'Continuer',
    next: 'Suivant',
    plusViteQueSonOmbre: {
      label: 'Plus vite que son ombre',
      description: 'Le plus rapide à bien répondre, devant le maître : il lui a volé 200 points par question, déjà comptés au classement.',
    },
    outsider: {
      label: "L'Outsider",
      description: 'Sans-faute sur la manche : +200.',
    },
    seulContreTous: {
      label: 'Seul contre tous',
      description: 'Seul challenger à trouver une question (dès 3 joueurs) : +150 par question.',
    },
    pasMonTruc: {
      label: 'Finalement pas mon truc',
      description: 'Le maître ne trouve aucune réponse sur son propre thème : −200.',
    },
    bonnetDane: {
      label: "Bonnet d'âne",
      description: 'Aucune bonne réponse sur la manche : badge seul.',
    },
  },
  rules: {
    title: 'Les règles',
    page: '{{number}}/{{total}}',
    trophy: 'Trophée',
    next: 'Suivant',
    close: "C'est compris\u00A0!",
    concept: {
      title: 'Chacun son truc',
      text: "Dans le lobby, chacun choisit en secret un thème pour tout le groupe, même le plus absurde. Claude en tire des questions, et chaque thème n'est révélé qu'au moment de sa manche.",
    },
    answers: {
      title: 'Répondre vite, un pari',
      text: "Tout le monde répond sur son téléphone. Une bonne réponse vaut 500 points, plus jusqu'à 500 points de rapidité. Une mauvaise réponse ne fait perdre que la moitié de ce bonus : dans le doute, tente ta chance !",
    },
    master: {
      title: 'Le maître de la manche',
      text: "Celui qui a choisi le thème joue et marque ses points comme tout le monde. Mais gare à lui : à chaque question, le plus rapide à bien répondre avant lui lui vole aussitôt 200 points !",
    },
    final: {
      title: 'La question finale mystère',
      text: "Pour finir, Claude tire un thème que personne n'a choisi. Tous les points sont doublés ! En cas d'égalité, le plus de bonnes réponses l'emporte, puis le plus rapide.",
    },
    trophies: {
      title: 'Les trophées',
      text: "À la fin de chaque manche, des trophées font gagner (ou perdre) des points. Voici lesquels.",
    },
  },
  finale: {
    podium: 'Podium',
    points: '{{count}} pts',
  },
};

export default fr;

// Every language provides the same keys as French.
type Translations<T> = { [K in keyof T]: T[K] extends string ? string : Translations<T[K]> };
export type Resources = Translations<typeof fr>;
