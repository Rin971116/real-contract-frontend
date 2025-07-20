import React, { useState, useEffect } from 'react';
import { useAccount, useContractRead } from 'wagmi';
import { useContractStatus, useCase, useCaseResult, useStakeCompensation, useStartCaseVoting, useExecuteCase, useApproveERC20, useERC20Allowance, useERC20Balance, useVote } from '../hooks/useRealContract';
import { CaseStatus, type Case, FAKE_ERC20_ADDRESS, REAL_CONTRACT_ADDRESS, REAL_CONTRACT_ABI, FAKE_ERC20_ABI } from '../contracts/RealContract';
import { VOTER_ABI, VOTER_ADDRESS } from '../contracts/Voter';

// 投票代幣授權組件
function VoteTokenApproval({ onApproved }: { onApproved: () => void }) {
  const { address } = useAccount();
  const [isChecking, setIsChecking] = useState(true);
  const [needsApproval, setNeedsApproval] = useState(false);
  const [voteTokenAmount, setVoteTokenAmount] = useState<bigint>(BigInt(0));
  const [voteTokenBalance, setVoteTokenBalance] = useState<bigint>(BigInt(0));
  const [voteTokenAllowance, setVoteTokenAllowance] = useState<bigint>(BigInt(0));
  
  const { approveERC20, isLoading: isApproving } = useApproveERC20();

  useEffect(() => {
    const checkVoteTokenStatus = async () => {
      if (!address) return;
      
      try {
        // 獲取投票代幣數量
        const { data: amount } = await import('wagmi').then(wagmi => 
          wagmi.useContractRead({
            address: REAL_CONTRACT_ADDRESS as `0x${string}`,
            abi: REAL_CONTRACT_ABI,
            functionName: 'voteTokenAmount',
          })
        );
        
        if (amount) {
          setVoteTokenAmount(amount);
          
          // 獲取投票代幣餘額
          const { data: balance } = await import('wagmi').then(wagmi => 
            wagmi.useContractRead({
              address: FAKE_ERC20_ADDRESS as `0x${string}`,
              abi: FAKE_ERC20_ABI,
              functionName: 'balanceOf',
              args: [address],
            })
          );
          
          if (balance) {
            setVoteTokenBalance(balance);
          }
          
          // 獲取授權額度
          const { data: allowance } = await import('wagmi').then(wagmi => 
            wagmi.useContractRead({
              address: FAKE_ERC20_ADDRESS as `0x${string}`,
              abi: FAKE_ERC20_ABI,
              functionName: 'allowance',
              args: [address, REAL_CONTRACT_ADDRESS as `0x${string}`],
            })
          );
          
          if (allowance) {
            setVoteTokenAllowance(allowance);
            setNeedsApproval(allowance < amount);
          }
        }
      } catch (error) {
        console.error('檢查投票代幣狀態失敗:', error);
      } finally {
        setIsChecking(false);
      }
    };

    checkVoteTokenStatus();
  }, [address]);

  const handleApprove = async () => {
    if (!address || !voteTokenAmount) return;
    
    try {
      await approveERC20(REAL_CONTRACT_ADDRESS as `0x${string}`, voteTokenAmount);
      onApproved();
    } catch (error) {
      console.error('授權失敗:', error);
    }
  };

  if (isChecking) {
    return (
      <div className="mb-3 p-2 bg-gray-50 dark:bg-gray-900/20 rounded-md">
        <p className="text-xs text-gray-600 dark:text-gray-400">檢查投票代幣狀態...</p>
      </div>
    );
  }

  if (voteTokenBalance < voteTokenAmount) {
    return (
      <div className="mb-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-md">
        <p className="text-sm text-red-800 dark:text-red-200">
          投票代幣餘額不足！需要 {Number(voteTokenAmount) / 1e18} FERC20，當前餘額 {Number(voteTokenBalance) / 1e18} FERC20
        </p>
      </div>
    );
  }

  if (needsApproval) {
    return (
      <div className="mb-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-md">
        <div className="flex justify-between items-center">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            需要授權投票代幣 ({Number(voteTokenAmount) / 1e18} FERC20)
          </p>
          <button
            onClick={handleApprove}
            disabled={isApproving}
            className={`px-3 py-1 rounded-md text-sm ${
              isApproving
                ? 'bg-gray-400 dark:bg-gray-600 text-gray-200 dark:text-gray-300 cursor-not-allowed'
                : 'bg-yellow-600 dark:bg-yellow-500 text-white hover:bg-yellow-700 dark:hover:bg-yellow-600'
            }`}
          >
            {isApproving ? '授權中...' : '授權'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-md">
      <p className="text-sm text-green-800 dark:text-green-200">
        ✓ 投票代幣已授權 ({Number(voteTokenAmount) / 1e18} FERC20)
      </p>
    </div>
  );
}

// 投票倒計時組件
function VotingCountdown({ endTime }: { endTime: number }) {
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    const updateCountdown = () => {
      const now = Math.floor(Date.now() / 1000);
      const remaining = endTime - now;
      
      if (remaining <= 0) {
        setTimeLeft('投票已結束');
        return;
      }

      const hours = Math.floor(remaining / 3600);
      const minutes = Math.floor((remaining % 3600) / 60);
      const seconds = remaining % 60;

      setTimeLeft(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [endTime]);

  return (
    <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
      剩餘時間: {timeLeft}
    </p>
  );
}

interface CaseListProps {
  onCaseSelect?: (caseNum: number) => void;
  mode: 'personal' | 'voting'; // 新增模式參數
}

// 檢查是否為投票者的 hook
function useIsVoter() {
  const { address } = useAccount();
  
  const { data: isVoter, isLoading } = useContractRead({
    address: VOTER_ADDRESS as `0x${string}`,
    abi: VOTER_ABI,
    functionName: 'isVoter',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  return { 
    isVoter: isVoter || false, 
    isLoading: isLoading || !address 
  };
}

// 單個案件組件
function CaseItem({ caseNum, onSelect, mode }: { caseNum: number; onSelect: () => void; mode: 'personal' | 'voting' }) {
  const { case: caseData, isLoading } = useCase(caseNum);
  const { result: caseResult } = useCaseResult(caseNum);
  const { address } = useAccount();
  
  // 操作 hooks
  const { stakeCompensation, isLoading: isStaking } = useStakeCompensation();
  const { startCaseVoting, isLoading: isStartingVoting } = useStartCaseVoting();
  const { executeCase, isLoading: isExecuting } = useExecuteCase();
  const { approveERC20, isLoading: isApproving } = useApproveERC20();
  const { vote, isLoading: isVoting } = useVote();

  // ERC20 相關檢查
  const { allowance, refetch: refetchAllowance } = useERC20Allowance(address, REAL_CONTRACT_ADDRESS as `0x${string}`);
  const { balance } = useERC20Balance(address);

  // 檢查當前用戶是否為合約人
  const isParticipantA = address && caseData?.participantA.toLowerCase() === address.toLowerCase();
  const isParticipantB = address && caseData?.participantB.toLowerCase() === address.toLowerCase();
  const isCurrentParticipant = isParticipantA || isParticipantB;

  // 本地pending狀態管理
  const [localPendingStates, setLocalPendingStates] = useState<{
    stakeA: boolean;
    stakeB: boolean;
    approve: boolean;
    startVoting: boolean;
    execute: boolean;
    voteA: boolean;
    voteB: boolean;
  }>({
    stakeA: false,
    stakeB: false,
    approve: false,
    startVoting: false,
    execute: false,
    voteA: false,
    voteB: false,
  });

  // 金額輸入狀態
  const [stakeAmountA, setStakeAmountA] = useState<string>('');
  const [stakeAmountB, setStakeAmountB] = useState<string>('');

  // 計算需要的金額（保證金 + 手續費）
  const getRequiredAmount = (payA: boolean) => {
    if (!caseData) return BigInt(0);
    const baseAmount = payA ? caseData.compensationA : caseData.compensationB;
    // 手續費率是 1% (100/10000)
    const fee = (baseAmount * BigInt(100)) / BigInt(10000);
    return baseAmount + fee;
  };

  const getStakeAmount = (payA: boolean) => {
    if (!caseData) return BigInt(0);
    return payA ? caseData.compensationA : caseData.compensationB;
  };

  // 處理存入保證金
  const handleStakeCompensation = async (e: React.MouseEvent, payA: boolean) => {
    e.stopPropagation(); // 防止觸發案件選擇
    
    if (!address || !caseData) return;

    // 獲取用戶輸入的金額
    const inputAmount = payA ? stakeAmountA : stakeAmountB;
    if (!inputAmount || parseFloat(inputAmount) <= 0) {
      alert('請輸入有效的存入金額');
      return;
    }

    // 將輸入的金額轉換為 wei (假設輸入的是 ETH 單位)
    const stakeAmount = BigInt(Math.floor(parseFloat(inputAmount) * 1e18));

    // 設置本地pending狀態
    if (payA) {
      setLocalPendingStates(prev => ({ ...prev, stakeA: true }));
    } else {
      setLocalPendingStates(prev => ({ ...prev, stakeB: true }));
    }

    // 計算總需要金額（用戶輸入的金額 + 手續費）
    const fee = (stakeAmount * BigInt(100)) / BigInt(10000); // 1% 手續費
    const totalRequiredAmount = stakeAmount + fee;
    
    // 檢查餘額
    if (balance < totalRequiredAmount) {
      alert(`餘額不足！需要 ${Number(totalRequiredAmount) / 1e18} FERC20（包含手續費），當前餘額 ${Number(balance) / 1e18} FERC20`);
      // 重置pending狀態
      if (payA) {
        setLocalPendingStates(prev => ({ ...prev, stakeA: false }));
      } else {
        setLocalPendingStates(prev => ({ ...prev, stakeB: false }));
      }
      return;
    }

    try {
      // 檢查 allowance，如果不足則先授權
      if (allowance < totalRequiredAmount) {
        console.log('授權額度不足，先進行授權...');
        
        // 設置授權pending狀態
        setLocalPendingStates(prev => ({ ...prev, approve: true }));
        
        // 授權當次要存入的金額
        const approveAmount = totalRequiredAmount;
        
        await approveERC20(REAL_CONTRACT_ADDRESS as `0x${string}`, approveAmount);
        
        // 等待授權交易確認，然後自動重試存入保證金
        setTimeout(async () => {
          try {
            await refetchAllowance(); // 重新獲取授權額度
            console.log('授權完成，現在存入保證金...');
            
            // 重置授權pending狀態，設置存入pending狀態
            setLocalPendingStates(prev => ({ 
              ...prev, 
              approve: false,
              [payA ? 'stakeA' : 'stakeB']: true 
            }));
            
            stakeCompensation(caseNum, payA, stakeAmount);
          } catch (error) {
            console.error('自動重試失敗:', error);
            alert('授權已完成，請手動點擊存入保證金按鈕');
            // 重置所有pending狀態
            setLocalPendingStates(prev => ({ 
              ...prev, 
              approve: false,
              [payA ? 'stakeA' : 'stakeB']: false 
            }));
          }
        }, 3000); // 等待3秒讓交易確認
        
        return;
      }

      // 授權足夠，直接存入保證金
      console.log('授權額度足夠，直接存入保證金...');
      stakeCompensation(caseNum, payA, stakeAmount);
      
    } catch (error) {
      console.error('操作失敗:', error);
      alert('操作失敗，請重試');
      // 重置pending狀態
      if (payA) {
        setLocalPendingStates(prev => ({ ...prev, stakeA: false }));
      } else {
        setLocalPendingStates(prev => ({ ...prev, stakeB: false }));
      }
    }
  };

  // 處理開始投票
  const handleStartVoting = (e: React.MouseEvent) => {
    e.stopPropagation(); // 防止觸發案件選擇
    setLocalPendingStates(prev => ({ ...prev, startVoting: true }));
    startCaseVoting(caseNum);
  };

  // 處理執行案件
  const handleExecuteCase = (e: React.MouseEvent) => {
    e.stopPropagation(); // 防止觸發案件選擇
    setLocalPendingStates(prev => ({ ...prev, execute: true }));
    executeCase(caseNum);
  };

  // 處理投票給A
  const handleVoteForA = async (e: React.MouseEvent) => {
    e.stopPropagation(); // 防止觸發案件選擇
    if (!caseData || !address) return;
    
    setLocalPendingStates(prev => ({ ...prev, voteA: true }));
    
    try {
      // 檢查投票代幣餘額和授權
      const { data: voteTokenAmount } = await import('wagmi').then(wagmi => 
        wagmi.useContractRead({
          address: REAL_CONTRACT_ADDRESS as `0x${string}`,
          abi: REAL_CONTRACT_ABI,
          functionName: 'voteTokenAmount',
        })
      );
      
      if (voteTokenAmount) {
        // 檢查投票代幣餘額
        const { data: voteTokenBalance } = await import('wagmi').then(wagmi => 
          wagmi.useContractRead({
            address: FAKE_ERC20_ADDRESS as `0x${string}`,
            abi: FAKE_ERC20_ABI,
            functionName: 'balanceOf',
            args: [address],
          })
        );
        
        if (voteTokenBalance && voteTokenBalance < voteTokenAmount) {
          alert(`投票代幣餘額不足！需要 ${Number(voteTokenAmount) / 1e18} FERC20，當前餘額 ${Number(voteTokenBalance) / 1e18} FERC20`);
          setLocalPendingStates(prev => ({ ...prev, voteA: false }));
          return;
        }
        
        // 檢查授權額度
        const { data: voteTokenAllowance } = await import('wagmi').then(wagmi => 
          wagmi.useContractRead({
            address: FAKE_ERC20_ADDRESS as `0x${string}`,
            abi: FAKE_ERC20_ABI,
            functionName: 'allowance',
            args: [address, REAL_CONTRACT_ADDRESS as `0x${string}`],
          })
        );
        
        if (voteTokenAllowance && voteTokenAllowance < voteTokenAmount) {
          // 需要先授權
          alert('需要先授權投票代幣，請點擊授權按鈕');
          setLocalPendingStates(prev => ({ ...prev, voteA: false }));
          return;
        }
      }
      
      // 執行投票
      vote(caseNum, caseData.participantA);
    } catch (error) {
      console.error('投票檢查失敗:', error);
      setLocalPendingStates(prev => ({ ...prev, voteA: false }));
    }
  };

  // 處理投票給B
  const handleVoteForB = async (e: React.MouseEvent) => {
    e.stopPropagation(); // 防止觸發案件選擇
    if (!caseData || !address) return;
    
    setLocalPendingStates(prev => ({ ...prev, voteB: true }));
    
    try {
      // 檢查投票代幣餘額和授權
      const { data: voteTokenAmount } = await import('wagmi').then(wagmi => 
        wagmi.useContractRead({
          address: REAL_CONTRACT_ADDRESS as `0x${string}`,
          abi: REAL_CONTRACT_ABI,
          functionName: 'voteTokenAmount',
        })
      );
      
      if (voteTokenAmount) {
        // 檢查投票代幣餘額
        const { data: voteTokenBalance } = await import('wagmi').then(wagmi => 
          wagmi.useContractRead({
            address: FAKE_ERC20_ADDRESS as `0x${string}`,
            abi: FAKE_ERC20_ABI,
            functionName: 'balanceOf',
            args: [address],
          })
        );
        
        if (voteTokenBalance && voteTokenBalance < voteTokenAmount) {
          alert(`投票代幣餘額不足！需要 ${Number(voteTokenAmount) / 1e18} FERC20，當前餘額 ${Number(voteTokenBalance) / 1e18} FERC20`);
          setLocalPendingStates(prev => ({ ...prev, voteB: false }));
          return;
        }
        
        // 檢查授權額度
        const { data: voteTokenAllowance } = await import('wagmi').then(wagmi => 
          wagmi.useContractRead({
            address: FAKE_ERC20_ADDRESS as `0x${string}`,
            abi: FAKE_ERC20_ABI,
            functionName: 'allowance',
            args: [address, REAL_CONTRACT_ADDRESS as `0x${string}`],
          })
        );
        
        if (voteTokenAllowance && voteTokenAllowance < voteTokenAmount) {
          // 需要先授權
          alert('需要先授權投票代幣，請點擊授權按鈕');
          setLocalPendingStates(prev => ({ ...prev, voteB: false }));
          return;
        }
      }
      
      // 執行投票
      vote(caseNum, caseData.participantB);
    } catch (error) {
      console.error('投票檢查失敗:', error);
      setLocalPendingStates(prev => ({ ...prev, voteB: false }));
    }
  };

  // 監聽交易狀態變化，重置pending狀態
  useEffect(() => {
    if (!isStaking && !isApproving) {
      setLocalPendingStates(prev => ({ 
        ...prev, 
        stakeA: false, 
        stakeB: false, 
        approve: false 
      }));
    }
  }, [isStaking, isApproving]);

  useEffect(() => {
    if (!isStartingVoting) {
      setLocalPendingStates(prev => ({ ...prev, startVoting: false }));
    }
  }, [isStartingVoting]);

  useEffect(() => {
    if (!isExecuting) {
      setLocalPendingStates(prev => ({ ...prev, execute: false }));
    }
  }, [isExecuting]);

  useEffect(() => {
    if (!isVoting) {
      setLocalPendingStates(prev => ({ 
        ...prev, 
        voteA: false, 
        voteB: false 
      }));
    }
  }, [isVoting]);

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!caseData) {
    return null;
  }

  // 個人案件模式：只顯示當前錢包作為合約人的案件
  if (mode === 'personal' && address) {
    const isParticipant = caseData.participantA.toLowerCase() === address.toLowerCase() || 
                         caseData.participantB.toLowerCase() === address.toLowerCase();
    

    
    if (!isParticipant) {
      return null;
    }
  }

  const getStatusText = (status: number) => {
    switch (status) {
      case CaseStatus.Inactivated:
        return '未激活';
      case CaseStatus.Activated:
        return '已激活';
      case CaseStatus.Voting:
        return '投票中';
      case CaseStatus.Executed:
        return '已執行';
      case CaseStatus.Cancelled:
        return '已取消';
      default:
        return '未知';
    }
  };

  const getStatusColor = (status: number) => {
    switch (status) {
      case CaseStatus.Inactivated:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
      case CaseStatus.Activated:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case CaseStatus.Voting:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case CaseStatus.Executed:
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case CaseStatus.Cancelled:
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  // 獲取顯示狀態（優先判斷投票是否結束）
  const getDisplayStatus = () => {
    // 如果投票已結束，顯示"已完成"
    if (caseResult?.voteEnded) {
      return {
        text: '已完成',
        color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      };
    }
    
    // 否則使用原本的狀態邏輯
    return {
      text: getStatusText(caseData.status),
      color: getStatusColor(caseData.status)
    };
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatTokenAmount = (amount: bigint) => {
    return Number(amount) / 1e18;
  };

  // 獲取投票結束時間
  const getVotingEndTime = () => {
    if (!caseData) return 0;
    return Number(caseData.votingStartTime) + Number(caseData.votingDuration);
  };

  return (
    <div
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer border border-gray-200 dark:border-gray-700"
      onClick={onSelect}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            案件 #{caseNum}: {caseData.caseName}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {caseData.caseDescription}
          </p>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDisplayStatus().color}`}>
          {getDisplayStatus().text}
        </span>
        {/* 右上角顯示 winner */}
        {getDisplayStatus().text === '已完成' && caseData.winner && caseData.winner !== '0x0000000000000000000000000000000000000000' && (
          <div className="mt-1 text-xs text-green-800 dark:text-green-200">
            獲勝者: <span className="font-mono">{formatAddress(caseData.winner)}</span>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-gray-600 dark:text-gray-400">合約人 A:</p>
          <p className="font-mono text-gray-900 dark:text-gray-100 break-all" title={caseData.participantA}>
            {caseData.participantA}
          </p>
        </div>
        <div>
          <p className="text-gray-600 dark:text-gray-400">合約人 B:</p>
          <p className="font-mono text-gray-900 dark:text-gray-100 break-all" title={caseData.participantB}>
            {caseData.participantB}
          </p>
        </div>
        <div>
          <p className="text-gray-600 dark:text-gray-400">A保證金狀態:</p>
          <p className="font-medium text-gray-900 dark:text-gray-100">
            {formatTokenAmount(caseData.existingCompensationA)} / {formatTokenAmount(caseData.compensationA)} FERC20
            {caseData.isPaidA && (
              <span className="ml-2 text-green-600 dark:text-green-400 text-xs">✓ 已存入</span>
            )}
          </p>
        </div>
        <div>
          <p className="text-gray-600 dark:text-gray-400">B保證金狀態:</p>
          <p className="font-medium text-gray-900 dark:text-gray-100">
            {formatTokenAmount(caseData.existingCompensationB)} / {formatTokenAmount(caseData.compensationB)} FERC20
            {caseData.isPaidB && (
              <span className="ml-2 text-green-600 dark:text-green-400 text-xs">✓ 已存入</span>
            )}
          </p>
        </div>
        <div>
          <p className="text-gray-600 dark:text-gray-400">分配模式:</p>
          <p className="font-medium text-gray-900 dark:text-gray-100">
            {Number(caseData.allocationMode) === 0 ? '勝者全拿' : '按得票數比例分配'}
          </p>
        </div>
      </div>

      {caseData.status === CaseStatus.Voting && (
        <div className={`mt-4 p-3 rounded-md ${
          caseResult?.voteEnded 
            ? 'bg-green-50 dark:bg-green-900/20' 
            : 'bg-yellow-50 dark:bg-yellow-900/20'
        }`}>
          <p className={`text-sm ${
            caseResult?.voteEnded 
              ? 'text-green-800 dark:text-green-200' 
              : 'text-yellow-800 dark:text-yellow-200'
          }`}>
            {caseResult?.voteEnded 
              ? `投票已結束 - 結束時間: ${new Date(getVotingEndTime() * 1000).toLocaleString()}`
              : `投票進行中 - 結束時間: ${new Date(getVotingEndTime() * 1000).toLocaleString()}`
            }
          </p>
          {/* 調試信息 */}
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            調試: caseResult存在={caseResult ? '是' : '否'}, voteEnded={caseResult?.voteEnded ? '是' : '否'}, 
            當前時間={Math.floor(Date.now() / 1000)}, 結束時間={getVotingEndTime()}
          </p>
          {/* 詳細調試信息 */}
          {caseResult && (
            <details className="mt-2">
              <summary className="text-xs text-gray-500 dark:text-gray-400 cursor-pointer">
                詳細調試信息
              </summary>
              <pre className="text-xs text-gray-600 dark:text-gray-300 mt-1 bg-gray-100 dark:bg-gray-800 p-2 rounded overflow-auto">
                {JSON.stringify({
                  caseNum: Number(caseResult.caseNum),
                  caseStatus: Number(caseResult.caseStatus),
                  currentWinner: caseResult.currentWinner,
                  compensationA: Number(caseResult.compensationA),
                  compensationB: Number(caseResult.compensationB),
                  existingCompensationA: Number(caseResult.existingCompensationA),
                  existingCompensationB: Number(caseResult.existingCompensationB),
                  voteCountA: Number(caseResult.voteCountA),
                  voteCountB: Number(caseResult.voteCountB),
                  voteEnded: caseResult.voteEnded,
                  allocationMode: Number(caseResult.allocationMode)
                }, null, 2)}
              </pre>
            </details>
          )}
          {!caseResult?.voteEnded && (
            <VotingCountdown endTime={getVotingEndTime()} />
          )}
        </div>
      )}

      {/* 投票結果詳細信息 */}
      {caseResult && (
        <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-900/20 rounded-md">
          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">投票結果詳情</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-gray-600 dark:text-gray-400">案件編號:</span>
              <span className="ml-1 text-gray-900 dark:text-gray-100">{Number(caseResult.caseNum)}</span>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">案件狀態:</span>
              <span className="ml-1 text-gray-900 dark:text-gray-100">{getStatusText(caseResult.caseStatus)}</span>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">當前勝者:</span>
              <span className="ml-1 text-gray-900 dark:text-gray-100">
                {caseResult.currentWinner === '0x0000000000000000000000000000000000000000' 
                  ? '平手' 
                  : formatAddress(caseResult.currentWinner)}
              </span>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">投票是否結束:</span>
              <span className={`ml-1 ${caseResult.voteEnded ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
                {caseResult.voteEnded ? '是' : '否'}
              </span>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">A得票數:</span>
              <span className="ml-1 text-gray-900 dark:text-gray-100">{Number(caseResult.voteCountA)}</span>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">B得票數:</span>
              <span className="ml-1 text-gray-900 dark:text-gray-100">{Number(caseResult.voteCountB)}</span>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">A保證金:</span>
              <span className="ml-1 text-gray-900 dark:text-gray-100">
                {formatTokenAmount(caseResult.existingCompensationA)} / {formatTokenAmount(caseResult.compensationA)} FERC20
              </span>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">B保證金:</span>
              <span className="ml-1 text-gray-900 dark:text-gray-100">
                {formatTokenAmount(caseResult.existingCompensationB)} / {formatTokenAmount(caseResult.compensationB)} FERC20
              </span>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">分配模式:</span>
              <span className="ml-1 text-gray-900 dark:text-gray-100">
                {Number(caseResult.allocationMode) === 0 ? '勝者全拿' : '按得票數比例分配'}
              </span>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">總保證金:</span>
              <span className="ml-1 text-gray-900 dark:text-gray-100">
                {formatTokenAmount(caseResult.existingCompensationA + caseResult.existingCompensationB)} FERC20
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 只在投票結束後顯示獲勝者信息 */}
      {caseResult?.voteEnded && caseData.winner && caseData.winner !== '0x0000000000000000000000000000000000000000' && (
        <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-md">
          <p className="text-sm text-green-800 dark:text-green-200">
            獲勝者: <span className="font-mono">{formatAddress(caseData.winner)}</span>
          </p>
        </div>
      )}

      {/* 操作按鈕區域 - 個人案件模式且為合約人時顯示 */}
      {mode === 'personal' && isCurrentParticipant && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">

          <div className="flex flex-col gap-3">
            {/* 未激活狀態：顯示存入保證金按鈕 */}
            {caseData.status === CaseStatus.Inactivated && (
              <>
                {isParticipantA && !caseData.isPaidA && (
                  <div className="flex flex-col gap-2">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      合約激活所需合約金額(含手續費): {Number(caseData.compensationA + (caseData.compensationA * BigInt(100)) / BigInt(10000)) / 1e18} FERC20
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="請輸入存入金額"
                        value={stakeAmountA}
                        onChange={(e) => setStakeAmountA(e.target.value)}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent w-48"
                        disabled={localPendingStates.stakeA || localPendingStates.approve}
                      />
                      <button
                        onClick={(e) => handleStakeCompensation(e, true)}
                        disabled={localPendingStates.stakeA || localPendingStates.approve || !stakeAmountA}
                        className={`px-3 py-2 rounded-md transition-colors text-sm ${
                          localPendingStates.stakeA || localPendingStates.approve || !stakeAmountA
                            ? 'bg-gray-400 dark:bg-gray-600 text-gray-200 dark:text-gray-300 cursor-not-allowed'
                            : 'bg-blue-600 dark:bg-[#58a6ff] text-white hover:bg-blue-700 dark:hover:bg-[#4a9eff]'
                        }`}
                      >
                        {localPendingStates.stakeA ? '存入中...' : localPendingStates.approve ? '授權中...' : '存入 A'}
                      </button>
                    </div>
                  </div>
                )}
                {isParticipantB && !caseData.isPaidB && (
                  <div className="flex flex-col gap-2">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      合約激活所需合約金額(含手續費): {Number(caseData.compensationB + (caseData.compensationB * BigInt(100)) / BigInt(10000)) / 1e18} FERC20
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="請輸入存入金額"
                        value={stakeAmountB}
                        onChange={(e) => setStakeAmountB(e.target.value)}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent w-48"
                        disabled={localPendingStates.stakeB || localPendingStates.approve}
                      />
                      <button
                        onClick={(e) => handleStakeCompensation(e, false)}
                        disabled={localPendingStates.stakeB || localPendingStates.approve || !stakeAmountB}
                        className={`px-3 py-2 rounded-md transition-colors text-sm ${
                          localPendingStates.stakeB || localPendingStates.approve || !stakeAmountB
                            ? 'bg-gray-400 dark:bg-gray-600 text-gray-200 dark:text-gray-300 cursor-not-allowed'
                            : 'bg-green-600 dark:bg-[#7ee787] text-white hover:bg-green-700 dark:hover:bg-[#6bdd75]'
                        }`}
                      >
                        {localPendingStates.stakeB ? '存入中...' : localPendingStates.approve ? '授權中...' : '存入 B'}
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* 已激活狀態：顯示開始投票按鈕 */}
            {caseData.status === CaseStatus.Activated && (
              <button
                onClick={handleStartVoting}
                disabled={localPendingStates.startVoting}
                className={`px-3 py-2 rounded-md transition-colors text-sm ${
                  localPendingStates.startVoting
                    ? 'bg-gray-400 dark:bg-gray-600 text-gray-200 dark:text-gray-300 cursor-not-allowed'
                    : 'bg-green-600 dark:bg-[#7ee787] text-white hover:bg-green-700 dark:hover:bg-[#6bdd75]'
                }`}
              >
                {localPendingStates.startVoting ? '開始中...' : '開始投票'}
              </button>
            )}



            {/* 投票中狀態：顯示執行案件按鈕（如果投票已結束） */}
            {caseData.status === CaseStatus.Voting && caseResult?.voteEnded && (
              <button
                onClick={handleExecuteCase}
                disabled={localPendingStates.execute}
                className={`px-3 py-2 rounded-md transition-colors text-sm ${
                  localPendingStates.execute
                    ? 'bg-gray-400 dark:bg-gray-600 text-gray-200 dark:text-gray-300 cursor-not-allowed'
                    : 'bg-orange-600 dark:bg-[#ffa657] text-white hover:bg-orange-700 dark:hover:bg-[#ff8c3a]'
                }`}
              >
                {localPendingStates.execute ? '執行中...' : '執行案件'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* 投票按鈕區域 - 只在投票模式且案件狀態為投票中且投票未結束時顯示 */}
      {mode === 'voting' && caseData.status === CaseStatus.Voting && !caseResult?.voteEnded && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
            <p className="text-sm text-blue-800 dark:text-blue-200 mb-2">
              請選擇您要投票支持的合約人：
            </p>
            <div className="text-xs text-blue-600 dark:text-blue-300">
              <p>合約人 A: {formatAddress(caseData.participantA)}</p>
              <p>合約人 B: {formatAddress(caseData.participantB)}</p>
            </div>
          </div>
          
          {/* 投票代幣授權檢查 */}
          <VoteTokenApproval 
            onApproved={() => {
              // 授權成功後可以刷新狀態
            }}
          />
          
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleVoteForA}
              disabled={localPendingStates.voteA || localPendingStates.voteB}
              className={`px-4 py-2 rounded-md transition-colors text-sm ${
                localPendingStates.voteA || localPendingStates.voteB
                  ? 'bg-gray-400 dark:bg-gray-600 text-gray-200 dark:text-gray-300 cursor-not-allowed'
                  : 'bg-blue-600 dark:bg-[#58a6ff] text-white hover:bg-blue-700 dark:hover:bg-[#4a9eff]'
              }`}
            >
              {localPendingStates.voteA ? '投票中...' : '投票給 A'}
            </button>
            <button
              onClick={handleVoteForB}
              disabled={localPendingStates.voteA || localPendingStates.voteB}
              className={`px-4 py-2 rounded-md transition-colors text-sm ${
                localPendingStates.voteA || localPendingStates.voteB
                  ? 'bg-gray-400 dark:bg-gray-600 text-gray-200 dark:text-gray-300 cursor-not-allowed'
                  : 'bg-green-600 dark:bg-[#7ee787] text-white hover:bg-green-700 dark:hover:bg-[#6bdd75]'
              }`}
            >
              {localPendingStates.voteB ? '投票中...' : '投票給 B'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function CaseList({ onCaseSelect, mode }: CaseListProps) {
  const { address } = useAccount();
  const { currentCaseNum, isLoading: contractLoading } = useContractStatus();
  const { isVoter, isLoading: voterLoading } = useIsVoter();
  const [refreshKey, setRefreshKey] = useState(0);

  // 如果正在加載合約狀態，顯示加載狀態
  if (contractLoading || voterLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {mode === 'voting' ? '待投票案件' : '個人案件'}
          </h2>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-400 mt-2">載入中...</p>
        </div>
      </div>
    );
  }

  // 如果沒有連接錢包，顯示提示
  if (!address) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {mode === 'voting' ? '待投票案件' : '個人案件'}
          </h2>
        </div>
        <div className="text-center py-8">
          <p className="text-gray-600 dark:text-gray-400">請先連接錢包</p>
        </div>
      </div>
    );
  }

  // 如果是投票模式但用戶不是投票者，顯示提示
  if (mode === 'voting' && !isVoter) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            待投票案件
          </h2>
        </div>
        <div className="text-center py-8">
          <p className="text-gray-600 dark:text-gray-400">您不是投票者，無法查看待投票案件</p>
        </div>
      </div>
    );
  }

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  // 生成案件編號列表 - 只包含真正存在的案件
  const allCaseNumbers = Array.from({ length: Number(currentCaseNum || 0) }, (_, i) => i + 1);

  // 如果是投票模式，先渲染所有案件，然後在 VotingCaseItem 中過濾
  if (mode === 'voting') {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            待投票案件
          </h2>
          <button
            onClick={handleRefresh}
            className="px-3 py-1 bg-blue-600 dark:bg-[#58a6ff] text-white rounded-md hover:bg-blue-700 dark:hover:bg-[#4a9eff] transition-colors text-sm"
          >
            刷新
          </button>
        </div>
        
        <VotingCaseListContent 
          allCaseNumbers={allCaseNumbers}
          refreshKey={refreshKey}
          mode={mode}
          onCaseSelect={onCaseSelect}
          currentAddress={address}
        />
      </div>
    );
  }

  // 個人案件模式
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          個人案件
        </h2>
        <button
          onClick={handleRefresh}
          className="px-3 py-1 bg-blue-600 dark:bg-[#58a6ff] text-white rounded-md hover:bg-blue-700 dark:hover:bg-[#4a9eff] transition-colors text-sm"
        >
          刷新
        </button>
      </div>

      <PersonalCaseListContent 
        allCaseNumbers={allCaseNumbers}
        refreshKey={refreshKey}
        mode={mode}
        onCaseSelect={onCaseSelect}
        currentAddress={address}
      />
    </div>
  );
}

// 個人案件列表內容組件
function PersonalCaseListContent({ 
  allCaseNumbers, 
  refreshKey, 
  mode, 
  onCaseSelect, 
  currentAddress 
}: { 
  allCaseNumbers: number[];
  refreshKey: number;
  mode: 'personal' | 'voting';
  onCaseSelect?: (caseNum: number) => void;
  currentAddress: string;
}) {
  // 直接渲染所有案件，讓 PersonalCaseItem 來處理過濾
  // 這樣可以利用現有的 useCase hook 來獲取案件數據
  const renderedItems = allCaseNumbers.map((caseNum) => (
    <PersonalCaseItem
      key={`${caseNum}-${refreshKey}`}
      caseNum={caseNum}
      mode={mode}
      onSelect={() => onCaseSelect?.(caseNum)}
      currentAddress={currentAddress}
    />
  ));

  // 過濾掉 null 項目（即不屬於個人案件的部分）
  const visibleItems = renderedItems.filter(item => item !== null);

  if (visibleItems.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 dark:text-gray-400">尚無個人案件</p>
              </div>
    );
  }

  return (
    <div className="grid gap-4">
      {visibleItems}
          </div>
  );
}

// 投票案件列表內容組件
function VotingCaseListContent({ 
  allCaseNumbers, 
  refreshKey, 
  mode, 
  onCaseSelect, 
  currentAddress 
}: { 
  allCaseNumbers: number[];
  refreshKey: number;
  mode: 'personal' | 'voting';
  onCaseSelect?: (caseNum: number) => void;
  currentAddress: string;
}) {
  // 直接渲染所有案件，讓 PersonalCaseItem 來處理過濾
  // 這樣可以利用現有的 useCase hook 來獲取案件數據
  const renderedItems = allCaseNumbers.map((caseNum) => (
    <VotingCaseItem
      key={`${caseNum}-${refreshKey}`}
      caseNum={caseNum}
      mode={mode}
      onSelect={() => onCaseSelect?.(caseNum)}
      currentAddress={currentAddress}
    />
  ));

  // 過濾掉 null 項目（即不處於 Voting 狀態的案件）
  const visibleItems = renderedItems.filter(item => item !== null);

  if (visibleItems.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 dark:text-gray-400">尚無可投票案件</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {visibleItems}
    </div>
  );
}

// 投票案件項目組件 - 顯示所有處於 Voting 狀態的案件
function VotingCaseItem({ caseNum, onSelect, mode, currentAddress }: { 
  caseNum: number; 
  onSelect: () => void; 
  mode: 'personal' | 'voting';
  currentAddress: string;
}) {
  const { case: caseData, isLoading, isCaseEmpty } = useCase(caseNum);
  
  // 如果正在加載，顯示加載狀態
  if (isLoading) {
    return (
      <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
      </div>
    );
  }
  
  // 如果案件為空，不顯示
  if (isCaseEmpty || !caseData) {
    return null;
  }
  
  // 只顯示處於 Voting 狀態的案件
  if (caseData.status !== CaseStatus.Voting) {
    return null;
  }
  
  // 顯示案件
  return (
    <CaseItem
      caseNum={caseNum}
      mode={mode}
      onSelect={onSelect}
    />
  );
}

// 個人案件項目組件 - 只顯示當前用戶參與的案件
function PersonalCaseItem({ caseNum, onSelect, mode, currentAddress }: { 
  caseNum: number; 
  onSelect: () => void; 
  mode: 'personal' | 'voting';
  currentAddress: string;
}) {
  const { case: caseData, isLoading, isCaseEmpty } = useCase(caseNum);
  
  // 如果正在加載，顯示加載狀態
  if (isLoading) {
    return (
      <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
      </div>
    );
  }
  
  // 如果案件為空，不顯示
  if (isCaseEmpty || !caseData) {
    return null;
  }
  
  // 檢查當前用戶是否參與此案件
  const isParticipantA = caseData.participantA.toLowerCase() === currentAddress.toLowerCase();
  const isParticipantB = caseData.participantB.toLowerCase() === currentAddress.toLowerCase();
  const isCurrentParticipant = isParticipantA || isParticipantB;
  
  // 只顯示用戶參與的案件
  if (!isCurrentParticipant) {
    return null;
  }
  
  // 顯示案件
  return (
    <CaseItem
      caseNum={caseNum}
      mode={mode}
      onSelect={onSelect}
    />
  );
} 