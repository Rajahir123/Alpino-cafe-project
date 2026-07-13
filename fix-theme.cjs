const fs = require('fs');

function replaceColors(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Basic background and text color inversions
  content = content.replace(/bg-black/g, 'bg-white');
  content = content.replace(/bg-white\//g, 'bg-neutral-100/'); // handle bg-white/10
  content = content.replace(/bg-neutral-900/g, 'bg-neutral-100');
  content = content.replace(/border-white\//g, 'border-neutral-200/');
  content = content.replace(/border-white/g, 'border-neutral-200');
  content = content.replace(/text-white\//g, 'text-neutral-500/');
  content = content.replace(/text-white/g, 'text-neutral-900');
  
  // Fix specific buttons that have red backgrounds where text should be white
  content = content.replace(/bg-red-600(.*?)text-neutral-900/g, 'bg-red-600$1text-white');
  content = content.replace(/bg-red-700(.*?)text-neutral-900/g, 'bg-red-700$1text-white');
  content = content.replace(/bg-green-600(.*?)text-neutral-900/g, 'bg-green-600$1text-white');
  content = content.replace(/bg-green-700(.*?)text-neutral-900/g, 'bg-green-700$1text-white');
  
  // Fix hover states on red backgrounds
  content = content.replace(/hover:bg-red-600(.*?)hover:text-neutral-900/g, 'hover:bg-red-600$1hover:text-white');
  content = content.replace(/hover:bg-green-600(.*?)hover:text-neutral-900/g, 'hover:bg-green-600$1hover:text-white');

  // Any remaining explicit texts
  content = content.replace(/text-neutral-900 px-6 py-3/g, 'text-white px-6 py-3');

  // Fix some remaining oddities
  content = content.replace(/border-2 border-neutral-200 text-neutral-900/g, 'border-2 border-neutral-200 text-neutral-500');

  fs.writeFileSync(filePath, content);
}

replaceColors('src/pages/AdminDashboard.tsx');
replaceColors('src/pages/UserDashboard.tsx');
replaceColors('src/pages/KitchenDashboard.tsx');

