const fs = require('fs');

let content = fs.readFileSync('src/pages/LandingPage.tsx', 'utf8');

const oldStyle = `style={{
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
        }}`;

const newStyle = `style={{
          background: scrolled 
            ? "linear-gradient(135deg, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0.2) 100%)"
            : "linear-gradient(135deg, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.05) 100%)",
          backdropFilter: "blur(24px) saturate(160%)",
          WebkitBackdropFilter: "blur(24px) saturate(160%)",
          border: "1px solid rgba(255, 255, 255, 0.5)",
          borderTop: "1px solid rgba(255, 255, 255, 0.8)",
          borderBottom: scrolled ? "1px solid rgba(255, 255, 255, 0.2)" : "1px solid rgba(255, 255, 255, 0.3)",
          boxShadow: scrolled
           ? "0 8px 32px 0 rgba(31, 38, 135, 0.15), inset 0 1px 2px rgba(255, 255, 255, 0.9)"
           : "0 8px 32px 0 rgba(31, 38, 135, 0.07), inset 0 1px 1px rgba(255, 255, 255, 0.5)",
        }}`;

content = content.replace(oldStyle, newStyle);

fs.writeFileSync('src/pages/LandingPage.tsx', content);
