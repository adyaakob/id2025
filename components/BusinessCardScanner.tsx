import { useState, useRef, useEffect } from 'react';
import { Camera, Upload, Send, List, RefreshCw, Check } from 'lucide-react';
import { Button } from "@/components/ui/button";
import BusinessCardList from './BusinessCardList';
import { createWorker } from 'tesseract.js';
import { storage } from '@/lib/storage';

interface BusinessCard {
  name: string;
  title: string;
  company: string;
  email: string;
  phone: string;
  type: 'customer' | 'partner';
}

export default function BusinessCardScanner() {
  const [scanning, setScanning] = useState(false);
  const [scannedData, setScannedData] = useState<BusinessCard | null>(null);
  const [showList, setShowList] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [processingError, setProcessingError] = useState<string | null>(null);
  const [processingSuccess, setProcessingSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const workerRef = useRef<any>(null);

  const initializeWorker = async () => {
    console.log('⚙️ Initializing Tesseract worker...');
    try {
      if (!workerRef.current) {
        workerRef.current = await createWorker();
        await workerRef.current.loadLanguage('eng');
        await workerRef.current.initialize('eng');
        console.log('✅ Tesseract worker initialized successfully');
      }
      return workerRef.current;
    } catch (error) {
      console.error('❌ Failed to initialize Tesseract worker:', error);
      throw new Error('Failed to initialize text recognition');
    }
  };

  // Clean up worker on unmount
  useEffect(() => {
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setScanning(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setProcessingError('Failed to access camera. Please make sure you have granted camera permissions.');
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setScanning(false);
  };

  const captureImage = async () => {
    if (!videoRef.current) return;

    try {
      setProcessing(true);
      setProcessingError(null);

      // Create a canvas element
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) throw new Error('Failed to get canvas context');
      
      // Draw the current video frame
      ctx.drawImage(videoRef.current, 0, 0);
      
      // Convert to base64
      const imageData = canvas.toDataURL('image/jpeg');
      
      // Stop the camera after capturing
      stopCamera();
      
      // Process the image
      await processImage(imageData);
    } catch (error) {
      console.error('Error capturing image:', error);
      setProcessingError('Failed to capture image. Please try again.');
      setProcessing(false);
    }
  };

  const processImage = async (imageData: string) => {
    try {
      const worker = await initializeWorker();
      const { data: { text } } = await worker.recognize(imageData);
      
      // Extract business card information from the OCR text
      const extractedData = extractBusinessCardInfo(text);
      setScannedData(extractedData);
      setProcessing(false);
    } catch (error) {
      console.error('Error processing image:', error);
      setProcessingError('Failed to process image. Please try again.');
      setProcessing(false);
    }
  };

  const extractBusinessCardInfo = (text: string): BusinessCard => {
    // Simple extraction logic - this can be enhanced with better parsing
    const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
    
    return {
      name: lines[0] || '',
      title: lines[1] || '',
      company: lines[2] || '',
      email: lines.find(line => line.includes('@')) || '',
      phone: lines.find(line => /[\d-+()]/.test(line)) || '',
      type: 'customer' // Default type
    };
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return;

    try {
      setProcessing(true);
      setProcessingError(null);

      // Get the first file
      const file = event.target.files[0];

      // Read the file as a data URL
      const reader = new FileReader();
      reader.onload = async (event) => {
        if (!event.target?.result) return;

        // Process the image
        await processImage(event.target.result as string);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading file:', error);
      setProcessingError('Failed to upload file. Please try again.');
      setProcessing(false);
    }
  };

  const handleProcessCard = async () => {
    try {
      setProcessing(true);
      setProcessingError(null);

      // Process the card
      // Add your logic here

      setProcessingSuccess(true);
      setProcessing(false);
    } catch (error) {
      console.error('Error processing card:', error);
      setProcessingError('Failed to process card. Please try again.');
      setProcessing(false);
    }
  };

  const resetStates = () => {
    setScanning(false);
    setScannedData(null);
    setProcessing(false);
    setProcessingError(null);
    setProcessingSuccess(false);
  };

  return (
    <div className="relative">
      <h3 className="font-semibold text-xs mb-2 text-foreground text-center">BUSINESS CARD SCANNER</h3>
      {!scanning && !scannedData && !processing && !processingSuccess && !processingError && (
        <div className="flex flex-col gap-2">
          <Button
            onClick={startCamera}
            variant="secondary"
            className="w-full flex items-center justify-center gap-1.5 text-xs h-8 font-medium text-secondary-foreground bg-secondary hover:bg-secondary/80"
          >
            <Camera className="h-3 w-3" />
            SCAN WITH CAMERA
          </Button>
          <Button
            onClick={() => fileInputRef.current?.click()}
            variant="secondary"
            className="w-full flex items-center justify-center gap-1.5 text-xs h-8 font-medium text-secondary-foreground bg-secondary hover:bg-secondary/80"
          >
            <Upload className="h-3 w-3" />
            UPLOAD IMAGE
          </Button>
          <Button
            onClick={() => setShowList(true)}
            variant="secondary"
            className="w-full flex items-center justify-center gap-1.5 text-xs h-8 font-medium text-secondary-foreground bg-secondary hover:bg-secondary/80"
          >
            <List className="h-3 w-3" />
            VIEW SCANNED CARDS
          </Button>
        </div>
      )}
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleFileUpload}
      />

      {/* Camera view */}
      {scanning && (
        <div className="relative">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full rounded-lg"
          />
          <div className="flex gap-2">
            <Button
              onClick={captureImage}
              variant="secondary"
              className="w-full flex items-center justify-center gap-1.5 text-xs h-8 font-medium text-secondary-foreground bg-secondary hover:bg-secondary/80"
              disabled={processing}
            >
              CAPTURE
            </Button>
            <Button
              onClick={stopCamera}
              variant="outline"
              className="w-full text-xs h-8 font-medium hover:bg-destructive/10 hover:text-destructive border-secondary-foreground/20"
            >
              CANCEL
            </Button>
          </div>
        </div>
      )}

      {/* Processing error */}
      {processingError && (
        <div className="flex flex-col items-center gap-2">
          <p className="text-destructive">{processingError}</p>
          <Button
            onClick={resetStates}
            variant="outline"
            className="text-xs h-8 font-medium hover:bg-destructive/10 hover:text-destructive border-secondary-foreground/20"
          >
            TRY AGAIN
          </Button>
        </div>
      )}

      {/* Show scanned data */}
      {scannedData && !processing && !processingError && (
        <div className="flex flex-col gap-2">
          <div className="text-xs space-y-1">
            <p><span className="font-medium">Name:</span> {scannedData.name}</p>
            <p><span className="font-medium">Title:</span> {scannedData.title}</p>
            <p><span className="font-medium">Company:</span> {scannedData.company}</p>
            <p><span className="font-medium">Email:</span> {scannedData.email}</p>
            <p><span className="font-medium">Phone:</span> {scannedData.phone}</p>
            <p><span className="font-medium">Type:</span> {scannedData.type}</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleProcessCard}
              variant="secondary"
              className="w-full flex items-center justify-center gap-1.5 text-xs h-8 font-medium text-secondary-foreground bg-secondary hover:bg-secondary/80"
              disabled={processing}
            >
              <Send className="h-3 w-3" />
              PROCESS CARD
            </Button>
            <Button
              onClick={resetStates}
              variant="outline"
              className="w-full text-xs h-8 font-medium hover:bg-destructive/10 hover:text-destructive border-secondary-foreground/20"
            >
              CANCEL
            </Button>
          </div>
        </div>
      )}

      {/* Processing indicator */}
      {processing && (
        <div className="flex flex-col items-center gap-2 py-4">
          <RefreshCw className="h-5 w-5 animate-spin" />
          <p className="text-xs">Processing...</p>
        </div>
      )}

      {/* Success message */}
      {processingSuccess && (
        <div className="flex flex-col items-center gap-2 py-4">
          <Check className="h-5 w-5 text-green-500" />
          <p className="text-xs text-green-500">Card processed successfully!</p>
          <Button
            onClick={resetStates}
            variant="outline"
            className="text-xs h-8 font-medium hover:bg-green-500/10 hover:text-green-500 border-green-500/20"
          >
            SCAN ANOTHER
          </Button>
        </div>
      )}

      {/* Card list modal */}
      {showList && (
        <BusinessCardList onClose={() => setShowList(false)} />
      )}
    </div>
  );
}
