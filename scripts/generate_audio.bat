@echo off
echo Activating virtual environment...
call venv\Scripts\activate.bat

echo Generating audio files...
python generate_audio.py

echo Audio generation complete!
pause
