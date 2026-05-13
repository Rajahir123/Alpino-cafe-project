import { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { Utensils, Milk, Zap, Target, Mountain } from 'lucide-react';
import { getGoogleDriveDirectUrl } from '../lib/assets';

interface LoadingScreenProps {
  customUrl?: string;
  videoUrl?: string;
  logoUrl?: string;
  onFinished?: () => void;
}

export function LoadingScreen({ customUrl, videoUrl, logoUrl, onFinished }: LoadingScreenProps) {
  const [videoError, setVideoError] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [minLogoTimePassed, setMinLogoTimePassed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const getDriveId = (url: string) => {
    const match = url?.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || url?.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    return match ? match[1] : null;
  };

  const driveId = videoUrl ? getDriveId(videoUrl) : null;
  const isDriveVideo = !!driveId;
  const embedUrl = driveId ? `https://drive.google.com/file/d/${driveId}/preview?autoplay=1&mute=1` : null;
  const directVideoUrl = getGoogleDriveDirectUrl(videoUrl);
  const directPhotoUrl = getGoogleDriveDirectUrl(customUrl);
  const directLogoUrl = getGoogleDriveDirectUrl(logoUrl);

  useEffect(() => {
    setVideoLoaded(false);
    setVideoError(false);
    setIsBuffering(true);
    setMinLogoTimePassed(false);
    
    // Ensure logo stays for at least 2.5 seconds for brand impact but feels snappy
    const timer = window.setTimeout(() => {
      setMinLogoTimePassed(true);
    }, 2500);
    
    return () => clearTimeout(timer);
  }, [videoUrl]);

  useEffect(() => {
    if (directVideoUrl && !isDriveVideo) {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.as = 'video';
      link.href = directVideoUrl;
      document.head.appendChild(link);
      return () => {
        try {
          document.head.removeChild(link);
        } catch (e) {}
      };
    }
  }, [directVideoUrl, isDriveVideo]);

  useEffect(() => {
    const checkScreen = () => {
      // Consider it mobile if width is small OR it's a touch device
      const isSmallScreen = window.innerWidth < 1024;
      const isTouchDevice = window.matchMedia("(pointer: coarse)").matches;
      setIsMobile(isSmallScreen || isTouchDevice);
      console.log(`LoadingScreen: Mobile detected? ${isSmallScreen || isTouchDevice} (Width: ${window.innerWidth})`);
    };
    checkScreen();
    window.addEventListener('resize', checkScreen);
    return () => window.removeEventListener('resize', checkScreen);
  }, []);

  const [hideUI, setHideUI] = useState(false);

  useEffect(() => {
    if (isMobile) {
      setHideUI(true);
    }
  }, [isMobile]);

  const [isExiting, setIsExiting] = useState(false);
  const onFinishedRef = useRef(onFinished);
  useEffect(() => {
    onFinishedRef.current = onFinished;
  }, [onFinished]);

  const handleFinish = () => {
    if (isExiting) return;
    setIsExiting(true);
    // Smooth fade/wipe time
    setTimeout(() => {
      onFinishedRef.current?.();
    }, 600);
  };

  useEffect(() => {
    let timeoutId: number;
    let finishTimer: number;
    let playCheckInterval: number;

    const useVideo = !!videoUrl;

    if (useVideo) {
      // Safety timeout: If nothing happens within 20 seconds, move on
      timeoutId = window.setTimeout(() => {
        if (!videoLoaded && !videoError) {
          console.warn("Video loading timed out, moving to fallback.");
          handleFinish();
        }
      }, 20000);
    } else {
      // Photo case or no video case - stay for 3 seconds for branding impact
      timeoutId = window.setTimeout(() => {
        handleFinish();
      }, 3000);
    }

    if (videoLoaded && !videoError && useVideo) {
      // Intelligent Hide: Once high-quality video starts playing, wait for impact, then finish
      finishTimer = window.setTimeout(() => {
        handleFinish();
      }, 4000); // 4 seconds of smooth 720p 60fps playback for maximum brand impact
    }

    const video = videoRef.current;
    if (useVideo && video && !videoError) {
      video.muted = true;
      video.playsInline = true;
      video.playbackRate = 1.5; 
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
  }, [videoUrl, videoLoaded, videoError]);

  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-[100] overflow-hidden cursor-pointer" onClick={() => {
      // Allow user to click anywhere to "jumpstart" the video if blocked
      if (videoRef.current) {
        videoRef.current.muted = false; // Try unmuting on click too
        videoRef.current.play().catch(e => console.error("Manual play failed:", e instanceof Error ? e.message : String(e)));
      }
    }}>
      {/* Exit Transition Wipe - Minimalist pure color for faster perceived speed */}
      <motion.div
        initial={{ x: "-100%" }}
        animate={{ x: isExiting ? "0%" : "-100%" }}
        transition={{ duration: 0.6, ease: [0.65, 0, 0.35, 1] }}
        className="absolute inset-0 z-[200] bg-[#C90000]"
      />

      {/* 0. Transition Flash Effect - Triggers when loading completes */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: (videoLoaded && !isBuffering && minLogoTimePassed) ? [0, 1, 0] : 0 }}
        transition={{ duration: 0.8, times: [0, 0.2, 1] }}
        className="absolute inset-0 z-[120] bg-white pointer-events-none"
      />

      {/* 1. Initial Logo Pre-loader - Prominent visibility during background loading */}
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: (!videoLoaded || isBuffering || !minLogoTimePassed) ? 1 : 0 }}
        transition={{ duration: 1.2, ease: [0.45, 0, 0.55, 1] }}
        className={`absolute inset-0 z-[110] bg-black flex items-center justify-center pointer-events-none transition-all duration-1000 ${(!videoLoaded || isBuffering || !minLogoTimePassed) ? 'scale-100' : 'scale-125'}`}
        onAnimationComplete={() => {
          // Additional logic could go here if we wanted to trigger something strictly after fade
        }}
      >
        <div className="relative">
             {/* Deep Ambient Glow */}
             <motion.div 
               animate={{ 
                 scale: [1, 1.15, 1],
                 opacity: [0.2, 0.5, 0.2]
               }}
               transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
               className="absolute inset-[-60px] bg-[#C90000]/20 blur-3xl rounded-full"
             />

             {/* Pulsing ring accent */}
             <motion.div 
               animate={{ rotate: 360 }}
               transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
               className="absolute inset-[-30px] border border-white/5 rounded-full border-dashed"
             />
             
             <motion.div
               animate={{ 
                 y: [0, -10, 0],
               }}
               transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
               className="relative z-10"
             >
                {directLogoUrl ? (
                  <img 
                    src={directLogoUrl} 
                    alt="Intro Logo" 
                    className="h-48 w-auto object-contain drop-shadow-[0_0_40px_rgba(255,255,255,0.15)]"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <Mountain size={120} className="text-white fill-white" />
                )}
             </motion.div>
             
             {/* Minimalist Progress Meter */}
             <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 w-64">
                <div className="w-full h-[1px] bg-white/10 overflow-hidden relative">
                  <motion.div 
                    initial={{ left: "-100%" }}
                    animate={{ left: "100%" }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-[#C90000] to-transparent"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <motion.div 
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="w-1.5 h-1.5 bg-[#C90000] rounded-full"
                  />
                  <p className="text-white/30 text-[9px] uppercase tracking-[0.8em] font-black whitespace-nowrap">
                     Syncing Performance Gear
                  </p>
                </div>
             </div>
        </div>
      </motion.div>

      {/* Dynamic Background Layer */}
      <motion.div
         initial={{ opacity: 1 }}
         animate={{ opacity: 1 }}
         className="absolute inset-0 z-0 bg-black"
      >
        {videoUrl ? (
           <div className="w-full h-full relative flex items-center justify-center bg-black">
              {!videoError ? (
                <div className="absolute inset-0 z-10">
                  <video 
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    loop
                    preload="auto"
                    key={videoUrl}
                    onCanPlay={() => {
                      setVideoLoaded(true);
                      setIsBuffering(false);
                      setVideoError(false);
                    }}
                    onPlay={() => {
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
                    {directVideoUrl && <source src={directVideoUrl} type="video/mp4" />}
                    {driveId && <source src={`https://docs.google.com/uc?id=${driveId}`} type="video/mp4" />}
                  </video>
                  {/* High Fidelity Sharpening Overlay - Faded in smoothly to avoid perceived drop */}
                  <div className={`absolute inset-0 z-20 pointer-events-none bg-black/5 contrast-[1.15] saturate-[1.1] mix-blend-overlay transition-opacity duration-1000 ${videoLoaded ? 'opacity-40' : 'opacity-0'}`} />
                  <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black to-transparent z-10" />
                </div>
              ) : isDriveVideo && embedUrl ? (
                <div className="absolute inset-0 overflow-hidden bg-black flex items-center justify-center">
                  <iframe 
                    src={`${embedUrl}&vq=hd720&hd=1&modestbranding=1&rel=0&fs=0&controls=0&disablekb=1&showinfo=0&iv_load_policy=3`}
                    className="w-full h-[calc(110%+160px)] -mt-[10%] border-none pointer-events-none transition-opacity duration-1000 will-change-transform scale-[1.05]"
                    onLoad={() => {
                      setVideoLoaded(true);
                      setTimeout(() => handleFinish(), 10000); // 10s for high-def impact
                    }}
                    allow="autoplay; fullscreen"
                    style={{ opacity: videoLoaded ? 1.0 : 0 }}
                  />
                  {/* Cinematic overlays and sharpening */}
                  <div className={`absolute inset-0 z-20 pointer-events-none border-[10vw] border-black/20 blur-[60px] mix-blend-multiply transition-opacity duration-700 ${videoLoaded ? 'opacity-100' : 'opacity-0'}`} />
                  <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/80 to-transparent z-10" />
                  <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/80 to-transparent z-10" />
                </div>
              ) : (
                <div className="w-full h-full bg-black" />
              )}
             
             {/* Cinematic Overlays - Optimized for 1080p 60fps Visual Fidelity */}
             <div className="absolute inset-0 bg-black/5 backdrop-contrast-[1.02] will-change-transform" />
             <div className="absolute inset-0 bg-gradient-to-tr from-black/40 via-transparent to-black/40 pointer-events-none" />
             <div className={`absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none mix-blend-overlay transition-opacity duration-1000 ${videoLoaded ? 'opacity-100' : 'opacity-0'}`} />
           </div>
        ) : (
          <div className="w-full h-full relative bg-black" />
        )}
      </motion.div>

      {/* Foreground Branding & Status (Floating over video) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: (videoLoaded && !isBuffering && minLogoTimePassed) ? 1 : 0, scale: (videoLoaded && !isBuffering && minLogoTimePassed) ? 1 : 0.95 }}
        transition={{ delay: 0.2, duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-30 flex flex-col items-center max-w-md w-full px-6"
      >
        <div className="text-center space-y-12">
          {/* Main Logo Mark with improved animation */}
          {!isMobile && (
            <motion.div
              animate={{ 
                y: [0, -15, 0],
                scale: [1, 1.02, 1],
                filter: ["drop-shadow(0 0 0px rgba(220,38,38,0))", "drop-shadow(0 0 40px rgba(220,38,38,0.5))", "drop-shadow(0 0 0px rgba(220,38,38,0))"]
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="flex justify-center"
            >
              {directLogoUrl ? (
                <div className="relative group">
                  <div className="absolute inset-[-15px] bg-[#C90000]/20 blur-2xl rounded-full animate-pulse" />
                  <img 
                    src={directLogoUrl} 
                    alt="Logo" 
                    className="h-40 w-auto object-contain relative z-10 drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                    referrerPolicy="no-referrer"
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
          )}

          {!isMobile && (
            <>
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
            </>
          )}
        </div>
      </motion.div>

      {/* Cinematic Frame Accents - Only show buffering after logo is gone */}
      {isBuffering && videoUrl && minLogoTimePassed && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-32 z-50 text-white/40 text-[10px] uppercase tracking-[0.4em] font-black pointer-events-none"
        >
          Buffering experience...
        </motion.div>
      )}

      {videoLoaded && !isBuffering && minLogoTimePassed && (
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={(e) => {
            e.stopPropagation();
            handleFinish();
          }}
          className="absolute bottom-16 z-[60] px-10 py-4 bg-white text-black font-black uppercase tracking-[0.3em] italic rounded-full shadow-[0_20px_50px_rgba(255,255,255,0.2)] hover:shadow-[0_25px_60px_rgba(255,255,255,0.4)] transition-all duration-300 flex items-center gap-3 overflow-hidden group"
        >
          <span className="relative z-10 font-black">Let's Go</span>
          <Zap size={18} className="relative z-10 fill-current group-hover:animate-pulse" />
          <motion.div 
            className="absolute inset-0 bg-[#C90000] origin-left"
            initial={{ scaleX: 0 }}
            whileHover={{ scaleX: 1 }}
            transition={{ duration: 0.3 }}
          />
          <motion.div 
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ 
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
              left: '-100%'
            }}
            animate={videoLoaded ? { left: '100%' } : {}}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear", repeatDelay: 1 }}
          />
        </motion.button>
      )}

      {videoLoaded && videoRef.current?.paused && !videoError && !hideUI && minLogoTimePassed && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute bottom-32 z-50 text-white/60 text-xs uppercase tracking-[0.2em] font-black bg-white/10 px-6 py-3 rounded-full border border-white/20 animate-pulse"
        >
          Tap to start experience
        </motion.div>
      )}

      {!hideUI && videoLoaded && !isBuffering && minLogoTimePassed && (
        <>
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 0.2, x: 0 }}
            transition={{ delay: 0.5 }}
            className="absolute top-12 left-12 z-40"
          >
            <div className="flex flex-col gap-1 text-[10px] font-mono text-white uppercase tracking-widest">
              <span>ALPN-X4</span>
              <span className="text-[#C90000]">Active</span>
            </div>
          </motion.div>

          {/* Animated HUD line - Top Left */}
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: 100 }}
            transition={{ delay: 0.6, duration: 1 }}
            className="absolute top-10 left-12 h-[1px] bg-white/20 z-40"
          />

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 0.2, x: 0 }}
            transition={{ delay: 0.5 }}
            className="absolute bottom-12 right-12 z-40"
          >
            <div className="flex flex-col gap-1 text-[10px] font-mono text-white uppercase tracking-widest text-right">
              <span>Buffer: 100%</span>
              <span>EST: 0.2s</span>
            </div>
          </motion.div>
          
          {/* Animated HUD line - Bottom Right */}
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: 100 }}
            transition={{ delay: 0.6, duration: 1 }}
            className="absolute bottom-10 right-12 h-[1px] bg-white/20 z-40 rotate-180"
          />
        </>
      )}

      {/* Red Top Panel - Symmetric with footer */}
      <motion.div
        initial={{ y: "-100%" }}
        animate={{ y: (videoLoaded && !isBuffering && minLogoTimePassed) ? 0 : "-100%" }}
        transition={{ delay: 0.4, duration: 1, ease: [0.22, 1, 0.36, 1] }}
        className="absolute top-0 inset-x-0 h-[6%] bg-[#C90000] z-50 shadow-[0_15px_50px_rgba(0,0,0,0.5)] flex flex-col items-center justify-center overflow-hidden border-b border-white/10"
      >
        {/* Animated Accent line in panel */}
        <motion.div 
          animate={{ x: ["100%", "-100%"] }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-white/10 to-transparent"
        />
        
        {/* Gloss overlay for panel */}
        <div className="absolute inset-0 bg-gradient-to-t from-white/10 to-transparent pointer-events-none" />
      </motion.div>

      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: (videoLoaded && !isBuffering && minLogoTimePassed) ? 0 : "100%" }}
        transition={{ delay: 0.4, duration: 1, ease: [0.22, 1, 0.36, 1] }}
        className="absolute bottom-0 inset-x-0 h-[6%] bg-[#C90000] z-50 shadow-[0_-15px_50px_rgba(0,0,0,0.5)] flex flex-col items-center justify-center overflow-hidden border-t border-white/10"
      >
        {/* Animated Accent line in panel */}
        <motion.div 
          animate={{ x: ["-100%", "100%"] }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-white/10 to-transparent"
        />
        
        {/* Gloss overlay for panel */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
      </motion.div>
    </div>
  );
}

