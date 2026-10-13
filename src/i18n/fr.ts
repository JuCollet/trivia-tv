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
    openUrl: 'Ouvre {{url}}',
    scan: 'Scanne avec ton téléphone',
    nothingToInstall: 'rien à installer',
    orCode: 'ou code',
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
  question: {
    finalMystery: 'Question finale mystère',
    multiplier: 'Points ×{{multiplier}}',
    progress: 'Question {{number}}/{{total}}',
    answered: '{{count}}/{{total}} ont répondu',
    finalTheme: 'Thème : {{theme}}',
  },
  results: {
    correctAnswer: 'Bonne réponse',
    nobody: 'Personne n’a trouvé',
    ranking: 'Classement',
    podium: 'Voir le podium',
    roundEnd: 'Fin de manche',
    nextQuestion: 'Question suivante',
    breakdown: {
      title: 'Points de la question',
      correct: 'Bonne réponse {{base}} + rapidité {{speed}}',
      wrong: 'Mauvaise réponse : pénalité de rapidité',
      noAnswer: 'Pas de réponse',
      masterAverage: 'Maître : moyenne des challengers',
      masterNobody: 'Maître : aucun challenger n’a trouvé',
      masterWrong: 'Maître : mauvaise réponse',
      masterNoAnswer: 'Maître : pas de réponse',
      steals: 'vole {{points}} au maître en fin de manche',
      stolen: 'se fait voler {{points}} en fin de manche',
    },
  },
  awards: {
    roundEnd: 'Fin de manche',
    none: 'Aucune récompense cette fois',
    continue: 'Continuer',
    next: 'Suivant',
    plusViteQueSonOmbre: {
      label: 'Plus vite que son ombre',
      description: 'Le plus rapide à bien répondre, devant le maître : il lui vole 200 points par question.',
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
      text: "Tout le monde répond sur son téléphone. Une bonne réponse vaut 500 points, plus jusqu'à 500 points de rapidité. Une mauvaise réponse fait perdre ce bonus : répondre trop vite, c'est risqué.",
    },
    master: {
      title: 'Le maître de la manche',
      text: "Celui qui a choisi le thème répond aussi, sans marquer ses propres points : s'il trouve, il reçoit la moyenne des points des autres sur la question. Si personne d'autre n'a trouvé, c'est zéro. Et gare à lui : le plus rapide à bien répondre avant lui lui vole 200 points !",
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
