'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { Tv, ArrowRight, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useAuthStore } from '@/lib/store';

const formSchema = z.object({
  code: z.string().length(6, 'Activation code must be 6 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export default function VerifyPage() {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const codeFromQR = searchParams.get('code');
  const { setAuthenticated } = useAuthStore();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: codeFromQR || '',
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);

    try {
      if (step === 1) {
        // First verify if the code is valid and not already activated
        const response = await fetch(`/api/activation?code=${values.code}`);
        const data = await response.json();
        
        if (data.valid && !data.isActivated) {
          setStep(2);
        } else if (data.valid && data.isActivated) {
          form.setError('code', { message: 'Code already activated' });
        } else {
          form.setError('code', { message: 'Invalid or expired code' });
        }
      } else if (step === 2) {
        // Activate the code and create/login user
        const response = await fetch('/api/activation', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setAuthenticated(true);
            router.push('/profiles');
          }
        } else {
          const data = await response.json();
          form.setError('root', { message: data.error });
        }
      }
    } catch (error) {
      console.error('Error:', error);
      form.setError('root', { message: 'An unexpected error occurred' });
    } finally {
      setIsLoading(false);
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
          <Tv className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h1 className="text-4xl font-bold mb-2">Connect Your TV</h1>
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-400">
            <div className={step >= 1 ? 'text-blue-400' : ''}>Code</div>
            <ArrowRight className="w-4 h-4" />
            <div className={step >= 2 ? 'text-blue-400' : ''}>Account</div>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-gray-900/50 backdrop-blur-sm p-6 rounded-xl space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-400">Activation Code</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Enter 6-digit code"
                            className="bg-gray-800 border-gray-700 text-lg tracking-widest"
                            maxLength={6}
                            value={field.value.toUpperCase()}
                            onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-gray-900/50 backdrop-blur-sm p-6 rounded-xl space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-400">Email</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="email"
                            className="bg-gray-800 border-gray-700"
                            placeholder="Enter your email"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-400">Password</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="password"
                            className="bg-gray-800 border-gray-700"
                            placeholder="Enter your password"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-white text-black hover:bg-gray-200 transition-colors py-6 text-lg font-medium rounded-xl"
            >
              {isLoading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                step === 2 ? 'Complete Setup' : 'Continue'
              )}
            </Button>
          </form>
        </Form>
      </motion.div>
    </div>
  );
}