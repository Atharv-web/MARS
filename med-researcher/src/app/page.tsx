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
      <div className="absolute top-4 right-60 z-20 space-x-3 text-white">
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
        Welcome to MARS 
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
            <Button variant="ghost"  type="submit" disabled={loading} className="h-auto px-2 py-1">
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

// "use client"
// import { useState, useEffect } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { Button } from '@/components/ui/button';
// import { saveAs } from 'file-saver';
// import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
// import { auth } from '@/lib/firebase';
// import { useAuth } from '@/hooks/useAuth';
// import { updateProfile } from 'firebase/auth';

// // Animated background particles component
// const AnimatedParticles = () => {
//   const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
//   const particles = Array.from({ length: 50 }, (_, i) => i);
  
//   useEffect(() => {
//     const updateDimensions = () => {
//       setDimensions({
//         width: window.innerWidth,
//         height: window.innerHeight,
//       });
//     };
    
//     updateDimensions();
//     window.addEventListener('resize', updateDimensions);
//     return () => window.removeEventListener('resize', updateDimensions);
//   }, []);

//   if (dimensions.width === 0) return null;
  
//   return (
//     <div className="absolute inset-0 overflow-hidden">
//       {particles.map((particle) => (
//         <motion.div
//           key={particle}
//           className="absolute rounded-full"
//           style={{
//             width: Math.random() * 8 + 4,
//             height: Math.random() * 8 + 4,
//             background: `linear-gradient(45deg, 
//               ${['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#fd79a8'][Math.floor(Math.random() * 6)]}, 
//               ${['#ff9ff3', '#54a0ff', '#5f27cd', '#00d2d3', '#ff9ff3', '#54a0ff'][Math.floor(Math.random() * 6)]})`
//           }}
//           initial={{
//             x: Math.random() * dimensions.width,
//             y: Math.random() * dimensions.height,
//             opacity: Math.random() * 0.8 + 0.2,
//           }}
//           animate={{
//             x: Math.random() * dimensions.width,
//             y: Math.random() * dimensions.height,
//             opacity: [0.2, 0.8, 0.2],
//           }}
//           transition={{
//             duration: Math.random() * 20 + 15,
//             repeat: Infinity,
//             ease: "linear"
//           }}
//         />
//       ))}
//     </div>
//   );
// };

// // Medical DNA helix animation
// const DNAHelix = () => {
//   const [mounted, setMounted] = useState(false);
  
//   useEffect(() => {
//     setMounted(true);
//   }, []);
  
//   if (!mounted) return null;
  
//   return (
//     <div className="absolute top-20 right-10 opacity-30">
//       <motion.div
//         className="w-32 h-64"
//         animate={{ rotate: 360 }}
//         transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
//       >
//         {Array.from({ length: 12 }, (_, i) => (
//           <motion.div
//             key={i}
//             className="absolute w-4 h-4 rounded-full"
//             style={{
//               left: Math.cos((i * Math.PI) / 6) * 40 + 60,
//               top: i * 20,
//               background: i % 2 === 0 
//                 ? 'linear-gradient(45deg, #ff6b6b, #4ecdc4)' 
//                 : 'linear-gradient(45deg, #45b7d1, #96ceb4)',
//             }}
//             animate={{
//               scale: [1, 1.8, 1],
//               opacity: [0.4, 1, 0.4],
//             }}
//             transition={{
//               duration: 2,
//               repeat: Infinity,
//               delay: i * 0.2,
//             }}
//           />
//         ))}
//       </motion.div>
//     </div>
//   );
// };

// // Floating medical icons
// const MedicalIcons = () => {
//   const [mounted, setMounted] = useState(false);
//   const icons = ['🧬', '🔬', '🧪', '⚗️', '🩺', '💊'];
  
//   useEffect(() => {
//     setMounted(true);
//   }, []);
  
//   if (!mounted) return null;
  
