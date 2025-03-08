'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function VerifyPage() {
  const [code, setCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const router = useRouter();

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase();
    if (value.length <= 6) {
      setCode(value);
    }
  };

  useEffect(() => {
    if (code.length === 6) {
      verifyCode();
    }
  }, [code]);

  const verifyCode = async () => {
    setIsVerifying(true);
    try {
      const response = await fetch(`/api/activation?code=${code}`);
      const data = await response.json();

      if (response.ok && data.valid) {
        setVerificationStatus('success');
        setTimeout(() => {
          router.push('/profiles');
        }, 2000);
      } else {
        setVerificationStatus('error');
        setTimeout(() => {
          setVerificationStatus('idle');
          setCode('');
        }, 2000);
      }
    } catch (error) {
      setVerificationStatus('error');
      setTimeout(() => {
        setVerificationStatus('idle');
        setCode('');
      }, 2000);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Enter TV Code</h1>
          <p className="text-gray-400">
            Enter the 6-digit code shown on your dashboard
          </p>
        </div>

        <div className="bg-gray-900 p-8 rounded-lg shadow-xl">
          <input
            type="text"
            value={code}
            onChange={handleCodeChange}
            placeholder="XXXXXX"
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-6 text-center text-4xl tracking-[0.5em] font-mono focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            maxLength={6}
            autoFocus
          />

          <motion.div
            initial={false}
            animate={{
              scale: verificationStatus !== 'idle' ? 1 : 0.8,
              opacity: verificationStatus !== 'idle' ? 1 : 0
            }}
            className="flex justify-center mt-6"
          >
            {verificationStatus === 'success' && (
              <div className="flex items-center text-green-500">
                <Check className="w-6 h-6 mr-2" />
                <span>Verification successful!</span>
              </div>
            )}
            {verificationStatus === 'error' && (
              <div className="flex items-center text-red-500">
                <X className="w-6 h-6 mr-2" />
                <span>Invalid code. Please try again.</span>
              </div>
            )}
          </motion.div>
        </div>

        <p className="text-center mt-6 text-gray-400">
          The code will expire after 30 minutes
        </p>
      </motion.div>
    </div>
  );
}