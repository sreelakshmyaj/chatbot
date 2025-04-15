# 🧠 AI Chatbot Assistant

A full-stack chatbot built with **FastAPI (backend)** and **React (frontend)** using the **LLaMA 2 model via Ollama**. Features include:

- 💬 Streaming chat with Markdown support  
- 📝 Export chat as **Markdown** or **PDF**  
- 🧠 Session-based memory for ongoing conversations  

---

## 🚀 Features

| Feature | Description |
|--------|-------------|
| 🧠 LLM Chat | Powered by LLaMA 2 through Ollama |
| 🔁 Streaming Responses | Real-time streaming from backend to frontend |
| 📝 Export Options | Save conversations as PDF or Markdown |
| 📚 Session Memory | Each chat has its own memory context |
| 🎨 Themed UI | Clean and user-friendly React interface |
| 🔊 Voice Support | Read responses out loud using text-to-speech |
| 📋 Copy Response | Easily copy response text to clipboard |
| 🌗 Light/Dark Mode | Toggle between light and dark themes |


---

## 🛠️ Tech Stack

- **Frontend**: React + TailwindCSS  
- **Backend**: FastAPI + Ollama    
- **Others**: SSE (Server-Sent Events) for streaming

---

<p align="center">
  <img src="https://github.com/user-attachments/assets/34ea3e03-9624-4425-9ea3-a947343816f5" width="400" />
  <img src="https://github.com/user-attachments/assets/ed4a6d42-7716-4ad4-b6a5-6c020080f513" width="400" />
</p>

## 🛠️ Setup Instructions

Follow these steps to run the chatbot locally.

---

## Backend (FastAPI + Ollama)

### 1. Create and activate a virtual environment (optional but recommended)

```bash
python -m venv venv
source venv/bin/activate   # For Linux/macOS
venv\Scripts\activate      # For Windows
```
### 2. Install Dependencies
```bash
pip install -r requirements.txt
```
### 3. Pull the LLaMA2 model
```bash
ollama pull llama2
```
### 4. Run Ollama server
```bash
ollama run llama2
```
### 5. Start FastAPI backend server
```bash 
uvicorn main:app --reload
```
## Frontend (React)
### 1. Navigate to the frontend folder and run:
```bash 
npm install
```
### 2. Start the React development server
```bash
npm start
```
You're all set! 
👉 Visit [http://localhost:3000](http://localhost:3000) in your browser to start chatting.

