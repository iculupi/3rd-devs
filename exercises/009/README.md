# Exercise 009 - Factory Files Analysis

## 🎯 Goal
Analyze factory reports from various formats (TXT, PNG, MP3) and categorize them based on content about people and hardware repairs.

## 📝 Tasks
1. Download and extract factory files
2. Process files using appropriate models:
   - Text files: Direct reading
   - Audio files: Whisper model
   - Images: GPT-4 Vision
3. Categorize content into:
   - People-related information
   - Hardware repairs
4. Send categorized file lists to API

## 🔧 Implementation Notes
- Uses multiple OpenAI models:
  - GPT-4 for text analysis
  - Whisper for audio transcription
  - GPT-4 Vision for image analysis
- Excludes 'fakty' directory
- Sorts file lists alphabetically
- Logs all operations for debugging

## 🧪 Testing
- Test scenarios:
  - Different file formats
  - Mixed content files
  - Invalid/corrupted files
- Edge cases:
  - Empty files
  - Unrelated content
  - Network errors