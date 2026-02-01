import React, { useState, useRef } from 'react';
import { Camera, Upload, X, Loader, FileText, AlertCircle } from 'lucide-react';
import { processReceipt } from '../utils/ocrService';
import './ReceiptScanner.css';

const ReceiptScanner = ({ onScanComplete, onClose }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const handleFileSelect = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('Image size must be less than 10MB');
      return;
    }

    await processImage(file);
  };

  const processImage = async (file) => {
    setError(null);
    setIsProcessing(true);
    setProgress(0);

    // Create preview
    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);

    try {
      const result = await processReceipt(file, (p) => setProgress(p));

      onScanComplete({
        name: result.name || '',
        description: result.description || '',
        amount: result.amount || '',
        dueDate: result.date || '',
        rawText: result.rawText,
        confidence: result.confidence
      });
    } catch (err) {
      console.error('OCR Error:', err);
      setError('Failed to process image. Please try again or enter data manually.');
    } finally {
      setIsProcessing(false);
      setProgress(0);
      URL.revokeObjectURL(previewUrl);
    }
  };

  const handleDrop = async (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      await processImage(file);
    } else {
      setError('Please drop an image file');
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  return (
    <div className="receipt-scanner-overlay">
      <div className="receipt-scanner-modal">
        <div className="receipt-scanner-header">
          <h3><FileText size={20} /> Scan Receipt</h3>
          <button className="close-button" onClick={onClose} disabled={isProcessing}>
            <X size={20} />
          </button>
        </div>

        <div className="receipt-scanner-content">
          {isProcessing ? (
            <div className="processing-state">
              {preview && (
                <div className="preview-container">
                  <img src={preview} alt="Receipt preview" className="receipt-preview" />
                </div>
              )}
              <div className="processing-info">
                <Loader className="spinner" size={32} />
                <p>Processing receipt...</p>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="progress-text">{progress}%</span>
              </div>
            </div>
          ) : (
            <div
              className="upload-area"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              <div className="upload-icon">
                <Upload size={48} />
              </div>
              <p className="upload-text">
                Drag & drop a receipt image here, or
              </p>
              <div className="upload-buttons">
                <button
                  className="btn-primary"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload size={16} />
                  Choose File
                </button>
                <button
                  className="btn-outline"
                  onClick={() => cameraInputRef.current?.click()}
                >
                  <Camera size={16} />
                  Take Photo
                </button>
              </div>
              <p className="upload-hint">
                Supported formats: JPG, PNG, GIF, BMP, WebP
              </p>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
            </div>
          )}

          {error && (
            <div className="error-message">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}
        </div>

        <div className="receipt-scanner-footer">
          <p className="scanner-note">
            The scanner will extract vendor name, amount, and date from your receipt.
            You can review and edit the extracted data before saving.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReceiptScanner;
