import openai
from typing import Optional
from config.settings import settings

class ChatGPTService:
    """Service for OpenAI ChatGPT API integration"""
    
    def __init__(self):
        self.client = openai.AsyncOpenAI(api_key=settings.openai_api_key)
    
    async def generate_summary(
        self, 
        transcript: str, 
        paper_title: str,
        custom_prompt: Optional[str] = None
    ) -> str:
        """
        Generate structured academic summary using ChatGPT
        
        Args:
            transcript: Transcribed text from audio
            paper_title: Title of the paper for context
            custom_prompt: Optional custom prompt template
            
        Returns:
            Structured summary in Markdown format
        """
        try:
            # Use custom prompt or default academic prompt
            prompt = custom_prompt or self._get_default_academic_prompt()
            
            # Format the complete prompt with transcript
            complete_prompt = f"""{prompt}

## 論文標題參考
{paper_title}

## 原始逐字稿內容如下:
\"\"\"
{transcript}
\"\"\""""

            # Call ChatGPT API
            response = await self.client.chat.completions.create(
                model=settings.chatgpt_model,
                messages=[
                    {
                        "role": "system",
                        "content": "你是一位專業的學術研究助理，擅長分析學術論文內容並生成結構化的重點摘要。"
                    },
                    {
                        "role": "user", 
                        "content": complete_prompt
                    }
                ],
                max_tokens=settings.max_tokens,
                temperature=settings.temperature
            )
            
            return response.choices[0].message.content.strip()
            
        except Exception as e:
            raise Exception(f"摘要生成失敗: {str(e)}")
    
    def _get_default_academic_prompt(self) -> str:
        """Get the default academic summary prompt template"""
        return """# Role: 學術研究助理

## Context:
你是一位專業的學術研究助理。我剛剛收聽了一段關於一篇學術論文的 Podcast，並使用 Whisper 取得了以下的逐字稿。

## Task:
請你根據這份逐字稿，為我整理出一份結構清晰、條理分明的論文重點筆記。筆記必須使用繁體中文和 Markdown 格式。

## Output Format (輸出格式要求):
請嚴格遵循以下 Markdown 結構來組織你的回答，如果某些部分資訊不足，可以留空或標示「資訊不明」：

### 核心問題 (Problem Statement)
- (這裡簡述這篇論文試圖解決的核心問題或研究目標。)

### 研究方法 (Methodology)
- (這裡描述論文所使用的主要研究方法、實驗設計、數據集或理論框架。)

### 主要發現 (Key Findings)
- (以點列方式，條列出 2-4 個最關鍵的實驗結果或發現。)

### 結論與未來展望 (Conclusion & Future Work)
- (總結這篇論文的貢獻，以及作者提到的未來研究方向或限制。)

## 重要指示:
1. 請保持客觀中性的學術語調
2. 重點突出關鍵資訊，避免冗長描述
3. 如果逐字稿中有不清楚的部分，請根據上下文合理推測
4. 確保輸出的 Markdown 格式正確且易讀"""
    
    async def generate_tags(self, summary: str, max_tags: int = 5) -> list:
        """
        Generate relevant tags for the paper based on summary
        
        Args:
            summary: The generated summary
            max_tags: Maximum number of tags to generate
            
        Returns:
            List of relevant tags
        """
        try:
            prompt = f"""基於以下論文摘要，請生成 {max_tags} 個最相關的關鍵字標籤。
標籤應該是:
1. 簡潔的中文詞彙（2-6個字）
2. 能夠代表論文的主要主題或技術
3. 有助於在 Obsidian 中進行分類和檢索

論文摘要:
{summary}

請只返回標籤列表，每個標籤一行，格式如下:
- 標籤1
- 標籤2
- 標籤3"""

            response = await self.client.chat.completions.create(
                model=settings.chatgpt_model,
                messages=[
                    {
                        "role": "system",
                        "content": "你是一位專業的學術分類專家，擅長為論文生成精準的關鍵字標籤。"
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                max_tokens=200,
                temperature=0.3
            )
            
            # Parse tags from response
            content = response.choices[0].message.content.strip()
            tags = []
            for line in content.split('\n'):
                line = line.strip()
                if line.startswith('- '):
                    tags.append(line[2:].strip())
                elif line and not line.startswith('#'):
                    tags.append(line.strip())
            
            return tags[:max_tags]
            
        except Exception as e:
            print(f"標籤生成失敗: {e}")
            return []
    
    async def refine_summary(self, original_summary: str, user_feedback: str) -> str:
        """
        Refine the summary based on user feedback
        
        Args:
            original_summary: The original generated summary
            user_feedback: User's feedback or requirements
            
        Returns:
            Refined summary
        """
        try:
            prompt = f"""請根據使用者的回饋，改進以下學術論文摘要。

原始摘要:
{original_summary}

使用者回饋:
{user_feedback}

請保持原有的 Markdown 結構，並根據回饋進行適當的修改或補充。"""

            response = await self.client.chat.completions.create(
                model=settings.chatgpt_model,
                messages=[
                    {
                        "role": "system",
                        "content": "你是一位專業的學術編輯，擅長根據回饋改進學術文獻摘要。"
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                max_tokens=settings.max_tokens,
                temperature=settings.temperature
            )
            
            return response.choices[0].message.content.strip()
            
        except Exception as e:
            raise Exception(f"摘要改進失敗: {str(e)}")