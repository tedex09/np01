'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { motion } from 'framer-motion';
import { Tv } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, router]);

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <Tv className="w-24 h-24 mx-auto mb-4" />
        <h1 className="text-4xl font-bold mb-2">Smart TV IPTV</h1>
        <p className="text-xl text-gray-400">Loading your experience...</p>
      </motion.div>
    </div>
  );
}