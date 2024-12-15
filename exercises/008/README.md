# Exercise 008 - Robot Image Generator

## 🎯 Goal
Generate an image of a robot based on provided description using DALL-E 3 model.

## 📝 Tasks
1. Fetch robot description from API
2. Generate image using DALL-E 3
3. Send image URL back to API

## 🔧 Implementation Notes
- Uses DALL-E 3 for image generation
- Image requirements:
  - Format: PNG
  - Size: 1024x1024px
- Handles API communication for:
  - Fetching descriptions
  - Submitting solutions

## 🧪 Testing
- Test scenarios:
  - Valid description processing
  - Image generation
  - API response handling
- Edge cases:
  - API errors
  - Invalid descriptions
  - Image generation failures