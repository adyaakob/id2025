import { useState, useRef, useEffect } from 'react';
import { Camera, Upload, Send, List, RefreshCw, Check } from 'lucide-react';
import { Button } from "@/components/ui/button";
import BusinessCardList from './BusinessCardList';
import { createWorker, Worker, ConfigResult } from 'tesseract.js';
import { storage } from '@/lib/storage';
import { toast } from "@/components/ui/use-toast";
import { saveAs } from 'file-saver';
import Papa from 'papaparse';

interface BusinessCard {
  name: string;
  title: string;
  company: string;
  email: string;
  phone: string;
  type: 'customer' | 'partner';
  id: string;
  processedDate: string;
}

// Update the interface to include Worker properties
interface TesseractWorker extends Worker {
  loadLanguage: (lang: string) => Promise<void>;
  initialize: (lang: string) => Promise<void>;
  terminate: () => Promise<ConfigResult>;
  recognize: (image: string | File | Blob) => Promise<any>;
}

export function saveToCSV(businessCards: BusinessCard[]) {
  // Convert data to CSV format
  const csv = Papa.unparse(businessCards);
  
  // Create blob and save file
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  saveAs(blob, `business_cards_${new Date().toISOString()}.csv`);
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
        const worker = await createWorker() as unknown as TesseractWorker;
        await worker.loadLanguage('eng');
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

  useEffect(() => {
    // Initialize worker when component mounts
    initializeWorker().catch(error => {
      console.error('Error initializing worker:', error);
      setProcessingError('Error initializing scanner. Please try again.');
    });

    // Cleanup worker when component unmounts
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
      
      toast({
        title: "Error",
        description: "Failed to capture image. Please try again.",
        variant: "destructive",
      });
    }
  };

  const processImage = async (imageData: string) => {
    try {
      setProcessing(true);
      setProcessingError(null);
      
      // Get the initialized worker
      const worker = await initializeWorker();
      console.log('Processing image...');
      
      // Recognize text from image
      const result = await worker.recognize(imageData);
      console.log('OCR Result:', result);
      
      if (!result?.data?.text) {
        throw new Error('No text detected in image');
      }

      // Extract business card information
      const extractedData = extractBusinessCardInfo(result.data.text);
      console.log('Extracted Data:', extractedData);
      
      setScannedData(extractedData);
      setProcessing(false);
      
      toast({
        title: "Success",
        description: "Business card text extracted successfully!",
      });
    } catch (error) {
      console.error('Error processing image:', error);
      setProcessingError('Failed to process image. Please try again.');
      setProcessing(false);
      
      toast({
        title: "Error",
        description: "Failed to process image. Please try again.",
        variant: "destructive",
      });
    }
  };

  const extractBusinessCardInfo = (text: string): BusinessCard => {
    console.log('Raw OCR Text:', text);
    // Split text into lines and clean them
    const lines = text.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    console.log('Processed Lines:', lines);

    // Initialize the card data
    const cardData: Partial<BusinessCard> = {
      type: 'customer',
      id: crypto.randomUUID(),
      processedDate: new Date().toISOString()
    };

    // Try to identify each field
    for (const line of lines) {
      // Name (usually the first non-empty line)
      if (!cardData.name && line.length > 2) {
        cardData.name = line;
        continue;
      }

      // Email (contains @ symbol)
      if (!cardData.email && line.includes('@')) {
        cardData.email = line.match(/[\w.-]+@[\w.-]+\.\w+/)?.[0] || '';
        continue;
      }

      // Phone number (contains digits and common separators)
      if (!cardData.phone && /[\d()+-]/.test(line)) {
        cardData.phone = line.match(/[\d()+-\s]{7,}/)?.[0]?.trim() || '';
        continue;
      }

      // Title (usually second line if not already set)
      if (!cardData.title) {
        cardData.title = line;
        continue;
      }

      // Company (remaining significant text)
      if (!cardData.company && line.length > 2) {
        cardData.company = line;
      }
    }

    // Ensure all required fields have at least an empty string
    return {
      name: cardData.name || '',
      title: cardData.title || '',
      company: cardData.company || '',
      email: cardData.email || '',
      phone: cardData.phone || '',
      type: cardData.type || 'customer',
      id: cardData.id || crypto.randomUUID(),
      processedDate: cardData.processedDate || new Date().toISOString()
    };
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setProcessing(true);
      setProcessingError(null);

      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('Please upload an image file');
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('File size too large. Please upload an image smaller than 5MB');
      }

      // Read the file
      const reader = new FileReader();
      reader.onload = async (e) => {
        if (typeof e.target?.result === 'string') {
          await processImage(e.target.result);
        }
      };
      reader.onerror = () => {
        throw new Error('Failed to read file');
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading file:', error);
      setProcessingError(error instanceof Error ? error.message : 'Failed to upload file');
      setProcessing(false);
      
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to upload file',
        variant: "destructive",
      });
    }
  };

  const handleProcessCard = async () => {
    if (!scannedData) return;

    try {
      setProcessing(true);
      setProcessingError(null);

      // Save the card data to storage
      await storage.saveCard(scannedData);

      setProcessingSuccess(true);
      setProcessing(false);

      // Reset the scanned data after successful processing
      setScannedData(null);
    } catch (error) {
      console.error('Error processing card:', error);
      setProcessingError('Failed to process card. Please try again.');
      setProcessing(false);
      
      toast({
        title: "Error",
        description: "Failed to process card. Please try again.",
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
        <BusinessCardList 
          onClose={() => setShowList(false)} 
        />
      )}
    </div>
  );
}