//   return (
//     <>
//       {icons.map((icon, index) => (
//         <motion.div
//           key={index}
//           className="absolute text-4xl opacity-10"
//           style={{
//             left: `${15 + index * 15}%`,
//             top: `${20 + (index % 2) * 60}%`,
//           }}
//           animate={{
//             y: [0, -20, 0],
//             rotate: [0, 10, -10, 0],
//           }}
//           transition={{
//             duration: 4 + index,
//             repeat: Infinity,
//             delay: index * 0.5,
//           }}
//         >
//           {icon}
//         </motion.div>
//       ))}
//     </>
//   );
// };

// // Pulse animation for the main container
// const pulseVariants = {
//   initial: { scale: 1 },
//   animate: {
//     scale: [1, 1.02, 1],
//     transition: {
//       duration: 4,
//       repeat: Infinity,
//       ease: "easeInOut"
//     }
//   }
// };

// export default function Home() {
//   const [topic, setTopic] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [authMode, setAuthMode] = useState<'login' | 'signup' | null>(null);
//   const [reportPath, setReportPath] = useState<string | null>(null);
//   const [reportContent, setReportContent] = useState<string | null>(null);

//   const {user, loading: authLoading} = useAuth();

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
//     setReportContent(null);
//     setReportPath(null);

//     try {
//       const res = await fetch('http://localhost:8000/research', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ input: topic })
//       });
//       const data = await res.json();
//       if (data.output_file) {
//         setReportPath(data.output_file);
//       } else {
//         setReportContent(data.message);
//       }
//     } catch {
//       setReportContent('Error running research.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleAuthSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     const form = e.target as HTMLFormElement;
//     const email = (form[0] as HTMLInputElement).value;
//     const username = (form[1] as HTMLInputElement).value;
//     const password = (form[2] as HTMLInputElement).value;

//     try{
//       if (authMode === "signup"){
//         const userCred = await createUserWithEmailAndPassword(auth,email,password);
//         await updateProfile(userCred.user,{
//           displayName: username
//         })
//       }
//       else{
//         await signInWithEmailAndPassword(auth,email,password);
//       }
//       setAuthMode(null);
//     } catch(error:any){
//       alert ("Authentication failed:" + error.message);
//     }
//   };

//   const handleLogout = async() =>{
//     await signOut(auth);
//   }

//   // fetch markdown once reportPath is set
//   useEffect(() => {
//     if (!reportPath) return;
//     (async () => {
//       try {
//         const res = await fetch(`/api/report?file=${encodeURIComponent(reportPath)}`);
//         const md = await res.text();
//         setReportContent(md);
//       } catch {
//         setReportContent('Failed to load report content.');
//       }
//     })();
//   }, [reportPath]);

//   const handleDownload = () => {
//     if (reportContent && reportPath) {
//       const blob = new Blob([reportContent], { type: 'text/markdown;charset=utf-8' });
//       const filename = reportPath.split('/').pop() || 'report.md';
//       saveAs(blob, filename);
//     }
//   };

//   return (
//     <div className="relative min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-orange-900 overflow-hidden">
//       {/* Animated Background Elements */}
//       <AnimatedParticles />
//       <DNAHelix />
//       <MedicalIcons />
      
//       {/* Animated grid overlay */}
//       <motion.div
//         className="absolute inset-0 opacity-15"
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 0.15 }}
//         transition={{ duration: 3 }}
//       >
//         <div className="w-full h-full bg-gradient-to-r from-transparent via-pink-400/20 to-transparent bg-[size:60px_60px] bg-[image:linear-gradient(to_right,rgba(236,72,153,0.2)_1px,transparent_1px),linear-gradient(to_bottom,rgba(236,72,153,0.2)_1px,transparent_1px)]" />
//       </motion.div>

