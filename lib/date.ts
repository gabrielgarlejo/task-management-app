import { TaskStatus } from '@/types/task';

export type DateFormat = 'short' | 'long' | 'time' | 'relative';

export function formatDate(date: string | null, format: DateFormat = 'short'): string {
  if (!date) return 'No due date';
  
  const d = new Date(date);
  
  switch (format) {
    case 'short':
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    case 'long':
      return d.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
    case 'time':
      return d.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      });
    default:
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
  }
}

export function formatDateTime(date: string): string {
  return formatDate(date, 'time');
}

export function formatDateLong(date: string | null): string {
  return formatDate(date, 'long');
}

export function getRelativeDateLabel(date: string | null, status: TaskStatus): string {
  if (!date) return 'No due date';
  
  const d = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDate = new Date(date);
  dueDate.setHours(0, 0, 0, 0);

  if (dueDate < today && status !== 'done') {
    return 'Overdue';
  }
  if (dueDate.getTime() === today.getTime()) {
    return 'Today';
  }
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export function getLocalDateString(): string {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  const localDate = new Date(now.getTime() - offset * 60 * 1000);
  return localDate.toISOString().split('T')[0];
}