'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Check, X, Loader2 } from 'lucide-react';

export default function QRVerifyPage({ params }: { params: { sessionId: string } }) {
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const router = useRouter();

  useEffect(() => {
    const verifyQRCode = async () => {
      try {
        const response = await fetch('/api/qr-verify', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ sessionId: params.sessionId }),
        });

        if (response.ok) {
          setStatus('success');
          setTimeout(() => {
            router.push('/profiles');
          }, 2000);
        } else {
          setStatus('error');
        }
      } catch (error) {
        console.error('QR verification error:', error);
        setStatus('error');
      }
    };

    verifyQRCode();
  }, [params.sessionId]);

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center"
      >
        {status === 'verifying' && (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          >
            <Loader2 className="w-16 h-16 text-blue-500 mx-auto" />
          </motion.div>
        )}
        {status === 'success' && (
          <Check className="w-16 h-16 text-green-500 mx-auto" />
        )}
        {status === 'error' && (
          <X className="w-16 h-16 text-red-500 mx-auto" />
        )}

        <h1 className="text-2xl font-bold mt-4">
          {status === 'verifying' && 'Verifying QR Code...'}
          {status === 'success' && 'Successfully Verified!'}
          {status === 'error' && 'Verification Failed'}
        </h1>

        <p className="text-gray-400 mt-2">
          {status === 'verifying' && 'Please wait while we verify your device'}
          {status === 'success' && 'Redirecting to your profile...'}
          {status === 'error' && 'Please try scanning the QR code again'}
        </p>
      </motion.div>
    </div>
  );
}