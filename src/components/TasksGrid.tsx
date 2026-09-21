import React, { useState, useMemo } from 'react';
import { TaskCard } from './TaskCard';
import { TaskItem, TaskCategory } from '../types';
import { PlusCircle, BookOpen, Trash2 } from 'lucide-react';

interface TasksGridProps {
  title: string;
  tasks: TaskItem[];
  currentCategory?: TaskCategory;
  onSelectTask: (task: TaskItem) => void;
  searchQuery?: string;
  onOpenUpload?: () => void;
  onDeleteTask?: (id: string, e: React.MouseEvent) => void;
}

export const TasksGrid: React.FC<TasksGridProps> = ({
  title,
  tasks,
  onSelectTask,
  searchQuery = '',
  onOpenUpload,
  onDeleteTask,
}) => {
  const [selectedFormat, setSelectedFormat] = useState<string>('all');

  const formats = [
    { id: 'all', label: 'Барлығы' },
    { id: 'pdf', label: 'PDF' },
    { id: 'word', label: 'Word' },
    { id: 'pptx', label: 'PowerPoint' },
    { id: 'zip', label: 'ZIP' },
  ];

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesSearch =
        !searchQuery ||
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        `№${task.number}`.includes(searchQuery);

      const matchesFormat =
        selectedFormat === 'all' || task.format === selectedFormat;

      return matchesSearch && matchesFormat;
    });
  }, [tasks, searchQuery, selectedFormat]);

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            {title}
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Барлығы: {filteredTasks.length} тапсырма
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Format filter pills */}
          <div className="flex items-center gap-1 overflow-x-auto bg-neutral-900 p-1 rounded-xl border border-neutral-800">
            {formats.map((fmt) => (
              <button
                key={fmt.id}
                onClick={() => setSelectedFormat(fmt.id)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  selectedFormat === fmt.id
                    ? 'bg-amber-500 text-neutral-950 font-bold shadow'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                {fmt.label}
              </button>
            ))}
          </div>

          {onOpenUpload && (
            <button
              onClick={onOpenUpload}
              className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-amber-500/20"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Файл салу</span>
            </button>
          )}
        </div>
      </div>

      {/* Grid */}
      {filteredTasks.length === 0 ? (
        <div className="p-12 text-center bg-neutral-900/40 rounded-3xl border border-dashed border-neutral-800 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-neutral-800 text-neutral-500 flex items-center justify-center mx-auto">
            <BookOpen className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <p className="text-base font-bold text-white">Қазір ешқандай файл жүктелмеген</p>
            <p className="text-xs text-neutral-400">
              Тапсырманы көрсету үшін «Файл салу» батырмасы арқылы жұмысыңызды қосыңыз
            </p>
          </div>
          {onOpenUpload && (
            <button
              onClick={onOpenUpload}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs inline-flex items-center gap-2 cursor-pointer shadow-md transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Файл салу</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTasks.map((task) => (
            <div key={task.id} className="relative group">
              <TaskCard
                task={task}
                onSelect={onSelectTask}
                onDelete={onDeleteTask ? (t, e) => onDeleteTask(t.id, e) : undefined}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
