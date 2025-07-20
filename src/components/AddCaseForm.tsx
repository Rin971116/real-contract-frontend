import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import { useAddCase } from '../hooks/useRealContract';
import { type CaseInit } from '../contracts/RealContract';

export function AddCaseForm() {
  const { address } = useAccount();
  const { addCase, isLoading, error } = useAddCase();
  
  const [formData, setFormData] = useState<Omit<CaseInit, 'compensationA' | 'compensationB' | 'votingDuration' | 'allocationMode'>>({
    caseName: '',
    caseDescription: '',
    participantA: '0x0000000000000000000000000000000000000000',
    participantB: '0x0000000000000000000000000000000000000000',
    winnerIfEqualVotes: '0x0000000000000000000000000000000000000000',
  });
  
  const [compensationA, setCompensationA] = useState('');
  const [compensationB, setCompensationB] = useState('');
  const [votingDuration, setVotingDuration] = useState('');
  const [allocationMode, setAllocationMode] = useState('0');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!address) return;

    const caseData: CaseInit = {
      ...formData,
      compensationA: BigInt(parseFloat(compensationA) * 1e18),
      compensationB: BigInt(parseFloat(compensationB) * 1e18),
      votingDuration: BigInt(parseInt(votingDuration) * 24 * 60 * 60), // 轉換為秒
      allocationMode: BigInt(allocationMode),
    };

    addCase(caseData);
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  if (!address) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">請先連接錢包</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">添加新案件</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            案件名稱 *
          </label>
          <input
            type="text"
            value={formData.caseName}
            onChange={(e) => handleInputChange('caseName', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            案件描述 *
          </label>
          <textarea
            value={formData.caseDescription}
            onChange={(e) => handleInputChange('caseDescription', e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              參與者 A 地址 *
            </label>
            <input
              type="text"
              value={formData.participantA}
              onChange={(e) => handleInputChange('participantA', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              placeholder="0x..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              參與者 B 地址 *
            </label>
            <input
              type="text"
              value={formData.participantB}
              onChange={(e) => handleInputChange('participantB', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              placeholder="0x..."
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              參與者 A 賠償金額 (ETH) *
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={compensationA}
              onChange={(e) => setCompensationA(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              參與者 B 賠償金額 (ETH) *
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={compensationB}
              onChange={(e) => setCompensationB(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            平票時獲勝者地址
          </label>
          <input
            type="text"
            value={formData.winnerIfEqualVotes}
            onChange={(e) => handleInputChange('winnerIfEqualVotes', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
            placeholder="0x..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              投票持續時間 (天) *
            </label>
            <input
              type="number"
              min="1"
              value={votingDuration}
              onChange={(e) => setVotingDuration(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              分配模式 *
            </label>
            <select
              value={allocationMode}
              onChange={(e) => setAllocationMode(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="0">全部給獲勝者</option>
              <option value="1">按比例分配</option>
              <option value="2">平均分配</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-800">錯誤: {error.message}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? '處理中...' : '添加案件'}
        </button>
      </form>
    </div>
  );
} 