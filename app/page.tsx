'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Tv } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export default function Home() {
  const [activationCode, setActivationCode] = useState<string>('');
  const [qrUrl, setQrUrl] = useState<string>('');
  const [expiresIn, setExpiresIn] = useState<number>(600); // 10 minutes in seconds

  useEffect(() => {
    const generateCode = async () => {
      try {
        const response = await fetch('/api/activation', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({}),
        });
        
        const data = await response.json();
        setActivationCode(data.activationCode);
        setQrUrl(`${window.location.origin}/auth/verify?code=${data.activationCode}`);
      } catch (error) {
        console.error('Failed to generate activation code:', error);
      }
    };

    generateCode();

    // Poll for activation status
    const pollInterval = setInterval(async () => {
      if (!activationCode) return;

      try {
        const response = await fetch(`/api/activation?code=${activationCode}`);
        const data = await response.json();
        
        if (data.valid) {
          window.location.href = '/profiles/create';
        }
      } catch (error) {
        console.error('Failed to check activation status:', error);
      }
    }, 3000);

    // Update expiration countdown
    const countdownInterval = setInterval(() => {
      setExpiresIn((prev) => {
        if (prev <= 0) {
          generateCode(); // Generate new code when expired
          return 600;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(pollInterval);
      clearInterval(countdownInterval);
    };
  }, [activationCode]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center max-w-md w-full"
      >
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <Tv className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h1 className="text-4xl font-bold tracking-tight">Welcome to IPTV</h1>
          <p className="text-gray-400 mt-2">Scan the QR code or enter the activation code on your mobile device</p>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-gray-900/50 backdrop-blur-sm p-8 rounded-2xl shadow-xl mb-8"
        >
          {qrUrl && (
            <div className="mb-8 flex justify-center">
              <QRCodeSVG
                value={qrUrl}
                size={200}
                level="H"
                className="rounded-xl"
                includeMargin
              />
            </div>
          )}
          
          <div className="text-6xl font-mono tracking-[0.5em] font-bold text-center mb-4">
            {activationCode || '------'}
          </div>
          
          <div className="text-sm text-gray-400">
            Code expires in {formatTime(expiresIn)}
          </div>
        </motion.div>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-gray-400"
        >
          Visit <span className="text-white font-medium">SITE AQUI</span> on your mobile device
        </motion.p>
      </motion.div>
    </div>
  );
}