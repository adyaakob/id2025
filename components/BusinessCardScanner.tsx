import { useState, useRef, useEffect } from 'react';
import { Camera, Upload, Scan, Send, List, RefreshCw, Check } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
      }
      setScanning(true);
    } catch (err) {
      console.error('Error accessing camera:', err);
      setProcessingError('Failed to access camera');
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setScanning(false);
  };

  const determineCardType = (text: string, title: string, company: string): 'customer' | 'partner' => {
    const partnerKeywords = [
      'vendor', 'supplier', 'partner', 'distributor', 'manufacturer',
      'wholesale', 'industry', 'b2b', 'business development',
      'alliance', 'partnership', 'collaboration'
    ];
    
    const lowercaseText = text.toLowerCase();
    const lowercaseTitle = title.toLowerCase();
    const lowercaseCompany = company.toLowerCase();
    
    // Check for partner keywords in the entire text
    for (const keyword of partnerKeywords) {
      if (
        lowercaseText.includes(keyword) ||
        lowercaseTitle.includes(keyword) ||
        lowercaseCompany.includes(keyword)
      ) {
        console.log(`Detected partner keyword: ${keyword}`);
        return 'partner';
      }
    }
    
    // Additional checks for partner indicators
    if (
      lowercaseTitle.includes('sales') ||
      lowercaseTitle.includes('account manager') ||
      lowercaseTitle.includes('business development')
    ) {
      console.log('Detected partner role in title');
      return 'partner';
    }
    
    console.log('No partner indicators found, categorizing as customer');
    return 'customer';
  };

  const processText = (text: string): BusinessCard => {
    console.log('Processing extracted text:', text);
    const lines = text.split('\n').filter(line => line.trim());
    console.log('Filtered lines:', lines);
    
    const card: BusinessCard = {
      name: '',
      title: '',
      company: '',
      email: '',
      phone: '',
      type: 'customer' // Default type, will be updated later
    };

    lines.forEach((line, index) => {
      line = line.trim();
      console.log(`Processing line ${index}:`, line);
      
      if (line.includes('@')) {
        card.email = line;
      } else if (line.match(/[\+\d\-\(\)]{8,}/)) {
        card.phone = line;
      } else if (!card.name) {
        card.name = line;
      } else if (!card.title) {
        card.title = line;
      } else if (!card.company) {
        card.company = line;
      }
    });

    // Determine the card type based on all available information
    card.type = determineCardType(text, card.title, card.company);
    console.log(`Card type determined as: ${card.type}`);

    console.log('Processed card data:', card);
    return card;
  };

  const performOCR = async (imageData: string | Blob) => {
    console.log('🔍 Starting OCR process...');
    try {
      const worker = await initializeWorker();
      
      console.log('📸 Starting image recognition...');
      const result = await worker.recognize(imageData);
      
      if (!result?.data?.text) {
        throw new Error('No text found in image');
      }
      
      console.log('✅ OCR completed, text extracted:', result.data.text.substring(0, 100) + '...');
      const processedCard = processText(result.data.text);
      console.log('📋 Processed card data:', processedCard);
      
      return processedCard;
    } catch (error) {
      console.error('❌ OCR Error:', error);
      throw error instanceof Error ? error : new Error('Failed to process image text');
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    console.log('📤 Starting file upload process...');
    console.log('File details:', {
      name: file.name,
      size: file.size,
      type: file.type
    });

    setProcessing(true);
    setProcessingError(null);
    setProcessingSuccess(false);

    try {
      // Initialize worker first
      await initializeWorker();
      
      console.log('🔄 Beginning OCR processing...');
      const card = await performOCR(file);
      
      if (!card.name && !card.email && !card.phone) {
        console.warn('⚠️ No useful data found in processed card');
        throw new Error('No readable text found in image');
      }
      
      console.log('✅ File processing completed successfully');
      setScannedData(card);
    } catch (error) {
      console.error('❌ File processing error:', error);
      setProcessingError(error instanceof Error ? error.message : 'Failed to process image');
    } finally {
      if (event.target) {
        event.target.value = ''; // Reset file input
      }
      setProcessing(false);
    }
  };

  const captureImage = async () => {
    if (!videoRef.current) return;

    console.log('📸 Starting image capture process...');
    setProcessing(true);
    setProcessingError(null);

    try {
      console.log('🎨 Creating canvas for image capture...');
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Failed to get canvas context');
      }
      
      console.log('🖼️ Drawing video frame to canvas...');
      ctx.drawImage(videoRef.current, 0, 0);
      
      console.log('🔄 Converting canvas to blob...');
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(blob => {
          if (blob) {
            console.log('✅ Blob created successfully, size:', blob.size);
            resolve(blob);
          } else {
            reject(new Error('Failed to create image blob'));
          }
        }, 'image/jpeg', 0.95);
      });
      
      console.log('🔍 Starting OCR processing...');
      const card = await performOCR(blob);
      
      if (!card.name && !card.email && !card.phone) {
        console.warn('⚠️ No useful data found in captured image');
        throw new Error('No readable text found in image');
      }
      
      console.log('✅ Image capture and processing completed successfully');
      setScannedData(card);
      stopCamera();
    } catch (error) {
      console.error('❌ Image capture error:', error);
      setProcessingError(error instanceof Error ? error.message : 'Failed to process image');
    } finally {
      console.log('🏁 Finishing image capture process, setting processing to false');
      setProcessing(false);
    }
  };

  const handleProcessCard = async () => {
    if (!scannedData || processing) {
      return;
    }

    console.log('🔄 Starting card processing...');
    setProcessing(true);
    setProcessingError(null);
    setProcessingSuccess(false);

    try {
      // Validate scanned data
      if (!scannedData.name && !scannedData.email && !scannedData.phone) {
        throw new Error('No valid business card data detected');
      }

      // Save directly to localStorage without any API calls
      console.log('💾 Saving card to localStorage...');
      const savedCard = await storage.saveCard({
        ...scannedData,
        id: Date.now().toString(36) + Math.random().toString(36).substr(2),
        processedDate: new Date().toISOString()
      });
      
      console.log('✅ Card saved successfully:', savedCard);
      setProcessingSuccess(true);
      
      // Reset states after delay
      setTimeout(() => {
        setScannedData(null);
        setProcessing(false);
        setProcessingError(null);
        setProcessingSuccess(false);
      }, 2000);
    } catch (error) {
      console.error('❌ Card processing error:', error);
      setProcessingError(error instanceof Error ? error.message : 'Failed to save card');
    } finally {
      console.log('🏁 Finishing card processing, setting processing to false');
      setProcessing(false);
    }
  };

  const resetStates = () => {
    setScannedData(null);
    setProcessing(false);
    setProcessingError(null);
    setProcessingSuccess(false);
  };

  useEffect(() => {
    console.log('🔄 State changed:', {
      isProcessing: processing,
      hasError: !!processingError,
      isSuccess: processingSuccess,
      hasScannedData: !!scannedData
    });
  }, [processing, processingError, processingSuccess, scannedData]);

  return (
    <Card className="p-2 w-1/5">
      <h3 className="font-semibold text-xs mb-1 text-foreground text-center">BUSINESS CARD SCANNER</h3>
      <div className="text-xs space-y-2 text-muted-foreground">
        {!scanning && !scannedData && !processing && !processingSuccess && !processingError && (
          <div className="flex flex-col gap-2">
            <Button
              onClick={startCamera}
              variant="outline"
              size="sm"
              className="w-full flex items-center gap-2"
            >
              <Camera className="h-3 w-3" />
              Scan with Camera
            </Button>
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              size="sm"
              className="w-full flex items-center gap-2"
            >
              <Upload className="h-3 w-3" />
              Upload Image
            </Button>
            <Button
              onClick={() => setShowList(true)}
              variant="outline"
              size="sm"
              className="w-full flex items-center gap-2"
            >
              <List className="h-3 w-3" />
              View All Cards
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
            />
          </div>
        )}

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
                size="sm"
                className="w-full flex items-center gap-2"
                disabled={processing}
              >
                <Scan className="h-3 w-3" />
                Capture
              </Button>
              <Button
                onClick={stopCamera}
                variant="outline"
                size="sm"
                className="w-full"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {processing && (
          <div className="text-center py-4">
            <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
            <p>Processing business card...</p>
          </div>
        )}

        {processingError && !processing && (
          <div className="text-center text-destructive py-4">
            <p className="mb-2">{processingError}</p>
            <Button
              onClick={resetStates}
              variant="outline"
              size="sm"
              className="mx-auto"
            >
              Try Again
            </Button>
          </div>
        )}

        {processingSuccess && (
          <div className="text-center text-green-500 py-4">
            <Check className="h-6 w-6 mx-auto mb-2" />
            <p>Card processed successfully!</p>
          </div>
        )}

        {scannedData && !processing && !processingSuccess && !processingError && (
          <div className="space-y-2">
            <div className="text-center">
              <p className="text-foreground font-medium">{scannedData.name}</p>
              <p>{scannedData.title}</p>
              <p>{scannedData.company}</p>
              <p>{scannedData.email}</p>
              <p>{scannedData.phone}</p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleProcessCard}
                variant="secondary"
                size="sm"
                className="w-full flex items-center gap-2"
                disabled={processing}
              >
                <Send className="h-3 w-3" />
                Process Card
              </Button>
              <Button
                onClick={resetStates}
                variant="outline"
                size="sm"
                className="w-full"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>

      {showList && <BusinessCardList onClose={() => setShowList(false)} />}
    </Card>
  );
}
