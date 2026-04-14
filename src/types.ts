export type UserRole = 'admin' | 'user';
export type UserCategory = 'A' | 'B' | 'C' | 'D';
export type SubscriptionType = 'monthly' | 'yearly';

export interface UserProfile {
  uid: string;
  name: string;
  fatherName?: string;
  motherName?: string;
  dob: string;
  religion?: string;
  profession?: string;
  address: string;
  bloodGroup?: string;
  maritalStatus?: string;
  nid?: string;
  subscriptionAmount?: number;
  subscriptionType?: SubscriptionType;
  mobileNo: string;
  fbId?: string;
  joinDate: string;
  category: UserCategory;
  email: string;
  role: UserRole;
  status: 'active' | 'blocked';
  totalContribution: number;
  contributionVisibility: boolean;
  photoURL?: string;
  isProfileComplete: boolean;
}

export interface AdminNotice {
  id: string;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'urgent';
  createdAt: string;
  active: boolean;
}

export interface FundTransaction {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  paymentMethod?: 'bkash' | 'nagad' | 'rocket' | 'cash';
  transactionId?: string;
  status: 'pending' | 'approved' | 'rejected';
  date: string;
  description?: string;
  fbLink?: string;
}

export interface Poll {
  id: string;
  question: string;
  options: { text: string; votes: number }[];
  votedBy: string[]; // List of UIDs
  createdAt: string;
  active: boolean;
}

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  fbLink?: string;
  thumbnail?: string;
  reacts: { [uid: string]: string }; // uid: emoji
  comments: Comment[];
  createdAt: string;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: string;
}

export interface AdminMessage {
  id: string;
  userId: string;
  userName: string;
  message: string;
  reply?: string;
  status: 'open' | 'replied';
  createdAt: string;
}

export interface AppSettings {
  bkashNo: string;
  nagadNo: string;
  rocketNo: string;
  totalFund: number;
  totalExpense: number;
}
