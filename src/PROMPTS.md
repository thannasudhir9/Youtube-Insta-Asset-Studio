# Development History & AI-Driven Feature Ideas (`PROMPTS.md`)

This log preserves the development cycle of the **the90s_Breeze** application, documenting key prompts, updates, and timestamps. It also serves as an architectural blueprint for future AI-driven integrations.

---

## 📅 Development History Log

### 🛠️ Entry 1: Toast System Integration
* **Timestamp**: 2026-06-28 04:05:12 UTC-7
* **Prompt**: *(Internal Optimization Phase)* Implement a global, styled notification/toast system to replace standard browser alert dialogs, maintaining an eye-safe aesthetic layout.
* **Outcome**: 
  - Engineered `/src/components/ToastContext.tsx` with high-fidelity React Context, customizable categories (`success`, `error`, `info`), and smooth slide-in/out transitions.
  - Injected CSS keyframes `@keyframes slideIn` into `/src/index.css`.
  - Wrapped root app layout inside `ToastProvider` in `/src/App.tsx`.
  - Integrated beautiful success/error micro-feedback throughout `YoutubeFetcher.tsx` and `AssetStudio.tsx`.

### 🛠️ Entry 2: High-Fidelity Asset Gallery Grid
* **Timestamp**: 2026-06-28 04:08:32 UTC-7
* **Prompt**: Build an 'Asset Gallery' grid view in the Asset Studio that renders cards for each stored clip, complete with a generated thumbnail, metadata display, and quick-action buttons for 'Play', 'Rename', and 'Delete'.
* **Outcome**:
  - Re-engineered the local Asset Gallery with a responsive grid layout.
  - **Dynamic Thumbnails**: Uses high-quality YouTube preview frames, falling back to an elegant, generated CSS gradient cover styled with simulated audio soundbar animations and music accents.
  - **Status & Source Badges**: Clear visual differentiation between localized offline cache (`Offline` badge) and Google Drive synced media (`Synced` badge).
  - **Advanced Controls**: Implemented realtime search filtering by title, film, singers, or vibes alongside tabbed segment controls (`All`, `Offline`, `Synced`).
  - **Interactive HUD**: Live state tracking displaying active player equalizer animations for playing loops, inline renamers, batch deletion protocols, and quick play triggers.
  - **Metadata Panels**: Interactive statistics tracker counting total clips, local caches, and active syncs.

### 🛠️ Entry 3: Storage & Cache Auto-Cleanup Engine
* **Timestamp**: 2026-06-28 04:21:26 UTC-7
* **Prompt**: Create a settings option in the ConfigView to enable 'Auto-Cleanup' for local assets, which clears temporary cache files older than 30 days to free up storage space while keeping curated viral hooks.
* **Outcome**:
  - **Curation System**: Integrated custom curation capability (`isCurated` flag) on `StoredAsset` types, allowing users to toggle curated status using an elegant `Star` quick-action button in the Asset Studio gallery cards.
  - **Cleanup Utility**: Engineered `/src/lib/cleanupUtils.ts` featuring automatic relative timestamp parsing of local cached clips to clear old temporary assets.
  - **Config Integration**: Added "Storage & Cache Optimization" control card in `ConfigView.tsx` with a master toggle to persistent state, detailed real-time cache statistics (total saved files, curated hooks, last run date), and manual cleanup trigger.
  - **Silent Boot Check**: Automated silent cache analysis upon application load in `App.tsx` when Auto-Cleanup is enabled.

### 🛠️ Entry 4: Centralized Notification System Integration
* **Timestamp**: 2026-06-28 04:26:39 UTC-7
* **Prompt**: Implement a centralized Toast notification system that triggers visual alerts for all successful background operations, specifically for 'Download Complete', 'Sync to Drive Success', and 'API Configuration Updated'.
* **Outcome**:
  - **Download Complete Integration**: Programmed explicit success triggers for local clip saving, loop package downloading, and offline detail exporting in `YoutubeFetcher.tsx`.
  - **Sync to Drive Success Integration**: Wired success states for Google Drive synchronization and uploads under custom OAuth configurations.
  - **API Configuration Updated Integration**: Injected success alerts upon successful saving and clearing of client-side credentials in `ConfigView.tsx`.

---

## 🚀 Future AI-Driven Roadmap

As the system evolves into a fully automated, agentic social production suite, the following high-value integrations are planned:

### 1. Model Context Protocol (MCP) Server Implementation
Bridging the gap between frontier models (e.g., Gemini 2.5 Flash / Pro) and local system resources using standard protocol definitions:
* **The Concept**: Build a custom Node-based MCP server (`the90s_Breeze-mcp`) that exposes secure tools for the agent to query, edit, and render media files directly on the host machine.
* **Exposed MCP Tools**:
  - `list_clips(filter?: string)`: Query the local IndexedDB database from a model context.
  - `preview_waveform(assetId: string)`: Return audio sample rate, length, and timestamp peaks to the LLM.
  - `ffmpeg_synthesis(assetId: string, backgroundPrompt: string)`: Trigger system-level FFmpeg builds through the model's tool calls.
* **Benefits**: Enables external developer agents (and in-browser models) to interact natively with your video studio workspace with full type-safety and permission guards.

### 2. Headless API Layer & Automated Microservices
Decoupling the interactive frontend to allow background automation cron jobs:
* **Ingestion Pipelines**: A headless `/api/headless/ingest` endpoint which accepts YouTube URLs, automatically downloads metadata, detects retro beats, extracts 15-second viral hooks, and generates translated caption files.
* **Gemini Autopilot**: Scheduled serverless workers calling Gemini Vision models to audit compiled clips for vertical safety (e.g., ensuring subtitle text stays inside mobile "safe zones" on TikTok/Instagram Reels).
* **Webhook Listeners**: Listen to incoming webhook triggers from Spotify or YouTube playlists to begin batch processing new retro hits as soon as they are added by curated creators.

### 3. Fully Agentic Social Auto-Posting
* **Instagram/YouTube Shorts Direct Publishing**: Connect official Meta & Google Graph APIs under custom OAuth configurations, enabling one-click queue-to-publish or automated publishing once Gemini-generated reels are compiled.
* **Viral A/B Variant Generation**: Generate 3 alternative caption variants and title hooks via Gemini API, and record performance metrics back into Firestore to train local selection models.
