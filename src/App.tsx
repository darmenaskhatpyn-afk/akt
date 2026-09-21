/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Navbar, NavTab } from './components/Navbar';
import { Hero } from './components/Hero';
import { AboutSection } from './components/AboutSection';
import { ContactSection } from './components/ContactSection';
import { TasksGrid } from './components/TasksGrid';
import { TaskModal } from './components/TaskModal';
import { SimpleUploadModal } from './components/SimpleUploadModal';
import { ProfileEditModal } from './components/ProfileEditModal';
import { PasswordAuthModal } from './components/PasswordAuthModal';
import { studentProfile as initialStudentProfile } from './data/tasks';
import { TaskItem, TaskCategory, StudentProfile } from './types';
import { ArrowUp } from 'lucide-react';
import { fetchTasksFromSupabase } from './lib/supabase';
import {
  subscribeToTasks,
  deleteTaskFromFirebase,
  subscribeToProfile,
  saveProfileToFirebase,
} from './lib/firebase';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [uploadCategory, setUploadCategory] = useState<TaskCategory>('practical');

  // Редактор режимі (пароль арқылы кіргенде ғана true болады)
  const [isEditor, setIsEditor] = useState<boolean>(() => {
    try {
      // 1. URL арқылы тікелей кілт берілсе: ?key=8888
      const params = new URLSearchParams(window.location.search);
      if (params.get('key') === '8888') {
        localStorage.setItem('portfolio_is_editor_session', 'true');
        return true;
      }
      // 2. Бұрын парольмен кірген болса
      return localStorage.getItem('portfolio_is_editor_session') === 'true';
    } catch {
      return false;
    }
  });

  const handleLoginSuccess = () => {
    setIsEditor(true);
    localStorage.setItem('portfolio_is_editor_session', 'true');
  };

  const handleLogout = () => {
    setIsEditor(false);
    localStorage.removeItem('portfolio_is_editor_session');
  };

  // Динамикалық жеке профиль деректері (бұлттық базамен және localStorage-пен синхрондалады)
  const [profile, setProfile] = useState<StudentProfile>(() => {
    try {
      const saved = localStorage.getItem('user_portfolio_profile');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return initialStudentProfile;
  });

  // Profile real-time synchronization from Firebase
  useEffect(() => {
    const unsubProfile = subscribeToProfile((cloudProfile) => {
      if (cloudProfile && cloudProfile.fullName) {
        setProfile(cloudProfile);
        try {
          localStorage.setItem('user_portfolio_profile', JSON.stringify(cloudProfile));
        } catch {
          // ignore
        }
      }
    });
    return () => unsubProfile();
  }, []);

  const handleProfileSave = async (updatedProfile: StudentProfile) => {
    setProfile(updatedProfile);
    try {
      localStorage.setItem('user_portfolio_profile', JSON.stringify(updatedProfile));
    } catch {
      // ignore
    }
    // Save to Firebase so everyone sees the updated profile
    await saveProfileToFirebase(updatedProfile);
  };

  // Файлдар тізімі (Firebase бұлттық базасы арқылы кез келген адамға бірдей көрінеді)
  const [tasks, setTasks] = useState<TaskItem[]>(() => {
    try {
      const saved = localStorage.getItem('user_portfolio_tasks');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Real-time listener for tasks from Firebase
  useEffect(() => {
    const unsubTasks = subscribeToTasks((cloudTasks) => {
      if (cloudTasks && cloudTasks.length > 0) {
        setTasks(cloudTasks);
        localStorage.setItem('user_portfolio_tasks', JSON.stringify(cloudTasks));
      }
    });

    // Fallback initial load
    fetchTasksFromSupabase()
      .then((res) => {
        if (res.tasks && res.tasks.length > 0) {
          setTasks((prev) => (prev.length > 0 ? prev : res.tasks));
        }
      })
      .catch((err) => console.warn('Supabase fetch fallback:', err));

    return () => unsubTasks();
  }, []);

  const handleTaskCreated = (newTask: TaskItem) => {
    setTasks((prev) => {
      const updated = [newTask, ...prev.filter((t) => t.id !== newTask.id)];
      localStorage.setItem('user_portfolio_tasks', JSON.stringify(updated));
      return updated;
    });
  };

  const handleDeleteTask = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isEditor) {
      setIsAuthModalOpen(true);
      return;
    }
    if (confirm('Бұл файлды тізімнен өшіргіңіз келе ме?')) {
      setTasks((prev) => {
        const updated = prev.filter((t) => t.id !== id);
        localStorage.setItem('user_portfolio_tasks', JSON.stringify(updated));
        return updated;
      });
      // Delete from Firebase Firestore
      await deleteTaskFromFirebase(id);
    }
  };

  const handleOpenUpload = (cat: TaskCategory = 'practical') => {
    if (!isEditor) {
      setIsAuthModalOpen(true);
      return;
    }
    setUploadCategory(cat);
    setIsUploadModalOpen(true);
  };

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const practicalTasksList = tasks.filter((t) => t.category === 'practical');
  const independentTasksList = tasks.filter((t) => t.category === 'independent');

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200">
      {/* Толыққанды Навигациялық панель */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onOpenUpload={() => handleOpenUpload('practical')}
        onOpenProfileEdit={() => (isEditor ? setIsProfileModalOpen(true) : setIsAuthModalOpen(true))}
        profile={profile}
        isEditor={isEditor}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
      />

      {/* Негізгі Контент */}
      <main className="flex-1">
        {/* 1. БАСТЫ БЕТ */}
        {activeTab === 'home' && (
          <div className="space-y-12 pb-16">
            {/* Hero Секциясы */}
            <Hero
              onExploreAbout={() => setActiveTab('about')}
              onExplorePractical={() => setActiveTab('practical')}
              onExploreIndependent={() => setActiveTab('independent')}
              onExploreContact={() => setActiveTab('contact')}
              onOpenUpload={() => handleOpenUpload('practical')}
              onOpenProfileEdit={() => (isEditor ? setIsProfileModalOpen(true) : setIsAuthModalOpen(true))}
              onOpenAuthModal={() => setIsAuthModalOpen(true)}
              practicalCount={practicalTasksList.length}
              independentCount={independentTasksList.length}
              profile={profile}
              isEditor={isEditor}
            />

            {/* Практикалық тапсырмалар блогы */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <TasksGrid
                title="Практикалық тапсырмалар"
                tasks={practicalTasksList}
                currentCategory="practical"
                onSelectTask={setSelectedTask}
                searchQuery={searchQuery}
                onOpenUpload={() => handleOpenUpload('practical')}
                onDeleteTask={isEditor ? handleDeleteTask : undefined}
              />
            </section>

            {/* Өзіндік жұмыстар (СРСП) блогы */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <TasksGrid
                title="Өзіндік жұмыс (СРСП)"
                tasks={independentTasksList}
                currentCategory="independent"
                onSelectTask={setSelectedTask}
                searchQuery={searchQuery}
                onOpenUpload={() => handleOpenUpload('independent')}
                onDeleteTask={isEditor ? handleDeleteTask : undefined}
              />
            </section>

            {/* Мен туралы блок */}
            <AboutSection
              profile={profile}
              onOpenEdit={isEditor ? () => setIsProfileModalOpen(true) : undefined}
            />

            {/* Байланыс блогы */}
            <ContactSection profile={profile} />
          </div>
        )}

        {/* 2. БӨЛЕК БЕТ: МЕН ТУРАЛЫ */}
        {activeTab === 'about' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <AboutSection
              profile={profile}
              onOpenEdit={isEditor ? () => setIsProfileModalOpen(true) : undefined}
            />
          </div>
        )}

        {/* 3. БӨЛЕК БЕТ: ПРАКТИКАЛЫҚ ТАПСЫРМАЛАР */}
        {activeTab === 'practical' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <TasksGrid
              title="Практикалық тапсырмалар"
              tasks={practicalTasksList}
              currentCategory="practical"
              onSelectTask={setSelectedTask}
              searchQuery={searchQuery}
              onOpenUpload={() => handleOpenUpload('practical')}
              onDeleteTask={isEditor ? handleDeleteTask : undefined}
            />
          </div>
        )}

        {/* 4. БӨЛЕК БЕТ: ӨЗІНДІК ЖҰМЫС (СРСП) */}
        {activeTab === 'independent' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <TasksGrid
              title="Өзіндік жұмыс (СРСП)"
              tasks={independentTasksList}
              currentCategory="independent"
              onSelectTask={setSelectedTask}
              searchQuery={searchQuery}
              onOpenUpload={() => handleOpenUpload('independent')}
              onDeleteTask={isEditor ? handleDeleteTask : undefined}
            />
          </div>
        )}

        {/* 5. БӨЛЕК БЕТ: БАЙЛАНЫС ЖӘНЕ ПІКІРЛЕР */}
        {activeTab === 'contact' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <ContactSection profile={profile} />
          </div>
        )}
      </main>

      {/* Төменгі футер */}
      <footer className="border-t border-neutral-800 bg-neutral-950 py-8 text-center text-xs text-neutral-400">
        <p className="font-semibold text-white">{profile.fullName} • АҚТ Портфолиосы</p>
        <p className="text-neutral-500 mt-1">{profile.university.name} • {profile.university.group} • {profile.city}</p>
      </footer>

      {/* Тапсырманы қарау модаль терезесі */}
      <TaskModal task={selectedTask} onClose={() => setSelectedTask(null)} />

      {/* Файлды тікелей салу модаль терезесі */}
      <SimpleUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onTaskCreated={handleTaskCreated}
        defaultCategory={uploadCategory}
      />

      {/* Жеке профильді өзгерту модаль терезесі */}
      <ProfileEditModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        profile={profile}
        onSave={handleProfileSave}
      />

      {/* Құпиясөзбен кіру модаль терезесі */}
      <PasswordAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        isEditor={isEditor}
        onLoginSuccess={handleLoginSuccess}
        onLogout={handleLogout}
      />

      {/* Жоғарыға көтерілу батырмасы */}
      <button
        id="back-to-top-btn"
        onClick={handleScrollToTop}
        className="fixed bottom-6 right-6 p-3 rounded-full bg-neutral-900/90 text-neutral-300 hover:text-white border border-neutral-800 shadow-xl backdrop-blur transition-all hover:bg-neutral-800 cursor-pointer"
        aria-label="Жоғарыға қайту"
      >
        <ArrowUp className="w-5 h-5" />
      </button>
    </div>
  );
}
