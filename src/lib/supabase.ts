import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { TaskItem, TaskCategory, TaskFormat } from '../types';

// Environment variables or fallback local storage credentials
const ENV_SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const ENV_SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const STORAGE_KEY_URL = 'albina_supabase_url';
const STORAGE_KEY_KEY = 'albina_supabase_anon_key';
const LOCAL_CUSTOM_TASKS_KEY = 'albina_custom_tasks';

export const BUCKET_NAME = 'portfolio-files';
export const TABLE_NAME = 'tasks';

export function getStoredCredentials(): { url: string; key: string } {
  const localUrl = localStorage.getItem(STORAGE_KEY_URL) || '';
  const localKey = localStorage.getItem(STORAGE_KEY_KEY) || '';
  return {
    url: ENV_SUPABASE_URL || localUrl,
    key: ENV_SUPABASE_ANON_KEY || localKey,
  };
}

export function saveCredentials(url: string, key: string) {
  if (url) localStorage.setItem(STORAGE_KEY_URL, url.trim());
  if (key) localStorage.setItem(STORAGE_KEY_KEY, key.trim());
}

export function isSupabaseConfigured(): boolean {
  const { url, key } = getStoredCredentials();
  return Boolean(url && key && url.startsWith('http'));
}

let cachedClient: SupabaseClient | null = null;
let lastUrl = '';
let lastKey = '';

export function getSupabaseClient(): SupabaseClient | null {
  const { url, key } = getStoredCredentials();
  if (!url || !key) return null;

  if (cachedClient && lastUrl === url && lastKey === key) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(url, key);
    lastUrl = url;
    lastKey = key;
    return cachedClient;
  } catch (err) {
    console.warn('Failed to initialize Supabase client:', err);
    return null;
  }
}

// Convert Supabase row to TaskItem
function mapRowToTask(row: Record<string, any>): TaskItem {
  return {
    id: String(row.id),
    number: Number(row.number) || 1,
    category: (row.category === 'independent' ? 'independent' : 'practical') as TaskCategory,
    title: row.title || 'Атаусыз тапсырма',
    subtitle: row.subtitle || '',
    topic: row.topic || 'АҚТ сабағы',
    description: row.description || '',
    format: (row.format || 'file') as TaskFormat,
    formatLabel: row.format_label || getFormatLabel(row.format || 'file'),
    link: row.file_url || row.link || '#',
    fileUrl: row.file_url || '',
    fileName: row.file_name || '',
    fileSize: row.file_size || '',
    imageUrl: row.image_url || getPlaceholderImage(row.format || 'file'),
    date: row.created_at ? new Date(row.created_at).toLocaleDateString('kk-KZ') : new Date().toLocaleDateString('kk-KZ'),
    isCustom: true,
  };
}

export function getFormatLabel(format: string): string {
  switch (format) {
    case 'pdf':
      return 'PDF құжаты';
    case 'word':
      return 'Word (.docx)';
    case 'zip':
      return 'ZIP архиві';
    case 'pptx':
      return 'PowerPoint (.pptx)';
    case 'canva':
      return 'Canva';
    case 'gdoc':
      return 'Google Docs';
    default:
      return 'Файл / Құжат';
  }
}

export function getPlaceholderImage(format: string): string {
  switch (format) {
    case 'pdf':
      return 'https://images.unsplash.com/photo-1568667256549-094345857637?auto=format&fit=crop&w=800&q=80';
    case 'word':
      return 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=800&q=80';
    case 'zip':
      return 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80';
    case 'pptx':
      return 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=800&q=80';
    default:
      return 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80';
  }
}

/**
 * Fetch tasks from Supabase if configured, with fallback to localStorage custom tasks
 */
