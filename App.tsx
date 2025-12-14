import React, { useState } from 'react';
import { Search, Loader2, Database, AlertCircle } from 'lucide-react';
import { KeywordData, AnalysisResult, KeywordClass, PlacementRecommendation } from './types';
import { analyzeAsinsWithGemini } from './services/geminiService';
import DashboardStats from './components/DashboardStats';
import KeywordTable from './components/KeywordTable';

const App: React.FC = () => {
  const [asinInput, setAsinInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<AnalysisResult | null>(null);

  const handleAnalyze = async () => {
    if (!asinInput.trim()) return;
    
    // Parse ASINs (handle commas, newlines, spaces)
    const asins = asinInput.split(/[\s,]+/).filter(a => a.length > 0).slice(0, 30); // Hard limit 30
    
    if (asins.length === 0) {
      setError("Please enter at least one valid ASIN.");
      return;
    }

    setLoading(true);
    setError(null);
    setData(null);

    try {
      const keywords = await analyzeAsinsWithGemini(asins);
      
      // Calculate Stats
      const summary = {
        totalKeywords: keywords.length,
        attackCount: keywords.filter(k => k.classification === KeywordClass.ATTACK).length,
        gapCount: keywords.filter(k => !k.isOrganic && k.intentScore > 6).length, // Simplified logic for gap
        ppcReadyCount: keywords.filter(k => 
          k.recommendation === PlacementRecommendation.PPC_EXACT || 
          k.recommendation === PlacementRecommendation.PPC_PHRASE
        ).length,
        analyzedAsins: asins
      };

      setData({ summary, keywords });
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during analysis.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <Database className="text-white h-6 w-6" />
            </div>
            <span className="text-xl font-bold text-gray-900 tracking-tight">AmzProfitScope</span>
          </div>
          <div className="text-sm text-gray-500 hidden md:block">
            Reverse ASIN Intelligence Tool
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Input Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <label htmlFor="asins" className="block text-sm font-medium text-gray-700 mb-2">
            Enter Competitor ASINs (Max 30)
          </label>
          <div className="relative">
            <textarea
              id="asins"
              rows={3}
              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-3 border font-mono"
              placeholder="B08ABCDEF1, B09XYZ1234..."
              value={asinInput}
              onChange={(e) => setAsinInput(e.target.value)}
              disabled={loading}
            />
            <div className="absolute bottom-3 right-3 text-xs text-gray-400">
              {asinInput.split(/[\s,]+/).filter(a => a.length > 0).length}/30
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleAnalyze}
              disabled={loading || !asinInput}
              className={`inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                  Analyzing Market...
                </>
              ) : (
                <>
                  <Search className="-ml-1 mr-2 h-5 w-5" />
                  Run Reverse Search
                </>
              )}
            </button>
          </div>
          
          {error && (
            <div className="mt-4 bg-red-50 border-l-4 border-red-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results Section */}
        {data ? (
          <div className="animate-fade-in-up">
            <div className="mb-6 flex items-baseline justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Intelligence Report</h2>
              <span className="text-sm text-gray-500">Based on {data.summary.analyzedAsins.length} ASINs</span>
            </div>
            
            <DashboardStats summary={data.summary} />
            <KeywordTable keywords={data.keywords} />
          </div>
        ) : (
          !loading && (
            <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
              <Database className="mx-auto h-12 w-12 text-gray-300" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No data generated</h3>
              <p className="mt-1 text-sm text-gray-500">Enter ASINs above to start scanning for profit opportunities.</p>
            </div>
          )
        )}
      </main>
    </div>
  );
};

export default App;