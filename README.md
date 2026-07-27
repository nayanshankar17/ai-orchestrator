# 🤖 AI Orchestrator

<div align="center">

### 🚀 A Full-Stack Multi-Provider AI Platform with Authentication, Analytics & Intelligent Orchestration

[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.116+-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-Latest-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16+-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-ORM-red?style=for-the-badge&logo=sqlalchemy&logoColor=white)](https://www.sqlalchemy.org/)
[![JWT](https://img.shields.io/badge/JWT-Authentication-black?style=for-the-badge&logo=jsonwebtokens)](https://jwt.io/)
[![License](https://img.shields.io/badge/License-MIT-success?style=for-the-badge)](LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/nayanshankar17/ai-orchestrator?style=for-the-badge)](https://github.com/nayanshankar17/ai-orchestrator/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/nayanshankar17/ai-orchestrator?style=for-the-badge)](https://github.com/nayanshankar17/ai-orchestrator/network)
[![Status](https://img.shields.io/badge/Status-Phase%203%20Complete-success?style=for-the-badge)]()

</div>

---

## 📖 Overview

**AI Orchestrator** is a full-stack AI platform that provides a unified interface for interacting with multiple Large Language Models (LLMs).

Instead of being locked to a single provider, users can seamlessly chat with multiple AI providers while enjoying features such as secure authentication, persistent chat history, user preferences, analytics dashboards, and intelligent request orchestration.

Designed with scalability in mind, the project follows a modular architecture that makes it easy to extend with new providers, tools, and AI agents.

---

## ✨ Key Features

- 🔐 JWT Authentication
- 💬 Multi-session Chat System
- 🤖 Multi-Provider AI Integration
- ⚡ FastAPI Backend
- ⚛️ React Frontend
- 🗄️ PostgreSQL Database
- 📊 Analytics Dashboard
- 📈 Provider Usage Statistics
- 🌙 Light / Dark Theme
- ⚙️ User Preferences
- 📜 Persistent Chat History
- 🚀 Modular Architecture
- 🔄 Easy Provider Expansion

---



# ✨ Features

## 🔐 Authentication

Secure user authentication built using JWT with encrypted password storage.

- User Registration
- Secure Login
- JWT Authentication
- Password Hashing (bcrypt)
- Protected API Routes
- Session Management

---

## 💬 Intelligent Chat System

A modern ChatGPT-inspired conversational interface.

### Features

- Multiple Chat Sessions
- Persistent Chat History
- Rename Chat Sessions
- Context-aware Conversations
- Responsive Chat Interface
- Real-time AI Responses

---

## 🤖 Multi-Provider AI Orchestration

Interact with multiple AI providers through a unified interface.

| Provider | Status |
|----------|--------|
| Google Gemini | ✅ Supported |
| Groq | ✅ Supported |
| Additional Providers | 🚧 Coming Soon |

### Capabilities

- Dynamic Provider Switching
- User Provider Preferences
- Model Preferences
- Unified API Layer
- Easy Provider Expansion

---

## 📊 Analytics Dashboard

Monitor usage and gain insights into conversations.

### Dashboard Includes

- 📈 Total Chat Sessions
- 💬 Total Messages
- ❤️ Favorite AI Provider
- 📊 Provider Usage Distribution
- 📅 Daily Activity Chart
- 📉 Conversation Statistics
- 🕒 Recent Activity Table

---

## ⚙️ User Preferences

Customize your AI experience.

- Preferred AI Provider
- Preferred AI Model
- Persistent User Settings
- Personalized Experience

---

## 🎨 Modern User Interface

Designed for simplicity and productivity.

- ChatGPT-inspired Design
- Responsive Layout
- Light Theme
- Dark Theme
- Interactive Charts
- Sidebar Navigation

---

# 📸 Application Screenshots

## 🔑 Login Page

<p align="center">
  <img src="images/login.png" width="900" alt="Login Page">
</p>

---

## 📝 Register Page

<p align="center">
  <img src="images/register.png" width="900" alt="Register Page">
</p>

---

## 💬 AI Chat Dashboard

<p align="center">
  <img src="images/dashboard.png" width="900" alt="AI Chat Dashboard">
</p>

---

## 📊 Analytics Dashboard

<p align="center">
  <img src="images/analytics.png" width="900" alt="Analytics Dashboard">
</p>

---

## ⚙️ User Preferences

<p align="center">
  <img src="images/preferences.png" width="900" alt="User Preferences">
</p>

---

# 🏗️ System Architecture

```text
                    +---------------------------+
                    |      React Frontend       |
                    +-------------+-------------+
                                  |
                                  ▼
                    +---------------------------+
                    |      FastAPI Backend      |
                    +-------------+-------------+
                                  |
        +-------------------------+-------------------------+
        |                         |                         |
        ▼                         ▼                         ▼
+---------------+        +----------------+        +----------------+
| Authentication|        | AI Orchestrator|        |   Analytics    |
+---------------+        +----------------+        +----------------+
        |                         |                         |
        +------------+------------+------------+------------+
                     |                         |
                     ▼                         ▼
             +---------------------------------------+
             |         PostgreSQL Database           |
             +---------------------------------------+
                                 |
                                 ▼
                   +-------------------------------+
                   |       AI Provider Layer        |
                   +-------------------------------+
                   |                               |
          +----------------+              +----------------+ 
          | Google Gemini  |              |      Groq      |  
          +----------------+              +----------------+  
```

---

# 🏛️ Project Design

The project follows a layered architecture to keep components modular, scalable, and maintainable.

```text
React Frontend
       │
       ▼
API Routers
       │
       ▼
Business Logic (Services)
       │
       ▼
Database Models
       │
       ▼
PostgreSQL
       │
       ▼
External AI Providers
```

### Why this Architecture?

- Clean separation of concerns
- Easy to add new AI providers
- Scalable backend structure
- Reusable service layer
- Independent frontend and backend
- Ready for future AI agents and MCP integration

# 💡 Why AI Orchestrator?

Modern AI applications often rely on a single LLM provider, making it difficult to compare responses, switch providers, or personalize user experiences.

AI Orchestrator solves this by introducing a unified platform that abstracts multiple AI providers behind a single interface while providing authentication, persistent conversations, analytics, and user-specific preferences.

The project is designed with scalability in mind, making it easy to integrate additional providers, tools, and autonomous AI agents in future versions.
