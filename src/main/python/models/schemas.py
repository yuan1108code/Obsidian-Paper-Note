from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from enum import Enum

class ProcessingStatus(str, Enum):
    PENDING = "待命中"
    UPLOADING = "正在上傳..."
    TRANSCRIBING = "1/4 正在進行語音辨識..."
    SUMMARIZING = "2/4 正在生成重點摘要..."
    IMPORTING = "3/4 正在匯入Obsidian..."
    COMPLETED = "4/4 完成！"
    ERROR = "錯誤！"

class AudioUploadRequest(BaseModel):
    paper_title: str = Field(..., description="論文標題")
    file_name: str = Field(..., description="音檔檔名")
    file_size: int = Field(..., description="檔案大小 (bytes)")

class TranscriptionResponse(BaseModel):
    session_id: str
    transcript: str
    status: ProcessingStatus

class SummaryRequest(BaseModel):
    session_id: str
    transcript: str
    paper_title: str
    custom_prompt: Optional[str] = None

class SummaryResponse(BaseModel):
    session_id: str
    summary: str
    status: ProcessingStatus

class ObsidianSaveRequest(BaseModel):
    paper_title: str = Field(..., description="論文標題")
    content: str = Field(..., description="筆記內容")
    vault_name: Optional[str] = None
    file_path: Optional[str] = None
    session_id: Optional[str] = None

class ObsidianSaveResponse(BaseModel):
    obsidian_uri: str
    success: bool
    message: str

class ProgressUpdate(BaseModel):
    session_id: str
    status: ProcessingStatus
    progress_percentage: int = Field(ge=0, le=100)
    message: Optional[str] = None
    data: Optional[Dict[str, Any]] = None

class ErrorResponse(BaseModel):
    error: str
    message: str
    session_id: Optional[str] = None