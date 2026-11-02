import type { Language } from './types';

// Fake themes that scroll past on the final question's slot machine, mixed with the themes played in the game.
export const DECOY_THEMES: Record<Language, readonly string[]> = {
  fr: [
    'Les capitales d’Océanie',
    'Les chats célèbres',
    'Le Moyen Âge',
    'Les dinosaures',
    'Le disco',
    'Les pirates',
    'La Belgique',
    'Les jeux vidéo rétro',
    'L’espace',
    'Les fromages qui puent',
    'Les années 80',
    'Les records du monde',
  ],
  en: [
    'Capitals of Oceania',
    'Famous cats',
    'The Middle Ages',
    'Dinosaurs',
    'Disco',
    'Pirates',
    'Belgium',
    'Retro video games',
    'Outer space',
    'Smelly cheeses',
    'The 80s',
    'World records',
  ],
};
