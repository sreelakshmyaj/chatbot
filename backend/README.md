# Ollama Llama2 FastAPI Backend

This is a FastAPI backend that integrates with Ollama's Llama2 model for chat functionality.

## Prerequisites

1. Python 3.8 or higher
2. Ollama installed and running locally
3. Llama2 model pulled in Ollama

## Setup

1. Install Ollama from [https://ollama.ai/](https://ollama.ai/)
2. Pull the Llama2 model:
   ```bash
   ollama pull llama2
   ```
3. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
4. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

## Running the Application

1. Make sure Ollama is running locally
2. Start the FastAPI server:
   ```bash
   python main.py
   ```
3. The API will be available at `http://localhost:8000`

## API Endpoints

- `GET /`: Welcome message
- `POST /chat`: Chat with Llama2 model
  - Request body:
    ```json
    {
        "message": "Your message here",
        "model": "llama2",
        "stream": false
    }
    ```

## API Documentation

Once the server is running, you can access:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc` 