export async function fetchTasksFromSupabase(): Promise<{ tasks: TaskItem[]; isLive: boolean; error?: string }> {
  const client = getSupabaseClient();

  if (client) {
    try {
      const { data, error } = await client
        .from(TABLE_NAME)
        .select('*')
        .order('number', { ascending: true });

      if (!error && data) {
        const mapped = data.map(mapRowToTask);
        return { tasks: mapped, isLive: true };
      }
      if (error) {
        console.warn('Supabase fetch returned error:', error.message);
        // Fallback to local storage tasks
        return { tasks: getLocalCustomTasks(), isLive: false, error: error.message };
      }
    } catch (err: any) {
      console.warn('Failed connecting to Supabase:', err);
      return { tasks: getLocalCustomTasks(), isLive: false, error: err.message || 'Қосылу қатесі' };
    }
  }

  // Not configured yet - return locally added custom tasks
  return { tasks: getLocalCustomTasks(), isLive: false };
}

/**
 * Upload a file to Supabase Storage bucket 'portfolio-files'
 */
export async function uploadTaskFile(file: File): Promise<{
  url: string;
  fileName: string;
  fileSize: string;
  isLive: boolean;
}> {
  const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
  const sizeFormatted = file.size > 1024 * 1024 ? `${sizeMb} MB` : `${Math.round(file.size / 1024)} KB`;

  const client = getSupabaseClient();

  if (client) {
    try {
      // Clean filename for storage
      const fileExt = file.name.split('.').pop() || '';
      const cleanBaseName = file.name.replace(/[^a-zA-Z0-9_-]/g, '_');
      const uniquePath = `tasks/${Date.now()}_${cleanBaseName}.${fileExt}`;

      const { data: uploadData, error: uploadError } = await client.storage
        .from(BUCKET_NAME)
        .upload(uniquePath, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: publicUrlData } = client.storage
        .from(BUCKET_NAME)
        .getPublicUrl(uploadData?.path || uniquePath);

      return {
        url: publicUrlData.publicUrl,
        fileName: file.name,
        fileSize: sizeFormatted,
        isLive: true,
      };
    } catch (err: any) {
      console.warn('Supabase upload failed, falling back to local object URL:', err);
      // Create local fallback preview URL (dataURL for persistent viewing if small, or objectURL)
      let fallbackUrl = '';
      if (file.size < 6 * 1024 * 1024) {
        fallbackUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = () => resolve(URL.createObjectURL(file));
          reader.readAsDataURL(file);
        });
      } else {
        fallbackUrl = URL.createObjectURL(file);
      }

      return {
        url: fallbackUrl,
        fileName: file.name,
        fileSize: sizeFormatted,
        isLive: false,
      };
    }
  }

  // Fallback if Supabase is not configured yet
  let fallbackUrl = '';
  if (file.size < 6 * 1024 * 1024) {
    fallbackUrl = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(URL.createObjectURL(file));
      reader.readAsDataURL(file);
    });
  } else {
    fallbackUrl = URL.createObjectURL(file);
  }

  return {
    url: fallbackUrl,
    fileName: file.name,
    fileSize: sizeFormatted,
    isLive: false,
  };
}

/**
 * Save new task to Supabase Database (or local fallback)
 */
