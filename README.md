# 🤖 VSCode AI Hackathon – April 2025

Welcome to our one-day hackathon focused on building **AI-powered developer tools** using VSCode, LLMs, and the Model Context Protocol (MCP)!

---

## 📅 Event Info

- **Date:** Friday, April 11th, 2025  
- **Time:** 9:00 AM – 5:00 PM  
- **Location:** Office  
- **Communication Channel:** [#hackathon-ai-assistant 🛠️ on Mattermost]  

---

## 🛠️ Challenge

> Build a VSCode extension that leverages AI to improve your coding workflow.  
> You can start with variable name suggestions or invent your own assistant!

---

## 🧰 What’s Included

- A basic **VSCode extension template** in the `main` branch
- A working **MCP (Model Context Protocol)** server
- Starter documentation in the `/mcp-starter-docs` folder
- [Examples of how to use a local LLM via Ollama or other tools](https://horizoncloud.atlassian.net/wiki/spaces/SOCIAL/pages/2479816706)
- [Local LLM Code Analysis Architecture](https://horizoncloud.atlassian.net/wiki/spaces/SOCIAL/pages/2479751181)

---

## 👥 Team Setup

- Teams of **1–3 people**
- Each team should create their own branch using the format:  
  `team-name/feature-name`  
  Examples:
  - `team-alpha/variable-namer`
  - `solo-jin/ai-hover-docs`

- You're free to create more branches within your namespace

---

## 🔄 Git Workflow

1. **Clone the repo**
2. **Create your team branch:**

   ```bash
   git checkout -b team-alpha/variable-namer


## Our ToDos for the Gherkin Review Assistant

### Goal

Build a tool that does a Gherkin review and checks Gherkin files for best practices.

1. define best practices to check
    1. try out different prompts to get results of individual best practice revies steps
2. build own VSCode command to trigger review of file
    1. find out how to use other .feature files as context
