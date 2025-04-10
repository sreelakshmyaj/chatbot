from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, FileResponse
import ollama
import json
import re
import time
import tempfile
import os
from datetime import datetime
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.enums import TA_LEFT, TA_CENTER

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

def generate_markdown(session_id: str):
    if session_id not in conversation_memory:
        return ""
    
    markdown = "# Chat Conversation\n\n"
    markdown += f"*Generated on {datetime.now().strftime('%B %d, %Y at %I:%M %p')}*\n\n"
    markdown += "---\n\n"
    
    for message in conversation_memory[session_id]:
        role = "User" if message["role"] == "user" else "Assistant"
        timestamp = datetime.now().strftime("%I:%M %p")
        
        markdown += f"## {role} ({timestamp})\n\n"
        markdown += f"{message['content']}\n\n"
        markdown += "---\n\n"
    
    return markdown

def generate_pdf(session_id: str):
    if session_id not in conversation_memory:
        return None
    
    # Create a temporary file
    with tempfile.NamedTemporaryFile(suffix='.pdf', delete=False) as tmp:
        # Create PDF document
        doc = SimpleDocTemplate(
            tmp.name,
            pagesize=letter,
            rightMargin=72,
            leftMargin=72,
            topMargin=72,
            bottomMargin=72
        )
        
        # Create styles
        styles = getSampleStyleSheet()
        
        # Title style
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=24,
            spaceAfter=30,
            textColor=colors.HexColor('#3B82F6'),
            alignment=TA_CENTER
        )
        
        # Subtitle style
        subtitle_style = ParagraphStyle(
            'CustomSubtitle',
            parent=styles['Normal'],
            fontSize=12,
            textColor=colors.gray,
            alignment=TA_CENTER,
            spaceAfter=20
        )
        
        # User message style
        user_style = ParagraphStyle(
            'UserStyle',
            parent=styles['Heading2'],
            fontSize=14,
            textColor=colors.HexColor('#3B82F6'),
            spaceAfter=6
        )
        
        # Assistant message style
        assistant_style = ParagraphStyle(
            'AssistantStyle',
            parent=styles['Heading2'],
            fontSize=14,
            textColor=colors.HexColor('#10B981'),
            spaceAfter=6
        )
        
        # Content style
        content_style = ParagraphStyle(
            'ContentStyle',
            parent=styles['Normal'],
            fontSize=12,
            spaceAfter=20,
            leading=16
        )
        
        # Timestamp style
        timestamp_style = ParagraphStyle(
            'TimestampStyle',
            parent=styles['Italic'],
            fontSize=10,
            textColor=colors.gray,
            spaceAfter=12
        )
        
        # Build the PDF content
        story = []
        
        # Add title
        story.append(Paragraph("Chat Conversation", title_style))
        story.append(Paragraph(
            f"Generated on {datetime.now().strftime('%B %d, %Y at %I:%M %p')}",
            subtitle_style
        ))
        
        # Add conversation content
        for message in conversation_memory[session_id]:
            role = "User" if message["role"] == "user" else "Assistant"
            timestamp = datetime.now().strftime("%I:%M %p")
            style = user_style if role == "User" else assistant_style
            
            # Add role and timestamp
            story.append(Paragraph(role, style))
            story.append(Paragraph(timestamp, timestamp_style))
            
            # Add message content
            story.append(Paragraph(message['content'], content_style))
            
            # Add separator
            story.append(Spacer(1, 10))
        
        # Build PDF
        doc.build(story)
        return tmp.name

@app.get("/export-conversation")
async def export_conversation(format: str, session_id: str = "default"):
    if format == "md":
        markdown = generate_markdown(session_id)
        with tempfile.NamedTemporaryFile(suffix='.md', delete=False) as tmp:
            tmp.write(markdown.encode())
            tmp.close()
            return FileResponse(
                tmp.name,
                media_type="text/markdown",
                filename=f"conversation_{datetime.now().strftime('%Y%m%d_%H%M%S')}.md"
            )
    elif format == "pdf":
        pdf_path = generate_pdf(session_id)
        if pdf_path:
            return FileResponse(
                pdf_path,
                media_type="application/pdf",
                filename=f"conversation_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
            )
        else:
            return {"error": "No conversation to export"}
    else:
        return {"error": "Unsupported format"}

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