export async function saveTask(taskData: {
  category: TaskCategory;
  number: number;
  title: string;
  topic: string;
  description: string;
  format: TaskFormat;
  fileUrl?: string;
  fileName?: string;
  fileSize?: string;
  link?: string;
  imageUrl?: string;
}): Promise<{ task: TaskItem; isLive: boolean; error?: string }> {
  const client = getSupabaseClient();
  const formatLabel = getFormatLabel(taskData.format);
  const finalLink = taskData.fileUrl || taskData.link || '#';
  const finalImage = taskData.imageUrl || getPlaceholderImage(taskData.format);

  if (client) {
    try {
      const payload = {
        number: taskData.number,
        category: taskData.category,
        title: taskData.title,
        subtitle: taskData.topic,
        topic: taskData.topic,
        description: taskData.description,
        format: taskData.format,
        format_label: formatLabel,
        link: finalLink,
        file_url: taskData.fileUrl || null,
        file_name: taskData.fileName || null,
        file_size: taskData.fileSize || null,
        image_url: finalImage,
      };

      const { data, error } = await client
        .from(TABLE_NAME)
        .insert([payload])
        .select()
        .single();

      if (!error && data) {
        const newTask = mapRowToTask(data);
        return { task: newTask, isLive: true };
      }

      if (error) {
        console.warn('Insert to Supabase failed, saving locally:', error);
      }
    } catch (err: any) {
      console.warn('Failed to insert into Supabase:', err);
    }
  }

  // Fallback: save to LocalStorage
  const localTask: TaskItem = {
    id: `local-${Date.now()}`,
    number: taskData.number,
    category: taskData.category,
    title: taskData.title,
    subtitle: taskData.topic,
    topic: taskData.topic,
    description: taskData.description,
    format: taskData.format,
    formatLabel,
    link: finalLink,
    fileUrl: taskData.fileUrl,
    fileName: taskData.fileName,
    fileSize: taskData.fileSize,
    imageUrl: finalImage,
    date: new Date().toLocaleDateString('kk-KZ'),
    isCustom: true,
  };

  saveLocalCustomTask(localTask);
  return { task: localTask, isLive: false };
}

/**
 * Delete a task
 */
export async function deleteTask(taskId: string): Promise<boolean> {
  const client = getSupabaseClient();
  if (client && !taskId.startsWith('local-')) {
    try {
      const { error } = await client.from(TABLE_NAME).delete().eq('id', taskId);
      if (!error) return true;
    } catch (err) {
      console.warn('Supabase delete error:', err);
    }
  }

  // Also remove from local
  removeLocalCustomTask(taskId);
  return true;
}

// Local storage helpers
export function getLocalCustomTasks(): TaskItem[] {
  try {
    const raw = localStorage.getItem(LOCAL_CUSTOM_TASKS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveLocalCustomTask(task: TaskItem) {
  const existing = getLocalCustomTasks();
  const updated = [task, ...existing];
  localStorage.setItem(LOCAL_CUSTOM_TASKS_KEY, JSON.stringify(updated));
}

export function removeLocalCustomTask(taskId: string) {
  const existing = getLocalCustomTasks();
  const updated = existing.filter((t) => t.id !== taskId);
  localStorage.setItem(LOCAL_CUSTOM_TASKS_KEY, JSON.stringify(updated));
}

export const SUPABASE_SQL_SETUP_GUIDE = `-- 1. Supabase SQL Editor-де осы скриптті орындаңыз:
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  number INT NOT NULL DEFAULT 1,
  category TEXT NOT NULL CHECK (category IN ('practical', 'independent')),
  title TEXT NOT NULL,
  subtitle TEXT,
  topic TEXT,
  description TEXT,
  format TEXT NOT NULL DEFAULT 'pdf',
  format_label TEXT,
  link TEXT,
  image_url TEXT,
  file_url TEXT,
  file_name TEXT,
  file_size TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS (Row Level Security) қосу
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Барлығына оқуға рұқсат беру:
CREATE POLICY "Public read tasks" ON public.tasks
  FOR SELECT USING (true);

-- Барлығына/Админге жазуға рұқсат беру:
CREATE POLICY "Allow insert tasks" ON public.tasks
  FOR INSERT WITH CHECK (true);

-- Өшіруге рұқсат беру:
CREATE POLICY "Allow delete tasks" ON public.tasks
  FOR DELETE USING (true);

-- 2. Storage -> 'portfolio-files' бакетін құру (Public bucket):
INSERT INTO storage.buckets (id, name, public) 
VALUES ('portfolio-files', 'portfolio-files', true)
ON CONFLICT (id) DO NOTHING;

-- Бакеттегі файлдарды жүктеу мен оқу саясаты:
CREATE POLICY "Public view portfolio files" ON storage.objects
  FOR SELECT USING (bucket_id = 'portfolio-files');

CREATE POLICY "Allow upload to portfolio files" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'portfolio-files');
`;
