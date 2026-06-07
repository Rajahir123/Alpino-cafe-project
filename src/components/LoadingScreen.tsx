import { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { Utensils, Milk, Zap, Target, Mountain } from 'lucide-react';

interface LoadingScreenProps {
  customUrl?: string;
  videoUrl?: string;
  logoUrl?: string;
  onFinished?: () => void;
}

export function LoadingScreen({ customUrl, videoUrl, logoUrl, onFinished }: LoadingScreenProps) {
  const [videoError, setVideoError] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [minLogoTimePassed, setMinLogoTimePassed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [isExiting, setIsExiting] = useState(false);
  const useVideo = !!videoUrl;

  useEffect(() => {
    setVideoLoaded(false);
    setVideoError(false);
    setIsBuffering(true);
    setMinLogoTimePassed(false);
    
    // Ensure logo stays for brand impact
    const logoTimer = isMobile ? 4000 : 500; 
    const timer = window.setTimeout(() => {
      setMinLogoTimePassed(true);
    }, logoTimer);
    
    return () => clearTimeout(timer);
  }, [videoUrl, isMobile]);

  useEffect(() => {
    const checkScreen = () => {
      const isSmallScreen = window.innerWidth < 1024;
      const isTouchDevice = window.matchMedia("(pointer: coarse)").matches;
      setIsMobile(isSmallScreen || isTouchDevice);
    };
    checkScreen();
    window.addEventListener('resize', checkScreen);
    return () => window.removeEventListener('resize', checkScreen);
  }, []);

  const handleFinish = () => {
    if (isExiting) return;
    setIsExiting(true);
    // Give time for exit animation (duration 0.8s) + a small safety buffer (0.2s)
    setTimeout(() => {
      onFinished?.();
    }, 1000);
  };

  useEffect(() => {
    let timeoutId: number;
    let finishTimer: number;
    let playCheckInterval: number;

    if (useVideo) {
      const timeoutDuration = 8000;
      
      timeoutId = window.setTimeout(() => {
        if (!videoLoaded && !videoError) {
          console.warn("Video loading timed out, moving to finish.");
          setVideoLoaded(true);
          setIsBuffering(false);
          setTimeout(() => handleFinish(), 1500);
        }
      }, timeoutDuration);
    } else {
      // Photo case or no video case (Desktop) - stay for 12 seconds total for branding impact
      if (!videoLoaded) setVideoLoaded(true);
      if (isBuffering) setIsBuffering(false);
      timeoutId = window.setTimeout(() => {
        handleFinish();
      }, 12000);
    }

    if (videoLoaded && !videoError && useVideo) {
      // Intelligent Hide: Once high-quality video starts playing, wait for impact, then finish
      // We increased this to 12 seconds to ensure the full cinematic experience plays out
      finishTimer = window.setTimeout(() => {
        handleFinish();
      }, 12000); 
    }

    const video = videoRef.current;
    if (useVideo && video && !videoError) {
      video.muted = true;
      video.playsInline = true;
      video.playbackRate = 1.0; 
      video.setAttribute('preload', 'auto');
      
      // Force immediate header fetch
      video.load();
      
      const attemptPlay = async () => {
        if (!video) return;
        try {
          if (video.paused) {
            await video.play();
          }
        } catch (err) {
          // Silent - user interaction fallback
        }
      };

      const handleCanPlay = () => {
        setIsBuffering(false);
        setVideoLoaded(true);
        attemptPlay();
      };

      const handlePlaying = () => {
        setIsBuffering(false);
        setVideoLoaded(true);
      };

      const handleWaiting = () => setIsBuffering(true);

      // Check readyState 2 (HAVE_CURRENT_DATA) or better for ultra-fast 0.1s start
      if (video.readyState >= 2) {
        setVideoLoaded(true);
        setIsBuffering(false);
      }

      attemptPlay();
      
      const fastInterval = window.setInterval(() => {
        // Aggressive 0.1s detection - even partial data (readyState 2) can show a frame
        if (video.readyState >= 2 && !videoLoaded) {
          setVideoLoaded(true);
          setIsBuffering(false);
        }
        if (video.paused && !videoError && (videoLoaded || video.readyState >= 1)) {
          attemptPlay();
        }
      }, 100); 

      video.addEventListener('canplay', handleCanPlay);
      video.addEventListener('playing', handlePlaying);
      video.addEventListener('waiting', handleWaiting);

      return () => {
        clearTimeout(timeoutId);
        clearTimeout(finishTimer);
        clearInterval(fastInterval);
        video.removeEventListener('canplay', handleCanPlay);
        video.removeEventListener('playing', handlePlaying);
        video.removeEventListener('waiting', handleWaiting);
      };
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (finishTimer) clearTimeout(finishTimer);
    };
  }, [videoUrl, videoLoaded, videoError, onFinished, isMobile]);

  return (
    <div className="fixed inset-0 bg-[#0a0a0a] flex flex-col items-center justify-center z-[100] overflow-hidden cursor-pointer" onClick={() => {
      if (!isMobile) {
        handleFinish();
        return;
      }
      // Allow user to click anywhere to "jumpstart" the video if blocked
      if (videoRef.current) {
        videoRef.current.muted = false; // Try unmuting on click too
        videoRef.current.play().catch(e => console.error("Manual play failed:", e instanceof Error ? e.message : String(e)));
      }
    }}>
      {/* Dynamic Background Layer with Smooth Exit */}
      <motion.div
         initial={{ opacity: 1, scale: 1 }}
         animate={{ 
           opacity: isExiting ? 0 : 1,
           scale: isExiting ? 1.05 : 1
         }}
         transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
         className="absolute inset-0 z-0 bg-black"
      >
        {useVideo ? (
           <div className="w-full h-full relative flex items-center justify-center bg-black">
              {!videoError ? (
                <div className="absolute inset-0 z-10">
                  <video 
                    ref={videoRef}
                    key={videoUrl}
                    autoPlay
                    muted
                    playsInline
                    loop
                    preload="auto"
                    src={videoUrl}
                    onCanPlay={() => {
                      console.log("Video: onCanPlay reached");
                      setVideoLoaded(true);
                      setIsBuffering(false);
                      setVideoError(false);
                    }}
                    onPlay={() => {
                      console.log("Video: onPlay reached");
                      setVideoLoaded(true);
                      setIsBuffering(false);
                    }}
                    onEnded={() => {
                      console.log("Video ended, finishing loading.");
                      handleFinish();
                    }}
                    onError={() => {
                      console.warn("Video element failed. Attempting fallback.");
                      setVideoError(true);
                      setIsBuffering(false);
                    }}
                    onWaiting={() => setIsBuffering(true)}
                    onPlaying={() => setIsBuffering(false)}
                    className={`relative z-10 w-full h-full object-cover transition-opacity duration-1000 will-change-transform ${videoLoaded ? 'opacity-100' : 'opacity-0'}`}
                  >
                  </video>
                  {/* High Fidelity Sharpening Overlay - Faded in smoothly to avoid perceived drop */}
                  <div className={`absolute inset-0 z-20 pointer-events-none bg-black/5 contrast-[1.15] saturate-[1.1] mix-blend-overlay transition-opacity duration-1000 ${videoLoaded ? 'opacity-40' : 'opacity-0'}`} />
                  <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black to-transparent z-10" />
                </div>
              ) : (
                <div className="w-full h-full bg-[radial-gradient(circle_at_center,_#1a1a1a_0%,_#000000_100%)]" />
              )}
             
             {/* Cinematic Overlays - Optimized for 1080p 60fps Visual Fidelity */}
             <div className="absolute inset-0 bg-black/5 backdrop-contrast-[1.02] will-change-transform" />
             <div className="absolute inset-0 bg-gradient-to-tr from-black/40 via-transparent to-black/40 pointer-events-none" />
             <div className={`absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none mix-blend-overlay transition-opacity duration-1000 ${videoLoaded ? 'opacity-100' : 'opacity-0'}`} />
           </div>
        ) : (
          <div className="w-full h-full relative">
            {customUrl ? (
              <img 
                src={customUrl} 
                alt="Background" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-full h-full bg-[radial-gradient(circle_at_center,_#1a1a1a_0%,_#000000_100%)]" />
            )}
          </div>
        )}
      </motion.div>

      {/* Floating UI Elements Fade Out early on exit */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ 
          opacity: 0, 
          scale: 0.95 
        }}
        transition={{ duration: 0.5 }}
        className="relative z-30 flex flex-col items-center max-w-md w-full px-6"
      >
        <div className="text-center space-y-12">
          {/* Main Logo Mark with improved animation */}
          <motion.div
            animate={{ 
              y: [0, -15, 0],
              scale: [1, 1.02, 1],
              filter: ["drop-shadow(0 0 0px rgba(220,38,38,0))", "drop-shadow(0 0 40px rgba(220,38,38,0.5))", "drop-shadow(0 0 0px rgba(220,38,38,0))"]
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="flex justify-center"
          >
            {logoUrl && !logoError ? (
              <div className="relative group">
                <div className="absolute inset-[-15px] bg-[#C90000]/20 blur-2xl rounded-full animate-pulse" />
                <img 
                  src={logoUrl} 
                  alt="Logo" 
                  className="h-40 w-auto object-contain relative z-10 drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                  referrerPolicy="no-referrer"
                  onError={() => setLogoError(true)}
                />
              </div>
            ) : (
              <div className="bg-[#C90000] p-10 rounded-[3rem] transform -rotate-2 shadow-[0_25px_60px_rgba(201,0,0,0.4)] border border-white/20 relative">
                <Mountain size={100} className="text-white fill-white" />
                {/* Spinning Accent */}
                <div className="absolute inset-[-10px] border-2 border-dashed border-[#C90000]/30 rounded-full animate-[spin_10s_linear_infinite]" />
              </div>
            )}
          </motion.div>

          <div className="space-y-6">
            <h2 className="text-8xl font-black italic uppercase tracking-tighter text-white drop-shadow-[0_15px_15px_rgba(0,0,0,0.6)] mb-1">
              Alpino <span className="text-[#C90000]">Premium</span>
            </h2>
            <div className="flex items-center justify-center gap-6">
              <span className="h-[2px] w-12 bg-white/30" />
              <p className="text-white/80 text-sm font-black uppercase tracking-[1.2em] translate-x-[0.6em] whitespace-nowrap">
                Evolution of Taste
              </p>
              <span className="h-[2px] w-12 bg-white/30" />
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex flex-col items-center gap-2">
              <p className="text-[#C90000]/90 text-xs font-black uppercase tracking-[0.5em] animate-pulse">
                Analyzing Ingredients
              </p>
              <p className="text-white/20 text-[10px] font-mono tracking-widest">
                VERIFYING CALIBRATION...
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Floating Let's Go Button for microsecond redirection */}
      <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-[120]">
        <motion.button
          type="button"
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={(e) => {
            e.stopPropagation();
            onFinished?.();
          }}
          className="bg-red-600 hover:bg-neutral-900 border-2 border-red-600 hover:border-white/20 text-white px-8 py-4 rounded-full font-black uppercase tracking-[0.25em] text-xs md:text-sm shadow-[0_0_35px_rgba(220,38,38,0.5)] hover:shadow-none transition-all flex items-center gap-3 cursor-pointer select-none"
        >
          <span>Let's Go</span>
          <Zap size={16} className="fill-current animate-pulse text-white" />
        </motion.button>
      </div>

    </div>
  );
}

