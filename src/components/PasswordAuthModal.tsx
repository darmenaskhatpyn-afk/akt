import React, { useState } from 'react';
import { Lock, KeyRound, AlertCircle, X, Eye, EyeOff, ShieldCheck, LogOut } from 'lucide-react';

interface PasswordAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  isEditor: boolean;
  onLoginSuccess: () => void;
  onLogout: () => void;
}

export const PasswordAuthModal: React.FC<PasswordAuthModalProps> = ({
  isOpen,
  onClose,
  isEditor,
  onLoginSuccess,
  onLogout,
}) => {
  const [inputPassword, setInputPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  React.useEffect(() => {
    if (isOpen) {
      setInputPassword('');
      setErrorMsg('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    // Құпиясөз тек қана 8888
    if (inputPassword.trim() === '8888') {
      onLoginSuccess();
      setErrorMsg('');
      onClose();
    } else {
      setErrorMsg('Құпиясөз қате!');
    }
  };

  return (
    <div
      id="password-auth-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-6 text-neutral-200 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                isEditor ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
              }`}
            >
              {isEditor ? <ShieldCheck className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {isEditor ? 'Редактор режимі' : 'Кіру'}
              </h2>
              <p className="text-xs text-neutral-400">
                {isEditor ? 'Өзгерту құқығы қосулы' : 'Құпиясөзді енгізіңіз'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Қазір редактор болса */}
        {isEditor ? (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs">
              Сіз сайтты өзгерту режиміндесіз. Файлдарды жүктей аласыз және профильді өңдей аласыз.
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-neutral-800 text-neutral-300 text-xs font-semibold"
              >
                Жабу
              </button>
              <button
                type="button"
                onClick={() => {
                  onLogout();
                  onClose();
                }}
                className="px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Шығу</span>
              </button>
            </div>
          </div>
        ) : (
          /* Құпиясөз енгізу формасы - ешқандай артық подсказкасыз тек құпиясөз өрісі */
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-neutral-300">
                Құпиясөз:
              </label>

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoFocus
                  placeholder="Құпиясөзді жазыңыз"
                  value={inputPassword}
                  onChange={(e) => {
                    setInputPassword(e.target.value);
                    setErrorMsg('');
                  }}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-3.5 pr-10 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {errorMsg && (
                <div className="text-xs text-red-400 flex items-center gap-1.5 pt-1">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold transition-colors cursor-pointer"
              >
                Болдырмау
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-lg shadow-amber-500/20"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Кіру</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
