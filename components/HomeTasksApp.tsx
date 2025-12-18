
import React from 'react';
import { HomeTask, Language } from '../types';
import { useTranslation } from '../translations';

interface HomeTasksAppProps {
  tasks: HomeTask[];
  language: Language;
  onToggleTask: (taskId: string) => void;
}

const HomeTasksApp: React.FC<HomeTasksAppProps> = ({ tasks, language, onToggleTask }) => {
  const t = useTranslation(language);
  const completedCount = tasks.filter(task => task.status === 'completed').length;
  const progress = Math.round((completedCount / (tasks.length || 1)) * 100);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Cleaning': return 'bg-blue-100 text-blue-700';
      case 'Laundry': return 'bg-pink-100 text-pink-700';
      case 'Kitchen': return 'bg-yellow-100 text-yellow-700';
      case 'Garden': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">{t.homeTasksTitle}</h2>
        <div className="flex items-center space-x-3">
          <span className="text-sm font-medium text-gray-500">{progress}% {t.done}</span>
          <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-teal-500 transition-all duration-500" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-teal-50 p-6 rounded-3xl border border-teal-100 md:col-span-1">
          <h3 className="font-bold text-teal-900 mb-4">{t.quickStats}</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-teal-700">{t.pendingTasks}</span>
              <span className="font-bold text-teal-900">{tasks.length - completedCount}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-teal-700">{t.completed}</span>
              <span className="font-bold text-teal-900">{completedCount}</span>
            </div>
            <button className="w-full mt-4 bg-teal-600 text-white py-2 rounded-xl font-bold hover:bg-teal-700 transition-colors">
              + {t.newTask}
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm md:col-span-2">
          <h3 className="text-lg font-semibold mb-4">{t.choreList}</h3>
          <div className="space-y-3">
            {tasks.map(task => (
              <div 
                key={task.id} 
                className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                  task.status === 'completed' ? 'bg-gray-50 border-gray-100 opacity-60' : 'bg-white border-gray-100'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <button 
                    onClick={() => onToggleTask(task.id)}
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                      task.status === 'completed' ? 'bg-teal-500 border-teal-500' : 'border-gray-300'
                    }`}
                  >
                    {task.status === 'completed' && (
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                  <div>
                    <p className={`font-bold ${task.status === 'completed' ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                      {task.title}
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${getCategoryColor(task.category)}`}>
                        {task.category}
                      </span>
                      <span className="text-xs text-gray-400">• {t.pending} {task.dueDate}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-600 border border-white">
                    {task.assignedTo.split(' ').map(n => n[0]).join('')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeTasksApp;
