import React, { useState } from 'react';
import QRCode from 'react-qr-code';
import { CopyIcon, CheckIcon } from './IconComponents';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const url = window.location.href;
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="bg-dark-card shadow-2xl shadow-accent/10 rounded-2xl border border-dark-border w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-8 text-center">
          <h2 className="text-3xl font-extrabold text-white mb-2">Share AI Tool Suite</h2>
          <p className="text-dark-text-secondary mb-6">
            Scan the QR code with your mobile device to open this app.
          </p>
          <div className="bg-white p-4 inline-block rounded-lg border-4 border-accent">
            <QRCode value={url} size={180} bgColor="#ffffff" fgColor="#000000" />
          </div>
          <div className="mt-6">
            <p className="text-dark-text-secondary text-sm mb-2">Or copy the link</p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={url}
                className="w-full p-2 bg-gray-900 border border-dark-border rounded-md text-dark-text-secondary"
              />
              <button
                onClick={handleCopy}
                className="p-2 bg-accent text-gray-900 rounded-lg hover:bg-accent-hover transition-colors duration-200"
                aria-label={copied ? 'Copied' : 'Copy link'}
              >
                {copied ? <CheckIcon className="w-6 h-6" /> : <CopyIcon className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
        <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-dark-text-secondary hover:text-white rounded-full bg-dark-card/50 hover:bg-dark-border transition-colors"
            aria-label="Close"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
        </button>
      </div>
    </div>
  );
};

export default ShareModal;
