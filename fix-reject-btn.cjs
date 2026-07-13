const fs = require('fs');
let content = fs.readFileSync('src/pages/AdminDashboard.tsx', 'utf8');

content = content.replace(
  'className="flex-1 md:flex-none border border-neutral-200 hover:bg-red-600 hover:border-red-600 transition-all text-neutral-500 hover:text-white px-6 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest"',
  'className="flex-1 md:flex-none border-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-white transition-all px-6 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest"'
);

fs.writeFileSync('src/pages/AdminDashboard.tsx', content);