//       {/* Floating geometric shapes */}
//       <div className="absolute inset-0 overflow-hidden">
//         <motion.div
//           className="absolute top-1/4 left-1/4 w-20 h-20 border-2 border-pink-400/30 rounded-full"
//           animate={{ rotate: 360, scale: [1, 1.2, 1] }}
//           transition={{ duration: 8, repeat: Infinity }}
//         />
//         <motion.div
//           className="absolute top-3/4 right-1/3 w-16 h-16 bg-gradient-to-br from-orange-400/20 to-pink-400/20 transform rotate-45"
//           animate={{ rotate: [45, 405], y: [-10, 10, -10] }}
//           transition={{ duration: 6, repeat: Infinity }}
//         />
//         <motion.div
//           className="absolute bottom-1/4 left-1/3 w-12 h-24 bg-gradient-to-t from-purple-400/30 to-transparent rounded-full"
//           animate={{ scaleY: [1, 1.5, 1], opacity: [0.3, 0.6, 0.3] }}
//           transition={{ duration: 4, repeat: Infinity }}
//         />
//       </div>

//       {/* Header with Authentication */}
//       <motion.div
//         className="absolute top-4 right-4 z-20 space-x-2 text-white"
//         initial={{ y: -20, opacity: 0 }}
//         animate={{ y: 0, opacity: 1 }}
//         transition={{ delay: 0.3 }}
//       >
//         {!user && !authLoading ? (
//           <motion.div
//             initial={{ scale: 0.8 }}
//             animate={{ scale: 1 }}
//             transition={{ delay: 0.5 }}
//             className="flex gap-2"
//           >
//             <Button 
//               variant="ghost" 
//               onClick={() => setAuthMode('signup')}
//               className="hover:bg-white/10 transition-all duration-300 hover:scale-105"
//             >
//               Sign Up
//             </Button>
//             <Button 
//               variant="ghost" 
//               onClick={() => setAuthMode('login')}
//               className="hover:bg-white/10 transition-all duration-300 hover:scale-105"
//             >
//               Login
//             </Button>
//           </motion.div>
//         ) : (
//           <motion.div 
//             className="flex items-center gap-3"
//             initial={{ scale: 0.8 }}
//             animate={{ scale: 1 }}
//           >
//             <motion.span 
//               className="text-white font-semibold bg-white/10 px-3 py-1 rounded-full"
//               animate={{ 
//                 boxShadow: ['0 0 10px rgba(59,130,246,0.3)', '0 0 20px rgba(59,130,246,0.5)', '0 0 10px rgba(59,130,246,0.3)'] 
//               }}
//               transition={{ duration: 2, repeat: Infinity }}
//             >
//               Hello, {user?.displayName}
//             </motion.span>
//             <Button 
//               variant="ghost" 
//               onClick={handleLogout}
//               className="hover:bg-red-500/20 transition-all duration-300"
//             >
//               Logout
//             </Button>
//           </motion.div>
//         )}
//       </motion.div>

//       {/* Main Content */}
//       <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 text-center text-white">
//         <motion.div
//           // variants={pulseVariants}
//           initial="initial"
//           animate="animate"
//           className="mb-8"
//         >
//           <motion.h1
//             className="text-6xl lg:text-8xl font-extrabold mb-4 bg-gradient-to-r from-pink-400 via-purple-400 to-orange-400 bg-clip-text text-transparent"
//             initial={{ y: -100, opacity: 0, scale: 0.5 }}
//             animate={{ y: 0, opacity: 1, scale: 1 }}
//             transition={{ 
//               delay: 0.2, 
//               duration: 1.2,
//               type: "spring",
//               stiffness: 100
//             }}
//           >
//             MARS
//           </motion.h1>
          
//           <motion.div
//             className="h-1 bg-gradient-to-r from-transparent via-pink-400 to-transparent mb-4"
//             initial={{ scaleX: 0 }}
//             animate={{ scaleX: 1 }}
//             transition={{ delay: 1, duration: 1.5 }}
//           />
          
//           <motion.p
//             className="text-xl lg:text-2xl mb-8 max-w-3xl text-pink-100"
//             initial={{ y: 50, opacity: 0 }}
//             animate={{ y: 0, opacity: 1 }}
//             transition={{ delay: 0.8, duration: 1 }}
//           >
//             Medical AI Research System - Conduct deep AI-driven medical research with cutting-edge analysis
//           </motion.p>
//         </motion.div>

