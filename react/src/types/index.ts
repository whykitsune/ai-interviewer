export interface User {
  id: number;
  username: string;
  email: string;
  resume_path: string | null;
  role: 'user' | 'admin';
}

export interface Message {
  role: 'user' | 'ai';
  content: string;
  timestamp?: string;
}

export interface Interview {
  id: number;
  topic: string;
  level: string;
  is_finished: boolean;
  feedback: string | null;
  created_at: string;
  messages: Message[];
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface ApiError {
  detail: string;
}

export interface PaginatedInterviews {
    total: number;
    page: number;
    size: number;
    items: Interview[];
}