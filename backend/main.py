from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import httpx
from typing import Optional
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Ollama Llama2 API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React's default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str
    model: str = "llama2"
    stream: bool = False

class ChatResponse(BaseModel):
    response: str

@app.get("/")
async def root():
    return {"message": "Welcome to Ollama Llama2 API"}

@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    try:
        async with httpx.AsyncClient(timeout=300.0) as client:  
            response = await client.post(
                "http://localhost:11434/api/generate",
                json={
                    "model": request.model,
                    "prompt": request.message,
                    "stream": request.stream,
                    "options": {
                        "num_ctx": 2048,  # Context window size
                        "temperature": 0.7,  # Lower temperature for more focused responses
                        "top_p": 0.9,  # Nucleus sampling parameter
                        "repeat_penalty": 1.1  # Penalty for repetition
                    }
                }
            )
            
            response.raise_for_status()
            data = response.json()
            
            if "response" not in data:
                raise HTTPException(
                    status_code=500,
                    detail="Unexpected response format from Ollama"
                )
                
            return ChatResponse(response=data["response"])
            
    except httpx.TimeoutException:
        raise HTTPException(
            status_code=504,
            detail="The model is taking too long to respond. Please try breaking down your question into smaller parts."
        )
    except httpx.RequestError as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error connecting to Ollama. Make sure Ollama is running. Error: {str(e)}"
        )
    except httpx.HTTPStatusError as e:
        raise HTTPException(
            status_code=500,
            detail=f"Ollama returned an error: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"An unexpected error occurred: {str(e)}"
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 