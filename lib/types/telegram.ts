// Telegram WebApp User Types

export type TelegramUser = {
  id: number;
  firstName: string;
  lastName?: string;
  username?: string;
  languageCode?: string;
  isPremium?: boolean;
  photoUrl?: string;
  allowsWriteToPm?: boolean;
  addedToAttachmentMenu?: boolean;
};

export type DatabaseUser = {
  id: number;
  first_name: string;
  last_name: string | null;
  username: string | null;
  language_code: string | null;
  is_premium: boolean;
  is_bot: boolean;
  photo_url: string | null;
  added_to_attachment_menu: boolean;
  allows_write_to_pm: boolean;
  created_at: Date;
  updated_at: Date;
  last_login: Date;
};

export type AuthResponse = {
  success: boolean;
  user?: {
    id: number;
    firstName: string;
    lastName?: string;
    username?: string;
    isNew: boolean;
  };
  error?: string;
};



