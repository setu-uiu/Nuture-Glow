import React from 'react';
import { TrendingUp, Check, Lock } from 'lucide-react';

interface CompletionChecklistItem {
  label: string;
  completed: boolean;
  required: boolean;
}

interface ProfileStrengthCardProps {
  completion: number;
  items?: CompletionChecklistItem[];
}

const ProfileStrengthCard: React.FC<ProfileStrengthCardProps> = ({ 
  completion,
  items = [
    { label: 'Full name', completed: true, required: true },
    { label: 'Profile picture', completed: true, required: true },
    { label: 'Blood group', completed: false, required: false },
    { label: 'Emergency contact', completed: false, required: false },
    { label: 'Medical records', completed: false, required: false },
    { label: 'Health ID verified', completed: false, required: false }
  ]
}) => {
  const completedItems = items.filter(item => item.completed).length;
  const requiredItems = items.filter(item => item.required);
  const allRequiredComplete = requiredItems.every(item => item.completed);

  // Circular progress indicator
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (completion / 100) * circumference;

  return (
    <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-gradient-to-br from-teal-100 to-[#BFE6DA]/40 rounded-2xl text-teal-600">
          <TrendingUp size={24} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-800">Profile Strength</h3>
          <p className="text-xs text-gray-400 font-medium mt-1">Complete your profile</p>
        </div>
      </div>

      {/* Circular Progress Indicator */}
      <div className="flex flex-col items-center gap-6 mb-8">
        <div className="relative w-32 h-32">
          <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="#f3f4f6"
              strokeWidth="6"
            />
            {/* Progress circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="url(#progressGradient)"
              strokeWidth="6"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-500"
            />
            <defs>
              <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#14b8a6" />
                <stop offset="100%" stopColor="#BFE6DA" />
              </linearGradient>
            </defs>
          </svg>
          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-teal-600">{completion}%</span>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Complete</span>
          </div>
        </div>

        {/* Status text */}
        <div className="text-center">
          <p className="text-sm font-bold text-gray-800">
            {completedItems} of {items.length} items
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {allRequiredComplete ? '✓ All required items complete' : 'Add required items to get verified'}
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-8">
        <div
          className="h-full bg-gradient-to-r from-teal-500 to-[#BFE6DA] transition-all duration-500"
          style={{ width: `${completion}%` }}
        />
      </div>

      {/* Checklist */}
      <div className="space-y-4">
        {/* Completed Items */}
        {items.filter(item => item.completed).length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
              <Check size={14} className="text-green-600" />
              Completed
            </h4>
            <div className="space-y-2 pl-6">
              {items.map((item, idx) => item.completed && (
                <div key={idx} className="flex items-center gap-2 text-xs text-gray-600">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Missing Items */}
        {items.filter(item => !item.completed).length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
              <Lock size={14} className="text-gray-400" />
              Missing Items
            </h4>
            <div className="space-y-2 pl-6">
              {items.map((item, idx) => !item.completed && (
                <div key={idx} className="flex items-center gap-2 text-xs text-gray-500">
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
                  <span>
                    {item.label}
                    {item.required && <span className="text-red-500 ml-1">*</span>}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <p className="text-xs text-gray-400 mt-6 pt-6 border-t border-gray-100">
        * Required items needed for full verification
      </p>
    </div>
  );
};

export default ProfileStrengthCard;
