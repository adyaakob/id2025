# Product Exhibition Web Application

An interactive web application designed for product exhibitions, featuring a slideshow, navigation buttons, and an AI chatbot.

## Features

- High-resolution product slideshow with smooth transitions
- Interactive navigation buttons for product features
- AI chatbot for visitor inquiries
- Responsive design optimized for 4K displays
- Offline mode support
- Fullscreen mode for exhibition display

## Requirements

- Node.js (v14 or higher)
- Modern web browser (Chrome, Firefox, Edge, or Safari)
- 4K display (3840 x 2160) for optimal viewing

## Setup Instructions

1. Install dependencies:
   ```bash
   npm install
   ```

2. Add your product images:
   - Place product images in the `images` folder
   - Supported formats: JPG, PNG
   - Recommended resolution: 3840 x 2160 (4K)

3. Start the server:
   ```bash
   npm start
   ```

4. Access the application:
   - Open http://localhost:3000 in your web browser
   - Press F11 for fullscreen mode

## LLM Integration Setup

You have two options for AI integration:

### Option 1: Local Ollama (Default)
The AI assistant uses Ollama to run an open-source LLM locally. Follow these steps:

1. Install Ollama from https://ollama.ai/

2. Pull the Llama 2 model:
```bash
ollama pull llama2
```
3. Start the Ollama server:
```bash
ollama serve
```

### Option 2: Hugging Face Transformers
Alternatively, you can use Hugging Face's Transformers library for more model options:

1. Install the required packages:
```bash
pip install -r requirements.txt
```

2. Run the LLM assistant:
```bash
python llm_assistant.py
```

The assistant uses:
- Llama 2 (7B parameters) with 4-bit quantization for efficient memory usage
- Automatic device placement (CPU/GPU)
- Temperature-controlled response generation

Note: Using Hugging Face models requires accepting their terms of service and may require an access token for some models.

## Development

To run the application in development mode with auto-reload:
```bash
npm run dev
```

## Customization

1. Product Images:
   - Replace placeholder images in the `images` folder
   - Update image references in `slideshow.js`

2. Product Information:
   - Edit product details in `features.js`
   - Update chatbot responses in `chatbot.js`

3. Styling:
   - Modify colors and layout in CSS files
   - Adjust animations and transitions as needed

## Offline Mode

The application supports offline mode with the following features:
- Cached product images and information
- Basic chatbot functionality
- All navigation and slideshow features

## Browser Support

- Chrome (recommended for best performance)
- Firefox
- Edge
- Safari

## Performance Optimization

The application is optimized for 4K displays with:
- Efficient image loading and caching
- Smooth animations and transitions
- Responsive layout adjustments
- Memory management for long-running sessions

## Keyboard Shortcuts

- F11: Toggle fullscreen mode
- Esc: Exit fullscreen mode
- Left/Right arrows: Navigate slideshow
- Space: Pause/Play slideshow
