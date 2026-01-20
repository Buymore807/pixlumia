
import { Product } from './types';

export const PRODUCTS: Product[] = [
  {
    id: 'test-0',
    title: 'Poster de Test (Gratuit)',
    category: 'Perso',
    price: 0,
    image: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=1000&auto=format&fit=crop',
    description: 'Produit spécial pour tester le tunnel de commande sans frais.',
    rating: 5.0,
    featured: false,
    isCustom: true // On utilise ce flag pour forcer la gratuité dans App.tsx
  },
  {
    id: '1',
    title: 'Inception',
    category: 'Films',
    price: 0,
    image: 'https://m.media-amazon.com/images/I/912AErFSBHL._AC_SL1500_.jpg',
    description: 'Affiche officielle du chef-d\'œuvre de Christopher Nolan.',
    rating: 4.9,
    featured: true
  },
  {
    id: '2',
    title: 'Dune: Part Two',
    category: 'Films',
    price: 0,
    image: 'https://m.media-amazon.com/images/I/818vY3A7S2L._AC_SL1500_.jpg',
    description: 'Le blockbuster épique de Denis Villeneuve.',
    rating: 4.8,
    featured: true
  },
  {
    id: '3',
    title: 'The Last of Us',
    category: 'Séries',
    price: 0,
    image: 'https://m.media-amazon.com/images/I/81p1+l5XWLL._AC_SL1500_.jpg',
    description: 'L\'affiche officielle de la série HBO.',
    rating: 4.9
  },
  {
    id: '4',
    title: 'Arcane',
    category: 'Séries',
    price: 0,
    image: 'https://m.media-amazon.com/images/I/71W17f7P29L._AC_SL1000_.jpg',
    description: 'L\'art visuel révolutionnaire de Fortiche.',
    rating: 5.0,
    featured: true
  }
];
