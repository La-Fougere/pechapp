export type Language = 'fr' | 'en';

export interface UserState {
  isLoggedin: boolean;
  username?: string;
  darkMode: boolean;
  hasSeenTutorial: boolean;
  loading: boolean;
  language: Language;
}
