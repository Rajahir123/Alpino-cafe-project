const fs = require('fs');
let content = fs.readFileSync('src/pages/ProfileSetup.tsx', 'utf8');

content = content.replace(/placeholder:text-neutral-300/g, 'placeholder:text-neutral-400');
content = content.replace(/className="w-full bg-white border border-neutral-200/g, 'className="w-full bg-neutral-50 border border-neutral-200');
content = content.replace(/focus:bg-neutral-100/g, 'focus:bg-white');
content = content.replace(/className="flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all \$\{formData\.gender === g \? 'bg-red-600 text-white' : 'bg-white/g, 'className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${formData.gender === g ? \'bg-red-600 text-white\' : \'bg-neutral-50');

// Fix buttons hover border
content = content.replace(/hover:border-red-500\/50/g, 'hover:border-red-500');

fs.writeFileSync('src/pages/ProfileSetup.tsx', content);
