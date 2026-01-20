
export type Category = 'Films' | 'Séries' | 'Jeux Vidéo' | 'Anime' | 'Perso';

export type PosterFormat = 'A4' | 'A3' | '40x60cm' | '50x70cm' | '60x90cm';

export const FORMAT_DETAILS: Record<PosterFormat, { label: string, price: number }> = {
  'A4': { label: 'A4 (21 × 29,7 cm)', price: 4.90 },
  'A3': { label: 'A3 (29,7 × 42 cm)', price: 5.90 },
  '40x60cm': { label: '40 × 60 cm', price: 9.90 },
  '50x70cm': { label: '50 × 70 cm', price: 12.90 },
  '60x90cm': { label: '60 × 90 cm', price: 19.90 }
};

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  address?: string;
  city?: string;
  zipCode?: string;
  phone?: string;
}

export interface RelayPoint {
  id: string;
  name: string;
  address: string;
  city: string;
  zipCode: string;
  distance: string;
}

export interface Order {
  id: string;
  date: string;
  items: CartItem[];
  total: number;
  status: 'En attente' | 'En préparation' | 'Expédié' | 'Livré';
  deliveryType: 'Mondial Relay' | 'Domicile';
  deliveryInfo: RelayPoint | string;
}

export interface Product {
  id: string;
  title: string;
  category: Category;
  price: number; 
  image: string;
  description: string;
  rating: number;
  featured?: boolean;
  isCustom?: boolean;
}

export interface CartItem extends Product {
  quantity: number;
  selectedFormat: PosterFormat;
  finalPrice: number;
}
