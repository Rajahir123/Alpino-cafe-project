const fs = require('fs');
let content = fs.readFileSync('src/pages/ProfileSetup.tsx', 'utf8');

content = content.replace(/bg-red-600\/10 border-red-500 text-neutral-900/g, 'bg-red-50 border-red-500 text-red-600');
content = content.replace(/hover:bg-neutral-100/g, 'hover:bg-neutral-50');
content = content.replace(/bg-neutral-100 text-neutral-500/g, 'bg-white border border-neutral-200 text-neutral-500 hover:border-neutral-300 hover:text-neutral-700');

fs.writeFileSync('src/pages/ProfileSetup.tsx', content);
