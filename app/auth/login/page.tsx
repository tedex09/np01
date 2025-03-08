'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import QRCode from 'qrcode.react';
import { useAuthStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { Tv, QrCode, ArrowRight } from 'lucide-react';
import { useFocusable, FocusContext } from '@/hooks/use-focusable';

export default function LoginPage() {
  const [loginMethod, setLoginMethod] = useState<'qr' | 'code'>('qr');
  const [code, setCode] = useState('');
  const [qrValue, setQrValue] = useState('');
  const router = useRouter();
  const { setAuthenticated } = useAuthStore();
  const { ref: containerRef, focusKey: containerFocusKey } = useFocusable();

  useEffect(() => {
    // Generate unique session ID for QR code
    const sessionId = Math.random().toString(36).substring(2);
    const qrUrl = `${window.location.origin}/auth/qr-verify/${sessionId}`;
    setQrValue(qrUrl);

    // Poll for QR code verification
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/qr-verify?sessionId=${sessionId}`);
        const data = await response.json();
        if (data.verified) {
          setAuthenticated(true);
          router.push('/profiles');
        }
      } catch (error) {
        console.error('QR verification error:', error);
      }
    }, 2000);

    return () => clearInterval(pollInterval);
  }, []);

  const { ref: qrButtonRef, focused: qrFocused } = useFocusable({
    onEnterPress: () => setLoginMethod('qr')
  });

  const { ref: codeButtonRef, focused: codeFocused } = useFocusable({
    onEnterPress: () => setLoginMethod('code')
  });

  const { ref: inputRef } = useFocusable({
    onEnterPress: async () => {
      if (code.length === 6) {
        try {
          const response = await fetch(`/api/activation?code=${code}`);
          const data = await response.json();
          if (data.valid) {
            setAuthenticated(true);
            router.push('/profiles');
          }
        } catch (error) {
          console.error('Verification error:', error);
        }
      }
    }
  });

  return (
    <FocusContext.Provider value={containerFocusKey}>
      <div ref={containerRef} className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="max-w-md w-full"
        >
          <h1 className="text-4xl font-bold text-center mb-8">Welcome Back</h1>
          
          <div className="bg-gray-900 p-8 rounded-lg shadow-xl">
            <div className="flex justify-center space-x-4 mb-8">
              <button
                ref={qrButtonRef}
                onClick={() => setLoginMethod('qr')}
                className={`px-6 py-2 rounded-full transition-all duration-200 ${
                  loginMethod === 'qr' ? 'bg-blue-600' : 'bg-gray-700'
                } ${qrFocused ? 'ring-4 ring-blue-400 scale-105' : ''}`}
              >
                <div className="flex items-center space-x-2">
                  <QrCode className="w-5 h-5" />
                  <span>QR Code</span>
                </div>
              </button>
              <button
                ref={codeButtonRef}
                onClick={() => setLoginMethod('code')}
                className={`px-6 py-2 rounded-full transition-all duration-200 ${
                  loginMethod === 'code' ? 'bg-blue-600' : 'bg-gray-700'
                } ${codeFocused ? 'ring-4 ring-blue-400 scale-105' : ''}`}
              >
                <div className="flex items-center space-x-2">
                  <Tv className="w-5 h-5" />
                  <span>TV Code</span>
                </div>
              </button>
            </div>

            <AnimatePresence mode="wait">
              {loginMethod === 'qr' ? (
                <motion.div
                  key="qr"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex flex-col items-center"
                >
                  <div className="bg-white p-4 rounded-lg">
                    <QRCode
                      value={qrValue}
                      size={200}
                      level="H"
                      className="rounded-lg"
                    />
                  </div>
                  <p className="text-gray-400 text-center mt-6">
                    Scan the QR code with your mobile device to log in
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="code"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <input
                    ref={inputRef}
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="Enter TV Code"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-center text-2xl tracking-widest focus:ring-4 ring-blue-400 transition-all duration-200"
                    maxLength={6}
                  />
                  <p className="text-gray-400 text-center">
                    Enter the code shown on your mobile device
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </FocusContext.Provider>
  );
}