'use client';

import { useState, useRef, useEffect } from 'react';
import { Camera, Upload, Send, List, RefreshCw, Check } from 'lucide-react';
import { Button } from "@/components/ui/button";
import BusinessCardList from './BusinessCardList';
import { createWorker } from 'tesseract.js';
import { storage } from '@/lib/storage-client';
import { toast } from "@/components/ui/use-toast";
import { BusinessCard } from '@/types/types';

// Generate a UUID v4
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

interface TesseractWorker {
  loadLanguage: (lang: string) => Promise<void>;
  initialize: (lang: string) => Promise<void>;
  terminate: () => Promise<any>;
  recognize: (image: string | File | Blob) => Promise<any>;
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
  const workerRef = useRef<TesseractWorker | null>(null);

  const initializeWorker = async (): Promise<TesseractWorker> => {
    try {
      if (!workerRef.current) {
        console.log('🔄 Initializing Tesseract worker...');
        const worker = await createWorker() as unknown as TesseractWorker;
        console.log('✅ Worker created, loading language...');
        await worker.loadLanguage('eng');
        console.log('✅ Language loaded, initializing...');
        await worker.initialize('eng');
        workerRef.current = worker;
        console.log('✅ Tesseract worker initialized successfully');
      }
      return workerRef.current;
    } catch (error) {
      console.error('❌ Error initializing Tesseract worker:', error);
      throw error;
    }
  };

  const extractBusinessCardInfo = (text: string): BusinessCard => {
    console.log('Raw OCR Text:', text);
    const lines = text.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    console.log('Processed Lines:', lines);

    const cardData: Partial<BusinessCard> = {
      type: 'customer',
      id: generateUUID(),
      processedDate: new Date().toISOString()
    };

    for (const line of lines) {
      if (!cardData.name && line.length > 2) {
        cardData.name = line;
        continue;
      }

      if (!cardData.email && line.includes('@')) {
        cardData.email = line.match(/[\w.-]+@[\w.-]+\.\w+/)?.[0] || '';
        continue;
      }

      if (!cardData.phone && /[\d()+-]/.test(line)) {
        cardData.phone = line.match(/[\d()+-\s]{7,}/)?.[0]?.trim() || '';
        continue;
      }

      if (!cardData.title) {
        cardData.title = line;
        continue;
      }

      if (!cardData.company && line.length > 2) {
        cardData.company = line;
      }
    }

    return {
      name: cardData.name || '',
      title: cardData.title || '',
      company: cardData.company || '',
      email: cardData.email || '',
      phone: cardData.phone || '',
      type: cardData.type || 'customer',
      id: cardData.id || generateUUID(),
      processedDate: cardData.processedDate || new Date().toISOString()
    };
  };

  const processImage = async (imageData: string) => {
    try {
      setProcessing(true);
      setProcessingError(null);
      
      console.log('🔄 Starting image processing...');
      const worker = await initializeWorker();
      
      // Convert base64 to blob for better Tesseract compatibility
      const response = await fetch(imageData);
      const blob = await response.blob();
      
      console.log('🔄 Running OCR on image...');
      const result = await worker.recognize(blob);
      console.log('✅ OCR completed. Result:', result);
      
      if (!result?.data?.text) {
        throw new Error('No text detected in image');
      }

      const extractedData = extractBusinessCardInfo(result.data.text);
      console.log('✅ Data extracted:', extractedData);
      
      await storage.saveBusinessCard(extractedData, imageData);
      console.log('✅ Card saved to storage');
      
      setScannedData(extractedData);
      setProcessing(false);
      setProcessingSuccess(true);
      
      toast({
        title: "Success",
        description: "Business card processed and saved successfully!",
      });
    } catch (error) {
      console.error('❌ Error processing image:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to process image';
      setProcessingError(errorMessage);
      setProcessing(false);
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setProcessing(true);
      setProcessingError(null);
      console.log('🔄 Starting file upload process...');

      if (!file.type.startsWith('image/')) {
        throw new Error('Please upload an image file');
      }

      if (file.size > 5 * 1024 * 1024) {
        throw new Error('File size too large. Please upload an image smaller than 5MB');
      }

      console.log('✅ File validation passed:', { type: file.type, size: file.size });

      const reader = new FileReader();
      reader.onload = async (e) => {
        if (typeof e.target?.result === 'string') {
          console.log('✅ File read successfully, processing image...');
          await processImage(e.target.result);
        }
      };
      reader.onerror = (error) => {
        console.error('❌ Error reading file:', error);
        throw new Error('Failed to read file');
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('❌ Error in file upload:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload file';
      setProcessingError(errorMessage);
      setProcessing(false);
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

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

      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) throw new Error('Failed to get canvas context');
      
      ctx.drawImage(videoRef.current, 0, 0);
      const imageData = canvas.toDataURL('image/jpeg');
      
      stopCamera();
      await processImage(imageData);
    } catch (error) {
      console.error('Error capturing image:', error);
      setProcessingError('Failed to capture image. Please try again.');
      setProcessing(false);
      
      toast({
        title: "Error",
        description: "Failed to capture image. Please try again.",
        variant: "destructive",
      });
    }
  };

  const resetStates = () => {
    setScanning(false);
    setScannedData(null);
    setProcessing(false);
    setProcessingError(null);
    setProcessingSuccess(false);
  };

  useEffect(() => {
    initializeWorker().catch(error => {
      console.error('Error initializing worker:', error);
      setProcessingError('Error initializing scanner. Please try again.');
    });

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
    };
  }, []);

  if (processingError) {
    return (
      <div className="p-4 text-center">
        <div className="text-red-500 mb-2">{processingError}</div>
        <Button
          variant="outline"
          onClick={() => {
            setProcessingError(null);
            setProcessing(false);
          }}
        >
          Try Again
        </Button>
      </div>
    );
  }

  if (processing) {
    return (
      <div className="p-4 text-center">
        <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
        <p>Processing image...</p>
      </div>
    );
  }

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

      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleFileUpload}
      />

      {scanning && (
        <div className="relative">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full rounded-lg"
          />
          <div className="flex gap-2 mt-2">
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
              onClick={resetStates}
              variant="secondary"
              className="w-full flex items-center justify-center gap-1.5 text-xs h-8 font-medium text-secondary-foreground bg-secondary hover:bg-secondary/80"
            >
              <Send className="h-3 w-3" />
              SCAN ANOTHER
            </Button>
          </div>
        </div>
      )}

      {processingSuccess && !scannedData && (
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

      {showList && (
        <BusinessCardList 
          onClose={() => setShowList(false)} 
        />
      )}
    </div>
  );
}