//         <motion.form 
//           onSubmit={handleSubmit} 
//           className="w-full max-w-2xl"
//           initial={{ y: 100, opacity: 0 }}
//           animate={{ y: 0, opacity: 1 }}
//           transition={{ delay: 1.2, duration: 0.8 }}
//         >
//           <div className="flex flex-col gap-6">
//             <motion.div
//               className="relative"
//               whileHover={{ scale: 1.02 }}
//               whileFocus={{ scale: 1.02 }}
//             >
//               <input
//                 type="text"
//                 value={topic}
//                 onChange={(e) => setTopic(e.target.value)}
//                 placeholder="Enter your medical research topic (e.g., 'diabetes treatment efficacy', 'cancer immunotherapy')..."
//                 className="w-full px-6 py-4 rounded-xl bg-white/10 backdrop-blur-md border border-pink-400/30 placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all duration-300 text-lg"
//                 required
//               />
//               <motion.div
//                 className="absolute inset-0 rounded-xl bg-gradient-to-r from-pink-400/10 via-purple-400/10 to-orange-400/10 -z-10"
//                 animate={{ 
//                   opacity: [0.3, 0.7, 0.3],
//                   scale: [1, 1.01, 1]
//                 }}
//                 transition={{ duration: 3, repeat: Infinity }}
//               />
//             </motion.div>
            
//             <motion.div
//               whileHover={{ scale: 1.05 }}
//               whileTap={{ scale: 0.95 }}
//             >
//               <Button 
//                 variant="ghost" 
//                 type="submit" 
//                 disabled={loading} 
//                 className="w-full py-4 text-lg font-semibold bg-gradient-to-r from-pink-600 via-purple-600 to-orange-600 hover:from-pink-500 hover:via-purple-500 hover:to-orange-500 transition-all duration-300 rounded-xl border-none"
//               >
//                 <motion.span
//                   animate={loading ? { rotate: 360 } : {}}
//                   transition={loading ? { duration: 1, repeat: Infinity, ease: "linear" } : {}}
//                 >
//                   {loading ? '🔬' : '🚀'}
//                 </motion.span>
//                 <span className="ml-2">
//                   {loading ? 'Analyzing Medical Data...' : 'Start Research'}
//                 </span>
//               </Button>
//             </motion.div>
//           </div>
//         </motion.form>

//         <AnimatePresence>
//           {reportContent && (
//             <motion.div
//               className="w-full max-w-5xl mt-12 bg-white/5 backdrop-blur-lg border border-pink-400/20 p-8 rounded-2xl text-left overflow-auto max-h-96 shadow-2xl"
//               style={{
//                 background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
//                 boxShadow: '0 8px 32px rgba(236,72,153,0.3)',
//               }}
//               initial={{ opacity: 0, y: 100, scale: 0.8 }}
//               animate={{ opacity: 1, y: 0, scale: 1 }}
//               exit={{ opacity: 0, y: -100, scale: 0.8 }}
//               transition={{ duration: 0.8, type: "spring" }}
//             >
//               <motion.h2 
//                 className="text-3xl font-bold mb-6 text-pink-300 flex items-center gap-3"
//                 initial={{ x: -50 }}
//                 animate={{ x: 0 }}
//                 transition={{ delay: 0.3 }}
//               >
//                 <motion.span
//                   animate={{ rotate: [0, 360] }}
//                   transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
//                 >
//                   🧬
//                 </motion.span>
//                 Research Report
//               </motion.h2>
              
//               <motion.div
//                 className="relative"
//                 initial={{ opacity: 0 }}
//                 animate={{ opacity: 1 }}
//                 transition={{ delay: 0.5 }}
//               >
//                 <pre className="whitespace-pre-wrap break-words text-sm text-pink-50 bg-black/20 p-6 rounded-xl border border-pink-400/10 leading-relaxed">
//                   {reportContent}
//                 </pre>
                
