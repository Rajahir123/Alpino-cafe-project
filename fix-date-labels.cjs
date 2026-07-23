const fs = require('fs');

let content = fs.readFileSync('src/pages/ProfileSetup.tsx', 'utf8');

// Add label for dob
content = content.replace(
  /<div className="relative group">\s*<Calendar[\s\S]*?type="date"\s*value=\{formData\.dob \|\| ''\}[\s\S]*?<\/div>/,
  `<div>
                      <label className="text-[10px] md:text-xs text-neutral-500 font-black uppercase tracking-[0.2em] pl-2 mb-2 block">Date of Birth</label>
                      <div className="relative group">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-red-500 transition-colors z-10" size={16} />
                        <input 
                          type="date" 
                          value={formData.dob || ''}
                          onChange={(e) => updateField('dob', e.target.value)}
                          className="w-full bg-neutral-50 border border-neutral-200 rounded-2xl py-4 pl-14 pr-5 font-bold text-sm uppercase tracking-widest text-neutral-900 focus:outline-none focus:border-red-500 transition-all placeholder:text-neutral-400"
                        />
                      </div>
                    </div>`
);

// Add label for startDate
content = content.replace(
  /<div className="relative group">\s*<Calendar[\s\S]*?type="date"\s*value=\{formData\.startDate \|\| ''\}[\s\S]*?<\/div>/,
  `<div>
                         <label className="text-[8px] md:text-[10px] text-neutral-500 font-black uppercase tracking-[0.2em] pl-2 mb-1 block">Start Date</label>
                         <div className="relative group">
                           <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-red-500 transition-colors z-10" size={16} />
                           <input 
                               type="date" 
                               value={formData.startDate || ''}
                              onChange={(e) => updateField('startDate', e.target.value)}
                              className="w-full bg-neutral-50 border border-neutral-200 rounded-xl py-4 pl-12 pr-4 font-bold text-xs uppercase tracking-widest text-neutral-900 focus:outline-none focus:border-red-500 transition-all placeholder:text-neutral-400"
                            />
                         </div>
                       </div>`
);

fs.writeFileSync('src/pages/ProfileSetup.tsx', content);

