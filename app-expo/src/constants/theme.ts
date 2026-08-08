// Palette portée depuis l'ancienne page statique (index.html), simplifiée pour
// un reskin léger plutôt qu'une reproduction pixel-perfect.
export const Colors = {
  paper: '#f2ede2',
  paperElement: '#e8e0cf',
  ink: '#2a2420',
  inkSoft: '#55483d',
  burgundy: '#7a2e2e',
  burgundyDeep: '#5c2222',
  gold: '#a9812f',
  green: '#3f6b3a',
  greenBg: '#e3ecdd',
  red: '#a13a2f',
  redBg: '#f3e0dc',
  rule: '#c9bda3',
} as const;

export const Fonts = {
  display: 'Fraunces_700Bold',
  displayMedium: 'Fraunces_600SemiBold',
  mono: 'JetBrainsMono_400Regular',
  monoMedium: 'JetBrainsMono_500Medium',
  serif: 'serif', // police système : texte courant (définitions, options)
} as const;

export const Spacing = {
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
} as const;

export const Radius = 8;
export const MaxContentWidth = 640;
