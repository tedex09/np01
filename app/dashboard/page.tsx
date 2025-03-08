'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { Settings, Tv, QrCode } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [xtreamUsername, setXtreamUsername] = useState('');
  const [xtreamPassword, setXtreamPassword] = useState('');
  const [activationCode, setActivationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleActivation = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/activation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          xtreamUsername,
          xtreamPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate activation code');
      }

      setActivationCode(data.activationCode);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (!session) {
    router.push('/auth/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        <div className="flex items-center gap-4 mb-8">
          <Settings className="w-8 h-8 text-blue-500" />
          <h1 className="text-3xl font-bold">Dashboard</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gray-900 rounded-lg p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <Tv className="w-6 h-6 text-blue-500" />
              <h2 className="text-xl font-semibold">TV Activation</h2>
            </div>

            <form onSubmit={handleActivation} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Xtream Username
                </label>
                <input
                  type="text"
                  value={xtreamUsername}
                  onChange={(e) => setXtreamUsername(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Xtream Password
                </label>
                <input
                  type="password"
                  value={xtreamPassword}
                  onChange={(e) => setXtreamPassword(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Generating...' : 'Generate TV Code'}
              </button>

              {error && (
                <p className="text-red-500 text-sm mt-2">{error}</p>
              )}
            </form>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gray-900 rounded-lg p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <QrCode className="w-6 h-6 text-blue-500" />
              <h2 className="text-xl font-semibold">Activation Code</h2>
            </div>

            {activationCode ? (
              <div className="text-center">
                <div className="bg-gray-800 p-8 rounded-lg mb-4">
                  <p className="text-4xl font-mono tracking-wider">
                    {activationCode}
                  </p>
                </div>
                <p className="text-gray-400 text-sm">
                  Enter this code on your TV within 30 minutes
                </p>
              </div>
            ) : (
              <div className="text-center text-gray-400 py-12">
                <QrCode className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Generate a code to activate your TV</p>
              </div>
            )}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}