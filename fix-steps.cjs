const fs = require('fs');

let content = fs.readFileSync('src/pages/ProfileSetup.tsx', 'utf8');

const missingSteps = `
               {currentStep === 1 && (
                 <div className="space-y-4">
                    <div className="p-4 md:p-6 rounded-2xl bg-white border border-neutral-200">
                       <div className="text-[10px] md:text-xs text-neutral-500 font-black uppercase tracking-[0.2em] pl-2 mb-3">Primary Goal</div>
                       <div className="grid grid-cols-2 gap-2">
                          {['Weight Loss', 'Muscle Gain', 'Maintenance', 'Performance'].map(goal => (
                             <button
                               key={goal} type="button"
                               onClick={() => updateField('primaryGoal', goal)}
                               className={\`py-3 md:py-4 rounded-xl border transition-all \${
                                 formData.primaryGoal === goal
                                   ? 'bg-red-50 border-red-500 text-red-600'
                                   : 'bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                                }\`}
                             >
                               <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest">{goal}</span>
                             </button>
                          ))}
                       </div>
                    </div>
                    <div className="p-4 md:p-6 rounded-2xl bg-white border border-neutral-200">
                       <div className="text-[10px] md:text-xs text-neutral-500 font-black uppercase tracking-[0.2em] pl-2 mb-3">Workout Frequency</div>
                       <div className="flex gap-2">
                          {['0-2 days', '3-4 days', '5+ days'].map(freq => (
                             <button
                               key={freq} type="button"
                               onClick={() => updateField('workoutFrequency', freq)}
                               className={\`flex-1 py-4 rounded-2xl border transition-all \${
                                 formData.workoutFrequency === freq
                                   ? 'bg-red-50 border-red-500 text-red-600'
                                   : 'bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                                }\`}
                             >
                               <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest block text-center">{freq}</span>
                             </button>
                          ))}
                       </div>
                    </div>
                 </div>
               )}
               {currentStep === 2 && (
                 <div className="space-y-4">
                    <div className="p-4 md:p-6 rounded-2xl bg-white border border-neutral-200">
                       <div className="text-[10px] md:text-xs text-neutral-500 font-black uppercase tracking-[0.2em] pl-2 mb-3">Meal Preference</div>
                       <div className="grid grid-cols-2 gap-2">
                          {['Veg', 'Non-Veg', 'Eggetarian', 'Vegan'].map(pref => (
                             <button
                               key={pref} type="button"
                               onClick={() => updateField('mealPreference', pref)}
                               className={\`py-3 md:py-4 rounded-xl border transition-all \${
                                 formData.mealPreference === pref
                                   ? 'bg-red-50 border-red-500 text-red-600'
                                   : 'bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                                }\`}
                             >
                               <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest">{pref}</span>
                             </button>
                          ))}
                       </div>
                    </div>
                    <div className="p-4 md:p-6 rounded-2xl bg-white border border-neutral-200">
                       <div className="text-[10px] md:text-xs text-neutral-500 font-black uppercase tracking-[0.2em] pl-2 mb-3">Meal Types Included</div>
                       <div className="grid grid-cols-2 gap-2">
                          {['All Meals', 'Lunch & Dinner', 'Lunch Only', 'Dinner Only'].map(type => (
                             <button
                               key={type} type="button"
                               onClick={() => updateField('mealTypes', type)}
                               className={\`py-3 md:py-4 rounded-xl border transition-all \${
                                 formData.mealTypes === type
                                   ? 'bg-red-50 border-red-500 text-red-600'
                                   : 'bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                                }\`}
                             >
                               <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest">{type}</span>
                             </button>
                          ))}
                       </div>
                    </div>
                    <div className="relative group">
                        <Activity className="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-red-500 transition-colors z-10" size={18} />
                        <input 
                          type="text" 
                          placeholder="ANY FOOD ALLERGIES?"
                          value={formData.foodAllergies || ''}
                          onChange={(e) => updateField('foodAllergies', e.target.value)}
                          className="w-full bg-neutral-50 border border-neutral-200 rounded-xl py-3 px-4 pl-14 font-bold text-[10px] uppercase tracking-widest text-neutral-900 focus:outline-none focus:border-red-500 transition-all placeholder:text-neutral-400"
                        />
                    </div>
                 </div>
               )}
               {currentStep === 3 && (
                 <div className="space-y-4">
                    <div className="p-4 md:p-6 rounded-2xl bg-white border border-neutral-200">
                       <div className="text-[10px] text-neutral-500 font-black uppercase tracking-[0.2em] pl-2 mb-3">How to consume?</div>
                       <div className="flex gap-2">
                          {['Dine-in', 'Takeaway', 'Delivery'].map(method => (
                             <button
                               key={method} type="button"
                               onClick={() => updateField('consumptionMethod', method)}
                               className={\`flex-1 py-3 rounded-2xl border transition-all \${
                                 formData.consumptionMethod === method
                                   ? 'bg-red-50 border-red-500 text-red-600'
                                   : 'bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                                }\`}
                             >
                               <span className="text-[10px] font-bold uppercase tracking-widest block text-center">{method}</span>
                             </button>
                          ))}
                       </div>
                    </div>
                    <div className="relative group">
                      <MapPin className="absolute left-5 top-4 text-neutral-400 group-focus-within:text-red-500 transition-colors z-10" size={18} />
                      <textarea 
                        placeholder="DELIVERY ADDRESS"
                        rows={2}
                        value={formData.address || ''}
                        onChange={(e) => updateField('address', e.target.value)}
                        className="w-full bg-neutral-50 border border-neutral-200 rounded-2xl py-4 pl-14 pr-5 font-bold text-sm uppercase tracking-widest text-neutral-900 focus:outline-none focus:border-red-500 transition-all placeholder:text-neutral-400 resize-none"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                       <div className="relative group">
                         <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-red-500 transition-colors z-10" size={16} />
                         <input 
                             type="text" 
                             placeholder="TIME SLOT"
                            value={formData.preferredTimeSlot || ''}
                            onChange={(e) => updateField('preferredTimeSlot', e.target.value)}
                            className="w-full bg-neutral-50 border border-neutral-200 rounded-xl py-4 pl-12 pr-4 font-bold text-xs uppercase tracking-widest text-neutral-900 focus:outline-none focus:border-red-500 transition-all placeholder:text-neutral-400"
                          />
                       </div>
                       <div>
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
                       </div>
                    </div>
                 </div>
               )}
`;

content = content.replace(/(<\/div>\s*<\/div>\s*)}\s*\{currentStep === 4 && \(/, `$1}\n${missingSteps}\n               {currentStep === 4 && (`);

fs.writeFileSync('src/pages/ProfileSetup.tsx', content);

