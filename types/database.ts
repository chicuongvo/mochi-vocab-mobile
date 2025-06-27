export interface Course {
  id: number;
  title: string;
  subtitle: string;
  description?: string;
  level: string;
  category: string;
  color_start: string;
  color_end: string;
  icon: string;
  estimated_time: number;
  total_words: number;
  created_at: string;
  updated_at: string;
}

export interface Word {
  id: number;
  course_id: number;
  word: string;
  pronunciation: string;
  definition: string;
  example: string;
  difficulty: string;
  synonyms: string[];
  antonyms: string[];
  audio_url?: string;
  order_index: number;
  created_at: string;
}
