import React, { useState, useEffect } from 'react';
import { Plus, RotateCcw, CheckCircle2, Circle, Trash2 } from 'lucide-react-native';

const APP_STORAGE_KEY = '2026_planner_data';

const FIXED_REVIEW_ITEMS = [
  '育膚堂帳單', '賣貨便帳款', '蝦皮帳款R', '蝦皮帳款U',
  '廠商帳單', '他牌帳單', '台幣帳單', '內地帳單', '簽約帳單'
];

const App = () => {
  const [activeTab, setActiveTab] = useState('daily');
  const [data, setData] = useState({
    daily: [],
    monthly: [],
    review: FIXED_REVIEW_ITEMS.map((text, idx) => ({ id: `fixed-${idx}`, text, completed: false, timestamp: Date.now() })),
    yearly: []
  });

  const tabs = [
    { id: 'daily', label: '每日待辦' },
    { id: 'monthly', label: '每月計畫' },
    { id: 'review', label: '每月固定檢視' },
    { id: 'yearly', label: '每年總計畫' }
  ];

  // Load data from localStorage
  useEffect(() => {
    const savedData = localStorage.getItem(APP_STORAGE_KEY);
    if (savedData) {
      try {
        setData(JSON.parse(savedData));
      } catch (e) {
        console.error("Failed to parse saved data", e);
      }
    }
  }, []);

  // Save data to localStorage
  useEffect(() => {
    localStorage.setItem(APP_STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  const addItem = (tabId) => {
    const newItem = {
      id: crypto.randomUUID(),
      text: '',
      completed: false,
      timestamp: Date.now()
    };
    setData(prev => ({
      ...prev,
      [tabId]: [newItem, ...prev[tabId]]
    }));
  };

  const toggleItem = (tabId, itemId) => {
    setData(prev => ({
      ...prev,
      [tabId]: prev[tabId].map(item => 
        item.id === itemId ? { ...item, completed: !item.completed } : item
      )
    }));
  };

  const updateText = (tabId, itemId, text) => {
    setData(prev => ({
      ...prev,
      [tabId]: prev[tabId].map(item => 
        item.id === itemId ? { ...item, text } : item
      )
    }));
  };

  const deleteItem = (tabId, itemId) => {
    setData(prev => ({
      ...prev,
      [tabId]: prev[tabId].filter(item => item.id !== itemId)
    }));
  };

  const resetReview = () => {
    setData(prev => ({
      ...prev,
      review: FIXED_REVIEW_ITEMS.map((text, idx) => ({ 
        id: `fixed-${idx}-${Date.now()}`, 
        text, 
        completed: false, 
        timestamp: Date.now() 
      }))
    }));
  };

  // Sorting logic: Uncompleted first (newest top), Completed last
  const getSortedItems = (tabId) => {
    return [...data[tabId]].sort((a, b) => {
      if (a.completed === b.completed) {
        return b.timestamp - a.timestamp;
      }
      return a.completed ? 1 : -1;
    });
  };

  return (
    <div className="min-h-screen bg-black text-gray-100 font-sans selection:bg-purple-500/30">
      {/* Header & Tabs */}
      <header className="sticky top-0 z-10 bg-black/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-3xl mx-auto px-4 pt-6 pb-2">
          <h1 className="text-2xl font-bold mb-6 text-white tracking-tight">
            2026 <span className="text-purple-500">計畫表</span>
          </h1>
          
          <nav className="flex space-x-1 overflow-x-auto no-scrollbar pb-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id 
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/20' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-300">
            {tabs.find(t => t.id === activeTab)?.label}
          </h2>
          
          <div className="flex space-x-2">
            {activeTab === 'review' && (
              <button 
                onClick={resetReview}
                className="flex items-center space-x-2 px-3 py-2 rounded-full bg-gray-800 hover:bg-gray-700 text-cyan-400 transition-colors text-xs font-bold"
              >
                <RotateCcw size={14} />
                <span>一鍵重置</span>
              </button>
            )}
            <button 
              onClick={() => addItem(activeTab)}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-600 hover:bg-purple-500 text-white transition-transform active:scale-95 shadow-lg shadow-purple-900/30"
            >
              <Plus size={24} />
            </button>
          </div>
        </div>

        {/* List Rendering */}
        <div className="space-y-3">
          {getSortedItems(activeTab).length === 0 ? (
            <div className="py-20 text-center text-gray-600 italic">
              目前沒有事項，點擊上方按鈕新增一個。
            </div>
          ) : (
            getSortedItems(activeTab).map(item => (
              <div 
                key={item.id}
                className={`group flex items-center space-x-3 p-4 rounded-xl border transition-all duration-300 ${
                  item.completed 
                    ? 'bg-white/5 border-transparent opacity-50' 
                    : 'bg-white/5 border-white/5 hover:border-purple-500/30'
                }`}
              >
                <button 
                  onClick={() => toggleItem(activeTab, item.id)}
                  className={`flex-shrink-0 transition-colors ${
                    item.completed ? 'text-purple-500' : 'text-gray-500 hover:text-purple-400'
                  }`}
                >
                  {item.completed ? <CheckCircle2 size={22} /> : <Circle size={22} />}
                </button>

                <input 
                  type="text"
                  value={item.text}
                  onChange={(e) => updateText(activeTab, item.id, e.target.value)}
                  placeholder="輸入內容..."
                  className={`flex-grow bg-transparent border-none focus:ring-0 text-base transition-all ${
                    item.completed ? 'line-through text-gray-500' : 'text-gray-100'
                  }`}
                  autoFocus={item.text === ''}
                />

                <button 
                  onClick={() => deleteItem(activeTab, item.id)}
                  className="opacity-0 group-hover:opacity-100 p-2 text-gray-600 hover:text-red-400 transition-all"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Custom Styles for hidden scrollbar */}
      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default App;