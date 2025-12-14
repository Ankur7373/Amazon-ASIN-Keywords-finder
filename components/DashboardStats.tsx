import React from 'react';
import { AnalysisSummary } from '../types';
import { TrendingUp, Target, ShieldAlert, BadgeDollarSign } from 'lucide-react';

interface Props {
  summary: AnalysisSummary;
}

const DashboardStats: React.FC<Props> = ({ summary }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center space-x-4">
        <div className="p-3 bg-blue-50 rounded-full text-blue-600">
          <Target size={24} />
        </div>
        <div>
          <p className="text-sm text-gray-500 font-medium">Total Keywords</p>
          <p className="text-2xl font-bold text-gray-900">{summary.totalKeywords}</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center space-x-4">
        <div className="p-3 bg-green-50 rounded-full text-green-600">
          <TrendingUp size={24} />
        </div>
        <div>
          <p className="text-sm text-gray-500 font-medium">Attack Opportunities</p>
          <p className="text-2xl font-bold text-gray-900">{summary.attackCount}</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center space-x-4">
        <div className="p-3 bg-yellow-50 rounded-full text-yellow-600">
          <BadgeDollarSign size={24} />
        </div>
        <div>
          <p className="text-sm text-gray-500 font-medium">PPC Ready</p>
          <p className="text-2xl font-bold text-gray-900">{summary.ppcReadyCount}</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center space-x-4">
        <div className="p-3 bg-red-50 rounded-full text-red-600">
          <ShieldAlert size={24} />
        </div>
        <div>
          <p className="text-sm text-gray-500 font-medium">Keywords to Gap</p>
          <p className="text-2xl font-bold text-gray-900">{summary.gapCount}</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;