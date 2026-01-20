import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import { Plus, Trash2 } from 'lucide-react';

interface Habit {
  id: string;
  name: string;
  month: number;
  year: number;
}

interface Completion {
  habit_id: string;
  day_number: number;
  completed: boolean;
}

function App() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completions, setCompletions] = useState<Completion[]>([]);
  const [newHabitName, setNewHabitName] = useState('');
  const [loading, setLoading] = useState(true);

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();
  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();

  useEffect(() => {
    loadHabits();
  }, []);

  const loadHabits = async () => {
    setLoading(true);
    const { data: habitsData } = await supabase
      .from('habits')
      .select('*')
      .eq('month', currentMonth)
      .eq('year', currentYear)
      .order('created_at', { ascending: true });

    if (habitsData) {
      setHabits(habitsData);

      const { data: completionsData } = await supabase
        .from('habit_completions')
        .select('*')
        .in('habit_id', habitsData.map(h => h.id));

      if (completionsData) {
        setCompletions(completionsData);
      }
    }
    setLoading(false);
  };

  const addHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;

    const { data } = await supabase
      .from('habits')
      .insert({
        name: newHabitName,
        month: currentMonth,
        year: currentYear,
      })
      .select()
      .single();

    if (data) {
      setHabits([...habits, data]);
      setNewHabitName('');
    }
  };

  const deleteHabit = async (habitId: string) => {
    await supabase.from('habits').delete().eq('id', habitId);
    setHabits(habits.filter(h => h.id !== habitId));
    setCompletions(completions.filter(c => c.habit_id !== habitId));
  };

  const toggleCompletion = async (habitId: string, day: number) => {
    const existing = completions.find(
      c => c.habit_id === habitId && c.day_number === day
    );

    if (existing) {
      const newCompleted = !existing.completed;
      await supabase
        .from('habit_completions')
        .update({ completed: newCompleted })
        .eq('habit_id', habitId)
        .eq('day_number', day);

      setCompletions(
        completions.map(c =>
          c.habit_id === habitId && c.day_number === day
            ? { ...c, completed: newCompleted }
            : c
        )
      );
    } else {
      const { data } = await supabase
        .from('habit_completions')
        .insert({
          habit_id: habitId,
          day_number: day,
          completed: true,
        })
        .select()
        .single();

      if (data) {
        setCompletions([...completions, data]);
      }
    }
  };

  const isCompleted = (habitId: string, day: number) => {
    const completion = completions.find(
      c => c.habit_id === habitId && c.day_number === day
    );
    return completion?.completed || false;
  };

  const getCompletionPercentage = (habitId: string) => {
    const habitCompletions = completions.filter(
      c => c.habit_id === habitId && c.completed
    );
    return Math.round((habitCompletions.length / daysInMonth) * 100);
  };

  const monthName = new Date(currentYear, currentMonth - 1).toLocaleString('default', {
    month: 'long',
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Habit Tracker
          </h1>
          <p className="text-gray-600 mb-8">
            {monthName} {currentYear}
          </p>

          <form onSubmit={addHabit} className="mb-8">
            <div className="flex gap-3">
              <input
                type="text"
                value={newHabitName}
                onChange={(e) => setNewHabitName(e.target.value)}
                placeholder="Enter a new habit..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium"
              >
                <Plus size={20} />
                Add Habit
              </button>
            </div>
          </form>

          {habits.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg">No habits yet. Add your first habit to get started!</p>
            </div>
          ) : (
            <>
              <div className="mb-8 overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="text-left p-3 bg-gray-50 border-b-2 border-gray-200 font-semibold text-gray-700 sticky left-0 bg-gray-50 z-10 min-w-[200px]">
                        Habit
                      </th>
                      {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => (
                        <th
                          key={day}
                          className="text-center p-2 bg-gray-50 border-b-2 border-gray-200 text-sm font-medium text-gray-600 min-w-[40px]"
                        >
                          {day}
                        </th>
                      ))}
                      <th className="text-center p-3 bg-gray-50 border-b-2 border-gray-200 font-semibold text-gray-700 min-w-[80px]">
                        %
                      </th>
                      <th className="text-center p-3 bg-gray-50 border-b-2 border-gray-200 font-semibold text-gray-700 min-w-[60px]">

                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {habits.map((habit) => {
                      const percentage = getCompletionPercentage(habit.id);
                      return (
                        <tr key={habit.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                          <td className="p-3 font-medium text-gray-700 sticky left-0 bg-white z-10">
                            {habit.name}
                          </td>
                          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => (
                            <td key={day} className="text-center p-2">
                              <input
                                type="checkbox"
                                checked={isCompleted(habit.id, day)}
                                onChange={() => toggleCompletion(habit.id, day)}
                                className="w-5 h-5 cursor-pointer accent-blue-600"
                              />
                            </td>
                          ))}
                          <td className="text-center p-3">
                            <span className={`font-bold ${percentage >= 80 ? 'text-green-600' : percentage >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                              {percentage}%
                            </span>
                          </td>
                          <td className="text-center p-3">
                            <button
                              onClick={() => deleteHabit(habit.id)}
                              className="text-red-500 hover:text-red-700 transition-colors p-1"
                            >
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="bg-gray-50 rounded-xl p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">
                  Completion Overview
                </h2>
                <div className="space-y-4">
                  {habits.map((habit) => {
                    const percentage = getCompletionPercentage(habit.id);
                    return (
                      <div key={habit.id}>
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium text-gray-700">{habit.name}</span>
                          <span className={`font-bold ${percentage >= 80 ? 'text-green-600' : percentage >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                            {percentage}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              percentage >= 80 ? 'bg-green-500' : percentage >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
