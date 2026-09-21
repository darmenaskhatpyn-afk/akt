import React from 'react';
import { UploadCloud, FileText, GraduationCap, User, Mail, Settings, Lock } from 'lucide-react';
import { StudentProfile } from '../types';

interface HeroProps {
  onExploreAbout: () => void;
  onExplorePractical: () => void;
  onExploreIndependent: () => void;
  onExploreContact: () => void;
  onOpenUpload: () => void;
  onOpenProfileEdit: () => void;
  onOpenAuthModal: () => void;
  practicalCount: number;
  independentCount: number;
  profile: StudentProfile;
  isEditor: boolean;
}

export const Hero: React.FC<HeroProps> = ({
  onExploreAbout,
  onExplorePractical,
  onExploreIndependent,
  onExploreContact,
  onOpenUpload,
  onOpenProfileEdit,
  onOpenAuthModal,
  practicalCount,
  independentCount,
  profile,
  isEditor,
}) => {
  return (
    <section className="relative overflow-hidden pt-10 pb-12 border-b border-neutral-800 bg-neutral-950">
      {/* Background radial glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full overflow-hidden pointer-events-none opacity-20">
        <div className="absolute -top-32 left-1/4 w-96 h-96 bg-amber-500/30 rounded-full blur-3xl" />
        <div className="absolute -top-32 right-1/4 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          {/* Left: Student Profile Card & Title */}
          <div className="flex items-center gap-5 text-left">
            <div className="relative group">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border border-neutral-700 ring-4 ring-amber-500/20 shadow-2xl flex-shrink-0">
                <img
                  src={profile.photoUrl}
                  alt={profile.fullName}
                  className="w-full h-full object-cover object-top"
                  referrerPolicy="no-referrer"
                />
              </div>
              {isEditor && (
                <button
                  onClick={onOpenProfileEdit}
                  title="Фото немесе мәліметті өзгерту"
                  className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 rounded-2xl flex items-center justify-center text-amber-400 text-xs font-bold transition-opacity cursor-pointer"
                >
                  <Settings className="w-5 h-5" />
                </button>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs font-semibold text-amber-400">
                <span>{profile.university.name} • {profile.university.group}</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
                <span>{profile.fullName}</span>
                {isEditor && (
                  <button
                    onClick={onOpenProfileEdit}
                    title="Профильді өңдеу"
                    className="text-neutral-500 hover:text-amber-400 transition-colors p-1 rounded-lg"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                )}
              </h1>

              <p className="text-xs sm:text-sm text-neutral-400">
                Ақпараттық-коммуникациялық технологиялар (АҚТ) электронды портфолиосы • <span className="text-neutral-300 font-medium">{profile.city}</span>
              </p>
            </div>
          </div>

          {/* Right: Primary Action Buttons */}
          <div className="flex flex-wrap items-center justify-center lg:justify-end gap-3 w-full lg:w-auto">
            {/* Direct Upload Button (Тек редактор болғанда немесе пароль сұрайды) */}
            <button
              id="hero-upload-direct-btn"
              onClick={isEditor ? onOpenUpload : onOpenAuthModal}
              className="px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer hover:scale-[1.02]"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Файл салу</span>
            </button>

            {/* Профильді өзгерту батырмасы */}
            {isEditor ? (
              <button
                id="hero-profile-edit-btn"
                onClick={onOpenProfileEdit}
                className="px-4 py-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-amber-400 hover:text-amber-300 border border-amber-500/30 font-semibold text-xs flex items-center gap-2 transition-all cursor-pointer"
              >
                <Settings className="w-4 h-4" />
                <span>Профильді өзгерту</span>
              </button>
            ) : (
              <button
                id="hero-login-btn"
                onClick={onOpenAuthModal}
                className="px-4 py-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800 font-semibold text-xs flex items-center gap-2 transition-all cursor-pointer"
              >
                <Lock className="w-4 h-4 text-amber-400" />
                <span>Өзгерту үшін кіру</span>
              </button>
            )}

            <button
              id="hero-about-btn"
              onClick={onExploreAbout}
              className="px-4 py-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800 font-semibold text-xs flex items-center gap-2 transition-all cursor-pointer"
            >
              <User className="w-4 h-4 text-amber-400" />
              <span>Мен туралы</span>
            </button>

            <button
              id="hero-practical-btn"
              onClick={onExplorePractical}
              className="px-4 py-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800 font-semibold text-xs flex items-center gap-2 transition-all cursor-pointer"
            >
              <FileText className="w-4 h-4 text-teal-400" />
              <span>Практикалық ({practicalCount})</span>
            </button>

            <button
              id="hero-independent-btn"
              onClick={onExploreIndependent}
              className="px-4 py-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800 font-semibold text-xs flex items-center gap-2 transition-all cursor-pointer"
            >
              <GraduationCap className="w-4 h-4 text-orange-400" />
              <span>Өзіндік жұмыс ({independentCount})</span>
            </button>

            <button
              id="hero-contact-btn"
              onClick={onExploreContact}
              className="px-4 py-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800 font-semibold text-xs flex items-center gap-2 transition-all cursor-pointer"
            >
              <Mail className="w-4 h-4 text-amber-400" />
              <span>Байланыс</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
