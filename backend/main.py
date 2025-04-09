from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import ollama
import json
import re
import time

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

conversation_memory = {}
MAX_MEMORY_MESSAGES = 5

def update_memory(session_id: str, role: str, message: str):
    if session_id not in conversation_memory:
        conversation_memory[session_id] = []
    conversation_memory[session_id].append({"role": role, "content": message})
    conversation_memory[session_id] = conversation_memory[session_id][-MAX_MEMORY_MESSAGES:]

@app.get("/chat-stream")
async def chat_stream(prompt: str, session_id: str = "default"):
    def generate():
        print(f"🔸 Prompt received: {prompt} (session: {session_id})")
        try:
            update_memory(session_id, "user", prompt)

            messages = conversation_memory.get(session_id, [])
            buffer = ""
            full_response = ""
            last_sent = time.time()

            client = ollama.chat(
                model="llama2",
                messages=messages,
                stream=True
            )

            for chunk in client:
                if hasattr(chunk, "message"):
                    part = chunk.message.content
                    if part:
                        buffer += part
                        full_response += part  # Collect full reply

                        now = time.time()
                        if (now - last_sent > 0.3) or re.search(r"[.!?\n]", buffer):
                            yield f"data: {json.dumps({'response': buffer})}\n\n"
                            last_sent = now
                            buffer = ""

                if getattr(chunk, "done", False):
                    if buffer:
                        yield f"data: {json.dumps({'response': buffer})}\n\n"
                    break

            # Save assistant's full response to memory
            update_memory(session_id, "assistant", full_response)

            yield "data: [DONE]\n\n"

        except Exception as e:
            print("❌ Error in stream:", e)
            yield f"data: {json.dumps({'response': f'[Error]: {str(e)}'})}\n\n"

    return StreamingResponse(generate(), media_type="text/event-stream")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
