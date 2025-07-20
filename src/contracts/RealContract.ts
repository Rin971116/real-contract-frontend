export const REAL_CONTRACT_ABI = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_owner",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "_voter",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "_compensationToken",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "_voteToken",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "_feeRateForStakeCompensation",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_feeRateForExecuteCase",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_voteTokenAmount",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [],
    "name": "ReentrancyGuardReentrantCall",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "token",
        "type": "address"
      }
    ],
    "name": "SafeERC20FailedOperation",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "caseNum",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "caseName",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "caseDescription",
        "type": "string"
      }
    ],
    "name": "CaseAdded",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "caseNum",
        "type": "uint256"
      }
    ],
    "name": "CaseCancelled",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "caseNum",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "reason",
        "type": "string"
      }
    ],
    "name": "CaseError",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "caseNum",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "winner",
        "type": "address"
      }
    ],
    "name": "CaseExecuted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "caseNum",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "participant",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "CaseStaked",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "caseNum",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "voter",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "voteFor",
        "type": "address"
      }
    ],
    "name": "CaseVoted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "caseNum",
        "type": "uint256"
      }
    ],
    "name": "CaseVotingStarted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "bool",
        "name": "running",
        "type": "bool"
      }
    ],
    "name": "ContractStatusChanged",
    "type": "event"
  },
  {
    "inputs": [
      {
        "components": [
          {
            "internalType": "string",
            "name": "caseName",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "caseDescription",
            "type": "string"
          },
          {
            "internalType": "address",
            "name": "participantA",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "participantB",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "compensationA",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "compensationB",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "votingDuration",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "allocationMode",
            "type": "uint256"
          }
        ],
        "internalType": "struct ICaseManager.CaseInit",
        "name": "_case",
        "type": "tuple"
      }
    ],
    "name": "addCase",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_caseNum",
        "type": "uint256"
      }
    ],
    "name": "cancelCase",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "cases",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "caseNum",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "caseName",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "caseDescription",
        "type": "string"
      },
      {
        "internalType": "address",
        "name": "participantA",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "participantB",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "compensationA",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "compensationB",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "existingCompensationA",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "existingCompensationB",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "isPaidA",
        "type": "bool"
      },
      {
        "internalType": "bool",
        "name": "isPaidB",
        "type": "bool"
      },
      {
        "internalType": "bool",
        "name": "isExecuted",
        "type": "bool"
      },
      {
        "internalType": "address",
        "name": "winner",
        "type": "address"
      },
      {
        "internalType": "enum ICaseManager.CaseStatus",
        "name": "status",
        "type": "uint8"
      },
      {
        "internalType": "uint256",
        "name": "votingStartTime",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "votingDuration",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "allocationMode",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "compensationToken",
    "outputs": [
      {
        "internalType": "contract IERC20",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "currentCaseNum",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_caseNum",
        "type": "uint256"
      }
    ],
    "name": "executeCase",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "feeRateForExecuteCase",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "feeRateForStakeCompensation",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "name": "_caseNum",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "name": "getCaseResult",
    "outputs": [
      {
        "name": "",
        "type": "tuple",
        "internalType": "struct ICaseManager.CaseResult",
        "components": [
          {
            "name": "caseNum",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "caseStatus",
            "type": "uint8",
            "internalType": "enum ICaseManager.CaseStatus"
          },
          {
            "name": "currentWinner",
            "type": "address",
            "internalType": "address"
          },
          {
            "name": "compensationA",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "compensationB",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "existingCompensationA",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "existingCompensationB",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "voteCountA",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "voteCountB",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "voteEnded",
            "type": "bool",
            "internalType": "bool"
          },
          {
            "name": "allocationMode",
            "type": "uint256",
            "internalType": "uint256"
          }
        ]
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "governance",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "isRunning",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_caseNum",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "_payA",
        "type": "bool"
      },
      {
        "internalType": "uint256",
        "name": "_amount",
        "type": "uint256"
      }
    ],
    "name": "stakeCompensation",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_caseNum",
        "type": "uint256"
      }
    ],
    "name": "startCaseVoting",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_caseNum",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "_voteFor",
        "type": "address"
      }
    ],
    "name": "vote",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "voteToken",
    "outputs": [
      {
        "internalType": "contract IERC20",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "voteTokenAmount",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "voter",
    "outputs": [
      {
        "internalType": "contract IVoter",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

// 合約地址 - 需要根據實際部署更新
// 部署的合約地址 (Sepolia 測試網)
export const REAL_CONTRACT_ADDRESS = "0xe2637738db03dbdaed8853502bdd0d1fe95bcd11" as `0x${string}`;

// 其他合約地址
export const VOTER_ADDRESS = "0x22dad1ada86e7e37aae2792055ab1c9c32fe2c16";
export const FAKE_ERC20_ADDRESS = "0x2f383a0b62f37e56ffc8dfc84a178f0324365b3e" as `0x${string}`;

// 測試參與者地址
export const TEST_PARTICIPANT_A = "0x57a0cd579B0fb24f3282F69680eeE85E3e5bCD68";
export const TEST_PARTICIPANT_B = "0x137C941D1097488cc9B454c362c768B7A837DA22";

// 案件狀態枚舉
export const CaseStatus = {
  Inactivated: 0,
  Activated: 1,
  Voting: 2,
  Executed: 3,
  Cancelled: 4
} as const;

export type CaseStatus = typeof CaseStatus[keyof typeof CaseStatus];

// 案件初始化結構
export interface CaseInit {
  caseName: string;
  caseDescription: string;
  participantA: `0x${string}`;
  participantB: `0x${string}`;
  compensationA: bigint;
  compensationB: bigint;
  votingDuration: bigint;
  allocationMode: bigint;
}

// 案件結果結構
export interface CaseResult {
  caseNum: bigint;
  caseStatus: CaseStatus;
  currentWinner: string;
  compensationA: bigint;
  compensationB: bigint;
  existingCompensationA: bigint;
  existingCompensationB: bigint;
  voteCountA: bigint;
  voteCountB: bigint;
  voteEnded: boolean;
  allocationMode: bigint;
}

// 案件結構
export interface Case {
  caseNum: bigint;
  caseName: string;
  caseDescription: string;
  participantA: `0x${string}`;
  participantB: `0x${string}`;
  compensationA: bigint;
  compensationB: bigint;
  existingCompensationA: bigint;
  existingCompensationB: bigint;
  isPaidA: boolean;
  isPaidB: boolean;
  isExecuted: boolean;
  winner: `0x${string}`;
  status: CaseStatus;
  votingStartTime: bigint;
  votingDuration: bigint;
  allocationMode: bigint;
}

// FakeERC20 合約配置
export const FAKE_ERC20_ABI = [
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "name",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "symbol",
        "type": "string"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "spender",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "value",
        "type": "uint256"
      }
    ],
    "name": "Approval",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "value",
        "type": "uint256"
      }
    ],
    "name": "Transfer",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "spender",
        "type": "address"
      }
    ],
    "name": "allowance",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "spender",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "approve",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "balanceOf",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "decimals",
    "outputs": [
      {
        "internalType": "uint8",
        "name": "",
        "type": "uint8"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "spender",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "subtractedValue",
        "type": "uint256"
      }
    ],
    "name": "decreaseAllowance",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "spender",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "addedValue",
        "type": "uint256"
      }
    ],
    "name": "increaseAllowance",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "name",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "symbol",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalSupply",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "transfer",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "transferFrom",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const; 