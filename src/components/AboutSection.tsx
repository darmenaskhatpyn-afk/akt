import React from 'react';
import { Mail, GraduationCap, Award, MapPin, Settings } from 'lucide-react';
import { StudentProfile } from '../types';

interface AboutSectionProps {
  profile: StudentProfile;
  onOpenEdit?: () => void;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ profile, onOpenEdit }) => {
  return (
    <section id="about-section" className="py-10 bg-neutral-950">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6 shadow-2xl relative group">
          {/* Direct Edit Button */}
          {onOpenEdit && (
            <button
              onClick={onOpenEdit}
              className="absolute top-4 right-4 px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-amber-400 hover:text-amber-300 border border-neutral-700 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Өзгерту</span>
            </button>
          )}

          <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl overflow-hidden border border-neutral-700 ring-2 ring-amber-500/20 flex-shrink-0">
            <img
              src={profile.photoUrl}
              alt={profile.fullName}
              className="w-full h-full object-cover object-top"
              referrerPolicy="no-referrer"
            />
          </div>

          <div className="space-y-3 flex-1 text-center sm:text-left">
            <div>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 font-semibold border border-amber-500/20">
                {profile.city}
              </span>
              <h2 className="text-2xl font-bold text-white mt-1.5">
                {profile.fullName}
              </h2>
              <p className="text-xs text-neutral-400">
                {profile.university.name} • {profile.university.faculty} ({profile.university.group})
              </p>
            </div>

            <p className="text-sm text-neutral-300 leading-relaxed">
              Ақпараттық-Коммуникациялық Технологиялар (АҚТ) пәні бойынша семестрлік портфолио. {profile.city} қаласынан, {profile.university.name} {profile.university.year}.
            </p>

            <div className="pt-2 flex flex-wrap gap-4 text-xs text-neutral-400 justify-center sm:justify-start">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-amber-400" />
                <span className="text-white font-semibold">{profile.city}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-amber-400" />
                <span>{profile.university.year}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-400" />
                <span>{profile.university.specialty}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-amber-400" />
                <span>{profile.contacts.email}</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
