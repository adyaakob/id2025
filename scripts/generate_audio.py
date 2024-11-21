import os
import json
from gtts import gTTS
import time

def generate_audio_for_slides():
    # Load narration text from JSON file
    with open('narration_text.json', 'r', encoding='utf-8') as f:
        narration_text = json.load(f)

    # Create audio directory if it doesn't exist
    os.makedirs('../public/audio', exist_ok=True)

    # Generate audio for each section and language
    for section, slides in narration_text.items():
        print(f"\nGenerating audio for section: {section}")
        
        # Create section directory
        section_dir = f'../public/audio/{section}'
        os.makedirs(section_dir, exist_ok=True)

        # Generate audio for each slide
        for slide_num, texts in slides.items():
            print(f"\nProcessing slide {slide_num}")
            
            # English
            if texts.get('en'):
                output_path = f'{section_dir}/slide{slide_num}_en.mp3'
                print(f"Generating English audio: {output_path}")
                tts = gTTS(text=texts['en'], lang='en')
                tts.save(output_path)
                time.sleep(1)  # Prevent rate limiting

            # Indonesian
            if texts.get('id'):
                output_path = f'{section_dir}/slide{slide_num}_id.mp3'
                print(f"Generating Indonesian audio: {output_path}")
                tts = gTTS(text=texts['id'], lang='id')
                tts.save(output_path)
                time.sleep(1)  # Prevent rate limiting

            # Malay
            if texts.get('ms'):
                output_path = f'{section_dir}/slide{slide_num}_ms.mp3'
                print(f"Generating Malay audio: {output_path}")
                tts = gTTS(text=texts['ms'], lang='ms')
                tts.save(output_path)
                time.sleep(1)  # Prevent rate limiting

if __name__ == "__main__":
    generate_audio_for_slides()
