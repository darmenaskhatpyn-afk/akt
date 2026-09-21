export type TaskCategory = 'practical' | 'independent';

export type TaskFormat = 'canva' | 'pptx' | 'gdoc' | 'wix' | 'interactive' | 'pdf' | 'word' | 'zip' | 'file';

export interface TaskItem {
  id: string;
  number: number;
  category: TaskCategory;
  title: string;
  subtitle?: string;
  topic: string;
  description: string;
  format: TaskFormat;
  formatLabel: string;
  link: string;
  imageUrl: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: string;
  badge?: string;
  date?: string;
  objectives?: string[];
  keyPoints?: string[];
  isCustom?: boolean;
}

export interface StudentProfile {
  fullName: string;
  birthDate: string;
  city: string;
  title: string;
  school: {
    name: string;
    year: string;
    achievement: string;
  };
  university: {
    name: string;
    faculty: string;
    year: string;
    specialty: string;
    group: string;
    role: string;
  };
  courseName: string;
  photoUrl: string;
  bannerUrl: string;
  skills: { name: string; level: number }[];
  contacts: {
    email: string;
    phone: string;
    instagram?: string;
    tiktok?: string;
    youtube?: string;
    cityLocation?: string;
  };
}

export interface FeedbackEntry {
  id: string;
  senderName: string;
  role: string;
  rating: number;
  message: string;
  createdAt: string;
}
