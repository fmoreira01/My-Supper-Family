
export enum AppView {
  DASHBOARD = 'DASHBOARD',
  FINANCE = 'FINANCE',
  FITNESS = 'FITNESS',
  HOME = 'HOME',
  ADMIN = 'ADMIN',
  MARKETPLACE = 'MARKETPLACE'
}

export type Language = 'en' | 'pt';

export interface Expense {
  id: string;
  category: string;
  amount: number;
  date: string;
  description: string;
  isRecurring?: boolean;
  frequency?: 'weekly' | 'monthly';
  lastProcessedDate?: string;
}

export interface Workout {
  id: string;
  type: string;
  duration: number; // minutes
  date: string;
  calories: number;
}

export interface FitnessGoals {
  dailyCalories: number;
  dailyDuration: number;
}

export interface HomeTask {
  id: string;
  title: string;
  category: 'Cleaning' | 'Laundry' | 'Kitchen' | 'Garden' | 'Maintenance';
  assignedTo: string;
  dueDate: string;
  status: 'pending' | 'completed';
}

export interface MiniApp {
  id: AppView;
  name: string;
  description: string;
  icon: string;
  color: string;
  status: 'active' | 'installed' | 'available';
}
