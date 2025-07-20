# Real Contract Frontend

這是一個用於與 RealContract 智能合約互動的前端應用程式，使用 React + TypeScript + Tailwind CSS 建構。

## 功能特色

- 🔗 **錢包連接**: 支援 MetaMask 和其他 Web3 錢包
- 📋 **案件管理**: 查看所有案件列表和詳細資訊
- ➕ **添加案件**: 創建新的案件
- 🗳️ **投票系統**: 對案件進行投票
- 💰 **質押保證金**: 質押保證金以啟動案件
- ⚡ **即時更新**: 使用 wagmi 進行即時區塊鏈數據同步

## 技術棧

- **React 18** - 前端框架
- **TypeScript** - 類型安全
- **Tailwind CSS** - 樣式框架
- **Wagmi** - React Hooks for Ethereum
- **RainbowKit** - 錢包連接 UI
- **Vite** - 建構工具

## 快速開始

### 1. 安裝依賴

```bash
npm install
```

### 2. 配置合約地址

在 `src/contracts/RealContract.ts` 中更新合約地址：

```typescript
export const REAL_CONTRACT_ADDRESS = "你的合約地址";
```

### 3. 啟動開發伺服器

```bash
npm run dev
```

應用程式將在 `http://localhost:5173` 啟動。

## 使用說明

### 連接錢包

1. 點擊右上角的 "Connect Wallet" 按鈕
2. 選擇你的錢包（如 MetaMask）
3. 確認連接

### 查看案件

- 在 "案件列表" 標籤中查看所有案件
- 點擊案件卡片查看詳細資訊
- 案件狀態會以不同顏色標示

### 添加案件

1. 切換到 "添加案件" 標籤
2. 填寫案件資訊：
   - 案件名稱和描述
   - 參與者 A 和 B 的地址
   - 賠償金額
   - 投票持續時間
   - 分配模式
3. 點擊 "添加案件" 提交

### 投票

1. 在案件列表中選擇正在投票的案件
2. 點擊 "投票" 按鈕
3. 選擇投票對象
4. 確認交易

### 質押保證金

1. 選擇需要質押的案件
2. 點擊 "質押保證金" 按鈕
3. 選擇質押對象（A 或 B）
4. 確認交易

## 專案結構

```
src/
├── components/          # React 組件
│   ├── CaseList.tsx    # 案件列表
│   └── AddCaseForm.tsx # 添加案件表單
├── contracts/          # 合約相關
│   └── RealContract.ts # 合約 ABI 和類型
├── hooks/              # 自定義 Hooks
│   └── useRealContract.ts # 合約互動 Hooks
├── App.tsx             # 主應用程式
└── main.tsx            # 入口點
```

## 環境變數

創建 `.env.local` 文件：

```env
VITE_CONTRACT_ADDRESS=你的合約地址
VITE_CHAIN_ID=11155111  # Sepolia 測試網
```

## 建構生產版本

```bash
npm run build
```

建構後的檔案將在 `dist/` 目錄中。

## 部署

### Vercel

1. 將專案推送到 GitHub
2. 在 Vercel 中導入專案
3. 配置環境變數
4. 部署

### Netlify

1. 將專案推送到 GitHub
2. 在 Netlify 中導入專案
3. 配置建構命令：`npm run build`
4. 配置發布目錄：`dist`
5. 配置環境變數
6. 部署

## 故障排除

### 常見問題

1. **錢包連接失敗**
   - 確保已安裝 MetaMask 或其他 Web3 錢包
   - 檢查網路設定（應為 Sepolia 測試網）

2. **合約互動失敗**
   - 檢查合約地址是否正確
   - 確保錢包中有足夠的測試 ETH
   - 檢查合約是否已部署

3. **建構錯誤**
   - 清除 node_modules 並重新安裝：`rm -rf node_modules && npm install`
   - 檢查 TypeScript 錯誤

## 貢獻

歡迎提交 Issue 和 Pull Request！

## 授權

MIT License
