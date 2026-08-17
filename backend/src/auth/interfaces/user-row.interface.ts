export interface UserRow {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  avatar_url: string | null;
  fallback_initials: string | null;
  is_guest: boolean;
  created_at: Date;
}