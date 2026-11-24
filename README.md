# 神燈遊戲：自我實踐 — 課堂互動平台

> 高中經濟科／生命教育課堂互動網頁，讓全班學生同時使用，學生端資料即時同步至教師控制台。

---

## 一、用途與設計理念

### 用途

「神燈遊戲：自我實踐」是一款專為高中課堂設計的價值澄清與決策訓練互動活動。學生扮演「擁有神燈」的角色，最初擁有 10 個願望，但在現實與命運的抉擇中，必須經過兩輪殘酷淘汰：

- **第一輪**：10 擇 6，劃線放棄 4 個願望
- **第二輪**：6 擇 3，再劃線放棄 3 個願望

最終留下的 3 個願望，即為該生內心最珍視的核心價值。教師端可即時查看全班的提交數據、統計核心願望與淘汰願望分佈，並隨機抽籤揭密特定學生的完整選擇軌跡。

### 設計理念

| 理念 | 說明 |
|------|------|
| **價值澄清** | 透過「放棄」而非「選擇」，讓學生反覆權衡什麼才是真正重要的，從而鎖定核心自我。 |
| **決策訓練** | 每一輪淘汰都是一次有代價的決策，訓練學生在資源有限下做出優先排序。 |
| **即時回饋** | 學生提交後，教師端 1 秒內即可看到結果，課堂氛圍即時建立，無需等待彙整。 |
| **多班別獨立** | 透過 `?instanceId=班別代碼` 區隔不同班別資料，各班互不干擾，同一個網址可重複使用。 |
| **隱私與安全** | 教師密碼不儲存在前端或版本庫中，僅存在部署平台環境變數。 |

---

## 二、功能說明

### 學生端

1. **身分登記**：填寫班別、學號、姓名
2. **願望填寫**：從預設標籤（最多 7 個）與手動自訂（至少 3 個）中湊滿 10 個願望
3. **第一輪淘汰（10 擇 6）**：點選 4 個願望劃線放棄
4. **第二輪淘汰（6 擇 3）**：從剩下 6 個中再劃線放棄 3 個
5. **最終確認**：檢視保留的 3 大核心願望與放棄的 7 個願望，提交至系統

### 教師端（大螢幕）

1. **即時儀表板**：總參與人數、最高頻保留核心願望、最高頻淘汰願望
2. **Top 5 排行榜**：最多學生保留的核心願望 / 最多被放棄的願望
3. **年級隨機抽籤**：隨機抽出一位學生，在大螢幕展示其 10 個初始願望與淘汰軌跡
4. **數據重置**：教師驗證後可清空全部數據，重新開始新一輪活動

### 即時同步（SSE）

學生提交選擇後，教師端會透過 **Server-Sent Events (SSE)** 在 1 秒內自動更新，無需手動刷新頁面。

---

## 三、技術架構

```
學生端 (瀏覽器)  ── POST /api/events ──>  Node.js 後端  ── SSE /api/stream ──>  教師端 (瀏覽器)
                                       │
                                       └── 資料持久化至 data/events.json
```

- **後端**：零依賴 Node.js（僅內建 `http`, `fs`, `path`, `crypto` 模組），可直接部署到 Render 免費方案
- **通訊**：`POST /api/events` 寫入事件、`GET /api/events?instanceId=...` 查詢事件、`GET /api/stream?instanceId=...` SSE 即時推送
- **資料格式**：JSON 檔案儲存，支援原子寫入與串行處理，避免並發覆蓋
- **速率限制**：每 IP 每分鐘最多 120 次寫入，防止惡意刷資料

---

## 四、部署說明（Render 免費方案）

### 前置條件

- GitHub 帳號
- Render 帳號（[https://dashboard.render.com](https://dashboard.render.com)）

### 部署步驟

1. **建立 GitHub 倉庫**並將本專案推送：
   ```bash
   git init -b main
   git add -A
   git commit -m "init genie-game classroom"
   git remote add origin https://github.com/你的帳號/genie-game.git
   git push -u origin main
   ```

2. **在 Render 建立 Web Service**：
   - 點擊 **New +** → **Web Service**
   - 連接 GitHub 倉庫 `genie-game`
   - 設定：
     - **Name**: `genie-game-classroom`
     - **Runtime**: `Node`
     - **Plan**: `Free`
     - **Build Command**: 留空
     - **Start Command**: `node server.js`
     - **Branch**: `main`
   - 點擊 **Create Web Service**

3. **設定環境變數**：
   - 在服務頁面 → **Environment** → **Add Environment Variable**
   - Key: `TEACHER_PASSWORD`
   - Value: `@W423021k`（或自訂密碼）
   - 點擊 **Save, rebuild, and deploy**

4. **訪問網站**：
   ```
   https://genie-game-classroom.onrender.com/?instanceId=01GIA
   ```

---

## 五、使用範例

### 課堂連結（分給全班學生）

```
https://genie-game-classroom.onrender.com/?instanceId=01GIA
```

可自行更換 `instanceId` 參數區分不同班別，例如 `?instanceId=01GIB`、`?instanceId=02A` 等。

### 教師控制台

1. 開啟同一個網址
2. 點擊「教師端（大螢幕）」
3. 輸入密碼（預設 `@W423021k`，可在 Render 環境變數修改）
4. 功能：即時看板、開始新輪、重置數據、下載 CSV、隨機抽籤

---

## 六、檔案清單

| 檔案 | 用途 |
|------|------|
| `index.html` | 前端單頁應用（學生端 + 教師控制台，Tailwind CSS） |
| `server.js` | Node.js 零依賴後端（靜態託管 + 事件儲存 + SSE 推送） |
| `package.json` | Node 專案設定 |
| `render.yaml` | Render 自動部署藍圖 |
| `.gitignore` | 忽略 `data/`、`node_modules/` |
| `README.md` | 本說明文件 |

---

## 七、重要提醒

| 項目 | 說明 |
|------|------|
| **Render 免費方案休眠** | 15 分鐘無人訪問會休眠，上課前請先開啟一次網址喚醒（約 30–60 秒） |
| **資料臨時性** | Render 免費方案磁碟為臨時性，重新部署會清空資料，每節課後請從教師端下載 CSV 留存 |
| **GitHub 公開倉庫** | 倉庫因帳號限制為公開（Public），但教師密碼不儲存在版本庫中，僅存在 Render 環境變數 |
| **教師密碼** | 預設 `@W423021k`，可在 Render → Environment 修改 |

---

## 八、版本歷程

- **v1.0** (2026-11-24)：初版，自有後端 + SSE 即時同步，移除平台 SDK 依賴，支援多班別獨立資料

---

**適用對象**：高中教師、生命教育／經濟科課堂互動  
**最後更新**：2026-11-24
