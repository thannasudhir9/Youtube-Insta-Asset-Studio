# 📝 PROMPTS.md: Development History & Future Automation Roadmap

A comprehensive record of user-driven requirements, prompt histories, development timestamps, and the future architectural roadmap for turning the **@the90s_breeze AI Music Automation Factory** into a programmatic headless platform with Model Context Protocol (MCP) capabilities.

---

## 📅 Historical Development Logs & Timestamps

### ⏱️ Phase 1: Core System Conception & Discovery
*   **Timestamp:** `2026-06-25T14:15:30-07:00`
*   **Prompt Input:**
    > "Design and build a web application interface for '@the90s_breeze' content factory. I need a dashboard where I can track viral trends for 90s Telugu and Tamil music, isolate 30-second peak emotional loops, and structure a visual diagram of the automated content pipeline."
*   **Engineering Deliverables:**
    *   Designed `src/components/ArchitectureView.tsx` outlining the modular automation pipeline.
    *   Created `src/components/TrendDiscovery.tsx` populated with Telugu & Tamil catalog indexes, viral metrics, and emotional triggers.
    *   Configured typography variables featuring **Inter** and **Space Grotesk** headings.

---

### ⏱️ Phase 2: YouTube Fetching & Offline Storage Integrations
*   **Timestamp:** `2026-06-26T09:42:10-07:00`
*   **Prompt Input:**
    > "I want to download and isolate audio segments from YouTube. Create a YouTube Fetcher module where I can paste any video URL, load it into a looper, and select specific start and end timestamps. I want this data saved locally inside an offline database (IndexedDB) as well as the option to authenticate and save assets directly to my Google Drive account."
*   **Engineering Deliverables:**
    *   Developed `src/components/YoutubeFetcher.tsx` with high-fidelity loop markers and playback widgets.
    *   Implemented the key-value offline storage wrapper in `src/lib/indexedDb.ts` using native client-side IndexedDB.
    *   Exposed Node/Express proxy routes supporting Google Drive OAuth token management.

---

### ⏱️ Phase 3: Asset Customization & Compilation Engines
*   **Timestamp:** `2026-06-27T11:05:15-07:00`
*   **Prompt Input:**
    > "Create an Asset Studio where I can configure video backgrounds. I want to search and choose beautiful watercolor and nostalgic portrait assets (misty roads, rain, train views) from Pexels, write custom lyric subtitles, fetch automated translation outputs, and run a simulated FFmpeg video compilation process that outputs professional logs in a terminal-like console."
*   **Engineering Deliverables:**
    *   Built `src/components/AssetStudio.tsx` to handle visual customization, backdrop transitions, and subtitles.
    *   Created an interactive simulated FFmpeg terminal logger displaying detailed compilation steps in real-time.

---

### ⏱️ Phase 4: Labs Sandbox, Scheduling & Exporters
*   **Timestamp:** `2026-06-27T16:30:22-07:00`
*   **Prompt Input:**
    > "We need more labs features. Create an AI Creative Labs page where I can prompt an image generator to produce stylized backgrounds, a Content Scheduler with calendar queues, an Analytics dashboard to track reel engagement, and a Scripts Exporter to output bash scripts for local rendering."
*   **Engineering Deliverables:**
    *   Delivered `src/components/AICreativeLabs.tsx`, `src/components/SchedulePublishing.tsx`, `src/components/AnalyticsView.tsx`, and `src/components/ScriptsExporter.tsx`.

---

### ⏱️ Phase 5: Inline YouTube Preview Player
*   **Timestamp:** `2026-06-28T03:35:44-07:00`
*   **Prompt Input:**
    > "Integrate a video preview player in the Asset Studio that displays the 'viral hook' clip visually once a YouTube video is processed, using an overlay to show the start/end timestamps."
*   **Engineering Deliverables:**
    *   Modified `src/components/AssetStudio.tsx` to read the processed YouTube records from the IndexedDB store.
    *   Embedded an iframe-based YouTube looper that binds dynamically to the selected clip and isolates the custom start and end duration timestamps.
    *   Overlaid a heads-up display (HUD) showing live start, end, and hook duration metrics.

---

### ⏱️ Phase 6: Algorithmic Safety & Fair Use Governance
*   **Timestamp:** `2026-06-28T03:39:28-07:00`
*   **Prompt Input:**
    > "Crucial Policy & Fair-Use Standards - Hide this with an eye icon, in home page. Create readme file, design and architecture, plan readme files, all input prompts readme file with date and time, all features, code explanation in deep in features and code readme file."
