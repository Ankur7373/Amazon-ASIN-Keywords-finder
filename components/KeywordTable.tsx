import React, { useState, useMemo } from 'react';
import { KeywordData, KeywordClass, PlacementRecommendation } from '../types';
import { ArrowUpDown, Download, CheckCircle, AlertTriangle, XCircle, Search } from 'lucide-react';

interface Props {
  keywords: KeywordData[];
}

const KeywordTable: React.FC<Props> = ({ keywords }) => {
  const [sortField, setSortField] = useState<keyof KeywordData>('intentScore');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [filterText, setFilterText] = useState('');
  const [classFilter, setClassFilter] = useState<KeywordClass | 'All'>('All');

  const handleSort = (field: keyof KeywordData) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const filteredAndSortedData = useMemo(() => {
    let data = [...keywords];

    // Filter
    if (filterText) {
      data = data.filter(k => k.term.toLowerCase().includes(filterText.toLowerCase()));
    }
    if (classFilter !== 'All') {
      data = data.filter(k => k.classification === classFilter);
    }

    // Sort
    data.sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }
      return 0;
    });

    return data;
  }, [keywords, sortField, sortDirection, filterText, classFilter]);

  const getClassBadge = (cls: KeywordClass) => {
    switch (cls) {
      case KeywordClass.ATTACK:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"><CheckCircle size={12} className="mr-1" /> Attack</span>;
      case KeywordClass.SUPPORT:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"><AlertTriangle size={12} className="mr-1" /> Support</span>;
      case KeywordClass.WASTE:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"><XCircle size={12} className="mr-1" /> Waste</span>;
    }
  };

  const downloadCSV = () => {
    const headers = ['Keyword', 'Classification', 'Intent Score', 'Est. Volume', 'Competition', 'Recommendation', 'Reasoning'];
    const rows = filteredAndSortedData.map(k => [
      k.term,
      k.classification,
      k.intentScore,
      k.searchVolumeEst,
      k.competition,
      k.recommendation,
      `"${k.reasoning}"`
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "amz_profit_scope_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white shadow rounded-lg border border-gray-200 overflow-hidden">
      {/* Table Controls */}
      <div className="p-4 border-b border-gray-200 bg-gray-50 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center space-x-2 w-full md:w-auto">
          <div className="relative rounded-md shadow-sm max-w-xs w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-gray-400" />
            </div>
            <input
              type="text"
              className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md p-2 border"
              placeholder="Search keywords..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
            />
          </div>
          <select
            className="block pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md border"
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value as KeywordClass | 'All')}
          >
            <option value="All">All Classes</option>
            <option value={KeywordClass.ATTACK}>Attack</option>
            <option value={KeywordClass.SUPPORT}>Support</option>
            <option value={KeywordClass.WASTE}>Waste</option>
          </select>
        </div>
        <button
          onClick={downloadCSV}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
        >
          <Download size={16} className="mr-2" />
          Export CSV
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {[
                { label: 'Keyword', key: 'term' },
                { label: 'Class', key: 'classification' },
                { label: 'Intent (0-10)', key: 'intentScore' },
                { label: 'Est. Vol', key: 'searchVolumeEst' },
                { label: 'Competition', key: 'competition' },
                { label: 'Action', key: 'recommendation' },
              ].map((col) => (
                <th
                  key={col.label}
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort(col.key as keyof KeywordData)}
                >
                  <div className="flex items-center">
                    {col.label}
                    <ArrowUpDown size={14} className="ml-1 text-gray-400" />
                  </div>
                </th>
              ))}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Reasoning
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredAndSortedData.map((keyword, idx) => (
              <tr key={idx} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {keyword.term}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {getClassBadge(keyword.classification)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div className="flex items-center">
                    <span className={`font-bold ${keyword.intentScore >= 8 ? 'text-green-600' : 'text-gray-600'}`}>
                      {keyword.intentScore}
                    </span>
                    <div className="ml-2 w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${keyword.intentScore >= 8 ? 'bg-green-500' : keyword.intentScore >= 5 ? 'bg-yellow-500' : 'bg-red-500'}`} 
                        style={{ width: `${keyword.intentScore * 10}%` }}
                      ></div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {keyword.searchVolumeEst.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className={`px-2 py-1 rounded text-xs ${
                    keyword.competition === 'High' ? 'bg-red-50 text-red-700' :
                    keyword.competition === 'Medium' ? 'bg-yellow-50 text-yellow-700' :
                    'bg-green-50 text-green-700'
                  }`}>
                    {keyword.competition}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-indigo-600">
                  {keyword.recommendation}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate" title={keyword.reasoning}>
                  {keyword.reasoning}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {filteredAndSortedData.length === 0 && (
        <div className="p-12 text-center text-gray-500">
          No keywords found matching your filters.
        </div>
      )}
    </div>
  );
};

export default KeywordTable;