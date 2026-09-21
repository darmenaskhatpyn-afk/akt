import React, { useState } from 'react';
import { BookOpen, User, GraduationCap, FileText, Menu, X, PlusCircle, Search, Mail, Settings, Lock, ShieldCheck } from 'lucide-react';
import { StudentProfile } from '../types';

export type NavTab = 'home' | 'about' | 'practical' | 'independent' | 'contact';

interface NavbarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  searchQuery?: string;
  setSearchQuery?: (query: string) => void;
  onOpenUpload: () => void;
  onOpenProfileEdit: () => void;
  profile: StudentProfile;
  isEditor: boolean;
  onOpenAuthModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  searchQuery = '',
  setSearchQuery,
  onOpenUpload,
  onOpenProfileEdit,
  profile,
  isEditor,
  onOpenAuthModal,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: {
    id: NavTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    { id: 'home', label: 'Басты бет', icon: BookOpen },
    { id: 'about', label: 'Мен туралы', icon: User },
    { id: 'practical', label: 'Практикалық тапсырмалар', icon: FileText },
    { id: 'independent', label: 'Өзіндік жұмыс (СРСП)', icon: GraduationCap },
    { id: 'contact', label: 'Байланыс', icon: Mail },
  ];

  return (
    <header className="sticky top-0 z-40 bg-neutral-950/95 backdrop-blur-md border-b border-neutral-800 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Student info */}
          <button
            id="nav-logo-btn"
            onClick={() => {
              setActiveTab('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-3 text-left group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl overflow-hidden border border-neutral-700 ring-2 ring-amber-500/20 group-hover:ring-amber-500/50 transition-all flex-shrink-0">
              <img
                src={profile.photoUrl}
                alt={profile.fullName}
                className="w-full h-full object-cover object-top"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="text-sm sm:text-base font-bold text-white tracking-tight group-hover:text-amber-400 transition-colors">
                {profile.fullName}
              </div>
              <p className="text-[11px] sm:text-xs text-neutral-400 font-medium">
                АҚТ Портфолиосы
              </p>
            </div>
          </button>

          {/* Center Navigation Tabs */}
          <nav className="hidden lg:flex items-center gap-1 bg-neutral-900/90 p-1.5 rounded-2xl border border-neutral-800">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-item-${item.id}`}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-amber-500 text-neutral-950 font-bold shadow-md'
                      : 'text-neutral-300 hover:text-white hover:bg-neutral-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Actions: Search + Auth Lock + Profile + Direct Upload Button */}
          <div className="hidden sm:flex items-center gap-2">
            {setSearchQuery && (
              <div className="relative w-36 xl:w-44">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Тапсырма іздеу..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500"
                />
              </div>
            )}

            {/* Auth / Editor Mode Indicator Button */}
            <button
              id="auth-mode-btn"
              onClick={onOpenAuthModal}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                isEditor
                  ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                  : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white border-neutral-800'
              }`}
              title={isEditor ? 'Редактор режимі белсенді (Басып басқару)' : 'Құпиясөзбен редактор ретінде кіру'}
            >
              {isEditor ? <ShieldCheck className="w-4 h-4 text-emerald-400" /> : <Lock className="w-4 h-4 text-amber-400" />}
              <span>{isEditor ? 'Редактор' : 'Кіру'}</span>
            </button>

            {/* Profile Edit button (Тек редактор болғанда белсенді немесе пароль сұрайды) */}
            {isEditor && (
              <button
                id="edit-profile-btn"
                onClick={onOpenProfileEdit}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-neutral-300 hover:text-white bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 transition-all cursor-pointer"
                title="Жеке профильді өзгерту"
              >
                <Settings className="w-4 h-4 text-amber-400" />
                <span>Профиль</span>
              </button>
            )}

            {/* Direct Upload Button (Тек редактор болғанда немесе басқанда пароль сұрайды) */}
            <button
              id="direct-upload-file-btn"
              onClick={isEditor ? onOpenUpload : onOpenAuthModal}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-neutral-950 bg-amber-500 hover:bg-amber-400 transition-all cursor-pointer shadow-md shadow-amber-500/20"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Файл салу</span>
            </button>
          </div>

          {/* Mobile Actions */}
          <div className="flex lg:hidden items-center gap-1.5">
            <button
              onClick={onOpenAuthModal}
              className={`p-2 rounded-lg border ${
                isEditor
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : 'bg-neutral-900 text-amber-400 border-neutral-800'
              }`}
              title={isEditor ? 'Редактор' : 'Кіру'}
            >
              {isEditor ? <ShieldCheck className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
            </button>

            {isEditor && (
              <button
                onClick={onOpenProfileEdit}
                className="p-2 rounded-lg text-neutral-300 hover:text-white bg-neutral-900 border border-neutral-800"
                title="Профиль"
              >
                <Settings className="w-4 h-4 text-amber-400" />
              </button>
            )}

            <button
              onClick={isEditor ? onOpenUpload : onOpenAuthModal}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-neutral-950 bg-amber-500"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Файл</span>
            </button>

            <button
              id="mobile-menu-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-neutral-300 hover:text-white bg-neutral-900 border border-neutral-800"
              aria-label="Мәзір"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-neutral-800 bg-neutral-950 px-4 py-3 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-xs font-semibold ${
                  isActive ? 'bg-amber-500 text-neutral-950 font-bold' : 'text-neutral-300 hover:bg-neutral-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
