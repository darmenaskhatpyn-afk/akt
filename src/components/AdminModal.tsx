import React, { useState, useRef } from 'react';
import {
  Lock,
  Unlock,
  KeyRound,
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Eye,
  Database,
  Copy,
  Check,
  X,
  Shield,
  Plus,
  RefreshCw,
  ExternalLink,
  Settings,
  FolderArchive,
  FileSpreadsheet,
  FileCode,
  File,
} from 'lucide-react';
import { TaskCategory, TaskFormat, TaskItem } from '../types';
import {
  saveTask,
  uploadTaskFile,
  deleteTask,
  isSupabaseConfigured,
  getStoredCredentials,
  saveCredentials,
  SUPABASE_SQL_SETUP_GUIDE,
  BUCKET_NAME,
  TABLE_NAME,
} from '../lib/supabase';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTaskCreated: (task: TaskItem) => void;
  onTaskDeleted: (taskId: string) => void;
  customTasks: TaskItem[];
  onRefreshTasks: () => void;
}

const DEFAULT_ADMIN_PASS = 'admin2026';

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  onTaskCreated,
  onTaskDeleted,
  customTasks,
  onRefreshTasks,
}) => {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('albina_admin_auth') === 'true';
  });
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');

  // Active sub-tab in Admin
  const [activeAdminTab, setActiveAdminTab] = useState<'create' | 'manage' | 'settings' | 'sql'>('create');

  // Form states
  const [category, setCategory] = useState<TaskCategory>('practical');
  const [number, setNumber] = useState<number>(10);
  const [title, setTitle] = useState('');
  const [topic, setTopic] = useState('');
  const [description, setDescription] = useState('');
  const [format, setFormat] = useState<TaskFormat>('pdf');
  const [customLink, setCustomLink] = useState('');

  // File upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const [formSuccessMessage, setFormSuccessMessage] = useState('');
  const [formErrorMessage, setFormErrorMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Supabase live settings
  const storedCreds = getStoredCredentials();
  const [supabaseUrl, setSupabaseUrl] = useState(storedCreds.url);
  const [supabaseKey, setSupabaseKey] = useState(storedCreds.key);
  const [configSaved, setConfigSaved] = useState(false);
  const [sqlCopied, setSqlCopied] = useState(false);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput.trim() === DEFAULT_ADMIN_PASS || passwordInput.trim() === 'albina2026') {
      setIsAuthenticated(true);
      sessionStorage.setItem('albina_admin_auth', 'true');
      setAuthError('');
    } else {
      setAuthError('Құпия сөз қате! Қайта теріп көріңіз.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('albina_admin_auth');
    setPasswordInput('');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);

      // Auto-detect format based on extension
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (ext === 'pdf') setFormat('pdf');
      else if (ext === 'doc' || ext === 'docx') setFormat('word');
      else if (ext === 'zip' || ext === 'rar' || ext === '7z') setFormat('zip');
      else if (ext === 'ppt' || ext === 'pptx') setFormat('pptx');
      else setFormat('file');

      // Auto-fill title if empty
      if (!title) {
        const cleanName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
        setTitle(cleanName.replace(/[_-]/g, ' '));
      }
    }
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    saveCredentials(supabaseUrl, supabaseKey);
    setConfigSaved(true);
    setTimeout(() => setConfigSaved(false), 3000);
    onRefreshTasks();
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SETUP_GUIDE);
    setSqlCopied(true);
    setTimeout(() => setSqlCopied(false), 2500);
  };

  const handleSubmitTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrorMessage('');
    setFormSuccessMessage('');

    if (!title.trim()) {
      setFormErrorMessage('Тапсырманың атауын енгізіңіз');
      return;
    }

    if (!description.trim()) {
      setFormErrorMessage('Тапсырманың қысқаша сипаттамасын жазыңыз');
      return;
    }

    try {
      setIsUploading(true);
      let fileUrl = '';
      let fileName = '';
      let fileSize = '';

      if (selectedFile) {
        setUploadProgress('Файл Supabase Storage бакетіне жүктелуде...');
        const uploadResult = await uploadTaskFile(selectedFile);
        fileUrl = uploadResult.url;
        fileName = uploadResult.fileName;
        fileSize = uploadResult.fileSize;
      }

      setUploadProgress('Мәліметтер Supabase деректер базасына сақталуда...');

      const result = await saveTask({
        category,
        number: Number(number) || 1,
        title: title.trim(),
        topic: topic.trim() || 'АҚТ Практикумы',
        description: description.trim(),
        format,
        fileUrl,
        fileName,
        fileSize,
        link: customLink.trim() || fileUrl,
      });

      onTaskCreated(result.task);

      setFormSuccessMessage(
        result.isLive
          ? 'Тапсырма Supabase-ке сәтті жүктелді және жарияланды!'
          : 'Тапсырма сәтті сақталды (Жергілікті сақтау қоймасында).'
      );

      // Reset form
      setTitle('');
      setTopic('');
      setDescription('');
      setSelectedFile(null);
      setCustomLink('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      setNumber((prev) => prev + 1);
    } catch (err: any) {
      setFormErrorMessage(`Сақтау қатесі: ${err?.message || 'Белгісіз қате'}`);
    } finally {
      setIsUploading(false);
      setUploadProgress('');
    }
  };

  const handleDelete = async (taskId: string) => {
    if (confirm('Тапсырманы өшіруді растайсыз ба?')) {
      await deleteTask(taskId);
      onTaskDeleted(taskId);
    }
  };

  const isConfigured = isSupabaseConfigured();

  return (
    <div
      id="admin-cms-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        className="relative w-full max-w-4xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden my-6 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-neutral-950 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-extrabold text-white">
                  CMS / Әкімші панелі
                </h2>
                <span
                  className={`text-[11px] px-2 py-0.5 rounded-full font-semibold border ${
                    isConfigured
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  }`}
                >
                  {isConfigured ? 'Supabase Қосылған' : 'Жергілікті режим'}
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Тапсырмаларды жүктеу, файлдарды басқару және Supabase баптаулары
              </p>
            </div>
          </div>

          <button
            id="admin-modal-close-btn"
            onClick={onClose}
            className="p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-700 transition-colors cursor-pointer"
            aria-label="Жабу"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Not Authenticated State */}
        {!isAuthenticated ? (
          <div className="p-8 sm:p-12 text-center max-w-md mx-auto space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mx-auto">
              <Lock className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white">Құпия парольмен кіру</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Бұл бөлім тек портфолио иесі Айсанова Альбинаға арналған. Тапсырмаларды жүктеу және өңдеу үшін парольді енгізіңіз.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4 text-left">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                  <span>Әкімші паролі:</span>
                </label>
                <input
                  type="password"
                  required
                  placeholder="Парольді енгізіңіз (мысалы: admin2026)"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>

              {authError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              <div className="p-3 rounded-xl bg-neutral-950/80 border border-neutral-800 text-[11px] text-neutral-400 flex items-center justify-between">
                <span>Әдепкі пароль: <code className="text-amber-400 font-mono">admin2026</code></span>
                <button
                  type="button"
                  onClick={() => setPasswordInput('admin2026')}
                  className="text-amber-400 hover:underline cursor-pointer"
                >
                  Автотолтыру
                </button>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-amber-500/20"
              >
                <Unlock className="w-4 h-4" />
                <span>Жүйеге кіру</span>
              </button>
            </form>
          </div>
        ) : (
          /* Authenticated Content with Tabs */
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Navigation sub-tabs */}
            <div className="px-6 pt-4 bg-neutral-950/50 border-b border-neutral-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
                <button
                  id="tab-btn-create"
                  onClick={() => setActiveAdminTab('create')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                    activeAdminTab === 'create'
                      ? 'bg-amber-500 text-neutral-950'
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                  }`}
                >
                  <Plus className="w-4 h-4" />
                  <span>Жаңа тапсырма қосу</span>
                </button>

                <button
                  id="tab-btn-manage"
                  onClick={() => setActiveAdminTab('manage')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                    activeAdminTab === 'manage'
                      ? 'bg-amber-500 text-neutral-950'
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>Жүктелгендер ({customTasks.length})</span>
                </button>

                <button
                  id="tab-btn-settings"
                  onClick={() => setActiveAdminTab('settings')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                    activeAdminTab === 'settings'
                      ? 'bg-amber-500 text-neutral-950'
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                  }`}
                >
                  <Settings className="w-4 h-4" />
                  <span>Supabase Баптаулары</span>
                </button>

                <button
                  id="tab-btn-sql"
                  onClick={() => setActiveAdminTab('sql')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                    activeAdminTab === 'sql'
                      ? 'bg-amber-500 text-neutral-950'
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                  }`}
                >
                  <Database className="w-4 h-4" />
                  <span>SQL Нұсқаулық</span>
                </button>
              </div>

              <button
                onClick={handleLogout}
                className="text-xs text-neutral-400 hover:text-red-400 pb-2 sm:pb-0 transition-colors cursor-pointer flex items-center gap-1"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Шығу</span>
              </button>
            </div>

            {/* Sub-tab Body */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-6">
              {/* TAB 1: CREATE TASK FORM */}
              {activeAdminTab === 'create' && (
                <form onSubmit={handleSubmitTask} className="space-y-6 max-w-2xl mx-auto">
                  {formSuccessMessage && (
                    <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                      <span>{formSuccessMessage}</span>
                    </div>
                  )}

                  {formErrorMessage && (
                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{formErrorMessage}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Category Selection */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-neutral-300">
                        Тапсырма түрі: *
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value as TaskCategory)}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                      >
                        <option value="practical">Практикалық тапсырма</option>
                        <option value="independent">Өзіндік жұмыс (БӨӨЖ / СРСП)</option>
                      </select>
                    </div>

                    {/* Task Number */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-neutral-300">
                        Тапсырма нөмірі (№): *
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="99"
                        required
                        value={number}
                        onChange={(e) => setNumber(Number(e.target.value))}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  {/* Title */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-neutral-300">
                      Тапсырма аты: *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Мысалы: Компьютердің жедел жады (RAM) және оның құрылымы"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  {/* Topic */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-neutral-300">
                      Тақырыбы / Бөлім:
                    </label>
                    <input
                      type="text"
                      placeholder="Мысалы: Ақпараттық жүйелер мен деректер қоры"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-neutral-300">
                      Қысқаша сипаттамасы: *
                    </label>
                    <textarea
                      required
                      rows={3}
                      placeholder="Тапсырма мазмұны, орындалған жұмыс пен зерттеу нәтижесі туралы қысқаша жазыңыз..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 resize-none"
                    />
                  </div>

                  {/* File Upload Box (PDF / Word / ZIP / PPTX) */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-neutral-300 flex items-center justify-between">
                      <span>Файл жүктеу (PDF / Word / ZIP / PPTX):</span>
                      <span className="text-[11px] text-amber-400 font-normal">
                        Supabase Storage бакетіне тікелей жүктеледі
                      </span>
                    </label>

                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                        selectedFile
                          ? 'border-amber-500/50 bg-amber-500/5'
                          : 'border-neutral-700 hover:border-amber-500/50 bg-neutral-950/60 hover:bg-neutral-950'
                      }`}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.doc,.docx,.zip,.rar,.7z,.ppt,.pptx"
                        onChange={handleFileChange}
                        className="hidden"
                      />

                      {selectedFile ? (
                        <div className="space-y-2">
                          <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
                            {format === 'zip' ? (
                              <FolderArchive className="w-6 h-6" />
                            ) : format === 'word' ? (
                              <FileSpreadsheet className="w-6 h-6" />
                            ) : (
                              <FileText className="w-6 h-6" />
                            )}
                          </div>
                          <div className="text-sm font-bold text-white">
                            {selectedFile.name}
                          </div>
                          <div className="text-xs text-neutral-400">
                            Көлемі: {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Форматы: {format.toUpperCase()}
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedFile(null);
                              if (fileInputRef.current) fileInputRef.current.value = '';
                            }}
                            className="text-xs text-red-400 hover:underline pt-1 inline-block"
                          >
                            Файлды алып тастау
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="w-12 h-12 rounded-xl bg-neutral-800 text-neutral-400 flex items-center justify-center mx-auto">
                            <UploadCloud className="w-6 h-6" />
                          </div>
                          <div className="text-xs font-semibold text-neutral-200">
                            Файлды таңдау үшін басыңыз немесе осында сүйреңіз
                          </div>
                          <p className="text-[11px] text-neutral-500">
                            Қолдау көрсетілетін форматтар: PDF, Word (.docx), ZIP, PowerPoint (.pptx)
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Or External Link (Canva, Google Docs, etc.) */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-neutral-300">
                      Немесе сыртқы сілтеме (Canva / Google Docs / Веб-сайт):
                    </label>
                    <input
                      type="url"
                      placeholder="https://canva.com/design/... немесе https://docs.google.com/..."
                      value={customLink}
                      onChange={(e) => setCustomLink(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="pt-3">
                    <button
                      type="submit"
                      disabled={isUploading}
                      className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-neutral-950 font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-amber-500/20"
                    >
                      {isUploading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>{uploadProgress || 'Жүктелуде...'}</span>
                        </>
                      ) : (
                        <>
                          <UploadCloud className="w-4 h-4" />
                          <span>Тапсырманы Supabase-ке сақтау және жариялау</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}

              {/* TAB 2: MANAGE UPLOADED TASKS */}
              {activeAdminTab === 'manage' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
                    <div>
                      <h4 className="text-sm font-bold text-white">
                        Жүктелген динамикалық тапсырмалар тізімі
                      </h4>
                      <p className="text-xs text-neutral-400">
                        Барлығы: {customTasks.length} тапсырма
                      </p>
                    </div>
                    <button
                      onClick={onRefreshTasks}
                      className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs text-neutral-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Жаңарту</span>
                    </button>
                  </div>

                  {customTasks.length === 0 ? (
                    <div className="text-center py-12 px-4 bg-neutral-950/50 rounded-xl border border-neutral-800 space-y-2">
                      <FileText className="w-8 h-8 text-neutral-500 mx-auto" />
                      <p className="text-xs text-neutral-400">
                        Әлі жаңа тапсырма жүктелмеген. «Жаңа тапсырма қосу» қойындысынан файл жүктей аласыз.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {customTasks.map((t) => (
                        <div
                          key={t.id}
                          className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                №{t.number} {t.category === 'practical' ? 'Практикалық' : 'БӨӨЖ'}
                              </span>
                              <span className="text-xs text-neutral-400">
                                {t.formatLabel}
                              </span>
                              {t.fileSize && (
                                <span className="text-[11px] text-neutral-500">
                                  ({t.fileSize})
                                </span>
                              )}
                            </div>
                            <h5 className="text-sm font-bold text-white">{t.title}</h5>
                            <p className="text-xs text-neutral-400 line-clamp-1">{t.description}</p>
                          </div>

                          <div className="flex items-center gap-2 flex-shrink-0">
                            {t.link && (
                              <a
                                href={t.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors"
                                title="Файлды ашу / көру"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            )}
                            <button
                              onClick={() => handleDelete(t.id)}
                              className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/20 transition-colors cursor-pointer"
                              title="Өшіру"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: SUPABASE CONFIGURATION */}
              {activeAdminTab === 'settings' && (
                <div className="space-y-6 max-w-2xl mx-auto">
                  <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                      <Database className="w-4 h-4" />
                      <span>Supabase жобасының күйі:</span>
                    </div>
                    <p className="text-xs text-neutral-300 leading-relaxed">
                      {isConfigured ? (
                        <span className="text-emerald-400 font-semibold">
                          ✓ Деректер базасы мен файл қоймасы белсенді. Жаңа тапсырмалар Supabase бұлтына сақталады.
                        </span>
                      ) : (
                        <span className="text-amber-400">
                          Қазір жергілікті сынақ режимі іске қосулы. Supabase URL мен Anon Key-ді төмендегі өріске енгізсеңіз, нақты бұлтқа қосылады.
                        </span>
                      )}
                    </p>
                  </div>

                  <form onSubmit={handleSaveConfig} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-neutral-300">
                        Supabase Project URL:
                      </label>
                      <input
                        type="url"
                        placeholder="https://xyzcompany.supabase.co"
                        value={supabaseUrl}
                        onChange={(e) => setSupabaseUrl(e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-neutral-300">
                        Supabase Anon Key:
                      </label>
                      <input
                        type="password"
                        placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                        value={supabaseKey}
                        onChange={(e) => setSupabaseKey(e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    {configSaved && (
                      <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
                        <Check className="w-4 h-4" />
                        <span>Supabase баптаулары сәтті сақталды!</span>
                      </div>
                    )}

                    <div className="pt-2 flex items-center gap-3">
                      <button
                        type="submit"
                        className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs transition-all cursor-pointer shadow-lg shadow-amber-500/20"
                      >
                        Баптауларды сақтау
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setSupabaseUrl('');
                          setSupabaseKey('');
                          saveCredentials('', '');
                          onRefreshTasks();
                        }}
                        className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white text-xs transition-colors cursor-pointer"
                      >
                        Тазарту
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* TAB 4: SQL & STORAGE SETUP INSTRUCTIONS */}
              {activeAdminTab === 'sql' && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h4 className="text-base font-bold text-white flex items-center gap-2">
                      <Database className="w-5 h-5 text-amber-400" />
                      <span>Supabase-те кесте (Table) мен Storage ашу қадамдары</span>
                    </h4>
                    <p className="text-xs text-neutral-300 leading-relaxed">
                      Supabase бақылау тақтасында (Dashboard) төмендегі екі қадамды орындаңыз:
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
                      <div className="font-bold text-amber-400">1-қадам: Кесте құру (tasks)</div>
                      <p className="text-neutral-400 leading-relaxed">
                        Supabase Dashboard &rarr; <strong>SQL Editor</strong> бөліміне өтіп, төмендегі SQL кодын көшіріп қойып, <strong>Run</strong> батырмасын басыңыз.
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
                      <div className="font-bold text-amber-400">2-қадам: Storage бакетін ашу</div>
                      <p className="text-neutral-400 leading-relaxed">
                        Supabase Dashboard &rarr; <strong>Storage</strong> бөліміне өтіп, <strong>New bucket</strong> басып, атын <code className="text-amber-300 font-mono">portfolio-files</code> деп қойып, <strong>Public bucket</strong> құсбелгісін қосыңыз.
                      </p>
                    </div>
                  </div>

                  {/* SQL Code Box with Copy */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-neutral-300">
                        Толық SQL скрипті:
                      </span>
                      <button
                        onClick={handleCopySql}
                        className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-amber-400 flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        {sqlCopied ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400">Көшірілді!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>SQL кодын көшіру</span>
                          </>
                        )}
                      </button>
                    </div>

                    <pre className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 text-[11px] text-amber-200/90 font-mono overflow-x-auto leading-relaxed max-h-72">
                      {SUPABASE_SQL_SETUP_GUIDE}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
