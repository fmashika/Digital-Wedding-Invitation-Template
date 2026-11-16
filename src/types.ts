export type MealChoice =
  | 'Sonoran Herb-Crusted Sea Bass'
  | 'Braised Beef Short Rib'
  | 'Charred Cauliflower Steak'
  | 'Not Attending';

export type CheckInStatus = 'pending' | 'checked_in';

export interface RsvpRecord {
  id: string;
  passCode: string;
  guestName: string;
  email: string;
  attending: boolean;
  partySize: number;
  additionalGuests: string;
  mealChoice: MealChoice;
  dietaryNotes: string;
  songRequest: string;
  tableAssignment: string;
  checkInStatus: CheckInStatus;
  checkedInAt: string | null;
  createdAt: string;
}

export type RegistryCategory =
  | 'Honeymoon'
  | 'Home & Kitchen'
  | 'Dining'
  | 'Experiences';

export interface RegistryItem {
  id: string;
  title: string;
  category: RegistryCategory;
  description: string;
  goalAmount: number;
  raisedAmount: number;
  imageUrl: string;
  featured: boolean;
}

export type PaymentMethod = 'Card' | 'Apple Pay' | 'Zelle' | 'Bank Transfer';

export interface GiftContribution {
  id: string;
  referenceCode: string;
  itemId: string;
  itemTitle: string;
  contributorName: string;
  contributorEmail: string;
  amount: number;
  paymentMethod: PaymentMethod;
  accountSummary: string;
  note: string;
  createdAt: string;
}

export interface WeddingDatabase {
  rsvps: RsvpRecord[];
  registryItems: RegistryItem[];
  contributions: GiftContribution[];
}
