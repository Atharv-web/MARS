"use client"
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { saveAs } from 'file-saver';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import { updateProfile } from 'firebase/auth';

export default function Home() {
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup' | null>(null);
  const [reportPath, setReportPath] = useState<string | null>(null);
  const [reportContent, setReportContent] = useState<string | null>(null);

  const {user, loading: authLoading} = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setReportContent(null);
    setReportPath(null);

    try {
      const res = await fetch('http://localhost:8000/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: topic })
      });
      const data = await res.json();
      if (data.output_file) {
        setReportPath(data.output_file);
      } else {
        setReportContent(data.message);
      }
    } catch {
      setReportContent('Error running research.');
    } finally {
      setLoading(false);
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const email = (form[0] as HTMLInputElement).value;
    const username = (form[1] as HTMLInputElement).value;
    const password = (form[2] as HTMLInputElement).value;
    // const username = (form[1])

    try{
      if (authMode === "signup"){
        const userCred = await createUserWithEmailAndPassword(auth,email,password);
        await updateProfile(userCred.user,{
          displayName: username
        })
      }
      else{
        await signInWithEmailAndPassword(auth,email,password);
      }
      setAuthMode(null);
    } catch(error:any){
      alert ("Authentication failed:" + error.message);
    }
  };

  const handleLogout = async() =>{
    await signOut(auth);
  }

  // fetch markdown once reportPath is set
  useEffect(() => {
    if (!reportPath) return;
    (async () => {
      try {
        const res = await fetch(`/api/report?file=${encodeURIComponent(reportPath)}`);
        const md = await res.text();
        setReportContent(md);
      } catch {
        setReportContent('Failed to load report content.');
      }
    })();
  }, [reportPath]);

  const handleDownload = () => {
    if (reportContent && reportPath) {
      const blob = new Blob([reportContent], { type: 'text/markdown;charset=utf-8' });
      const filename = reportPath.split('/').pop() || 'report.md';
      saveAs(blob, filename);
    }
  };

  return (
    <div className="relative h-screen bg-gradient-to-br from-indigo-900 via-black to-gray-900 overflow-hidden">
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2 }}
      >
        <Image
          src="/bg.jpg"
          alt="Digital Bust"
          fill
          className="object-cover opacity-65"
        />
      </motion.div>
      <div className="absolute top-4 right-4 z-20 space-x-2 text-white">
        {!user && !authLoading ? (
          <>
            <Button variant="ghost" onClick={() => setAuthMode('signup')}>Sign Up</Button>
            <Button variant="ghost" onClick={() => setAuthMode('login')}>Login</Button>
          </>
        ) : (
          <>
          <span className="text-white font-semibold">Hello, {user?.displayName}</span>
          <Button variant={"ghost"} onClick={handleLogout}>Logout</Button>
          </>
        )}
      </div>

      {/* Overlay content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-4 text-center text-white">
        <motion.h1
          className="text-5xl lg:text-7xl font-extrabold mb-4"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
        >
        Welcome
        </motion.h1>
        <motion.p
          className="text-xl lg:text-xl mb-8 max-w-2xl"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7, duration: 1 }}
        >
          Conduct deep AI-driven medical research.
        </motion.p>

        <form onSubmit={handleSubmit} className="w-full max-w-lg">
          <div className="flex flex-col gap-6">
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Enter your research topic..."
              className="flex-grow px-4 py-3 rounded-lg bg-white/6 placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-stone-50"
              required
            />
            <Button variant="ghost" type="submit" disabled={loading} className="whitespace-nowrap gap-2">
              {loading ? 'Running...' : 'Submit'}
            </Button>
          </div>
        </form>

        {reportContent && (
          <div className="w-full max-w-3xl bg-white/10 p-6 rounded-lg text-left overflow-auto">
            <h2 className="text-2xl font-bold mb-4">Research Report</h2>
            <pre className="whitespace-pre-wrap break-words text-sm text-white bg-black/30 p-4 rounded">
              {reportContent}
            </pre>
            {reportPath && (
              <Button variant="ghost" className="mt-4" onClick={handleDownload}>
                Download Report
              </Button>
            )}
          </div>
        )}
      </div>

      <AnimatePresence>
        {authMode && (
          <motion.div
            className="absolute inset-0 z-30 flex items-center justify-center bg-black/40 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white/30 dark:bg-zinc-900 rounded-lg p-6 w-full max-w-md shadow-xl text-left"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <h2 className="text-2xl font-bold mb-4 text-white dark:text-white">
                {authMode === 'login' ? 'Login' : 'Sign Up'}
              </h2>
              <form onSubmit={handleAuthSubmit} className="space-y-4">
                <input
                  type="email"
                  placeholder="Email"
                  className="w-full px-4 py-2 border rounded-md dark:bg-zinc-800 dark:text-white"
                  required
                />
                <input
                  type="text"
                  placeholder='Username'
                  className="w-full px-4 py-2 border rounded-md dark:bg-zinc-800 dark:text-white"
                  required
                />
                <input
                  type="password"
                  placeholder="Password"
                  className="w-full px-4 py-2 border rounded-md dark:bg-zinc-800 dark:text-white"
                  required
                />
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" onClick={() => setAuthMode(null)} type="button">
                    Cancel
                  </Button>
                  <Button variant="ghost" type="submit">{authMode === 'login' ? 'Login' : 'Create Account'}</Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}