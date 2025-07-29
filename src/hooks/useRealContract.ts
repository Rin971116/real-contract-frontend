import { useContractRead, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { REAL_CONTRACT_ABI, REAL_CONTRACT_ADDRESS, type CaseInit, CaseStatus, FAKE_ERC20_ABI, FAKE_ERC20_ADDRESS } from '../contracts/RealContract';

// 讀取合約狀態
export function useContractStatus() {
  const { data: isRunning, isLoading: isRunningLoading } = useContractRead({
    address: REAL_CONTRACT_ADDRESS as `0x${string}`,
    abi: REAL_CONTRACT_ABI,
    functionName: 'isRunning',
  });

  const { data: currentCaseNum, isLoading: caseNumLoading } = useContractRead({
    address: REAL_CONTRACT_ADDRESS as `0x${string}`,
    abi: REAL_CONTRACT_ABI,
    functionName: 'currentCaseNum',
  });

  return {
    isRunning,
    currentCaseNum,
    isLoading: isRunningLoading || caseNumLoading,
  };
}

// 讀取案件資訊 - 使用 cases 函數
export function useCase(caseNum: number) {
  const { data: caseData, isLoading, refetch } = useContractRead({
    address: REAL_CONTRACT_ADDRESS as `0x${string}`,
    abi: REAL_CONTRACT_ABI,
    functionName: 'cases',
    args: [BigInt(caseNum)],
    query: {
      // 每30秒自動刷新一次，確保案件狀態及時更新
      refetchInterval: 30000,
      refetchIntervalInBackground: true,
    },
  });

  // 檢查案件是否真的存在（不是空案件）
  const isCaseEmpty = !caseData || 
    caseData[3] === '0x0000000000000000000000000000000000000000' || // participantA 是零地址
    caseData[4] === '0x0000000000000000000000000000000000000000' || // participantB 是零地址
    !caseData[1] || caseData[1] === ''; // caseName 為空

  // 處理返回的數組數據
  const processedCase = caseData && !isCaseEmpty ? {
    caseNum: caseData[0] as bigint,
    caseName: caseData[1] as string,
    caseDescription: caseData[2] as string,
    participantA: caseData[3] as `0x${string}`,
    participantB: caseData[4] as `0x${string}`,
    compensationA: caseData[5] as bigint,
    compensationB: caseData[6] as bigint,
    existingCompensationA: caseData[7] as bigint,
    existingCompensationB: caseData[8] as bigint,
    isPaidA: caseData[9] as boolean,
    isPaidB: caseData[10] as boolean,
    isExecuted: caseData[11] as boolean,
    winner: caseData[12] as `0x${string}`,
    status: Number(caseData[13]),
    votingStartTime: caseData[14] as bigint,
    votingDuration: caseData[15] as bigint,
    allocationMode: caseData[16] as bigint,
  } : null;

  return {
    case: processedCase,
    isLoading,
    refetch,
    isCaseEmpty, // 新增：標記案件是否為空
  };
}

// 讀取案件結果
export function useCaseResult(caseNum: number) {
  const { data: result, isLoading, refetch, error } = useContractRead({
    address: REAL_CONTRACT_ADDRESS as `0x${string}`,
    abi: REAL_CONTRACT_ABI,
    functionName: 'getCaseResult',
    args: [BigInt(caseNum)],
    query: {
      // 每30秒自動刷新一次，確保投票狀態及時更新
      refetchInterval: 30000,
      // 如果投票未結束，更頻繁地刷新
      refetchIntervalInBackground: true,
    },
  });

  // 調試信息已移除

  return {
    result,
    isLoading,
    refetch,
    error,
  };
}

// 添加案件
export function useAddCase() {
  const { writeContract, isPending, error, data: hash } = useWriteContract();

  const addCase = (caseData: CaseInit) => {
    writeContract({
      address: REAL_CONTRACT_ADDRESS as `0x${string}`,
      abi: REAL_CONTRACT_ABI,
      functionName: 'addCase',
      args: [{
        caseName: caseData.caseName,
        caseDescription: caseData.caseDescription,
        participantA: caseData.participantA,
        participantB: caseData.participantB,
        compensationA: caseData.compensationA,
        compensationB: caseData.compensationB,
        votingDuration: caseData.votingDuration,
        allocationMode: caseData.allocationMode
      }],
    });
  };

  return {
    addCase,
    isLoading: isPending,
    error,
    hash,
  };
}

// 投票
export function useVote() {
  const { writeContract, isPending, error, data: hash } = useWriteContract();

  // 監聽交易完成
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({
    hash,
  });

  const vote = (caseNum: number, voteFor: string, value?: bigint) => {
    writeContract({
      address: REAL_CONTRACT_ADDRESS as `0x${string}`,
      abi: REAL_CONTRACT_ABI,
      functionName: 'vote',
      args: [BigInt(caseNum), voteFor as `0x${string}`],
      value,
    });
  };

  return {
    vote,
    isLoading: isPending || isConfirming,
    error,
  };
}

// 開始投票
export function useStartCaseVoting() {
  const { writeContract, isPending, error, data: hash } = useWriteContract();

  // 監聽交易完成
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({
    hash,
  });

  const startCaseVoting = (caseNum: number) => {
    writeContract({
      address: REAL_CONTRACT_ADDRESS as `0x${string}`,
      abi: REAL_CONTRACT_ABI,
      functionName: 'startCaseVoting',
      args: [BigInt(caseNum)],
    });
  };

  return {
    startCaseVoting,
    isLoading: isPending || isConfirming,
    error,
  };
}

// 執行案件
export function useExecuteCase() {
  const { writeContract, isPending, error, data: hash } = useWriteContract();

  // 監聽交易完成
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({
    hash,
  });

  const executeCase = (caseNum: number) => {
    writeContract({
      address: REAL_CONTRACT_ADDRESS as `0x${string}`,
      abi: REAL_CONTRACT_ABI,
      functionName: 'executeCase',
      args: [BigInt(caseNum)],
    });
  };

  return {
    executeCase,
    isLoading: isPending || isConfirming,
    error,
  };
}

// 質押保證金
export function useStakeCompensation() {
  const { writeContract, isPending, error, data: hash } = useWriteContract();

  // 監聽交易完成
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({
    hash,
  });

  const stakeCompensation = (caseNum: number, payA: boolean, amount: bigint) => {
    writeContract({
      address: REAL_CONTRACT_ADDRESS as `0x${string}`,
      abi: REAL_CONTRACT_ABI,
      functionName: 'stakeCompensation',
      args: [BigInt(caseNum), payA, amount],
    });
  };

  return {
    stakeCompensation,
    isLoading: isPending || isConfirming,
    error,
  };
}

// ERC20 approve hook
export function useApproveERC20() {
  const { writeContract, isPending, error, data: hash } = useWriteContract();

  // 監聽交易完成
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({
    hash,
  });

  const approveERC20 = (tokenAddress: `0x${string}`, spender: `0x${string}`, amount: bigint) => {
    writeContract({
      address: tokenAddress,
      abi: FAKE_ERC20_ABI,
      functionName: 'approve',
      args: [spender, amount],
    });
  };

  return {
    approveERC20,
    isLoading: isPending || isConfirming,
    error,
  };
}

// 檢查 ERC20 allowance
export function useERC20Allowance(owner: `0x${string}` | undefined, spender: `0x${string}` | undefined) {
  const { data: allowance, isLoading, refetch } = useContractRead({
    address: FAKE_ERC20_ADDRESS,
    abi: FAKE_ERC20_ABI,
    functionName: 'allowance',
    args: owner && spender ? [owner, spender] : undefined,
    query: {
      enabled: !!owner && !!spender,
    },
  });

  return {
    allowance: allowance || BigInt(0),
    isLoading,
    refetch,
  };
}

// 檢查 ERC20 balance
export function useERC20Balance(address: `0x${string}` | undefined) {
  const { data: balance, isLoading, refetch } = useContractRead({
    address: FAKE_ERC20_ADDRESS,
    abi: FAKE_ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  return {
    balance: balance || BigInt(0),
    isLoading,
    refetch,
  };
}

// 取消案件
export function useCancelCase() {
  const { writeContract, isPending, error } = useWriteContract();

  const cancelCase = (caseNum: number) => {
    writeContract({
      address: REAL_CONTRACT_ADDRESS as `0x${string}`,
      abi: REAL_CONTRACT_ABI,
      functionName: 'cancelCase',
      args: [BigInt(caseNum)],
    });
  };

  return {
    cancelCase,
    isLoading: isPending,
    error,
  };
}

// 領取投票獎勵
export function useClaimVotePool() {
  const { writeContract, isPending, error } = useWriteContract();

  const claimVotePool = (caseNum: number) => {
    writeContract({
      address: REAL_CONTRACT_ADDRESS as `0x${string}`,
      abi: REAL_CONTRACT_ABI,
      functionName: 'claimVotePool',
      args: [BigInt(caseNum)],
    });
  };

  return {
    claimVotePool,
    isLoading: isPending,
    error,
  };
} 