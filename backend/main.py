from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import ollama
import json

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace with your frontend origin in prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "Ollama streaming backend is running."}

@app.get("/chat-stream")
async def chat_stream(prompt: str):
    def generate():
        print(f"🔸 Prompt received: {prompt}")
        try:
            client = ollama.chat(
                model="llama2",
                messages=[{"role": "user", "content": prompt}],
                stream=True
            )

            any_response = False

            for chunk in client:
                if hasattr(chunk, "message") and chunk.message.content.strip() != "":
                    any_response = True
                    yield f"data: {json.dumps({'response': chunk.message.content})}\n\n"
                if getattr(chunk, "done", False):
                    break

            if not any_response:
                yield f"data: {json.dumps({'response': '[No content received from model]'})}\n\n"

            yield "data: [DONE]\n\n"

        except Exception as e:
            print("❌ Error in stream:", e)
            yield f"data: {json.dumps({'response': f'[Error]: {str(e)}'})}\n\n"

    return StreamingResponse(generate(), media_type="text/event-stream")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
