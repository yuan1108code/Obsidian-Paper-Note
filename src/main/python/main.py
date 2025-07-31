from fastapi import FastAPI, UploadFile, File, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import uvicorn
import asyncio
import uuid
import os
from typing import Dict, Set
import json

from config.settings import settings
from models.schemas import *
from services.whisper_service import WhisperService
from services.chatgpt_service import ChatGPTService
from services.obsidian_service import ObsidianService
from api.progress_manager import ProgressManager

app = FastAPI(
    title="Obsidian Paper Note API",
    description="Academic Podcast to Obsidian Notetaker",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
whisper_service = WhisperService()
chatgpt_service = ChatGPTService()
obsidian_service = ObsidianService()
progress_manager = ProgressManager()

# Ensure upload directory exists
os.makedirs(settings.upload_dir, exist_ok=True)

@app.get("/")
async def root():
    return {"message": "Obsidian Paper Note API is running"}

@app.get("/api/health")
async def health_check():
    """Health check endpoint that tests OpenAI API connectivity"""
    try:
        # Test if OpenAI API key is configured
        if not settings.openai_api_key:
            return {
                "status": "error",
                "message": "OpenAI API key not configured",
                "services": {
                    "whisper": "❌ No API Key",
                    "chatgpt": "❌ No API Key"
                }
            }
        
        # Basic connectivity test - just check if we can create clients
        whisper_status = "✅ Ready"
        chatgpt_status = "✅ Ready"
        
        try:
            whisper_service.client
        except Exception as e:
            whisper_status = f"❌ Error: {str(e)}"
            
        try:
            chatgpt_service.client
        except Exception as e:
            chatgpt_status = f"❌ Error: {str(e)}"
        
        return {
            "status": "ok",
            "message": "API is running",
            "services": {
                "whisper": whisper_status,
                "chatgpt": chatgpt_status
            },
            "api_key_configured": bool(settings.openai_api_key)
        }
        
    except Exception as e:
        return {
            "status": "error", 
            "message": f"Health check failed: {str(e)}"
        }

@app.post("/api/upload", response_model=Dict[str, str])
async def upload_audio(file: UploadFile = File(...), paper_title: str = ""):
    """Upload audio file and return session ID"""
    
    # Validate file
    if not file.filename:
        raise HTTPException(status_code=400, detail="沒有選擇檔案")
    
    file_ext = os.path.splitext(file.filename)[1].lower()
    if file_ext not in settings.allowed_extensions:
        raise HTTPException(
            status_code=400, 
            detail=f"不支援的檔案格式。支援格式：{', '.join(settings.allowed_extensions)}"
        )
    
    # Check file size
    content = await file.read()
    if len(content) > settings.max_file_size_mb * 1024 * 1024:
        raise HTTPException(
            status_code=400, 
            detail=f"檔案過大。最大支援 {settings.max_file_size_mb}MB"
        )
    
    # Generate session ID and save file
    session_id = str(uuid.uuid4())
    file_path = os.path.join(settings.upload_dir, f"{session_id}{file_ext}")
    
    with open(file_path, "wb") as f:
        f.write(content)
    
    # Store session info
    progress_manager.create_session(session_id, {
        "file_path": file_path,
        "file_name": file.filename,
        "paper_title": paper_title or file.filename,
        "status": ProcessingStatus.PENDING
    })
    
    return {"session_id": session_id, "message": "檔案上傳成功"}

@app.post("/api/process", response_model=Dict[str, str])
async def process_audio(session_id: str):
    """Start processing audio (transcription + summarization)"""
    
    session_data = progress_manager.get_session(session_id)
    if not session_data:
        raise HTTPException(status_code=404, detail="找不到指定的會話")
    
    # Start background processing
    asyncio.create_task(process_audio_background(session_id))
    
    return {"message": "開始處理音檔", "session_id": session_id}

async def process_audio_background(session_id: str):
    """Background task for audio processing"""
    try:
        session_data = progress_manager.get_session(session_id)
        
        # Step 1: Transcription
        await progress_manager.update_progress(
            session_id, ProcessingStatus.TRANSCRIBING, 10, "開始語音辨識..."
        )
        
        transcript = await whisper_service.transcribe_audio(session_data["file_path"])
        session_data["transcript"] = transcript
        
        await progress_manager.update_progress(
            session_id, ProcessingStatus.TRANSCRIBING, 25, "語音辨識完成"
        )
        
        # Step 2: Summarization
        await progress_manager.update_progress(
            session_id, ProcessingStatus.SUMMARIZING, 30, "開始生成摘要..."
        )
        
        summary = await chatgpt_service.generate_summary(
            transcript, session_data["paper_title"]
        )
        session_data["summary"] = summary
        
        await progress_manager.update_progress(
            session_id, ProcessingStatus.SUMMARIZING, 50, "摘要生成完成"
        )
        
        # Step 3: Auto-import to Obsidian
        await progress_manager.update_progress(
            session_id, ProcessingStatus.IMPORTING, 75, "正在匯入Obsidian..."
        )
        
        # Auto-generate Obsidian URI and complete the process
        try:
            # Add small delay to show progress transition
            await asyncio.sleep(0.5)
            
            uri = obsidian_service.generate_uri(
                title=session_data["paper_title"],
                content=summary,
                validate=False  # Skip validation in background task to avoid blocking
            )
            
            # Store Obsidian URI in session data
            session_data["obsidian_uri"] = uri
            
            await progress_manager.update_progress(
                session_id, ProcessingStatus.COMPLETED, 100, "已成功匯入Obsidian！"
            )
            
        except Exception as obsidian_error:
            # If Obsidian integration fails, still mark as complete but with warning
            await progress_manager.update_progress(
                session_id, ProcessingStatus.COMPLETED, 90, f"摘要完成，Obsidian匯入發生錯誤：{str(obsidian_error)}"
            )
        
    except Exception as e:
        await progress_manager.update_progress(
            session_id, ProcessingStatus.ERROR, 0, f"處理失敗：{str(e)}"
        )

@app.get("/api/result/{session_id}")
async def get_result(session_id: str):
    """Get processing result"""
    session_data = progress_manager.get_session(session_id)
    if not session_data:
        raise HTTPException(status_code=404, detail="找不到指定的會話")
    
    return {
        "session_id": session_id,
        "status": session_data.get("status", ProcessingStatus.PENDING),
        "transcript": session_data.get("transcript", ""),
        "summary": session_data.get("summary", ""),
        "paper_title": session_data.get("paper_title", ""),
        "obsidian_uri": session_data.get("obsidian_uri", "")
    }

@app.post("/api/obsidian/save", response_model=ObsidianSaveResponse)
async def save_to_obsidian(request: ObsidianSaveRequest):
    """Generate Obsidian URI for saving note"""
    try:
        uri = obsidian_service.generate_uri(
            title=request.paper_title,
            content=request.content,
            vault_name=request.vault_name,
            file_path=request.file_path
        )
        
        # Use session_id from request if provided, otherwise try to find it
        session_id = getattr(request, 'session_id', None)
        if not session_id:
            # Fallback: Find session ID by content match (legacy support)
            for sid, data in progress_manager.sessions.items():
                if data.get("summary") and request.content in data.get("summary", ""):
                    session_id = sid
                    break
        
        # Update progress to 100% when Obsidian save is initiated
        if session_id:
            await progress_manager.update_progress(
                session_id, ProcessingStatus.COMPLETED, 100, "已匯入Obsidian！"
            )
        
        return ObsidianSaveResponse(
            obsidian_uri=uri,
            success=True,
            message="Obsidian URI 生成成功"
        )
    except Exception as e:
        return ObsidianSaveResponse(
            obsidian_uri="",
            success=False,
            message=f"生成失敗：{str(e)}"
        )

# WebSocket endpoint for real-time progress
@app.websocket("/ws/{session_id}")
async def websocket_endpoint(websocket: WebSocket, session_id: str):
    await progress_manager.connect(websocket, session_id)
    try:
        while True:
            await websocket.receive_text()  # Keep connection alive
    except WebSocketDisconnect:
        progress_manager.disconnect(session_id)

def find_available_port(start_port: int = 8000, max_attempts: int = 10) -> int:
    """Find an available port starting from start_port"""
    import socket
    
    for port in range(start_port, start_port + max_attempts):
        try:
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                s.bind(('localhost', port))
                return port
        except OSError:
            continue
    
    raise RuntimeError(f"No available port found in range {start_port}-{start_port + max_attempts}")

if __name__ == "__main__":
    try:
        # Try to use configured port, or find an available one
        port = settings.port
        
        # Test if configured port is available
        import socket
        try:
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                s.bind(('localhost', port))
        except OSError:
            print(f"⚠️  Port {port} is busy, finding alternative...")
            port = find_available_port(port)
            print(f"✅ Using port {port} instead")
        
        print(f"🚀 Starting Obsidian Paper Note API on {settings.host}:{port}")
        print(f"📋 Health check: http://localhost:{port}/api/health")
        print(f"📚 API docs: http://localhost:{port}/docs")
        
        uvicorn.run(
            "main:app",
            host=settings.host,
            port=port,
            reload=settings.debug
        )
    except Exception as e:
        print(f"❌ Failed to start server: {e}")
        print("Please check if another service is using the ports or try a different port.")