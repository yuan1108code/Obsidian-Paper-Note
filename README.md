# Obsidian Paper Note

這是一個自動化工具，旨在將學術 Podcast 音檔一鍵轉換為結構化的 Obsidian 筆記，大幅提升學習與研究效率。

## 核心工作流程

1. **語音轉文字**: 使用者上傳 Podcast 音檔，系統透過 OpenAI Whisper API 自動生成逐字稿
2. **AI 重點整理**: ChatGPT 接著分析逐字稿，並依據預設的學術框架（如：核心問題、研究方法、主要發現、結論）產出精簡的重點摘要
3. **一鍵存入筆記**: 使用者可在介面預覽並微調摘要，然後點擊按鈕，即可將格式化的 Markdown 筆記無縫儲存至 Obsidian

## 主要特點

- **一站式處理**: 從音檔到筆記，所有操作皆在單一介面完成
- **智慧摘要**: 利用大型語言模型生成高品質、結構化的學術筆記
- **無縫整合**: 直接與本地的 Obsidian 知識庫連接，實現自動化歸檔

## Quick Start

1. **Read CLAUDE.md first** - Contains essential rules for Claude Code
2. Follow the pre-task compliance checklist before starting any work
3. Use proper module structure under `src/main/python/`
4. Commit after every completed task

## Universal Flexible Project Structure

**Standard Project:** Full application structure with modular organization  

## Development Guidelines

- **Always search first** before creating new files
- **Extend existing** functionality rather than duplicating  
- **Use Task agents** for operations >30 seconds
- **Single source of truth** for all functionality
- **Language-agnostic structure** - works with Python, JS, Java, etc.
- **Scalable** - start simple, grow as needed
- **Flexible** - choose complexity level based on project needs