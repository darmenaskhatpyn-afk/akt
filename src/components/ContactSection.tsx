import React, { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Instagram, Youtube, Send, Star, MessageSquare, Check, Sparkles, Heart } from 'lucide-react';
import { StudentProfile, FeedbackEntry } from '../types';
import { saveFeedbackToFirebase, subscribeToFeedbacks } from '../lib/firebase';

interface ContactSectionProps {
  profile: StudentProfile;
}

export const ContactSection: React.FC<ContactSectionProps> = ({ profile }) => {
  const [feedbacks, setFeedbacks] = useState<FeedbackEntry[]>(() => {
    try {
      const saved = localStorage.getItem('mereke_portfolio_feedback');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [
      {
        id: 'initial-1',
        senderName: 'АҚТ пәні оқытушысы',
        role: 'Оқытушы',
        rating: 5,
        message: 'Тапсырмалар талапқа сай толық орындалған. Барлық практикалық және өзіндік жұмыстар жүйелі түрде салынған.',
        createdAt: '2026-02-15',
      },
      {
        id: 'initial-2',
        senderName: 'МОК-251 тобының студенті',
        role: 'Студент',
        rating: 5,
        message: 'Мерекенің портфолио сайты өте ыңғайлы жасалған, барлық тапсырмалар анық әрі сапалы көрсетілген!',
        createdAt: '2026-02-18',
      },
    ];
  });

  const [name, setName] = useState('');
  const [role, setRole] = useState('Оқытушы / Студент');
  const [rating, setRating] = useState(5);
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToFeedbacks((remoteFeedbacks) => {
      if (remoteFeedbacks && remoteFeedbacks.length > 0) {
        setFeedbacks(remoteFeedbacks);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;

    const newFeedback: FeedbackEntry = {
      id: Date.now().toString(),
      senderName: name.trim(),
      role,
      rating,
      message: message.trim(),
      createdAt: new Date().toISOString().split('T')[0],
    };

    setFeedbacks([newFeedback, ...feedbacks]);
    setName('');
    setMessage('');
    setSubmitted(true);
    await saveFeedbackToFirebase(newFeedback);
    setTimeout(() => setSubmitted(false), 4000);
  };

  return (
    <section id="contact-section" className="py-12 bg-neutral-950 border-t border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs font-semibold text-amber-400">
            <span>Кері байланыс және бағалау</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Байланыс және пікір қалдыру
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400">
            Студентке кері байланыс беріп, орындалған жұмыстар бойынша бағаңыз бен ұсынысыңызды қалдыра аласыз
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Direct Contacts */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-6 shadow-xl">
              <div>
                <h3 className="text-lg font-bold text-white mb-1">
                  Студентпен байланыс
                </h3>
                <p className="text-xs text-neutral-400">
                  Сұрақтар немесе тапсырмаларды тексеру бойынша:
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3 text-neutral-300">
                  <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400 flex-shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs text-neutral-400">E-mail поштасы:</div>
                    <a href={`mailto:${profile.contacts.email}`} className="font-semibold text-white hover:text-amber-400 transition-colors">
                      {profile.contacts.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3 text-neutral-300">
                  <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400 flex-shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs text-neutral-400">Телефон / WhatsApp:</div>
                    <a href={`tel:${profile.contacts.phone}`} className="font-semibold text-white hover:text-amber-400 transition-colors">
                      {profile.contacts.phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3 text-neutral-300">
                  <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400 flex-shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs text-neutral-400">Орналасқан жері:</div>
                    <div className="font-semibold text-white">
                      {profile.contacts.cityLocation || profile.city}
                    </div>
                  </div>
                </div>
              </div>

              {/* Social Channels */}
              <div className="pt-4 border-t border-neutral-800 space-y-3">
                <div className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                  Әлеуметтік желілер
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={profile.contacts.instagram || 'https://instagram.com'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-xl bg-neutral-800 hover:bg-pink-600/20 text-neutral-300 hover:text-pink-400 border border-neutral-700 transition-colors"
                    title="Instagram"
                  >
                    <Instagram className="w-4 h-4" />
                  </a>
                  <a
                    href={profile.contacts.youtube || 'https://youtube.com'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-xl bg-neutral-800 hover:bg-red-600/20 text-neutral-300 hover:text-red-400 border border-neutral-700 transition-colors"
                    title="YouTube"
                  >
                    <Youtube className="w-4 h-4" />
                  </a>
                  {profile.contacts.tiktok && (
                    <a
                      href={profile.contacts.tiktok}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white border border-neutral-700 text-xs font-semibold transition-colors"
                      title="Telegram / Желі"
                    >
                      Желі
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* University summary card */}
            <div className="p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800/80 space-y-2 text-xs text-neutral-400">
              <div className="text-white font-bold text-sm">
                {profile.university.name}
              </div>
              <div>{profile.university.faculty}</div>
              <div>{profile.university.specialty}, {profile.university.year}, {profile.university.group}</div>
            </div>
          </div>

          {/* Right Column: Feedback Form & Wall */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Feedback Form */}
            <form
              onSubmit={handleSubmit}
              className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4"
            >
              <h3 className="text-lg font-bold text-white flex items-center justify-between">
                <span>Бағалау пікірін қалдыру</span>
                <span className="text-xs font-normal text-amber-400 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  Оқытушылар мен қонақтарға арналған
                </span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="fb-name" className="text-xs font-medium text-neutral-300">
                    Аты-жөніңіз:
                  </label>
                  <input
                    id="fb-name"
                    type="text"
                    required
                    placeholder="Мысалы: Оқытушы немесе студент аты"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="fb-role" className="text-xs font-medium text-neutral-300">
                    Мәртебеңіз:
                  </label>
                  <select
                    id="fb-role"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Оқытушы">Оқытушы / Мұғалім</option>
                    <option value="Студент">Студент / Топтас</option>
                    <option value="Қонақ">Қонақ / Сарапшы</option>
                  </select>
                </div>
              </div>

              {/* Rating selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-neutral-300">
                  Портфолионы бағалау:
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                        rating >= star
                          ? 'border-amber-500/50 bg-amber-500/10 text-amber-400'
                          : 'border-neutral-800 text-neutral-600 hover:text-neutral-400'
                      }`}
                    >
                      <Star className="w-5 h-5 fill-current" />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-amber-400 ml-2">
                    {rating} / 5 жұлдыз
                  </span>
                </div>
              </div>

              {/* Message */}
              <div className="space-y-1.5">
                <label htmlFor="fb-message" className="text-xs font-medium text-neutral-300">
                  Пікір немесе ұсыныс:
                </label>
                <textarea
                  id="fb-message"
                  required
                  rows={3}
                  placeholder="Портфолио туралы пікіріңіз, бағаңыз немесе ұсыныстарыңыз..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                {submitted ? (
                  <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold animate-in fade-in">
                    <Check className="w-4 h-4" />
                    <span>Пікіріңіз сәтті қосылды! Рақмет!</span>
                  </div>
                ) : (
                  <div className="text-[11px] text-neutral-500">
                    Пікір бірден сайтқа қосылады
                  </div>
                )}

                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-md shadow-amber-500/20"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Жіберу</span>
                </button>
              </div>
            </form>

            {/* Feedback List */}
            <div className="space-y-3">
              <div className="text-xs font-semibold uppercase tracking-wider text-neutral-400 flex items-center gap-2">
                <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                <span>Қалдырылған пікірлер ({feedbacks.length})</span>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                {feedbacks.map((fb) => (
                  <div
                    key={fb.id}
                    className="p-4 rounded-xl bg-neutral-900/80 border border-neutral-800 space-y-2 hover:border-neutral-700 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">
                          {fb.senderName}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-400 border border-neutral-700">
                          {fb.role}
                        </span>
                      </div>
                      <div className="flex items-center gap-0.5 text-amber-400">
                        {Array.from({ length: fb.rating }).map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-current" />
                        ))}
                      </div>
                    </div>

                    <p className="text-xs text-neutral-300 leading-relaxed">
                      "{fb.message}"
                    </p>

                    <div className="text-[10px] text-neutral-500 text-right">
                      {fb.createdAt}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
