export interface Sample {
  id: number;
  title: string;
  description?: string;
  status: 'published' | 'draft' | 'deleted' | string;
  impurities_percent?: number;
  gas_volume?: number;
  likes: number;
  image_url: string;
  video_url: string;
  created_at: string;
  formation_date?: string | null;
  creator_id?: number;
  is_creator?: number; // 1 - автор текущий пользователь (можно удалять), 0 - гость или чужой образец
  is_liked?: number;   // 1 - лайкнуто текущим пользователем, 0 - нет
  isDraft?: boolean;
}

export interface SampleFilterOptions {
  searchQuery: string;
  gasVolumeMin?: number;
  gasVolumeMax?: number;
  impuritiesMax?: number;
  status?: string;
  sortBy?: 'id' | 'title' | 'gas_volume' | 'impurities_percent' | 'likes';
  sortOrder?: 'asc' | 'desc';
}

export interface AuthUser {
  id: number;
  username: string;
  email: string;
}
