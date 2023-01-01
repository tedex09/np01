'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Tv } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [activationCode, setActivationCode] = useState<string>('');
  const [qrUrl, setQrUrl] = useState<string>('');
  const [expiresIn, setExpiresIn] = useState<number>(86400); // 24 hours in seconds
  const router = useRouter();

  useEffect(() => {
    const generateCode = async () => {
      try {
        // Check localStorage first for an existing valid code
        const storedCode = localStorage.getItem('tvActivationCode');
        const storedExpiry = localStorage.getItem('tvActivationExpiry');
        
        if (storedCode && storedExpiry && new Date(storedExpiry).getTime() > Date.now()) {
          setActivationCode(storedCode);
          setQrUrl(`${window.location.origin}/auth/verify?code=${storedCode}`);
          // Update expiration countdown
          setExpiresIn(Math.floor((new Date(storedExpiry).getTime() - Date.now()) / 1000));
          return;
        }

        // If no valid stored code, generate a new one
        const response = await fetch('/api/activation', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({}),
        });
        
        const data = await response.json();
        
        if (data.activationCode) {
          setActivationCode(data.activationCode);
          setQrUrl(`${window.location.origin}/auth/verify?code=${data.activationCode}`);
          
          // Store the new code and its expiry
          const expiryDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
          localStorage.setItem('tvActivationCode', data.activationCode);
          localStorage.setItem('tvActivationExpiry', expiryDate.toISOString());
        }
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
        
        if (data.valid && data.isActivated) {
          // Clear stored code once activated
          localStorage.removeItem('tvActivationCode');
          localStorage.removeItem('tvActivationExpiry');
          router.push('/profiles');
        }
      } catch (error) {
        console.error('Failed to check activation status:', error);
      }
    }, 3000);

    // Update expiration countdown
    const countdownInterval = setInterval(() => {
      setExpiresIn((prev) => {
        if (prev <= 0) {
          // Clear expired code
          localStorage.removeItem('tvActivationCode');
          localStorage.removeItem('tvActivationExpiry');
          generateCode();
          return 86400;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(pollInterval);
      clearInterval(countdownInterval);
    };
  }, [activationCode, router]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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
          Visit <span className="text-white font-medium">{window.location.origin}/auth/verify</span> on your mobile device
        </motion.p>
      </motion.div>
    </div>
  );
}