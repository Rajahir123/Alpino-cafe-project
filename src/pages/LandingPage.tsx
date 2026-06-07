import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Link } from "react-router-dom";
import { ChevronRight, Zap, Target, Clock, Star, Info } from "lucide-react";
import { MENU_ITEMS, PLANS, LANDING_PAGE_ITEM_NAMES } from "../constants";
import { db } from "../lib/firebase";
import { collection, onSnapshot, query } from "firebase/firestore";
import { MenuItem } from "../types";
import { useAuth } from "../hooks/useAuth";
import DynamicLogo from "../components/DynamicLogo";
import AssetImage from "../components/AssetImage";
import BowlCarousel from "../components/BowlCarousel";

export default function LandingPage() {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [scrolled, setScrolled] = useState(false);
  const [firestoreItems, setFirestoreItems] = useState<MenuItem[]>([]);
  const [tappedItemId, setTappedItemId] = useState<string | null>(null);
  const [planModal, setPlanModal] = useState<"trial" | "pro" | null>(null);

  useEffect(() => {
    const q = query(collection(db, "menu"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setFirestoreItems(
          snapshot.docs.map(
            (doc) => ({ id: doc.id, ...doc.data() }) as MenuItem,
          ),
        );
      },
      (error) => {
        console.error("Public Menu Fetch Error:", error);
      },
    );
    return () => unsubscribe();
  }, []);

  const allMenuItems = useMemo(() => {
    // Show items that are published. Default to true if the field is missing.
    return firestoreItems.filter((item) => item.published !== false);
  }, [firestoreItems]);

  const landingPageItems = useMemo(() => {
    // The items shown on landing page are now strictly the ones published in Firestore.
    // We no longer rely on a hardcoded list of names to ensure the Admin Panel has full control.
    return allMenuItems;
  }, [allMenuItems]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 100);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.classList.add("theme-light");
    return () => {
      document.body.classList.remove("theme-light");
    };
  }, []);

  return (
    <div className="theme-light">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
        className="bg-black text-white"
      >
      {/* Navbar */}
      {/* Navbar with Off-White Glass Effect, Graphic Lines, and Round Geometric Shapes */}
      <nav
        className={`fixed top-3 left-1/2 -translate-x-1/2 w-[calc(100%-1.5rem)] md:w-[calc(100%-3rem)] max-w-7xl z-50 transition-all duration-500 ease-in-out px-5 md:px-10 flex justify-between items-center overflow-hidden rounded-2xl md:rounded-full ${
          scrolled ? "py-1.5 md:py-3.5" : "py-2.5 md:py-6"
        }`}
        style={{
          background: scrolled 
            ? "rgba(247, 246, 242, 0.88)" 
            : "rgba(251, 250, 246, 0.75)",
          backdropFilter: "blur(28px) saturate(190%)",
          WebkitBackdropFilter: "blur(28px) saturate(190%)",
          border: scrolled 
            ? "1.5px solid rgba(220, 38, 38, 0.12)" 
            : "1.5px solid rgba(255, 255, 255, 0.75)",
          boxShadow: scrolled
            ? "0 15px 35px -5px rgba(121, 142, 155, 0.15), 0 5px 15px -3px rgba(121, 142, 155, 0.08), inset 0 1px 2px rgba(255, 255, 255, 0.9)"
            : "0 10px 25px -10px rgba(121, 142, 155, 0.05), inset 0 1px 1px rgba(255, 255, 255, 0.5)",
        }}
      >
        {/* Dynamic Graphic Round Vector Shapes & Linear Path Grid Cover */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none">
          {/* Subtle horizontal baseline grid line */}
          <div className="absolute bottom-0 left-10 right-10 h-[1px] bg-gradient-to-r from-transparent via-red-600/10 to-transparent" />
          
          {/* Left Decorative Intersecting Linear & Round Vector Elements */}
          <svg className="absolute left-1/4 top-1/2 -translate-y-1/2 w-40 h-10 opacity-15" viewBox="0 0 150 40">
            <line x1="0" y1="20" x2="150" y2="20" stroke="#DC2626" strokeWidth="1" strokeDasharray="4,4" />
            <circle cx="75" cy="20" r="14" fill="none" stroke="#DC2626" strokeWidth="1" />
            <circle cx="75" cy="20" r="4" fill="#DC2626" />
          </svg>

          {/* Right Floating Ambient Concentric Rings (Round Shapes) */}
          <div className="absolute right-1/3 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none">
            <motion.div 
              animate={{ scale: [1, 1.1, 1], opacity: [0.12, 0.22, 0.12] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="absolute w-16 h-16 rounded-full border border-red-600/30" 
            />
            <motion.div 
              animate={{ scale: [1.1, 1, 1.1], opacity: [0.1, 0.2, 0.1] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="absolute w-24 h-24 rounded-full border border-neutral-400/20" 
            />
          </div>

          {/* Decorative Fine Horizontal Accent Track */}
          <div className="absolute top-[3px] left-1/2 -translate-x-1/2 w-32 h-[2px] bg-gradient-to-r from-transparent via-red-600/30 to-transparent rounded-full" />
        </div>

        <Link
          to="/"
          className="hover:opacity-90 transition-all duration-500 flex-shrink-0 flex items-center relative h-10 md:h-12 z-10"
        >
          {!scrolled ? (
            <motion.div
              layoutId="logo-text-container"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="flex items-center"
            >
              <DynamicLogo showImage={false} size={36} />
            </motion.div>
          ) : (
            <motion.div
              layoutId="main-logo"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 30,
              }}
              className="flex items-center"
            >
              <DynamicLogo showText={false} size={32} />
            </motion.div>
          )}
        </Link>

        <div className="flex gap-2 md:gap-3 items-center relative z-10">
          <Link
            to={user ? "/dashboard" : "/login"}
            className={`hidden md:block bg-white/40 hover:bg-white/80 text-neutral-800 rounded-xl text-[9px] md:text-xs font-black uppercase tracking-[0.2em] transition-all border border-neutral-200 hover:border-red-600/30 cursor-pointer ${
              scrolled ? "px-3 md:px-4 py-1.5 md:py-2" : "px-4 md:px-5 py-2 md:py-2.5"
            }`}
          >
            {user ? "Dashboard" : "Admin Login"}
          </Link>
          <Link
            to={user ? "/dashboard" : "/plans"}
            className={`bg-red-600 hover:bg-neutral-900 hover:text-white text-white rounded-xl text-[9px] md:text-xs font-black uppercase tracking-[0.2em] transition-all shadow-[0_4px_25px_rgba(220,38,38,0.3)] hover:scale-[1.03] active:scale-95 cursor-pointer ${
              scrolled
                ? "px-3.5 md:px-5 py-1.5 md:py-2"
                : "px-4.5 md:px-7 py-2 md:py-2.5"
            }`}
          >
            {user ? "Enter App" : "Join Now"}
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-[85vh] md:h-screen flex items-center justify-center pt-28 md:pt-20 overflow-hidden">
        <motion.div
          className="absolute inset-0 z-0 opacity-20 bg-[radial-gradient(circle_at_center,rgba(220,38,38,0.4),transparent_70%)]"
          animate={{ scale: [1, 1.1, 1], opacity: [0.15, 0.25, 0.15] }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        />
        <div className="container mx-auto px-6 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
            animate={{
              opacity: 1,
              scale: [1, 1.02, 1],
              rotate: [0, -1, 1, 0],
              y: [0, -15, 0],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
              times: [0, 0.5, 1],
              opacity: { duration: 1.2, delay: 0.2 },
            }}
            className="mb-12 md:mb-16 flex justify-center"
          >
            <div className="relative group cursor-pointer active:scale-95 transition-transform duration-500">
              <AnimatePresence>
                {!scrolled && (
                  <motion.div
                    key="hero-logo-container"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{
                      opacity: 0,
                      scale: 0.8,
                      transition: { duration: 0.3 },
                    }}
                    className="relative"
                  >
                    {/* Kinetic Energy Rings */}
                    <motion.div
                      animate={{
                        scale: [1, 1.5],
                        opacity: [0.3, 0],
                        borderWidth: ["2px", "0px"],
                      }}
                      transition={{
                        duration: 2.5,
                        repeat: Infinity,
                        ease: "easeOut",
                      }}
                      className="absolute inset-0 border-2 border-red-600 rounded-full -z-10"
                    />
                    <motion.div
                      animate={{
                        scale: [1, 1.8],
                        opacity: [0.2, 0],
                        borderWidth: ["1px", "0px"],
                      }}
                      transition={{
                        duration: 2.5,
                        repeat: Infinity,
                        ease: "easeOut",
                        delay: 0.5,
                      }}
                      className="absolute inset-0 border border-red-500 rounded-full -z-10"
                    />

                    {/* Atmospheric Glow */}
                    <div className="absolute -inset-10 md:-inset-20 bg-red-600/20 rounded-full blur-[60px] md:blur-[100px] group-hover:bg-red-600/30 transition-colors duration-1000" />

                    <DynamicLogo
                      layoutId="main-logo"
                      size={window.innerWidth < 768 ? 60 : 180}
                      showText={false}
                      className="justify-center relative z-10 filter drop-shadow-[0_0_50px_rgba(220,38,38,0.5)] transform md:hover:scale-110 transition-all duration-700"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-6 md:mb-12"
          >
            <div className="flex flex-wrap justify-center gap-1 md:gap-4 px-2">
              {[
                { label: "Maida", status: "0%" },
                { label: "Palm Oil", status: "0%" },
                { label: "Artificial", status: "0%" },
                { label: "Sugar", status: "0%" },
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center group">
                  <div className="flex items-center gap-1.5 md:gap-2 bg-neutral-900 border border-white/5 px-2 md:px-5 py-1.5 md:py-3 rounded-md md:rounded-xl group-hover:border-red-600/50 transition-all duration-300">
                    <span className="text-[7px] md:text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
                      {item.label}
                    </span>
                    <div className="w-px h-2.5 bg-white/10" />
                    <span className="text-[9px] md:text-sm font-black text-red-600 italic tracking-tighter group-hover:animate-pulse">
                      {item.status}
                    </span>
                  </div>
                  <div className="h-1.5 w-[1px] bg-red-600/20 group-last:hidden" />
                </div>
              ))}
            </div>
            <div className="mt-3 text-[8px] font-black uppercase tracking-[0.4em] text-red-600/40 text-center animate-pulse">
              [ PURITY MANIFEST PROTOCOL ACTIVE ]
            </div>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-xs md:text-3xl text-white/50 max-w-2xl mx-auto mb-6 md:mb-10 font-medium leading-relaxed px-4 md:px-0"
          >
            Just{" "}
            <span className="text-white font-black italic underline decoration-red-600 underline-offset-8">
              Pure Performance Fuel
            </span>{" "}
            for your body.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col md:flex-row gap-2.5 justify-center px-10 md:px-0"
          >
            <Link
              to={user ? "/dashboard" : "/plans"}
              className="bg-red-600 hover:bg-red-700 text-white px-5 md:px-10 py-3 md:py-4 rounded-lg md:rounded-xl text-[10px] md:text-lg font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 group shadow-[0_4px_20px_rgba(220,38,38,0.4)]"
            >
              {user ? "Go To Dashboard" : "Start Your Plan"}{" "}
              <ChevronRight
                size={14}
                className="group-hover:translate-x-1 transition-transform md:w-5 md:h-5"
              />
            </Link>
            <Link
              to="/menu"
              className="border-2 border-white/20 hover:border-red-600 hover:bg-red-600/10 px-5 md:px-10 py-2.5 md:py-4 rounded-lg md:rounded-xl text-[10px] md:text-lg font-black uppercase tracking-widest transition-all"
            >
              View Menu
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Kinetic Slogan Ticker */}
      <div className="relative z-20 bg-red-600 border-y-4 md:border-y-8 border-black py-4 md:py-8 overflow-hidden select-none">
        <motion.div
          animate={{ x: [0, -2800] }}
          transition={{
            duration: 40,
            repeat: Infinity,
            ease: "linear",
          }}
          className="flex whitespace-nowrap gap-8 md:gap-16 items-center"
        >
          {[...Array(10)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 md:gap-16">
              <div className="flex items-center gap-4 md:gap-12">
                <span className="text-base md:text-8xl font-black italic uppercase tracking-tighter text-black flex items-center gap-1.5 md:gap-4">
                  Eat <span className="text-white">.</span>
                </span>
                <span className="text-base md:text-8xl font-black italic uppercase tracking-tighter text-black flex items-center gap-1.5 md:gap-4">
                  Train <span className="text-white">.</span>
                </span>
                <span className="text-base md:text-8xl font-black italic uppercase tracking-tighter text-black flex items-center gap-1.5 md:gap-4">
                  Repeat <span className="text-white">.</span>
                </span>
              </div>
              <div className="flex items-center gap-2 md:gap-4 bg-black px-3 md:px-8 py-1 md:py-2 transform -skew-x-12">
                <span className="text-[10px] md:text-6xl font-black italic uppercase tracking-tighter text-red-600">
                  With Alpino Protein Cafe
                </span>
                <Zap className="text-white fill-current md:w-6 md:h-6" size={12} />
              </div>
            </div>
          ))}
        </motion.div>

        {/* Decorative Overlay */}
        <div className="absolute inset-0 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 mix-blend-overlay" />
      </div>

      {/* About Section */}
      <section className="py-12 md:py-24 bg-white text-black relative">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="inline-block bg-red-600 text-white px-3 py-0.5 md:px-4 md:py-1 skew-x-[-10deg] mb-4 md:mb-6 font-bold uppercase tracking-widest text-[10px] md:text-sm"
              >
                The Alpino Way
              </motion.div>
              <h2 className="text-xl md:text-5xl font-black italic uppercase leading-tight mb-4 md:mb-6">
                Clean eating shouldn't be a{" "}
                <span className="text-red-600">struggle.</span>
              </h2>
              <div className="space-y-3 md:space-y-6 text-sm md:text-lg text-black/70">
                <p>
                  We believe that protein is the foundation of a healthy life,
                  but finding delicious, high-protein meals that are actually
                  healthy is hard.
                </p>
                <div className="grid grid-cols-2 gap-4 md:gap-6 pt-2 md:pt-4">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                    className="flex items-start gap-3"
                  >
                    <div className="bg-red-100 p-2 rounded-lg text-red-600">
                      <Zap size={20} />
                    </div>
                    <div>
                      <div className="font-bold uppercase text-sm">
                        High Protein
                      </div>
                      <div className="text-xs">30g+ protein in every bowl</div>
                    </div>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 }}
                    className="flex items-start gap-3"
                  >
                    <div className="bg-red-100 p-2 rounded-lg text-red-600">
                      <Target size={20} />
                    </div>
                    <div>
                      <div className="font-bold uppercase text-sm">
                        Zero Junk
                      </div>
                      <div className="text-xs">No refined sugar or oils</div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative"
            >
              <BowlCarousel />
              <div className="absolute -bottom-3 -right-3 md:-bottom-6 md:-right-6 bg-red-600 text-white p-4 md:p-8 rounded-xl md:rounded-2xl shadow-[0_10px_40px_rgba(220,38,38,0.4)] transform rotate-3 z-30">
                <div className="text-2xl md:text-4xl font-black">100%</div>
                <div className="uppercase font-bold tracking-widest text-[8px] md:text-sm text-white/80">
                  Nutritious
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Menu Section */}
      <section
        id="menu"
        className="py-10 md:py-24 bg-black overflow-hidden border-t border-white/5"
      >
        <div className="container mx-auto px-6 mb-8 md:mb-16 relative">
          <div className="absolute -top-24 -left-24 w-64 h-64 md:w-96 md:h-96 bg-red-600/10 blur-[120px] rounded-full" />
          <div className="relative z-10">
            <h2 className="text-xl md:text-8xl font-black italic uppercase tracking-tighter mb-2 leading-none text-white/5 absolute -top-1 md:-top-12 left-0 select-none">
              Performance
            </h2>
            <h2 className="text-xl md:text-7xl font-black italic uppercase tracking-tighter mb-2 relative">
              The <span className="text-red-600">Alpino</span> Menu
            </h2>
            <p className="text-white/40 text-[10px] md:text-lg uppercase tracking-[0.1em] md:tracking-[0.4em] font-bold max-w-xl">
              Scientifically formulated fuel.
              <span className="text-red-600 ml-2">Clean Ingredients Only.</span>
            </p>
          </div>
        </div>

        <div className="container mx-auto px-6">
          {/* Category Filter */}
          <div className="flex flex-wrap gap-1.5 md:gap-4 mb-8 md:mb-16 relative z-40">
            {["All", "Bowl", "Smoothies", "Shake", "Wrap"]
              .filter((cat) => {
                if (cat === "All") return true;
                return landingPageItems.some((item) => item.category === cat);
              })
              .map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    console.log("Category changed to:", cat);
                    setSelectedCategory(cat);
                  }}
                  className={`relative px-3.5 md:px-10 py-2 md:py-5 rounded-lg md:rounded-2xl text-[8px] md:text-sm font-black uppercase tracking-[0.1em] md:tracking-[0.4em] transition-all duration-300 cursor-pointer active:scale-95 group ${
                    selectedCategory === cat
                      ? "text-white"
                      : "text-white/40 hover:text-white"
                  }`}
                >
                  {/* Active Background Glitch Effect */}
                  {selectedCategory === cat && (
                    <motion.div
                      layoutId="active-cat-bg"
                      className="absolute inset-0 bg-red-600 rounded-lg md:rounded-2xl -z-10 shadow-[0_15px_40px_rgba(220,38,38,0.4)]"
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 30,
                      }}
                    />
                  )}
                  <span className="relative z-10 transition-transform duration-300 group-hover:translate-y-[-1px]">
                    {cat === "All"
                      ? "All"
                      : cat.endsWith("s")
                        ? cat
                        : `${cat}s`}
                  </span>

                  {/* Invisible stroke for hover stability */}
                  <div
                    className={`absolute inset-0 border-2 rounded-lg md:rounded-2xl transition-colors duration-300 ${
                      selectedCategory === cat
                        ? "border-red-600"
                        : "border-white/10 group-hover:border-white/20"
                    }`}
                  />
                </button>
              ))}
          </div>

          <div className="relative min-h-[600px]">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.div
                key={selectedCategory}
                initial={{
                  opacity: 0,
                  y: 30,
                  filter: "blur(10px)",
                  scale: 0.95,
                }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)", scale: 1 }}
                exit={{ opacity: 0, y: -30, filter: "blur(10px)", scale: 0.95 }}
                transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-x-3 md:gap-x-8 gap-y-6 md:gap-y-16"
              >
                {landingPageItems
                  .filter(
                    (item) =>
                      selectedCategory === "All" ||
                      item.category === selectedCategory,
                  )
                  .map((item, idx) => {
                    const bgUrl = item.bgImage || null;
                    const spinningUrl = item.spinningImage || null;

                    return (
                      <div
                        key={item.id}
                        className="group relative"
                        onClick={() =>
                          setTappedItemId(
                            tappedItemId === item.id ? null : item.id,
                          )
                        }
                      >
                        <motion.div
                          layout
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          whileHover="hover"
                          variants={{
                            initial: {},
                            animate: {},
                          }}
                        >
                          <motion.div
                            animate={
                              tappedItemId === item.id ? "hover" : undefined
                            }
                            variants={{
                              hover: {
                                y: -12,
                                transition: { duration: 0.4, ease: "easeOut" },
                              },
                            }}
                            className="relative z-10"
                          >
                            {/* Image Container Frame */}
                            <div
                              className={`relative aspect-square mb-3 md:mb-6 rounded-2xl md:rounded-3xl bg-neutral-900 border transition-all duration-500 shadow-2xl flex items-center justify-center overflow-hidden ${tappedItemId === item.id ? "border-red-600/30" : "border-white/5 group-hover:border-red-600/30"}`}
                            >
                              {/* Static Background Image layer - High Visibility */}
                              <div className="absolute inset-0 z-0">
                                {bgUrl ? (
                                  <img
                                    src={bgUrl}
                                    alt=""
                                    className={`w-full h-full object-cover transition-all duration-700 ${tappedItemId === item.id ? "opacity-100" : "opacity-90 group-hover:opacity-100"}`}
                                    referrerPolicy="no-referrer"
                                  />
                                ) : (
                                  <AssetImage
                                    assetName={item.name}
                                    fallbackUrl={
                                      item.image ||
                                      `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800`
                                    }
                                    alt=""
                                    className={`w-full h-full object-cover transition-all duration-700 ${tappedItemId === item.id ? "opacity-100" : "opacity-90 group-hover:opacity-100"}`}
                                  />
                                )}
                              </div>

                              {/* Subtle Glow on hover */}
                              <div
                                className={`absolute inset-0 bg-white/10 transition-opacity duration-500 blur-3xl z-10 ${tappedItemId === item.id ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
                              />

                              {/* Perfectly Cropped Bowl (Spinning) - Deep Crop & Tight Frame */}
                              <motion.div
                                className="relative w-[75%] h-[75%] rounded-full overflow-hidden border-[2px] md:border-[4px] border-white/70 shadow-[0_60px_120px_rgba(0,0,0,1)] z-20"
                                variants={{
                                  hover: {
                                    rotate:
                                      item.category === "Shake" ||
                                      item.category === "Smoothie"
                                        ? 0
                                        : 360,
                                    scale: 1.1,
                                    transition: {
                                      rotate: {
                                        duration:
                                          item.category === "Shake" ||
                                          item.category === "Smoothie"
                                            ? 0
                                            : 12,
                                        repeat:
                                          item.category === "Shake" ||
                                          item.category === "Smoothie"
                                            ? 0
                                            : Infinity,
                                        ease: "linear",
                                      },
                                      scale: {
                                        duration: 0.4,
                                        repeat:
                                          item.category === "Shake" ||
                                          item.category === "Smoothie"
                                            ? Infinity
                                            : 0,
                                        repeatType: "reverse",
                                      },
                                    },
                                  },
                                }}
                              >
                                {spinningUrl ? (
                                  <img
                                    src={spinningUrl}
                                    alt={item.name}
                                    className={`w-full h-full object-cover transform ${item.category === "Shake" || item.category === "Smoothie" ? "scale-105" : "scale-125"}`}
                                    referrerPolicy="no-referrer"
                                  />
                                ) : (
                                  <AssetImage
                                    assetName={item.name}
                                    fallbackUrl={
                                      item.image ||
                                      `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800`
                                    }
                                    alt={item.name}
                                    className={`w-full h-full object-cover transform ${item.category === "Shake" || item.category === "Smoothie" ? "scale-105" : "scale-125"}`}
                                  />
                                )}
                              </motion.div>

                              {/* Minimal Shadow Overlay for text depth */}
                              <div
                                className={`absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(0,0,0,0.4)_100%)] pointer-events-none z-30 transition-opacity ${tappedItemId === item.id ? "opacity-20" : "opacity-40 group-hover:opacity-20"}`}
                              />

                              {/* Floating Price */}
                              <div
                                className={`absolute bottom-3 right-3 md:bottom-6 md:right-6 bg-red-600 text-white px-2.5 py-1.5 md:px-4 md:py-2 rounded-lg md:rounded-xl font-black text-xs md:text-xl shadow-xl transform transition-transform z-40 ${tappedItemId === item.id ? "rotate-0" : "rotate-3 group-hover:rotate-0"}`}
                              >
                                ₹{item.price}
                              </div>

                              {/* Quick Nutrition Badges */}
                              <div className="absolute top-3 left-3 md:top-6 md:left-6 flex flex-col gap-2 z-40">
                                <div className="bg-white px-2 py-0.5 md:px-3 md:py-1 rounded-md md:rounded-lg border border-black/10 shadow-sm text-center">
                                  <span className="text-[7px] md:text-[10px] font-black uppercase text-red-600 tracking-tighter block leading-tight">
                                    Protein
                                  </span>
                                  <div className="text-[10px] md:text-sm font-black text-neutral-900 leading-tight">
                                    {item.protein}g
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Text Content */}
                            <div className="px-1 md:px-2">
                              <div className="flex items-center gap-1.5 md:gap-2 mb-1 md:mb-2">
                                <div className="w-5 md:w-8 h-px bg-red-600" />
                                <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-red-600">
                                  {item.category}
                                </span>
                              </div>
                              <h3
                                className={`text-sm md:text-2xl font-black italic uppercase tracking-tighter mb-1.5 md:mb-3 transition-colors line-clamp-1 ${tappedItemId === item.id ? "text-red-500" : "group-hover:text-red-500"}`}
                              >
                                {item.name}
                              </h3>
                              <p className="text-white/40 text-[10px] md:text-sm font-medium leading-relaxed mb-3 md:mb-6 line-clamp-1 md:line-clamp-2">
                                {item.description}
                              </p>

                              <div className="flex items-center justify-between">
                                <div className="flex gap-4">
                                  <div className="flex flex-col">
                                    <span className="text-[7px] md:text-[8px] font-bold uppercase text-white/30 tracking-widest">
                                      Energy
                                    </span>
                                    <span className="text-[9px] md:text-xs font-black text-white/80">
                                      {item.calories} kcal
                                    </span>
                                  </div>
                                </div>
                                <Link
                                  to={user ? "/dashboard" : "/login"}
                                  className={`p-2 md:p-3 rounded-lg md:rounded-xl transition-all border ${tappedItemId === item.id ? "bg-red-600 text-white border-red-600 translate-x-1" : "bg-white/5 hover:bg-red-600 hover:text-white border-white/5 hover:border-red-600 group-hover:translate-x-1"}`}
                                >
                                  <ChevronRight size={14} className="md:w-5 md:h-5" />
                                </Link>
                              </div>
                            </div>
                          </motion.div>
                        </motion.div>
                      </div>
                    );
                  })}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="mt-16 md:mt-24 relative">
            <div
              className="absolute inset-0 flex items-center"
              aria-hidden="true"
            >
              <div className="w-full border-t border-white/5"></div>
            </div>
            <div className="relative flex justify-center mx-4 md:mx-0">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-black px-6 md:px-12 border-2 border-red-600 rounded-xl md:rounded-2xl py-6 md:py-8 text-center max-w-2xl"
              >
                <h4 className="text-lg md:text-3xl font-black italic uppercase tracking-tighter mb-2 md:mb-4">
                  Want a Custom Meal Plan?
                </h4>
                <p className="text-white/50 text-xs md:text-base mb-4 md:mb-8 font-medium">
                  Join our PRO Plan for personalized macros, automated tracking,
                  and weekly nutrition consultations.
                </p>
                <Link
                  to="/plans"
                  className="inline-block bg-red-600 hover:bg-red-700 text-white px-5 md:px-8 py-2 md:py-3 rounded-lg md:rounded-xl font-black uppercase tracking-widest text-[10px] md:text-sm transition-all shadow-[0_0_20px_rgba(220,38,38,0.3)] hover:shadow-[0_0_30px_rgba(220,38,38,0.5)] transform hover:-translate-y-1"
                >
                  Get Started Now
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Plans Section */}
      <section id="plans" className="py-12 md:py-24 bg-neutral-900 overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="text-center mb-6 md:mb-16">
            <h2 className="text-2xl md:text-7xl font-black italic uppercase mb-3">
              Choose Your <span className="text-red-600">Routine</span>
            </h2>
            <div className="flex flex-wrap justify-center gap-2 md:gap-4 text-[9px] md:text-sm font-bold uppercase tracking-widest mb-6 md:mb-12">
              <span className="flex items-center gap-1 text-red-500">
                <Star size={12} className="md:w-3.5 md:h-3.5" fill="currentColor" /> Premium Ingredients
              </span>
              <span className="flex items-center gap-1 border-l border-white/10 pl-2 md:pl-4">
                <Clock size={12} className="md:w-3.5 md:h-3.5" /> Flexible Delivery
              </span>
            </div>
          </div>          <div className="grid md:grid-cols-2 gap-6 md:gap-8 max-w-5xl mx-auto">
            {/* Trial Plan */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              whileHover={{ y: -15, scale: 1.02 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="glass-card-light rounded-2xl md:rounded-[40px] p-5 md:p-10 flex flex-col relative overflow-hidden group/plan"
            >
              <motion.div className="absolute inset-0 bg-gradient-to-br from-red-600/5 via-transparent to-transparent opacity-0 group-hover/plan:opacity-100 transition-all duration-700 pointer-events-none" />
              {/* Animated Shimmer */}
              <motion.div
                className="absolute inset-0 w-[200%] h-full bg-gradient-to-r from-transparent via-red-600/[0.02] to-transparent -skew-x-45 pointer-events-none"
                animate={{ left: ["-100%", "200%"] }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "linear",
                  repeatDelay: 2,
                }}
              />
              {/* Corner Ribbon */}
              <div className="absolute top-0 right-0 w-24 h-24 md:w-32 md:h-32 overflow-hidden pointer-events-none z-10">
                <div className="absolute top-4 -right-8 md:top-6 md:-right-10 w-32 md:w-40 bg-neutral-200 text-neutral-700 font-black text-[8px] md:text-[10px] text-center py-1 md:py-1.5 uppercase tracking-widest rotate-45 shadow-sm">
                  Trial Plan
                </div>
              </div>
              <h3 className="text-xl md:text-3xl font-black italic uppercase mb-1.5 md:mb-2 text-neutral-800">
                Trial Plan
              </h3>
              <p className="text-neutral-500 text-xs md:text-base mb-4 md:mb-8 font-medium">
                5-Day Starter with fixed menu for testing.
              </p>

              <div className="flex-grow">
                {/* Removed inline mapped plans */}
              </div>

              <button
                type="button"
                onClick={() => setPlanModal('trial')}
                className="w-full bg-red-600 text-white py-3 md:py-4 rounded-lg md:rounded-xl font-black uppercase tracking-widest hover:bg-neutral-900 transition-all text-[10px] md:text-sm text-center relative z-10 cursor-pointer shadow-md hover:shadow-xl active:scale-95"
              >
                Choose Trial Plan
              </button>
            </motion.div>

            {/* Pro Plan */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              whileHover={{ y: -15, scale: 1.02 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="glass-card-red rounded-2xl md:rounded-[40px] p-5 md:p-10 flex flex-col relative overflow-hidden group/plan"
            >
              <motion.div className="absolute inset-0 bg-gradient-to-br from-white/25 via-transparent to-transparent opacity-0 group-hover/plan:opacity-100 transition-all duration-700 pointer-events-none" />
              <motion.div
                className="absolute inset-0 w-[200%] h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-45 pointer-events-none"
                animate={{ left: ["-100%", "200%"] }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "linear",
                  repeatDelay: 1,
                }}
              />
              {/* Corner Ribbon */}
              <div className="absolute top-0 right-0 w-24 h-24 md:w-32 md:h-32 overflow-hidden pointer-events-none z-10">
                <div className="absolute top-4 -right-8 md:top-6 md:-right-10 w-32 md:w-40 bg-white text-red-600 font-black text-[8px] md:text-[10px] text-center py-1 md:py-1.5 uppercase tracking-widest rotate-45 shadow-md">
                  Pro Plan
                </div>
              </div>
              <h3 className="text-xl md:text-3xl font-black italic uppercase mb-1.5 md:mb-2 relative z-10 text-white">
                Pro Plan
              </h3>
              <p className="text-white/95 text-xs md:text-lg mb-4 md:mb-8 font-medium relative z-10">
                20-Day Routine for dedicated athletes and busy professionals.
              </p>

              <div className="flex-grow">
                {/* Removed inline mapped plans */}
              </div>

              <button
                type="button"
                onClick={() => setPlanModal('pro')}
                className="w-full bg-white hover:bg-neutral-100 text-red-600 py-3 md:py-4 rounded-lg md:rounded-xl font-black uppercase tracking-widest transition-all text-[10px] md:text-sm text-center relative z-10 cursor-pointer shadow-md hover:shadow-xl active:scale-95"
              >
                Choose Pro Plan
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black py-12 border-t border-white/5">
        <div className="container mx-auto px-6 text-center">
          <div className="flex justify-center mb-6">
            <DynamicLogo size={32} />
          </div>
          <p className="text-white/40 max-w-md mx-auto mb-8 font-medium">
            Fueled by protein, driven by results. Join the revolution of clean
            eating.
          </p>
          <div className="flex justify-center gap-8 text-white/60 mb-8">
            <a
              href="#"
              className="hover:text-red-500 font-bold uppercase text-xs tracking-widest"
            >
              Instagram
            </a>
            <a
              href="#"
              className="hover:text-red-500 font-bold uppercase text-xs tracking-widest"
            >
              Twitter
            </a>
            <a
              href="#"
              className="hover:text-red-500 font-bold uppercase text-xs tracking-widest"
            >
              Facebook
            </a>
            <Link
              to={user ? "/dashboard" : "/login"}
              className="hover:text-red-500 font-bold uppercase text-xs tracking-widest"
            >
              {user ? "Dashboard" : "Admin Login"}
            </Link>
          </div>
          <div className="text-white/20 text-[10px] uppercase font-bold tracking-[0.2em]">
            © 2026 ALPINO PROTEIN CAFÉ. ALL RIGHTS RESERVED.
          </div>
        </div>
      </footer>
      {/* Plan Details Modal */}
      <AnimatePresence>
        {planModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPlanModal(null)}
              className="absolute inset-0 bg-black/75 backdrop-blur-sm cursor-pointer"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={`relative w-full max-w-lg rounded-3xl p-8 z-10 ${
                planModal === "trial"
                  ? "glass-card-light text-neutral-800"
                  : "glass-card-red text-white"
              }`}
            >
              <button
                type="button"
                onClick={() => setPlanModal(null)}
                className={`absolute top-4 right-4 w-8 h-8 flex items-center justify-center font-black text-xl hover:opacity-50 transition-opacity ${
                  planModal === "trial" ? "text-neutral-500" : "text-white"
                }`}
              >
                ✕
              </button>

              <h2 className="text-3xl font-black italic uppercase mb-2">
                {planModal === "trial" ? "Trial Plan Details" : "Pro Plan Details"}
              </h2>
              <p className={`mb-8 font-medium ${planModal === "trial" ? "text-neutral-500" : "text-white/80"}`}>
                {planModal === "trial"
                  ? "Select your preferred Trial configuration:"
                  : "Select your preferred Pro configuration:"}
              </p>

              <div className="space-y-4 mb-10">
                {PLANS.filter((p) => p.type === planModal).map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                       sessionStorage.setItem('plan_intent', p.id);
                       window.location.href = '/plans';
                    }}
                    className={`w-full flex justify-between items-center p-4 rounded-xl cursor-pointer hover:scale-[1.02] active:scale-95 transition-all ${
                      planModal === "trial"
                        ? "bg-white/60 border border-neutral-200 hover:border-red-600/30 hover:bg-neutral-100/80"
                        : "bg-white/10 border-2 border-white/5 shadow-lg hover:border-white/20 hover:bg-white/20"
                    }`}
                  >
                    <div className={`font-bold text-sm uppercase tracking-wide text-left ${planModal === "trial" ? "text-neutral-700" : "text-white"}`}>
                      {p.includes.join(" + ")}
                    </div>
                    <div className={`font-black text-xl flex items-center gap-3 ${planModal === "trial" ? "text-red-500" : "text-white"}`}>
                      ₹{p.price}
                      <span className={`text-[10px] uppercase tracking-widest px-3 py-1 rounded ${planModal === "trial" ? "bg-neutral-200 text-neutral-700" : "bg-white/20 text-white"}`}>Select</span>
                    </div>
                  </button>
                ))}
              </div>

              <div className="text-center opacity-50 text-[10px] uppercase tracking-widest font-black hidden">
                {/* Removed the generic Link below since they can choose above */}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      </motion.div>
    </div>
  );
}
