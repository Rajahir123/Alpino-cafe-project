const fs = require('fs');

let content = fs.readFileSync('src/pages/ProfileSetup.tsx', 'utf8');

// The messed up part in step 0 looks like this:
// <div>
//   <label className="text-[10px] md:text-xs text-neutral-500 font-black uppercase tracking-[0.2em] pl-2 mb-2 block">Date of Birth</label>
//   <div>
//      <label className="text-[8px] md:text-[10px] text-neutral-500 font-black uppercase tracking-[0.2em] pl-2 mb-1 block">Start Date</label>
//      <div className="relative group">
//        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-red-500 transition-colors z-10" size={16} />
//        <input 
//            type="date" 
//            value={formData.startDate || ''}
//           onChange={(e) => updateField('startDate', e.target.value)}
//           className="w-full bg-neutral-50 border border-neutral-200 rounded-xl py-4 pl-12 pr-4 font-bold text-xs uppercase tracking-widest text-neutral-900 focus:outline-none focus:border-red-500 transition-all placeholder:text-neutral-400"
//         />
//      </div>
//    </div>
// </div>

const badBlockRegex = /<div>\s*<label[^>]*>Date of Birth<\/label>\s*<div>\s*<label[^>]*>Start Date<\/label>\s*<div className="relative group">\s*<Calendar[^>]*>\s*<input\s*type="date"\s*value=\{formData\.startDate \|\| ''\}[^>]*onChange=\{\(e\) => updateField\('startDate', e\.target\.value\)\}[^>]*\/>\s*<\/div>\s*<\/div>\s*<\/div>/;

const properDobBlock = `<div>
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
                    </div>`;

const properStartDateBlock = `<div>
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
                       </div>`;


content = content.replace(badBlockRegex, properDobBlock);

// Now we need to put startDate back into step 3. 
// Step 3 ends with preferredTimeSlot
const timeSlotRegex = /(<div className="relative group">\s*<Calendar[^>]*>\s*<input\s*type="text"\s*placeholder="TIME SLOT"[^>]*onChange=\{\(e\) => updateField\('preferredTimeSlot', e\.target\.value\)\}[^>]*\/>\s*<\/div>)/;

// Wait, let's look at step 3. It had a grid of 2 cols for preferredTimeSlot and startDate
const gridRegex = /<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">\s*(<div className="relative group">\s*<Calendar[^>]*>\s*<input\s*type="text"\s*placeholder="TIME SLOT"[^>]*updateField\('preferredTimeSlot'[^>]*>\s*<\/div>)\s*<\/div>/;

if (gridRegex.test(content)) {
    content = content.replace(gridRegex, `<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">\n                       $1\n                       ${properStartDateBlock}\n                    </div>`);
} else {
    // If we can't find the grid, just append it after time slot
    content = content.replace(timeSlotRegex, `$1\n${properStartDateBlock}`);
}

fs.writeFileSync('src/pages/ProfileSetup.tsx', content);

