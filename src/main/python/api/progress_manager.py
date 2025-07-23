from fastapi import WebSocket
from typing import Dict, Any, Optional
import json
import asyncio
from models.schemas import ProcessingStatus, ProgressUpdate

class ProgressManager:
    """Manages session progress and WebSocket connections"""
    
    def __init__(self):
        self.sessions: Dict[str, Dict[str, Any]] = {}
        self.connections: Dict[str, WebSocket] = {}
    
    def create_session(self, session_id: str, data: Dict[str, Any]):
        """Create a new session"""
        self.sessions[session_id] = data
    
    def get_session(self, session_id: str) -> Optional[Dict[str, Any]]:
        """Get session data"""
        return self.sessions.get(session_id)
    
    def update_session(self, session_id: str, data: Dict[str, Any]):
        """Update session data"""
        if session_id in self.sessions:
            self.sessions[session_id].update(data)
    
    async def connect(self, websocket: WebSocket, session_id: str):
        """Accept WebSocket connection"""
        await websocket.accept()
        self.connections[session_id] = websocket
        
        # Send current status if session exists
        if session_id in self.sessions:
            session_data = self.sessions[session_id]
            await self.send_progress(session_id, {
                "status": session_data.get("status", ProcessingStatus.PENDING),
                "progress_percentage": 0,
                "message": "連接成功"
            })
    
    def disconnect(self, session_id: str):
        """Remove WebSocket connection"""
        if session_id in self.connections:
            del self.connections[session_id]
    
    async def update_progress(
        self, 
        session_id: str, 
        status: ProcessingStatus, 
        progress: int, 
        message: str = "",
        data: Optional[Dict[str, Any]] = None
    ):
        """Update progress and notify connected clients"""
        
        # Update session data
        if session_id in self.sessions:
            self.sessions[session_id].update({
                "status": status,
                "progress": progress,
                "message": message
            })
            if data:
                self.sessions[session_id].update(data)
        
        # Send update via WebSocket
        await self.send_progress(session_id, {
            "status": status,
            "progress_percentage": progress,
            "message": message,
            "data": data
        })
    
    async def send_progress(self, session_id: str, progress_data: Dict[str, Any]):
        """Send progress update via WebSocket"""
        if session_id in self.connections:
            try:
                update = ProgressUpdate(
                    session_id=session_id,
                    **progress_data
                )
                await self.connections[session_id].send_text(update.model_dump_json())
            except Exception as e:
                print(f"Failed to send progress update: {e}")
                # Remove broken connection
                self.disconnect(session_id)
    
    def cleanup_session(self, session_id: str):
        """Clean up session data and connections"""
        if session_id in self.sessions:
            # Delete uploaded file if exists
            session_data = self.sessions[session_id]
            if "file_path" in session_data:
                try:
                    import os
                    os.remove(session_data["file_path"])
                except:
                    pass
            
            del self.sessions[session_id]
        
        self.disconnect(session_id)