*   **Engineering Deliverables:**
    *   Integrated a collapsible safety standards module inside `src/components/ArchitectureView.tsx` with high-contrast panels, toggled by professional `Eye` and `EyeOff` icons.
    *   Structured master documentation: `README.md`, `README_PROMPTS.md`, and `README_FEATURES.md`.

---

### ⏱️ Phase 7: Headless Automation, MCP Servers & Latest AI Integrations
*   **Timestamp:** `2026-06-28T03:46:26-07:00`
*   **Prompt Input:**
    > "add new latest AI features and issues to fix and implement in future phases to do full automatation and create headless apis , mcp servers from our app. add this also into our prompts file."
*   **Engineering Deliverables:**
    *   Documented headless REST/JSON-RPC integration patterns and Model Context Protocol schema bindings for developer-centric agent automation.

---

## ⚡ Future AI-Driven Roadmap, Headless APIs & MCP Servers

To evolve `@the90s_breeze` into a headless, highly programmable content factory, the following roadmap details the engineering specifications for upcoming development phases.

### 🤖 1. Advanced AI-Driven Features
*   **Whisper Subtitle Alignment:** A backend pipeline using OpenAI Whisper or Gemini's Audio Analysis API to ingest nostalgic song streams, transcribe lines, translate lyrics, and calculate millisecond-level word timing coordinates to drive active subtitle rendering.
*   **Reels Visual Overlay Verification:** A multimodal agent model checking if subtitle overlays are printed in safe-zones, avoiding overlap with Instagram's active profile overlays or action panels.

### 🛡️ 2. Core Operational Improvements & Issue Fixes
*   **Audio Sync Latency Buffer:** Implementation of a adjustable `bufferLatencyMs` slider to eliminate iframe initialization latency, ensuring synchronized video frames and audio playbacks.
*   **Scraping Rate-Limit Mitigation:** Seamless rotation of proxies on backend YouTube scraping requests to completely prevent `429 Too Many Requests` API blockages.

### 🌐 3. Headless REST API Architecture
Developers can invoke the content factory's services programmatically from custom cron jobs or shell scripts:

```typescript
// Proposed Endpoint Mapping inside express server (server.ts)

// Returns current Telugu & Tamil nostalgia trends
app.get("/api/v1/trends", async (req, res) => { ... });

// Requests isolated YouTube data, extracting title, movie and hook timestamps
app.post("/api/v1/process-clip", async (req, res) => {
  const { youtubeUrl } = req.body;
  ...
});

// Triggers background FFmpeg compilation to write output file to storage
app.post("/api/v1/compile", async (req, res) => {
  const { clipId, backgroundAssetUrl, lyrics } = req.body;
  ...
});
```

### 🛰️ 4. Model Context Protocol (MCP) Server Integration
An integrated Model Context Protocol server over Server-Sent Events (SSE) will expose the factory's pipeline directly to LLMs as standard tools, making the application natively agent-driven.

#### Proposed Tool Schema:
```json
{
  "mcpVersion": "1.0.0",
  "tools": [
    {
      "name": "get_viral_trends",
      "description": "Exposes Telugu and Tamil musical trends for AI agents to query active song lists.",
      "inputSchema": {
        "type": "object",
        "properties": {
          "language": { "type": "string", "enum": ["telugu", "tamil", "all"] }
        }
      }
    },
    {
      "name": "parse_youtube_hook",
      "description": "Isolates and indexes a 15-30 second emotional loop from any given YouTube track.",
      "inputSchema": {
        "type": "object",
        "properties": {
          "url": { "type": "string" }
        },
        "required": ["url"]
      }
    },
    {
      "name": "schedule_render",
      "description": "Appends a synthesized 9:16 vertical video directly onto the calendar queue.",
      "inputSchema": {
        "type": "object",
        "properties": {
          "assetId": { "type": "string" },
          "date": { "type": "string", "description": "ISO 8651 Publish Date" }
        },
        "required": ["assetId", "date"]
      }
    }
  ]
}
```
This tool schema lets autonomous agents control the factory hands-off: identifying trending audio hooks, pulling matching video clips from IndexedDB or Drive, compiling customized Reels, and populating publication pipelines on absolute autopilot.
