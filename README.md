# Coach OS / Vitrion V2

Coach OS 是一個健康與教練決策輔助產品原型。它不是單純的打卡 App，而是把使用者的體重、睡眠、步數、疲勞、飢餓感與飲食執行率整理成可回測的 observations，再透過 deterministic rules 找出需要處理的問題，最後交給 coach attention queue 做人工審核。

## Core Idea

很多健康 App 只會記錄資料或給出泛用 AI 建議。Coach OS 的重點是「先判斷問題，再決定動作」：

- 使用者每天用 30 秒提交身體回報。
- 系統把回報轉成標準化 observations。
- Feature engine 計算 7 天趨勢與 28 天 baseline。
- Detection engine 找出活動量下降、睡眠下滑、體重停滯、低執行率與恢復警訊。
- AI gateway 只產生可審核的建議，不作為真相來源。
- Coach 可以 approve、edit 或 reject recommendation，留下 decision log。

## Main Routes

- `/`：整合後的產品首頁
- `/v2/checkin`：V2 使用者身體回報
- `/v2/coach-attention`：教練 attention queue
- `/insights`：趨勢、營養品關聯與 V2 decision layer 入口

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Supabase client
- Vitest
- Tailwind CSS

## Local Development

```bash
npm install
npm run dev
```

Open:

```text
http://localhost:3000
```

## Validation

```bash
npm run test
npm run build
```

Focused lint for the V2 integration:

```bash
npx eslint src/lib/v2 src/services/ai src/app/v2 src/tests src/components/vitrion/bottom-nav.tsx src/components/vitrion/action-todo-list.tsx src/app/checkin/page.tsx src/app/insights/page.tsx src/app/page.tsx src/app/onboarding/page.tsx src/app/layout.tsx
```

## Current Status

This is an early product slice. The V2 engines, check-in flow, coach attention UI, AI gateway abstraction, and golden-case tests are implemented. Real production persistence for coach decisions requires Supabase V2 tables and persisted recommendation IDs.

Coach OS is a decision-support tool. It does not provide medical diagnosis, prescriptions, or treatment instructions.
