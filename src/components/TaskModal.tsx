import React, { useState, useEffect } from 'react';
import { X, ExternalLink, Download, FileText, CheckCircle2, Copy, Check, Sparkles, BookOpen, Share2, Trash2, Loader2 } from 'lucide-react';
import { TaskItem } from '../types';
import { openTaskFile, downloadFile } from '../lib/fileViewer';
import { getTaskFileFromFirebase } from '../lib/firebase';

interface TaskModalProps {
  task: TaskItem | null;
  onClose: () => void;
  onDelete?: (task: TaskItem) => void;
}

export const TaskModal: React.FC<TaskModalProps> = ({ task, onClose, onDelete }) => {
  const [copied, setCopied] = useState(false);
  const [cloudFileData, setCloudFileData] = useState<{ fileName: string; fileData: string; mimeType: string } | null>(null);
  const [isLoadingCloudFile, setIsLoadingCloudFile] = useState(false);

  useEffect(() => {
    let isMounted = true;
    if (task && task.id) {
      // Check if file is stored in Firebase task_files collection
      setIsLoadingCloudFile(true);
      getTaskFileFromFirebase(task.id)
        .then((res) => {
          if (isMounted) {
            setCloudFileData(res);
            setIsLoadingCloudFile(false);
          }
        })
        .catch(() => {
          if (isMounted) setIsLoadingCloudFile(false);
        });
    } else {
      setCloudFileData(null);
    }
    return () => {
      isMounted = false;
    };
  }, [task?.id]);

  if (!task) return null;

  const isPractical = task.category === 'practical';

  const handleCopy = () => {
    navigator.clipboard.writeText(task.link || window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = async () => {
    if (cloudFileData && cloudFileData.fileData) {
      downloadFile(cloudFileData.fileData, cloudFileData.fileName || task.fileName || `${task.title}.${task.format}`);
      return;
    }
    setIsLoadingCloudFile(true);
    try {
      const res = await getTaskFileFromFirebase(task.id);
      if (res && res.fileData) {
        setCloudFileData(res);
        downloadFile(res.fileData, res.fileName || task.fileName || `${task.title}.${task.format}`);
        return;
      }
    } catch (e) {
      console.warn('Download fetch error:', e);
    } finally {
      setIsLoadingCloudFile(false);
    }
    const targetUrl = task.fileUrl || task.link;
    downloadFile(targetUrl, task.fileName || `${task.title}.${task.format}`);
  };

  const handleOpenAction = async () => {
    if (cloudFileData && cloudFileData.fileData) {
      openTaskFile({
        link: cloudFileData.fileData,
        fileUrl: cloudFileData.fileData,
        fileName: cloudFileData.fileName,
        format: task.format,
        title: task.title,
      });
      return;
    }
    setIsLoadingCloudFile(true);
    try {
      const res = await getTaskFileFromFirebase(task.id);
      if (res && res.fileData) {
        setCloudFileData(res);
        openTaskFile({
          link: res.fileData,
          fileUrl: res.fileData,
          fileName: res.fileName,
          format: task.format,
          title: task.title,
        });
        return;
      }
    } catch (e) {
      console.warn('Open action fetch error:', e);
    } finally {
      setIsLoadingCloudFile(false);
    }
    openTaskFile(task);
  };

  const getActionDetails = () => {
    switch (task.format) {
      case 'canva':
        return {
          btnText: 'Canva презентациясын ашу',
          icon: ExternalLink,
          description: 'Бұл тапсырма Canva онлайн графикалық платформасында интерактивті түрде дайындалған.',
        };
      case 'pptx':
        return {
          btnText: 'Презентацияны жүктеу (.pptx)',
          icon: Download,
          description: 'Бұл тапсырма Microsoft PowerPoint форматында (.pptx) дайындалған, жүктеп көруге болады.',
        };
      case 'gdoc':
        return {
          btnText: 'Google Docs құжатын ашу',
          icon: FileText,
          description: 'Бұл зерттеу жұмысы Google Docs бұлттық құжат ретінде сақталған.',
        };
      case 'wix':
        return {
          btnText: 'Wix сайтын ашу',
          icon: ExternalLink,
          description: 'Бұл жұмыс Wix веб-платформасында әзірленген.',
        };
      case 'pdf':
        return {
          btnText: 'PDF файлын ашу / жүктеу',
          icon: Download,
          description: 'Бұл тапсырма PDF құжаты ретінде Supabase Storage қоймасында сақталған.',
        };
      case 'word':
        return {
          btnText: 'Word (.docx) файлын жүктеу',
          icon: Download,
          description: 'Бұл тапсырма Microsoft Word форматында жүктелген.',
        };
      case 'zip':
        return {
          btnText: 'ZIP архивін жүктеу',
          icon: Download,
          description: 'Барлық қосымша материалдар мен кодтар жинақталған ZIP архиві.',
        };
      case 'file':
        return {
          btnText: 'Файлды жүктеу',
          icon: Download,
          description: 'Жүктелген тапсырма файлы.',
        };
      default:
        return {
          btnText: 'Тапсырмаға өту',
          icon: ExternalLink,
          description: 'Тапсырма материалдарына тікелей сілтеме.',
        };
    }
  };

  const action = getActionDetails();
  const ActionIcon = action.icon;

  return (
    <div
      id="task-details-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header Image */}
        <div className="relative aspect-[16/8] w-full bg-neutral-950 overflow-hidden">
          <img
            src={task.imageUrl}
            alt={task.title}
            className="w-full h-full object-cover object-center"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/40 to-transparent" />

          {/* Close button */}
          <button
            id="modal-close-btn"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-neutral-950/80 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-700 backdrop-blur transition-colors cursor-pointer"
            aria-label="Жабу"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Badge over image */}
          <div className="absolute bottom-4 left-4 flex items-center gap-2">
            <span className="px-3 py-1 rounded-lg bg-amber-500 text-neutral-950 font-bold text-xs">
              №{task.number} {isPractical ? 'Практикалық' : 'Өзіндік'} тапсырма
            </span>
            <span className="px-3 py-1 rounded-lg bg-neutral-950/80 text-neutral-200 font-medium text-xs border border-neutral-700 backdrop-blur">
              {task.formatLabel}
            </span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[60vh] overflow-y-auto">
          <div>
            <div className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1">
              Тақырыбы: {task.topic}
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white leading-snug">
              {task.title}
            </h2>
            {task.subtitle && (
              <p className="text-sm text-neutral-400 mt-1">
                {task.subtitle}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="p-4 rounded-xl bg-neutral-950/60 border border-neutral-800/80 space-y-2">
            <h4 className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
              Сипаттамасы
            </h4>
            <p className="text-sm text-neutral-300 leading-relaxed">
              {task.description}
            </p>
          </div>

          {/* Attached File Info Box if present */}
          {(task.fileName || task.fileSize || task.fileUrl) && (
            <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400 flex-shrink-0">
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">
                    {task.fileName || `${task.title}.${task.format}`}
                  </div>
                  <div className="text-[11px] text-neutral-400">
                    Форматы: {task.formatLabel} {task.fileSize ? `• Көлемі: ${task.fileSize}` : ''}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  id="modal-box-download-btn"
                  onClick={handleDownload}
                  className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow"
                >
                  {isLoadingCloudFile ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Download className="w-3.5 h-3.5" />
                  )}
                  <span>Жүктеу</span>
                </button>
                {onDelete && (
                  <button
                    id="modal-box-delete-btn"
                    onClick={() => onDelete(task)}
                    className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/30 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                    title="Бұл файлды өшіру"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Өшіру</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Objectives & Key Points */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {task.objectives && task.objectives.length > 0 && (
              <div className="p-4 rounded-xl bg-neutral-950/40 border border-neutral-800/80 space-y-2">
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Мақсаттары</span>
                </h4>
                <ul className="space-y-1.5 text-xs text-neutral-300">
                  {task.objectives.map((obj, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-amber-400 mt-0.5">•</span>
                      <span>{obj}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {task.keyPoints && task.keyPoints.length > 0 && (
              <div className="p-4 rounded-xl bg-neutral-950/40 border border-neutral-800/80 space-y-2">
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Негізгі ұғымдар</span>
                </h4>
                <ul className="space-y-1.5 text-xs text-neutral-300">
                  {task.keyPoints.map((pt, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-amber-400 mt-0.5">•</span>
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Format Note */}
          <div className="text-xs text-neutral-400 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span>{action.description}</span>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-6 bg-neutral-950 border-t border-neutral-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              id="modal-copy-link-btn"
              onClick={handleCopy}
              className="px-4 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white text-xs font-medium border border-neutral-800 flex items-center gap-2 transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400">Сілтеме көшірілді!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4 text-neutral-400" />
                  <span>Сілтемені көшіру</span>
                </>
              )}
            </button>

            {onDelete && (
              <button
                id="modal-footer-delete-btn"
                onClick={() => onDelete(task)}
                className="px-3.5 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white text-xs font-bold border border-red-500/30 flex items-center gap-2 transition-all cursor-pointer shadow-sm"
                title="Файлды портфолиодан өшіру"
              >
                <Trash2 className="w-4 h-4" />
                <span>Файлды өшіру</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              id="modal-cancel-btn"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-neutral-400 hover:text-white text-xs font-medium transition-colors cursor-pointer"
            >
              Жабу
            </button>

            <button
              id="modal-action-btn"
              onClick={handleOpenAction}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
            >
              <span>{action.btnText}</span>
              <ActionIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
