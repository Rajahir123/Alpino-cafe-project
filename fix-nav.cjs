const fs = require('fs');

let content = fs.readFileSync('src/pages/LandingPage.tsx', 'utf8');

// Replace <nav ...> with <motion.nav ...>
content = content.replace(
  /<nav([\s\S]*?)<\/nav>/g,
  (match, inner) => {
    return `<motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className={\`fixed top-4 left-1/2 -translate-x-1/2 w-[calc(100%-1.5rem)] md:w-[calc(100%-3rem)] max-w-7xl z-50 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] px-5 md:px-8 flex justify-between items-center overflow-hidden rounded-3xl md:rounded-full \${
          scrolled ? "py-2 md:py-3 shadow-2xl" : "py-4 md:py-6"
        }\`}
        style={{
          background: scrolled 
            ? "linear-gradient(135deg, rgba(255, 255, 255, 0.85) 0%, rgba(245, 245, 245, 0.7) 100%)"
            : "linear-gradient(135deg, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0.3) 100%)",
          backdropFilter: "blur(40px) saturate(200%)",
          WebkitBackdropFilter: "blur(40px) saturate(200%)",
          border: "1px solid rgba(255, 255, 255, 0.6)",
          borderTop: "1px solid rgba(255, 255, 255, 0.9)",
          borderBottom: scrolled ? "1px solid rgba(200, 200, 200, 0.3)" : "1px solid rgba(255, 255, 255, 0.4)",
          boxShadow: scrolled
           ? "0 20px 40px -10px rgba(0, 0, 0, 0.1), inset 0 1px 2px rgba(255, 255, 255, 0.9), inset 0 -1px 2px rgba(0,0,0,0.05)"
           : "0 10px 30px -10px rgba(0, 0, 0, 0.05), inset 0 1px 1px rgba(255, 255, 255, 0.8)",
        }}
      >${inner.replace('className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none"', 'className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none mix-blend-overlay opacity-70"')}</motion.nav>`;
  }
);

fs.writeFileSync('src/pages/LandingPage.tsx', content);

