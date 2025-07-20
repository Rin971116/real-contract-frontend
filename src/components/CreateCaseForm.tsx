import React, { useState, useEffect } from 'react';
import { useAddCase } from '../hooks/useRealContract';
import { useWaitForTransactionReceipt, useAccount } from 'wagmi';

interface CreateCaseFormProps {
  onClose: () => void;
}

export function CreateCaseForm({ onClose }: CreateCaseFormProps) {
  const { addCase, isLoading, error, hash } = useAddCase();
  const { address } = useAccount();
  
  // 監聽交易收據
  const { data: receipt, isSuccess } = useWaitForTransactionReceipt({
    hash: hash,
  });
  
  // 當交易成功時關閉表單
  useEffect(() => {
    if (isSuccess && receipt) {
      // 顯示成功訊息
      alert('案件創建成功！');
      onClose();
    }
  }, [isSuccess, receipt, onClose]);
  
  const [formData, setFormData] = useState({
    caseName: '',
    caseDescription: '',
    participantA: '',
    participantB: '',
    compensationA: '',
    compensationB: '',
    votingDuration: '86400', // 24小時，以秒為單位
    allocationMode: '0'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 檢查地址是否為空
    if (!formData.participantA.trim() || !formData.participantB.trim()) {
      alert('請填寫所有參與者地址');
      return;
    }
    
    // 驗證地址格式
    const addressRegex = /^0x[a-fA-F0-9]{40}$/;
    if (!addressRegex.test(formData.participantA) || 
        !addressRegex.test(formData.participantB)) {
      alert('請輸入有效的以太坊地址（0x開頭的42位字符）');
      return;
    }
    
    // 檢查合約人地址是否相同
    if (formData.participantA.toLowerCase() === formData.participantB.toLowerCase()) {
      alert('合約人 A 和合約人 B 不能是同一個地址');
      return;
    }

    // 轉換為合約需要的格式
    // FERC20 有 18 位小數，所以需要乘以 10^18
    const caseData = {
      caseName: formData.caseName,
      caseDescription: formData.caseDescription,
      participantA: formData.participantA as `0x${string}`,
      participantB: formData.participantB as `0x${string}`,
      compensationA: BigInt(Math.floor(parseFloat(formData.compensationA) * 10 ** 18)),
      compensationB: BigInt(Math.floor(parseFloat(formData.compensationB) * 10 ** 18)),
      votingDuration: BigInt(formData.votingDuration),
      allocationMode: BigInt(formData.allocationMode)
    };

    addCase(caseData);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-[#161b22] rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-[#30363d]">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-[#f0f6fc]">創建新案件</h2>
            <button
              onClick={onClose}
              disabled={isLoading}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* 案件名稱 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-[#8b949e] mb-2">
              案件名稱 *
            </label>
            <input
              type="text"
              name="caseName"
              value={formData.caseName}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-[#30363d] rounded-md bg-white dark:bg-[#0d1117] text-gray-900 dark:text-[#f0f6fc] focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="請輸入案件名稱"
            />
          </div>

          {/* 案件描述 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-[#8b949e] mb-2">
              案件描述 *
            </label>
            <textarea
              name="caseDescription"
              value={formData.caseDescription}
              onChange={handleInputChange}
              required
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 dark:border-[#30363d] rounded-md bg-white dark:bg-[#0d1117] text-gray-900 dark:text-[#f0f6fc] focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="請詳細描述案件內容"
            />
          </div>

          {/* 合約人 A */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-[#8b949e] mb-2">
              合約人 A 地址 *
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                name="participantA"
                value={formData.participantA}
                onChange={handleInputChange}
                required
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-[#30363d] rounded-md bg-white dark:bg-[#0d1117] text-gray-900 dark:text-[#f0f6fc] focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0x..."
              />
              {address && (
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, participantA: address }))}
                  className="px-3 py-2 bg-blue-600 dark:bg-[#58a6ff] text-white rounded-md hover:bg-blue-700 dark:hover:bg-[#4a9eff] transition-colors text-sm whitespace-nowrap"
                >
                  填入當前地址
                </button>
              )}
            </div>
          </div>

          {/* 合約人 B */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-[#8b949e] mb-2">
              合約人 B 地址 *
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                name="participantB"
                value={formData.participantB}
                onChange={handleInputChange}
                required
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-[#30363d] rounded-md bg-white dark:bg-[#0d1117] text-gray-900 dark:text-[#f0f6fc] focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0x..."
              />
              {address && (
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, participantB: address }))}
                  className="px-3 py-2 bg-blue-600 dark:bg-[#58a6ff] text-white rounded-md hover:bg-blue-700 dark:hover:bg-[#4a9eff] transition-colors text-sm whitespace-nowrap"
                >
                  填入當前地址
                </button>
              )}
            </div>
          </div>

          {/* 保證金金額 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-[#8b949e] mb-2">
                合約人 A 保證金 (FERC20) *
              </label>
              <input
                type="number"
                name="compensationA"
                value={formData.compensationA}
                onChange={handleInputChange}
                required
                step="0.000000000000000001" // 18位小數
                min="0"
                className="w-full px-3 py-2 border border-gray-300 dark:border-[#30363d] rounded-md bg-white dark:bg-[#0d1117] text-gray-900 dark:text-[#f0f6fc] focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-[#8b949e] mb-2">
                合約人 B 保證金 (FERC20) *
              </label>
              <input
                type="number"
                name="compensationB"
                value={formData.compensationB}
                onChange={handleInputChange}
                required
                step="0.000000000000000001" // 18位小數
                min="0"
                className="w-full px-3 py-2 border border-gray-300 dark:border-[#30363d] rounded-md bg-white dark:bg-[#0d1117] text-gray-900 dark:text-[#f0f6fc] focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.1"
              />
            </div>
          </div>



          {/* 投票持續時間 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-[#8b949e] mb-2">
              投票持續時間 (秒) *
            </label>
            <input
              type="number"
              name="votingDuration"
              value={formData.votingDuration}
              onChange={handleInputChange}
              required
              min="1"
              className="w-full px-3 py-2 border border-gray-300 dark:border-[#30363d] rounded-md bg-white dark:bg-[#0d1117] text-gray-900 dark:text-[#f0f6fc] focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="86400 (24小時)"
            />
            <p className="text-xs text-gray-500 dark:text-[#6e7681] mt-1">
              提示: 3600秒=1小時, 86400秒=24小時, 604800秒=7天
            </p>
          </div>

          {/* 分配模式 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-[#8b949e] mb-2">
              分配模式 *
            </label>
            <select
              name="allocationMode"
              value={formData.allocationMode}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-[#30363d] rounded-md bg-white dark:bg-[#0d1117] text-gray-900 dark:text-[#f0f6fc] focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="0">勝者全拿</option>
              <option value="1">照得票數比例分配</option>
            </select>
            <p className="text-xs text-gray-500 dark:text-[#6e7681] mt-1">
              勝者全拿: 獲勝者獲得所有保證金 | 比例分配: 按投票比例分配保證金
            </p>
          </div>

          {/* 錯誤訊息 */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
              <p className="text-red-800 dark:text-red-200 text-sm">
                錯誤: {error.message}
              </p>
            </div>
          )}

          {/* 按鈕 */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-gray-700 dark:text-[#8b949e] bg-gray-100 dark:bg-[#21262d] rounded-md hover:bg-gray-200 dark:hover:bg-[#30363d] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className={`px-4 py-2 rounded-md transition-colors ${
                isLoading
                  ? 'bg-gray-400 dark:bg-gray-600 text-gray-200 dark:text-gray-300 cursor-not-allowed'
                  : 'bg-blue-600 dark:bg-[#58a6ff] text-white hover:bg-blue-700 dark:hover:bg-[#4a9eff]'
              }`}
            >
              {isLoading ? '創建中...' : '創建案件'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 