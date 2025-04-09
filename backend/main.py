from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import ollama
import json
import re

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

import time

@app.get("/chat-stream")
async def chat_stream(prompt: str):
    def generate():
        print(f"🔸 Prompt received: {prompt}")
        try:
            buffer = ""
            last_sent = time.time()

            client = ollama.chat(
                model="llama2",
                messages=[{"role": "user", "content": prompt}],
                stream=True
            )

            for chunk in client:
                if hasattr(chunk, "message"):
                    part = chunk.message.content
                    if part:
                        buffer += part

                        now = time.time()
                        # Send if it's been 0.3 seconds or we hit a punctuation
                        if (now - last_sent > 0.3) or re.search(r"[.!?\n]", buffer):
                            yield f"data: {json.dumps({'response': buffer})}\n\n"
                            buffer = ""
                            last_sent = now

                if getattr(chunk, "done", False):
                    if buffer:
                        yield f"data: {json.dumps({'response': buffer})}\n\n"
                    break

            yield "data: [DONE]\n\n"

        except Exception as e:
            print("❌ Error in stream:", e)
            yield f"data: {json.dumps({'response': f'[Error]: {str(e)}'})}\n\n"

    return StreamingResponse(generate(), media_type="text/event-stream")



if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
