import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  X,
  Plus,
  RefreshCw,
  FolderArchive,
  FileSpreadsheet,
} from 'lucide-react';
import { TaskCategory, TaskFormat, TaskItem } from '../types';
import { saveTask, uploadTaskFile } from '../lib/supabase';
import { saveTaskToFirebase, saveTaskFileToFirebase } from '../lib/firebase';

interface SimpleUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTaskCreated: (task: TaskItem) => void;
  defaultCategory?: TaskCategory;
}

export const SimpleUploadModal: React.FC<SimpleUploadModalProps> = ({
  isOpen,
  onClose,
  onTaskCreated,
  defaultCategory = 'practical',
}) => {
  const [category, setCategory] = useState<TaskCategory>(defaultCategory);
  const [title, setTitle] = useState('');
  const [number, setNumber] = useState<number>(1);
  const [format, setFormat] = useState<TaskFormat>('pdf');
  const [description, setDescription] = useState('');
  const [customLink, setCustomLink] = useState('');

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (isOpen) {
      setCategory(defaultCategory);
      setTitle('');
      setSelectedFile(null);
      setCustomLink('');
      setDescription('');
      setErrorMessage('');
      setSuccessMessage('');
    }
  }, [isOpen, defaultCategory]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);

      const ext = file.name.split('.').pop()?.toLowerCase();
      if (ext === 'pdf') setFormat('pdf');
      else if (ext === 'doc' || ext === 'docx') setFormat('word');
      else if (ext === 'zip' || ext === 'rar' || ext === '7z') setFormat('zip');
      else if (ext === 'ppt' || ext === 'pptx') setFormat('pptx');
      else setFormat('file');

      if (!title) {
        const cleanName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
        setTitle(cleanName.replace(/[_-]/g, ' '));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!selectedFile && !customLink.trim()) {
      setErrorMessage('Файл таңдаңыз немесе сілтеме жазыңыз');
      return;
    }

    try {
      setIsUploading(true);
      let fileUrl = '';
      let fileName = '';
      let fileSize = '';

      let rawDataUrl = '';

      if (selectedFile) {
        const uploadRes = await uploadTaskFile(selectedFile);
        fileUrl = uploadRes.url;
        fileName = uploadRes.fileName;
        fileSize = uploadRes.fileSize;

        // Convert file to Data URL for IndexedDB and chunked Firebase storage (supports up to 15MB)
        if (selectedFile.size <= 15 * 1024 * 1024) {
          rawDataUrl = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = () => reject(new Error('Файлды оқу мүмкін болмады'));
            reader.readAsDataURL(selectedFile);
          });
        }
      }

      // Save task item (with clean URL metadata, without giant strings that blow up 5MB quota)
      const res = await saveTask({
        category,
        number: Number(number) || 1,
        title: title.trim() || selectedFile?.name || 'Жаңа тапсырма',
        topic: category === 'practical' ? 'Практикалық жұмыс' : 'Өзіндік жұмыс',
        description: description.trim() || (selectedFile ? `Жүктелген файл: ${selectedFile.name}` : 'Тапсырма файлы'),
        format,
        fileUrl: customLink.trim() ? customLink.trim() : (fileUrl || ''),
        fileName,
        fileSize,
        link: customLink.trim() || '#',
      });

      // Save to Firebase Firestore tasks collection
      await saveTaskToFirebase(res.task);

      // Save file binary payload into Firebase task_files (multi-chunk) and IndexedDB
      if (rawDataUrl) {
        await saveTaskFileToFirebase(
          res.task.id,
          fileName,
          rawDataUrl,
          selectedFile?.type || 'application/octet-stream'
        );
      }

      onTaskCreated(res.task);
      setSuccessMessage('Файл сәтті жүктелді және барлық құрылғыларға қолжетімді болды!');

      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err: any) {
      setErrorMessage(`Қате орын алды: ${err?.message || 'Жүктеу орындалмады'}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div
      id="simple-upload-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-2xl space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Файл салу / Тапсырма қосу</h3>
              <p className="text-xs text-neutral-400">PDF, Word, PPTX немесе кез келген файл</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Category tabs */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setCategory('practical')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                category === 'practical'
                  ? 'bg-amber-500 text-neutral-950 shadow-md'
                  : 'bg-neutral-800 text-neutral-300 hover:text-white'
              }`}
            >
              Практикалық тапсырма
            </button>
            <button
              type="button"
              onClick={() => setCategory('independent')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                category === 'independent'
                  ? 'bg-amber-500 text-neutral-950 shadow-md'
                  : 'bg-neutral-800 text-neutral-300 hover:text-white'
              }`}
            >
              Өзіндік жұмыс (СРСП)
            </button>
          </div>

          {/* File Upload Zone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
              selectedFile
                ? 'border-amber-500/60 bg-amber-500/10'
                : 'border-neutral-700 hover:border-amber-500/50 bg-neutral-950/60 hover:bg-neutral-950'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.ppt,.pptx,.zip,.rar,.7z"
              onChange={handleFileChange}
              className="hidden"
            />

            {selectedFile ? (
              <div className="space-y-1.5">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
                  {format === 'zip' ? (
                    <FolderArchive className="w-5 h-5" />
                  ) : format === 'word' ? (
                    <FileSpreadsheet className="w-5 h-5" />
                  ) : (
                    <FileText className="w-5 h-5" />
                  )}
                </div>
                <div className="text-sm font-bold text-white line-clamp-1">{selectedFile.name}</div>
                <div className="text-xs text-neutral-400">
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • {format.toUpperCase()}
                </div>
                <span className="text-[11px] text-amber-400 underline pt-1 inline-block">
                  Басқа файл таңдау
                </span>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-neutral-800 text-neutral-400 flex items-center justify-center mx-auto">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <div className="text-sm font-semibold text-white">
                  Файлды таңдау үшін басыңыз
                </div>
                <p className="text-xs text-neutral-400">
                  PDF, Word, PPTX, ZIP форматтары қолдаулы
                </p>
              </div>
            )}
          </div>

          {/* Title */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-neutral-300">
              Тапсырма атауы:
            </label>
            <input
              type="text"
              placeholder="Мысалы: 1-зертханалық жұмыс"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Optional Link */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-neutral-300">
                Немесе сыртқы сілтеме (Google Drive / Canva / т.б.):
              </label>
              <span className="text-[10px] text-amber-400">Міндетті емес</span>
            </div>
            <input
              type="url"
              placeholder="https://docs.google.com/... немесе кез келген сілтеме"
              value={customLink}
              onChange={(e) => setCustomLink(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500"
            />
            <p className="text-[11px] text-neutral-500">
              💡 Кеңес: Егер файлды осы жерден тікелей таңдасаңыз, ол бұлттық базаға сақталып, кез келген адамға тікелей ашылатын болады.
            </p>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isUploading}
            className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-neutral-950 font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-amber-500/20"
          >
            {isUploading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Жүктелуде...</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>Салу / Жүктеу</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
