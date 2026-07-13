const fs = require('fs');

function replaceColors(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Basic background and text color inversions
  content = content.replace(/bg-black/g, 'bg-white');
  content = content.replace(/bg-white\//g, 'bg-neutral-100/');
  content = content.replace(/bg-neutral-900/g, 'bg-neutral-100');
  content = content.replace(/border-white\//g, 'border-neutral-200/');
  content = content.replace(/border-white/g, 'border-neutral-200');
  content = content.replace(/text-white\//g, 'text-neutral-500/');
  content = content.replace(/text-white/g, 'text-neutral-900');
  
  content = content.replace(/bg-red-600(.*?)text-neutral-900/g, 'bg-red-600$1text-white');
  content = content.replace(/bg-red-700(.*?)text-neutral-900/g, 'bg-red-700$1text-white');
  content = content.replace(/bg-green-600(.*?)text-neutral-900/g, 'bg-green-600$1text-white');
  content = content.replace(/bg-green-700(.*?)text-neutral-900/g, 'bg-green-700$1text-white');
  
  content = content.replace(/hover:bg-red-600(.*?)hover:text-neutral-900/g, 'hover:bg-red-600$1hover:text-white');
  content = content.replace(/hover:bg-green-600(.*?)hover:text-neutral-900/g, 'hover:bg-green-600$1hover:text-white');

  content = content.replace(/text-neutral-900 px-6 py-3/g, 'text-white px-6 py-3');
  content = content.replace(/border-2 border-neutral-200 text-neutral-900/g, 'border-2 border-neutral-200 text-neutral-500');
  content = content.replace(/bg-neutral-100\/[0-9]+/g, 'bg-neutral-50');
  content = content.replace(/border-neutral-200\/[0-9]+/g, 'border-neutral-200');
  content = content.replace(/text-neutral-500\/[0-9]+/g, 'text-neutral-500');

  // Yellow
  content = content.replace(/<Zap(.*?)text-red-600/g, '<Zap$1text-yellow-500');
  content = content.replace(/<Star(.*?)text-red-600/g, '<Star$1text-yellow-500');
  content = content.replace(/<ShieldCheck(.*?)text-red-600/g, '<ShieldCheck$1text-yellow-500');
  content = content.replace(/text-red-600(.*?)Zap/g, 'text-yellow-500$1Zap');
  content = content.replace(/text-red-600(.*?)Star/g, 'text-yellow-500$1Star');
  content = content.replace(/text-red-600(.*?)ShieldCheck/g, 'text-yellow-500$1ShieldCheck');

  fs.writeFileSync(filePath, content);
}

replaceColors('src/pages/PlanSelection.tsx');
replaceColors('src/pages/PaymentPage.tsx');

