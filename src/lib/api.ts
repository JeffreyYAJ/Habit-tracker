const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface Habit {
  id: string;
  name: string;
  month: number;
  year: number;
  created_at: string;
}

export interface Completion {
  id: string;
  habit_id: string;
  day_number: number;
  completed: boolean;
  created_at: string;
}

// Habits
export const getHabits = async (month: number, year: number): Promise<Habit[]> => {
  const response = await fetch(`${API_URL}/habits?month=${month}&year=${year}`);
  if (!response.ok) throw new Error('Failed to fetch habits');
  return response.json();
};

export const createHabit = async (name: string, month: number, year: number): Promise<Habit> => {
  const response = await fetch(`${API_URL}/habits`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, month, year }),
  });
  if (!response.ok) throw new Error('Failed to create habit');
  return response.json();
};

export const deleteHabit = async (habitId: string): Promise<void> => {
  const response = await fetch(`${API_URL}/habits/${habitId}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete habit');
};

// Completions
export const getCompletions = async (habitIds: string[]): Promise<Completion[]> => {
  const params = habitIds.map(id => `habit_id=${id}`).join('&');
  const response = await fetch(`${API_URL}/completions?${params}`);
  if (!response.ok) throw new Error('Failed to fetch completions');
  return response.json();
};

export const createCompletion = async (
  habitId: string,
  dayNumber: number,
  completed: boolean = true
): Promise<Completion> => {
  const response = await fetch(`${API_URL}/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ habit_id: habitId, day_number: dayNumber, completed }),
  });
  if (!response.ok) throw new Error('Failed to create completion');
  return response.json();
};

export const updateCompletion = async (
  habitId: string,
  dayNumber: number,
  completed: boolean
): Promise<Completion> => {
  const response = await fetch(`${API_URL}/completions`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ habit_id: habitId, day_number: dayNumber, completed }),
  });
  if (!response.ok) throw new Error('Failed to update completion');
  return response.json();
};
