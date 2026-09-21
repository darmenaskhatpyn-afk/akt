import React, { useState, useRef } from 'react';
import {
  User,
  Camera,
  MapPin,
  Mail,
  Phone,
  GraduationCap,
  Award,
  BookOpen,
  Save,
  CheckCircle2,
  X,
  RotateCcw,
  Sparkles,
  Link as LinkIcon,
} from 'lucide-react';
import { StudentProfile } from '../types';

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: StudentProfile;
  onSave: (updatedProfile: StudentProfile) => void;
}

export const ProfileEditModal: React.FC<ProfileEditModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSave,
}) => {
  const [formData, setFormData] = useState<StudentProfile>(profile);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (isOpen) {
      setFormData(profile);
      setSavedSuccess(false);
    }
  }, [isOpen, profile]);

  if (!isOpen) return null;

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          photoUrl: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  const handleResetToDefault = () => {
    if (confirm('Барлық мәліметтерді бастапқы қалпына келтіргіңіз келе ме?')) {
      const defaultState: StudentProfile = {
        fullName: 'Әзірбай Мереке',
        birthDate: '2007 жыл',
        city: 'Шымкент қаласы',
        title: 'Студент',
        school: {
          name: 'Шымкент қаласының мектебі',
          year: '2025',
          achievement: 'Мектептің үздік түлегі',
        },
        university: {
          name: 'Абай атындағы ҚазҰПУ',
          faculty: 'МФжИ (Математика, физика және информатика факультеті)',
          year: '2 курс студенті',
          specialty: 'Математика педагогикасы мамандығы',
          group: 'МОК-251 тобы',
          role: 'Студент',
        },
        courseName: 'Ақпараттық-Коммуникациялық Технологиялар (АҚТ)',
        photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop',
        bannerUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=1200&auto=format&fit=crop',
        skills: [
          { name: 'Canva & Презентация дизайны', level: 95 },
          { name: 'MS Office & PowerPoint', level: 90 },
          { name: 'Google Workspace құралдары', level: 92 },
          { name: 'Сандық білім беру құралдары', level: 85 },
          { name: 'Интерактивті оқыту әдістері', level: 90 },
        ],
        contacts: {
          email: 'mereke.azirbai@mail.kz',
          phone: '+7 (775) 000-00-00',
          instagram: 'https://instagram.com',
          tiktok: 'https://tiktok.com',
          youtube: 'https://youtube.com',
          cityLocation: 'Шымкент, Қазақстан',
        },
      };
      setFormData(defaultState);
    }
  };

  return (
    <div
      id="profile-edit-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 my-8 text-neutral-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Жеке профильді өзгерту</h2>
              <p className="text-xs text-neutral-400">
                Өзіңіз туралы барлық ақпаратты, фотосуретті және байланысты жаңартыңыз
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Alert */}
        {savedSuccess && (
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>Барлық мәліметтер сәтті сақталды және сайтта жаңартылды!</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 1. Photo Avatar Section */}
          <div className="p-4 rounded-2xl bg-neutral-950/70 border border-neutral-800 flex flex-col sm:flex-row items-center gap-5">
            <div className="relative group">
              <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-neutral-700 shadow-xl ring-2 ring-amber-500/20 flex-shrink-0">
                <img
                  src={formData.photoUrl}
                  alt={formData.fullName}
                  className="w-full h-full object-cover object-top"
                  referrerPolicy="no-referrer"
                />
              </div>
              <button
                type="button"
                onClick={() => photoInputRef.current?.click()}
                className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity flex flex-col items-center justify-center text-amber-400 text-[10px] font-bold cursor-pointer"
              >
                <Camera className="w-5 h-5 mb-1" />
                <span>Өзгерту</span>
              </button>
              <input
                ref={photoInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </div>

            <div className="space-y-2 flex-1 text-center sm:text-left w-full">
              <div className="text-xs font-bold text-white">Профиль фотосуреті</div>
              <p className="text-[11px] text-neutral-400">
                Компьютер немесе телефоннан фото таңдаңыз немесе сурет сілтемесін (URL) қойыңыз
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => photoInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold cursor-pointer border border-neutral-700"
                >
                  Файлдан фото жүктеу
                </button>
                <input
                  type="url"
                  placeholder="Немесе фотоның URL сілтемесі..."
                  value={formData.photoUrl.startsWith('data:') ? '' : formData.photoUrl}
                  onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
                  className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          {/* 2. Main Identity Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-300">
                Аты-жөніңіз (Толық):
              </label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                placeholder="Мысалы: Әзірбай Мереке"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-300">
                Қаласы:
              </label>
              <input
                type="text"
                required
                value={formData.city}
                onChange={(e) => {
                  const val = e.target.value;
                  setFormData({
                    ...formData,
                    city: val,
                    contacts: { ...formData.contacts, cityLocation: `${val}, Қазақстан` },
                  });
                }}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                placeholder="Мысалы: Шымкент қаласы"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-300">
                Университет атауы:
              </label>
              <input
                type="text"
                value={formData.university.name}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    university: { ...formData.university, name: e.target.value },
                  })
                }
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-300">
                Факультет:
              </label>
              <input
                type="text"
                value={formData.university.faculty}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    university: { ...formData.university, faculty: e.target.value },
                  })
                }
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-300">
                Мамандығы:
              </label>
              <input
                type="text"
                value={formData.university.specialty}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    university: { ...formData.university, specialty: e.target.value },
                  })
                }
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-300">
                Тобы және курс:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.university.group}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      university: { ...formData.university, group: e.target.value },
                    })
                  }
                  className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  placeholder="МОК-251"
                />
                <input
                  type="text"
                  value={formData.university.year}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      university: { ...formData.university, year: e.target.value },
                    })
                  }
                  className="w-32 bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  placeholder="2 курс"
                />
              </div>
            </div>
          </div>

          {/* 3. Contacts Information */}
          <div className="p-4 rounded-2xl bg-neutral-950/70 border border-neutral-800 space-y-3">
            <div className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5" />
              <span>Байланыс деректері</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] text-neutral-400">Электронды пошта (E-mail):</label>
                <input
                  type="email"
                  value={formData.contacts.email}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      contacts: { ...formData.contacts, email: e.target.value },
                    })
                  }
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-neutral-400">Телефон / WhatsApp:</label>
                <input
                  type="text"
                  value={formData.contacts.phone}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      contacts: { ...formData.contacts, phone: e.target.value },
                    })
                  }
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-neutral-400">Instagram сілтемесі:</label>
                <input
                  type="text"
                  value={formData.contacts.instagram || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      contacts: { ...formData.contacts, instagram: e.target.value },
                    })
                  }
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  placeholder="https://instagram.com/..."
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-neutral-400">Telegram сілтемесі:</label>
                <input
                  type="text"
                  value={formData.contacts.tiktok || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      contacts: { ...formData.contacts, tiktok: e.target.value },
                    })
                  }
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  placeholder="https://t.me/..."
                />
              </div>
            </div>
          </div>

          {/* 4. Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-neutral-800">
            <button
              type="button"
              onClick={handleResetToDefault}
              className="text-xs text-neutral-400 hover:text-red-400 flex items-center gap-1.5 transition-colors cursor-pointer py-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Бастапқы күйге қайтару</span>
            </button>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold transition-all cursor-pointer"
              >
                Болдырмау
              </button>
              <button
                type="submit"
                className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Сақтау</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