//                 {reportPath && (
//                   <motion.div
//                     className="mt-6"
//                     initial={{ y: 20, opacity: 0 }}
//                     animate={{ y: 0, opacity: 1 }}
//                     transition={{ delay: 0.8 }}
//                   >
//                     <Button 
//                       variant="ghost" 
//                       onClick={handleDownload}
//                       className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:via-teal-500 hover:to-cyan-500 transition-all duration-300 px-6 py-3 rounded-xl"
//                     >
//                       <motion.span
//                         animate={{ y: [0, -2, 0] }}
//                         transition={{ duration: 1.5, repeat: Infinity }}
//                       >
//                         📥
//                       </motion.span>
//                       <span className="ml-2">Download Report</span>
//                     </Button>
//                   </motion.div>
//                 )}
//               </motion.div>
//             </motion.div>
//           )}
//         </AnimatePresence>
//       </div>

//       {/* Authentication Modal */}
//       <AnimatePresence>
//         {authMode && (
//           <motion.div
//             className="absolute inset-0 z-30 flex items-center justify-center bg-black/60 backdrop-blur-lg"
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//           >
//             <motion.div
//               className="bg-slate-800/80 backdrop-blur-xl border border-pink-400/20 rounded-2xl p-8 w-full max-w-md shadow-2xl"
//               style={{
//                 background: 'linear-gradient(135deg, rgba(30,41,59,0.9) 0%, rgba(51,65,85,0.8) 100%)',
//                 boxShadow: '0 25px 50px rgba(236,72,153,0.4)',
//               }}
//               initial={{ scale: 0.7, opacity: 0, y: 50 }}
//               animate={{ scale: 1, opacity: 1, y: 0 }}
//               exit={{ scale: 0.7, opacity: 0, y: 50 }}
//               transition={{ type: "spring", damping: 20 }}
//             >
//               <motion.h2 
//                 className="text-3xl font-bold mb-6 text-pink-300 text-center"
//                 initial={{ y: -20 }}
//                 animate={{ y: 0 }}
//                 transition={{ delay: 0.2 }}
//               >
//                 {authMode === 'login' ? '🔬 Login to MARS' : '🧬 Join MARS'}
//               </motion.h2>
              
//               <form onSubmit={handleAuthSubmit} className="space-y-4">
//                 <motion.input
//                   type="email"
//                   placeholder="Email Address"
//                   className="w-full px-4 py-3 border border-cyan-400/30 rounded-xl bg-slate-700/50 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
//                   required
//                   initial={{ x: -20, opacity: 0 }}
//                   animate={{ x: 0, opacity: 1 }}
//                   transition={{ delay: 0.3 }}
//                 />
//                 <motion.input
//                   type="text"
//                   placeholder="Username"
//                   className="w-full px-4 py-3 border border-cyan-400/30 rounded-xl bg-slate-700/50 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
//                   required
//                   initial={{ x: -20, opacity: 0 }}
//                   animate={{ x: 0, opacity: 1 }}
//                   transition={{ delay: 0.4 }}
//                 />
//                 <motion.input
//                   type="password"
//                   placeholder="Password"
//                   className="w-full px-4 py-3 border border-cyan-400/30 rounded-xl bg-slate-700/50 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
//                   required
//                   initial={{ x: -20, opacity: 0 }}
//                   animate={{ x: 0, opacity: 1 }}
//                   transition={{ delay: 0.5 }}
//                 />
                
//                 <motion.div 
//                   className="flex justify-end gap-3 pt-4"
//                   initial={{ y: 20, opacity: 0 }}
//                   animate={{ y: 0, opacity: 1 }}
//                   transition={{ delay: 0.6 }}
//                 >
//                   <Button 
//                     variant="ghost" 
//                     onClick={() => setAuthMode(null)} 
//                     type="button"
//                     className="px-6 py-2 rounded-lg hover:bg-slate-600/50"
//                   >
//                     Cancel
//                   </Button>
//                   <Button 
//                     variant="ghost" 
//                     type="submit"
//                     className="px-6 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500"
//                   >
//                     {authMode === 'login' ? 'Login' : 'Create Account'}
//                   </Button>
//                 </motion.div>
//               </form>
//             </motion.div>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// }