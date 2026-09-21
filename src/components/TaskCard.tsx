import React from 'react';
import { ArrowUpRight, ExternalLink, FileText, Presentation, Globe, Eye, Check, Trash2 } from 'lucide-react';
import { TaskItem } from '../types';
import { openTaskFile } from '../lib/fileViewer';
import { getTaskFileFromFirebase } from '../lib/firebase';

interface TaskCardProps {
  task: TaskItem;
  onSelect: (task: TaskItem) => void;
  onDelete?: (task: TaskItem, e: React.MouseEvent) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onSelect, onDelete }) => {
  const isPractical = task.category === 'practical';

  const getFormatBadge = (format: TaskItem['format']) => {
    switch (format) {
      case 'canva':
        return { label: 'Canva', bg: 'bg-teal-500/10 text-teal-400 border-teal-500/20' };
      case 'pptx':
        return { label: 'PowerPoint (.pptx)', bg: 'bg-orange-500/10 text-orange-400 border-orange-500/20' };
      case 'gdoc':
        return { label: 'Google Docs', bg: 'bg-blue-500/10 text-blue-400 border-blue-500/20' };
      case 'wix':
        return { label: 'Wix Platform', bg: 'bg-purple-500/10 text-purple-400 border-purple-500/20' };
      case 'pdf':
        return { label: 'PDF құжаты', bg: 'bg-red-500/10 text-red-400 border-red-500/20' };
      case 'word':
        return { label: 'Word (.docx)', bg: 'bg-sky-500/10 text-sky-400 border-sky-500/20' };
      case 'zip':
        return { label: 'ZIP архив', bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' };
      default:
        return { label: 'Интерактивті', bg: 'bg-amber-500/10 text-amber-400 border-amber-500/20' };
    }
  };

  const badgeInfo = getFormatBadge(task.format);

  const handleOpenTask = async (e: React.MouseEvent) => {
    e.stopPropagation();

    // Check if cloud file data exists in Firestore for any visitor
    try {
      const cloudFile = await getTaskFileFromFirebase(task.id);
      if (cloudFile && cloudFile.fileData) {
        openTaskFile({
          link: cloudFile.fileData,
          fileUrl: cloudFile.fileData,
          fileName: cloudFile.fileName,
          format: task.format,
          title: task.title,
        });
        return;
      }
    } catch {
      // ignore and fallback
    }

    const targetUrl = task.fileUrl || task.link;
    if (targetUrl && targetUrl !== '#') {
      openTaskFile(task);
    } else {
      onSelect(task);
    }
  };

  return (
    <div
      id={`task-card-${task.id}`}
      className="group rounded-2xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition-all duration-300 flex flex-col overflow-hidden hover:shadow-xl hover:shadow-black/40 relative"
    >
      {/* Thumbnail area */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-neutral-950">
        <img
          src={task.imageUrl}
          alt={task.title}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/20 to-transparent" />

        {/* Task Number & Category Badge */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-neutral-950/80 text-white backdrop-blur border border-neutral-700">
            №{task.number}
          </span>
          <span
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border backdrop-blur ${badgeInfo.bg}`}
          >
            {badgeInfo.label}
          </span>
        </div>

        {/* Completion Indicator & Delete Button */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5">
          {onDelete && (
            <button
              id={`task-card-top-del-${task.id}`}
              onClick={(e) => {
                e.stopPropagation();
                onDelete(task, e);
              }}
              title="Файлды өшіру"
              aria-label="Файлды өшіру"
              className="w-7 h-7 rounded-lg bg-neutral-950/80 hover:bg-red-600 text-neutral-300 hover:text-white flex items-center justify-center backdrop-blur border border-neutral-700/80 transition-all cursor-pointer shadow-md"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
          <span className="w-7 h-7 rounded-full bg-emerald-500/90 text-neutral-950 flex items-center justify-center font-bold text-xs shadow-md">
            <Check className="w-4 h-4 stroke-[3]" />
          </span>
        </div>
      </div>

      {/* Content area */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-amber-400">
            {isPractical ? 'Практикалық тапсырма' : 'Өзіндік жұмыс (БОӨЖ)'}
          </div>

          <h3 className="text-base font-bold text-white line-clamp-2 group-hover:text-amber-300 transition-colors">
            {task.title}
          </h3>

          <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
            {task.description}
          </p>
        </div>

        {/* Action Buttons (Matches Wix exact "Тапсырмаға өту" button + Preview + Delete) */}
        <div className="pt-2 border-t border-neutral-800/80 flex items-center gap-2">
          <button
            id={`task-btn-go-${task.id}`}
            onClick={handleOpenTask}
            className="flex-1 py-2.5 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-neutral-950 font-bold text-xs flex items-center justify-center gap-1.5 border border-amber-500/30 transition-all cursor-pointer truncate"
          >
            <span className="truncate">Тапсырмаға өту</span>
            <ArrowUpRight className="w-4 h-4 flex-shrink-0" />
          </button>

          <button
            id={`task-btn-preview-${task.id}`}
            onClick={() => onSelect(task)}
            title="Толық сипаттамасын ашу"
            className="p-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white border border-neutral-700 transition-colors cursor-pointer flex-shrink-0"
            aria-label="Сипаттамасын көру"
          >
            <Eye className="w-4 h-4" />
          </button>

          {onDelete && (
            <button
              id={`task-btn-delete-${task.id}`}
              onClick={(e) => {
                e.stopPropagation();
                onDelete(task, e);
              }}
              title="Файлды өшіру"
              className="p-2.5 rounded-xl bg-neutral-800/80 hover:bg-red-500/20 text-neutral-400 hover:text-red-400 border border-neutral-700 hover:border-red-500/40 transition-colors cursor-pointer flex-shrink-0"
              aria-label="Файлды өшіру"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
