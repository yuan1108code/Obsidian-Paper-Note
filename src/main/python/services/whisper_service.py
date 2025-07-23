import openai
import aiofiles
from typing import Optional
from config.settings import settings

class WhisperService:
    """Service for OpenAI Whisper API integration"""
    
    def __init__(self):
        if not settings.openai_api_key:
            raise Exception("OpenAI API key not found. Please check your .env file.")
        self.client = openai.AsyncOpenAI(
            api_key=settings.openai_api_key,
            timeout=60.0  # 60 seconds timeout
        )
    
    async def transcribe_audio(
        self, 
        file_path: str, 
        custom_prompt: Optional[str] = None
    ) -> str:
        """
        Transcribe audio file using OpenAI Whisper API
        
        Args:
            file_path: Path to the audio file
            custom_prompt: Optional prompt to help with transcription accuracy
            
        Returns:
            Transcribed text
        """
        try:
            # Default academic prompt for better recognition of technical terms
            default_prompt = (
                "這是一段關於學術論文討論的錄音，可能包含專業術語如："
                "深度學習、機器學習、神經網路、Transformer、BERT、GPT、"
                "資料科學、人工智慧、演算法、模型訓練、自然語言處理等專業詞彙。"
            )
            
            prompt = custom_prompt or default_prompt
            
            # Read audio file
            async with aiofiles.open(file_path, 'rb') as audio_file:
                # Call Whisper API
                response = await self.client.audio.transcriptions.create(
                    model=settings.whisper_model,
                    file=audio_file,
                    prompt=prompt,
                    language="zh",  # Specify Chinese for better accuracy
                    response_format="text"
                )
                
                return response
                
        except openai.APIConnectionError as e:
            raise Exception(f"網路連接失敗，請檢查網路連線: {str(e)}")
        except openai.APIError as e:
            raise Exception(f"OpenAI API 錯誤: {str(e)}")
        except Exception as e:
            raise Exception(f"語音辨識失敗: {str(e)}")
    
    def validate_audio_file(self, file_path: str) -> bool:
        """
        Validate if the audio file is supported
        
        Args:
            file_path: Path to the audio file
            
        Returns:
            True if file is valid, False otherwise
        """
        import os
        
        if not os.path.exists(file_path):
            return False
            
        file_ext = os.path.splitext(file_path)[1].lower()
        return file_ext in settings.allowed_extensions
    
    def get_audio_duration(self, file_path: str) -> Optional[float]:
        """
        Get audio file duration in seconds
        
        Args:
            file_path: Path to the audio file
            
        Returns:
            Duration in seconds, or None if failed
        """
        try:
            import mutagen
            audio_file = mutagen.File(file_path)
            return audio_file.info.length if audio_file else None
        except ImportError:
            # If mutagen is not installed, return None
            return None
        except Exception:
            return None