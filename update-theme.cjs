const fs = require('fs');
let content = fs.readFileSync('src/pages/ProfileSetup.tsx', 'utf8');

// Container
content = content.replace(/bg-neutral-900/g, 'bg-white');
content = content.replace(/bg-neutral-950\/80/g, 'bg-white/95');

// Text colors
content = content.replace(/text-white\/80/g, 'text-neutral-700');
content = content.replace(/text-white\/60/g, 'text-neutral-600');
content = content.replace(/text-white\/50/g, 'text-neutral-500');
content = content.replace(/text-white\/40/g, 'text-neutral-400');
content = content.replace(/text-white\/30/g, 'text-neutral-300');
content = content.replace(/text-white/g, 'text-neutral-900');
content = content.replace(/text-neutral-900\/10/g, 'text-neutral-200');

// Placeholder
content = content.replace(/placeholder:text-neutral-900\/30/g, 'placeholder:text-neutral-400');

// Borders
content = content.replace(/border-neutral-900\/10/g, 'border-neutral-200');

// Backgrounds
content = content.replace(/bg-neutral-900\/5/g, 'bg-neutral-50');
content = content.replace(/bg-neutral-900\/10/g, 'bg-neutral-100');
content = content.replace(/bg-neutral-900\/20/g, 'bg-neutral-200');
content = content.replace(/bg-neutral-900\/40/g, 'bg-neutral-400');
content = content.replace(/hover:bg-neutral-900\/10/g, 'hover:bg-neutral-100');
content = content.replace(/hover:bg-neutral-900\/20/g, 'hover:bg-neutral-200');

// Fixes
content = content.replace(/bg-red-600 text-neutral-900/g, 'bg-red-600 text-white'); // Buttons with red background should have white text
content = content.replace(/border-white\/10/g, 'border-neutral-200');
content = content.replace(/bg-white\/5/g, 'bg-white');
content = content.replace(/bg-white\/10/g, 'bg-neutral-100');
content = content.replace(/bg-white\/20/g, 'bg-neutral-200');
content = content.replace(/bg-white\/40/g, 'bg-neutral-400');
content = content.replace(/hover:bg-white\/10/g, 'hover:bg-neutral-50');
content = content.replace(/hover:bg-white\/20/g, 'hover:bg-neutral-100');

// Additional fixes for the background glows
content = content.replace(/bg-red-600\/20/g, 'bg-red-500/10');
content = content.replace(/bg-yellow-500\/10/g, 'bg-yellow-400/20');
content = content.replace(/mix-blend-screen/g, 'mix-blend-multiply');

fs.writeFileSync('src/pages/ProfileSetup.tsx', content);
