const fs = require('fs');

let content = fs.readFileSync('src/pages/ProfileSetup.tsx', 'utf8');

// 1. Add dob and mealAddons to initial state
content = content.replace(
  /heardAboutUs: profile\?\.heardAboutUs \|\| '',/,
  "heardAboutUs: profile?.heardAboutUs || '',\n    dob: profile?.dob || '',\n    mealAddons: profile?.mealAddons || [],"
);

content = content.replace(
  /heardAboutUs: profile\.heardAboutUs \|\| '',/,
  "heardAboutUs: profile.heardAboutUs || '',\n        dob: profile.dob || '',\n        mealAddons: profile.mealAddons || [],"
);

// 2. Add dob and mealAddons to allowedKeys
content = content.replace(
  /'upgradeMeals', 'socialMediaFeature', 'fitnessTips', 'heardAboutUs', 'startDate'/,
  "'upgradeMeals', 'socialMediaFeature', 'fitnessTips', 'heardAboutUs', 'startDate', 'dob', 'mealAddons'"
);

// 3. Add DOB field in step 0 (Personal Info)
const dobField = `
                    <div className="relative group">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-red-500 transition-colors z-10" size={16} />
                      <input 
                        type="date" 
                        value={formData.dob || ''}
                        onChange={(e) => updateField('dob', e.target.value)}
                        className="w-full bg-neutral-50 border border-neutral-200 rounded-2xl py-4 pl-14 pr-5 font-bold text-sm uppercase tracking-widest text-neutral-900 focus:outline-none focus:border-red-500 transition-all placeholder:text-neutral-400"
                      />
                    </div>
`;
content = content.replace(
  /(<input[\s\S]*?updateField\('phone', e\.target\.value\)[\s\S]*?<\/div>)/,
  `$1${dobField}`
);

// Update step 0 validation
content = content.replace(
  /return !!\(formData\.name && formData\.phone && formData\.gender && formData\.occupation\);/,
  "return !!(formData.name && formData.phone && formData.dob && formData.gender && formData.occupation);"
);

// 4. In Step 4, replace the simple "upgradeMeals" Yes/No with Add-ons (Checkbox style)
const addonsHtml = `
                       <div className="flex flex-col gap-4">
                         <span className="text-xs font-bold uppercase tracking-widest text-neutral-700">Want to upgrade your meals?</span>
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                           {['Extra Protein Add-on', 'Peanut Butter Add-on', 'Creatine Add-on', 'Coconut Water Add-on'].map(addon => {
                             const isSelected = formData.mealAddons?.includes(addon);
                             return (
                               <button 
                                 key={addon} type="button" 
                                 onClick={() => {
                                   const current = formData.mealAddons || [];
                                   if (isSelected) {
                                     updateField('mealAddons', current.filter(a => a !== addon));
                                   } else {
                                     updateField('mealAddons', [...current, addon]);
                                   }
                                 }} 
                                 className={\`text-left p-4 rounded-xl text-xs font-bold uppercase tracking-widest transition-all \${isSelected ? 'bg-red-600 text-white' : 'bg-white border border-neutral-200 text-neutral-500 hover:border-red-500 hover:text-red-600'}\`}
                               >
                                 <div className="flex items-center justify-between">
                                   <span>{addon}</span>
                                   {isSelected && <CheckCircle2 size={16} />}
                                 </div>
                               </button>
                             );
                           })}
                         </div>
                       </div>
`;

content = content.replace(
  /<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">[\s\S]*?Want to upgrade your meals\?[\s\S]*?<\/div>\s*<\/div>/,
  addonsHtml
);

// 5. Add "Where did you hear about us?"
const hearAboutUsHtml = `
                       <div className="h-px bg-neutral-100 w-full" />
                       <div className="flex flex-col gap-4">
                         <span className="text-xs font-bold uppercase tracking-widest text-neutral-700">Where did you hear about us? *</span>
                         <div className="flex flex-wrap gap-2">
                           {['Instagram', 'Gym Partnership', 'Friend Referral', 'Walk-In', 'Google', 'Influencer', 'Other'].map(source => (
                             <button 
                               key={source} type="button" 
                               onClick={() => updateField('heardAboutUs', source)} 
                               className={\`py-2 px-4 rounded-lg text-xs font-bold uppercase tracking-widest transition-all \${formData.heardAboutUs === source ? 'bg-red-600 text-white' : 'bg-white border border-neutral-200 text-neutral-500 hover:border-neutral-300 hover:text-neutral-700 hover:bg-neutral-50'}\`}
                             >
                               {source}
                             </button>
                           ))}
                         </div>
                       </div>
`;

content = content.replace(
  /(<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">[\s\S]*?Would you like fitness & nutrition guidance\?[\s\S]*?<\/div>\s*<\/div>)/,
  `$1\n${hearAboutUsHtml}`
);

// 6. Add Subscription Terms
const termsHtml = `
                       <div className="h-px bg-neutral-100 w-full" />
                       <div className="flex flex-col gap-3">
                         <span className="text-xs font-bold uppercase tracking-widest text-neutral-700">Subscription Terms</span>
                         <div className="bg-neutral-50 p-4 rounded-xl text-[9px] md:text-[10px] text-neutral-500 font-medium uppercase tracking-wider space-y-2 border border-neutral-200">
                           <ul className="list-disc pl-4 space-y-1.5">
                             <li>Subscription validity starts from the activation date.</li>
                             <li>One redemption allowed per day unless specified.</li>
                             <li>Subscription is non-refundable and non-transferable.</li>
                             <li>Unused meals cannot be carried forward.</li>
                             <li>Add-ons are chargeable unless included in selected plan.</li>
                             <li>Management reserves the right to modify menu items based on availability.</li>
                             <li>Any misuse of the subscription may lead to cancellation.</li>
                             <li>Delivery charges may apply separately.</li>
                           </ul>
                         </div>
                         <button 
                            type="button"
                            onClick={() => setTermsAccepted(!termsAccepted)}
                            className={\`mt-2 p-3 rounded-xl border flex items-center gap-3 transition-all \${termsAccepted ? 'bg-green-50 border-green-500 text-green-700' : 'bg-white border-neutral-200 text-neutral-500 hover:bg-neutral-50'}\`}
                         >
                           <div className={\`w-5 h-5 rounded-md flex items-center justify-center border transition-all \${termsAccepted ? 'bg-green-500 border-green-500 text-white' : 'border-neutral-300'}\`}>
                             {termsAccepted && <CheckCircle2 size={14} />}
                           </div>
                           <span className="text-[10px] font-bold uppercase tracking-widest">I agree to the Subscription Terms</span>
                         </button>
                       </div>
`;

content = content.replace(
  /(<div className="p-6 rounded-2xl bg-white border border-neutral-200 space-y-4">[\s\S]*?)(<\/div>\s*<\/div>\s*)}/,
  `$1\n${termsHtml}\n$2}`
);

// update step 4 validation
content = content.replace(
  /case 4:\s*return true;/,
  "case 4:\n        return !!(formData.heardAboutUs && termsAccepted);"
);

// We need to import checkCircle2 and add termsAccepted state
content = content.replace(
  /const \[saving, setSaving\] = useState\(false\);/,
  "const [saving, setSaving] = useState(false);\n  const [termsAccepted, setTermsAccepted] = useState(false);"
);

fs.writeFileSync('src/pages/ProfileSetup.tsx', content);

