import type { CharacterAppearance, HairStyle } from '@shared/index';

export const DEFAULT_APPEARANCE: CharacterAppearance = {
  name: 'Arin',
  farmName: 'Willowbrook',
  skinColor: '#f4c7a1',
  hairStyle: 'classic',
  hairColor: '#5a3825',
  shirtColor: '#4d923d',
  pantsColor: '#3b5b8a',
};

export const SKIN_TONES = [
  { label: 'Porcelain', value: '#fce0c9' },
  { label: 'Warm Peach', value: '#f4c7a1' },
  { label: 'Honey', value: '#dfa475' },
  { label: 'Caramel', value: '#b87648' },
  { label: 'Chestnut', value: '#87502c' },
  { label: 'Espresso', value: '#5c331a' },
];

export const HAIR_STYLES: { label: string; value: HairStyle }[] = [
  { label: 'Classic', value: 'classic' },
  { label: 'Spiky', value: 'spiky' },
  { label: 'Long', value: 'long' },
  { label: 'Bob', value: 'bob' },
];

export const HAIR_COLORS = [
  { label: 'Walnut', value: '#5a3825' },
  { label: 'Raven', value: '#232026' },
  { label: 'Golden', value: '#d9a441' },
  { label: 'Copper', value: '#b84a27' },
  { label: 'Forest', value: '#2f6e49' },
  { label: 'Sky', value: '#3b7bb8' },
  { label: 'Sakura', value: '#d6789c' },
  { label: 'Silver', value: '#c9d1d9' },
];

export const SHIRT_COLORS = [
  { label: 'Meadow Green', value: '#4d923d' },
  { label: 'Barn Red', value: '#c04438' },
  { label: 'River Blue', value: '#3a72b0' },
  { label: 'Sunflower', value: '#d99f2b' },
  { label: 'Lavender', value: '#845ec2' },
  { label: 'Cream Linen', value: '#e6dcc8' },
];

export const PANTS_COLORS = [
  { label: 'Denim', value: '#3b5b8a' },
  { label: 'Earth Brown', value: '#6b472b' },
  { label: 'Charcoal', value: '#363940' },
  { label: 'Olive', value: '#4c5e3a' },
  { label: 'Burgundy', value: '#6e2c3a' },
];
