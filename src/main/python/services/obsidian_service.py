import urllib.parse
from typing import Optional
from datetime import datetime
from config.settings import settings

class ObsidianService:
    """Service for Obsidian integration via URI scheme"""
    
    def generate_uri(
        self,
        title: str,
        content: str,
        vault_name: Optional[str] = None,
        file_path: Optional[str] = None,
        validate: bool = True
    ) -> str:
        """
        Generate Obsidian URI for creating/opening notes
        
        Args:
            title: Note title
            content: Note content in Markdown
            vault_name: Obsidian vault name (optional)
            file_path: Custom file path within vault (optional)
            validate: Whether to validate Obsidian installation (optional)
            
        Returns:
            Obsidian URI string
            
        Raises:
            RuntimeError: If validation enabled and Obsidian not found
        """
        # Validate Obsidian installation if requested
        if validate and not self.validate_obsidian_installed():
            raise RuntimeError("Obsidian 尚未安裝或無法偵測到。請確保 Obsidian 已正確安裝。")
        
        # Use default vault if not specified
        vault = vault_name or settings.default_obsidian_vault
        
        # Generate file path
        if file_path:
            full_path = file_path
        else:
            # Use default path with sanitized title
            sanitized_title = self._sanitize_filename(title)
            full_path = f"{settings.default_paper_path}/{sanitized_title}"
        
        # Add .md extension if not present
        if not full_path.endswith('.md'):
            full_path += '.md'
        
        # Add metadata to content
        enhanced_content = self._add_metadata(content, title)
        
        # URL encode parameters
        encoded_vault = urllib.parse.quote(vault)
        encoded_path = urllib.parse.quote(full_path)
        encoded_content = urllib.parse.quote(enhanced_content)
        
        # Construct Obsidian URI
        uri = f"obsidian://new?vault={encoded_vault}&file={encoded_path}&content={encoded_content}"
        
        return uri
    
    def _sanitize_filename(self, filename: str) -> str:
        """
        Sanitize filename for file system compatibility
        
        Args:
            filename: Original filename
            
        Returns:
            Sanitized filename
        """
        # Remove/replace invalid characters
        invalid_chars = '<>:"/\\|?*'
        sanitized = filename
        
        for char in invalid_chars:
            sanitized = sanitized.replace(char, '-')
        
        # Remove multiple consecutive dashes
        while '--' in sanitized:
            sanitized = sanitized.replace('--', '-')
        
        # Remove leading/trailing dashes and spaces
        sanitized = sanitized.strip('- ')
        
        # Limit length
        if len(sanitized) > 100:
            sanitized = sanitized[:100].rstrip()
        
        return sanitized or "未命名論文"
    
    def _add_metadata(self, content: str, title: str) -> str:
        """
        Add YAML frontmatter and metadata to the content
        
        Args:
            content: Original content
            title: Paper title
            
        Returns:
            Content with metadata
        """
        # Current timestamp
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        
        # YAML frontmatter
        frontmatter = f"""---
title: "{title}"
type: "學術論文筆記"
created: "{timestamp}"
source: "Podcast 音檔"
tags:
  - 學術論文
  - AI生成摘要
  - Podcast筆記
---

# {title}

> **建立時間**: {timestamp}  
> **來源**: Podcast 音檔 → Whisper API → ChatGPT 摘要  
> **工具**: Obsidian Paper Note 自動化工具  

{content}

---
*此筆記由 AI 自動生成，請根據需要進行調整和補充。*"""

        return frontmatter
    
    def generate_simple_uri(self, title: str, content: str) -> str:
        """
        Generate simple Obsidian URI without vault specification
        
        Args:
            title: Note title
            content: Note content
            
        Returns:
            Simple Obsidian URI
        """
        sanitized_title = self._sanitize_filename(title)
        encoded_content = urllib.parse.quote(content)
        
        return f"obsidian://new?file={sanitized_title}.md&content={encoded_content}"
    
    def get_vault_info(self) -> dict:
        """
        Get current vault configuration
        
        Returns:
            Dictionary with vault information
        """
        return {
            "default_vault": settings.default_obsidian_vault,
            "default_path": settings.default_paper_path,
            "example_uri": self.generate_simple_uri(
                "範例論文標題", 
                "# 範例論文標題\n\n這是一個範例筆記內容。"
            )
        }
    
    def validate_obsidian_installed(self) -> bool:
        """
        Check if Obsidian is likely installed (basic check)
        
        Returns:
            True if Obsidian might be installed
        """
        import platform
        import os
        
        system = platform.system()
        
        # Basic checks for common Obsidian installation paths
        if system == "Windows":
            common_paths = [
                os.path.expanduser("~/AppData/Local/Obsidian"),
                "C:/Program Files/Obsidian",
                "C:/Program Files (x86)/Obsidian"
            ]
        elif system == "Darwin":  # macOS
            common_paths = [
                "/Applications/Obsidian.app",
                os.path.expanduser("~/Applications/Obsidian.app")
            ]
        else:  # Linux
            common_paths = [
                "/usr/bin/obsidian",
                os.path.expanduser("~/.local/bin/obsidian"),
                "/opt/Obsidian"
            ]
        
        return any(os.path.exists(path) for path in common_paths)