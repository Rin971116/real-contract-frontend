import React, { useState } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { useDarkMode } from './hooks/useDarkMode';
import { CreateCaseForm } from './components/CreateCaseForm';
import { CaseList } from './components/CaseList';


type ViewMode = 'main' | 'personal' | 'voting';

function App() {
  const { address } = useAccount();
  const { isDark, toggleDarkMode } = useDarkMode();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('main');
  const [selectedCase, setSelectedCase] = useState<number | null>(null);



  const getPageTitle = () => {
    switch (viewMode) {
      case 'personal':
        return '個人案件';
      case 'voting':
        return '待投票案件';
      default:
        return '歡迎使用 RealContract';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0d1117] transition-colors duration-200">
      {/* 頂部導航欄 */}
      <header className="bg-white dark:bg-[#161b22] shadow-sm border-b border-gray-200 dark:border-[#30363d] transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* 左側 Logo/標題 */}
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900 dark:text-[#f0f6fc]">RealContract DApp</h1>
            </div>
            
            {/* 右側按鈕區域 */}
            <div className="flex items-center space-x-4">
              {/* 深色模式切換按鈕 */}
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg bg-gray-100 dark:bg-[#21262d] hover:bg-gray-200 dark:hover:bg-[#30363d] transition-colors duration-200"
                title={isDark ? '切換到淺色模式' : '切換到深色模式'}
              >
                {isDark ? (
                  <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                  </svg>
                )}
              </button>
              
              {/* 錢包連接按鈕 */}
              <ConnectButton />
            </div>
          </div>
        </div>
      </header>

      {/* 主要內容區域 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {viewMode === 'main' ? (
          // 主頁面
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-[#f0f6fc] mb-4">
              {getPageTitle()}
          </h2>
            <p className="text-lg text-gray-600 dark:text-[#8b949e] mb-8 max-w-2xl mx-auto">
            這是一個去中心化的案件管理平台，您可以參與案件投票、創建新案件，並參與治理決策。
          </p>
            

          
          {/* 功能卡片區域 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              <div 
                className="bg-white dark:bg-[#161b22] p-6 rounded-lg shadow-md border border-gray-200 dark:border-[#30363d] transition-colors duration-200 cursor-pointer hover:shadow-lg"
                onClick={() => setViewMode('personal')}
              >
              <div className="text-blue-600 dark:text-[#58a6ff] text-2xl mb-4">📋</div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-[#f0f6fc] mb-2">查看個人案件</h3>
              <p className="text-gray-600 dark:text-[#8b949e]">瀏覽該帳號所有正在進行和已完成的案件</p>
            </div>
            
            <div 
              className="bg-white dark:bg-[#161b22] p-6 rounded-lg shadow-md border border-gray-200 dark:border-[#30363d] transition-colors duration-200 cursor-pointer hover:shadow-lg"
              onClick={() => setShowCreateForm(true)}
            >
              <div className="text-green-600 dark:text-[#7ee787] text-2xl mb-4">➕</div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-[#f0f6fc] mb-2">創建案件</h3>
              <p className="text-gray-600 dark:text-[#8b949e]">提交新的案件供社區投票</p>
            </div>
            
              <div 
                className="bg-white dark:bg-[#161b22] p-6 rounded-lg shadow-md border border-gray-200 dark:border-[#30363d] transition-colors duration-200 cursor-pointer hover:shadow-lg"
                onClick={() => setViewMode('voting')}
              >
              <div className="text-purple-600 dark:text-[#d2a8ff] text-2xl mb-4">🗳️</div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-[#f0f6fc] mb-2">待投票案件</h3>
              <p className="text-gray-600 dark:text-[#8b949e]">對案件進行投票，參與仲裁</p>
            </div>
          </div>
        </div>
        ) : (
          // 案件列表頁面
          <div>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-[#f0f6fc]">{getPageTitle()}</h2>
              <button
                onClick={() => setViewMode('main')}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
              >
                ← 返回主頁
              </button>
            </div>
            <CaseList 
              mode={viewMode === 'personal' ? 'personal' : 'voting'} 
              onCaseSelect={setSelectedCase} 
            />
          </div>
        )}
      </main>

      {/* 創建案件表單 */}
      {showCreateForm && (
        <CreateCaseForm onClose={() => setShowCreateForm(false)} />
      )}
    </div>
  );
}

export default App;
