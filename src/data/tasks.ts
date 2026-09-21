import { StudentProfile, TaskItem } from '../types';

export const studentProfile: StudentProfile = {
  fullName: "Әзірбай Мереке",
  birthDate: "2007 жыл",
  city: "Шымкент қаласы",
  title: "Студент",
  school: {
    name: "Шымкент қаласының мектебі",
    year: "2025",
    achievement: "Мектептің үздік түлегі",
  },
  university: {
    name: "Абай атындағы ҚазҰПУ",
    faculty: "МФжИ (Математика, физика және информатика факультеті)",
    year: "2 курс студенті",
    specialty: "Математика педагогикасы мамандығы",
    group: "МОК-251 тобы",
    role: "Студент",
  },
  courseName: "Ақпараттық-Коммуникациялық Технологиялар (АҚТ)",
  photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop",
  bannerUrl: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=1200&auto=format&fit=crop",
  skills: [
    { name: "Canva & Презентация дизайны", level: 95 },
    { name: "MS Office & PowerPoint", level: 90 },
    { name: "Google Workspace құралдары", level: 92 },
    { name: "Сандық білім беру құралдары", level: 85 },
    { name: "Интерактивті оқыту әдістері", level: 90 },
  ],
  contacts: {
    email: "mereke.azirbai@mail.kz",
    phone: "+7 (775) 000-00-00",
    instagram: "https://instagram.com",
    tiktok: "https://tiktok.com",
    youtube: "https://youtube.com",
    cityLocation: "Шымкент, Қазақстан",
  },
};

export const practicalTasks: TaskItem[] = [];
export const independentTasks: TaskItem[] = [];
