import React, { useState } from 'react';
import { UserProfile } from '../types';
import { motion } from 'motion/react';
import { Search, ChevronDown, ChevronUp, User, Phone, MapPin, Activity, Calendar, Utensils } from 'lucide-react';

interface CustomerTableProps {
  users: UserProfile[];
  searchTerm: string;
}

type SortField = 'name' | 'email' | 'planStatus' | 'startDate';

export default function CustomerTable({ users, searchTerm }: CustomerTableProps) {
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredUsers = users
    .filter(u => u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || u.email?.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      let aVal = a[sortField] || '';
      let bVal = b[sortField] || '';
      
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return 0;
    });

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ChevronDown className="w-3 h-3 opacity-20" />;
    return sortDirection === 'asc' ? <ChevronUp className="w-3 h-3 text-red-600" /> : <ChevronDown className="w-3 h-3 text-red-600" />;
  };

  if (filteredUsers.length === 0) {
    return (
      <div className="bg-neutral-900/50 border border-white/5 p-12 rounded-[3rem] text-center">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">No users found.</p>
      </div>
    );
  }

  return (
    <div className="bg-neutral-900 border border-white/5 rounded-[2.5rem] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-black/50 border-b border-white/5">
              <th 
                className="px-6 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-white/40 cursor-pointer hover:text-white transition-colors group select-none"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center gap-2">Customer <SortIcon field="name" /></div>
              </th>
              <th 
                className="px-6 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-white/40 cursor-pointer hover:text-white transition-colors group select-none"
                onClick={() => handleSort('email')}
              >
                <div className="flex items-center gap-2">Contact <SortIcon field="email" /></div>
              </th>
              <th 
                className="px-6 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-white/40 cursor-pointer hover:text-white transition-colors group select-none hidden md:table-cell"
                onClick={() => handleSort('startDate')}
              >
                <div className="flex items-center gap-2">Start Date <SortIcon field="startDate" /></div>
              </th>
              <th 
                className="px-6 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-white/40 cursor-pointer hover:text-white transition-colors group select-none"
                onClick={() => handleSort('planStatus')}
              >
                <div className="flex items-center gap-2">Status <SortIcon field="planStatus" /></div>
              </th>
              <th className="px-6 py-5 text-right text-[9px] font-black uppercase tracking-[0.2em] text-white/40">
                Details
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredUsers.map(user => (
              <React.Fragment key={user.uid}>
                <tr className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-5">
                    <div className="font-bold text-sm uppercase tracking-widest text-white">{user.name || 'UNNAMED'}</div>
                    {user.phone && <div className="text-[10px] text-white/40 font-bold uppercase tracking-widest mt-1">TEL: {user.phone}</div>}
                  </td>
                  <td className="px-6 py-5">
                    <div className="text-xs text-white/70 font-bold tracking-wider">{user.email}</div>
                  </td>
                  <td className="px-6 py-5 hidden md:table-cell">
                    <div className="text-xs text-white/70 font-bold uppercase tracking-wider">{user.startDate || '-'}</div>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border ${
                      user.planStatus === 'active' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                      user.planStatus === 'pending' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                      'bg-white/5 text-white/60 border-white/10'
                    }`}>
                      {user.planStatus || 'NONE'}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <button 
                      onClick={() => setExpandedUserId(expandedUserId === user.uid ? null : user.uid)}
                      className="inline-flex items-center justify-center p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                    >
                      {expandedUserId === user.uid ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  </td>
                </tr>
                {expandedUserId === user.uid && (
                  <tr>
                    <td colSpan={5} className="p-0 border-b border-white/5">
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="bg-black/20 px-6 py-8"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                          {/* Profile Data */}
                          <div className="space-y-4">
                            <h4 className="text-[10px] font-black uppercase text-red-600 tracking-[0.2em] mb-4 flex items-center gap-2">
                              <User size={14} /> Profile Data
                            </h4>
                            {user.gender && (
                              <div>
                                <div className="text-[8px] font-black uppercase text-white/30 tracking-widest mb-1">Gender</div>
                                <div className="text-xs font-bold uppercase text-white/80">{user.gender}</div>
                              </div>
                            )}
                            {user.occupation && (
                              <div>
                                <div className="text-[8px] font-black uppercase text-white/30 tracking-widest mb-1">Occupation</div>
                                <div className="text-xs font-bold uppercase text-white/80">{user.occupation}</div>
                              </div>
                            )}
                            {user.address && (
                              <div>
                                <div className="text-[8px] font-black uppercase text-white/30 tracking-widest mb-1">Delivery Address</div>
                                <div className="text-xs font-bold uppercase text-white/80 leading-relaxed">{user.address}</div>
                              </div>
                            )}
                          </div>

                          {/* Fitness Goals */}
                          <div className="space-y-4">
                            <h4 className="text-[10px] font-black uppercase text-red-600 tracking-[0.2em] mb-4 flex items-center gap-2">
                              <Activity size={14} /> Fitness Goals
                            </h4>
                            {user.primaryGoal && (
                              <div>
                                <div className="text-[8px] font-black uppercase text-white/30 tracking-widest mb-1">Primary Goal</div>
                                <div className="text-xs font-bold uppercase text-white/80">{user.primaryGoal}</div>
                              </div>
                            )}
                            {user.workoutFrequency && (
                              <div>
                                <div className="text-[8px] font-black uppercase text-white/30 tracking-widest mb-1">Workout Freq</div>
                                <div className="text-xs font-bold uppercase text-white/80">{user.workoutFrequency}</div>
                              </div>
                            )}
                          </div>

                          {/* Meal Preferences */}
                          <div className="space-y-4">
                            <h4 className="text-[10px] font-black uppercase text-red-600 tracking-[0.2em] mb-4 flex items-center gap-2">
                              <Utensils size={14} /> Nutrition Setup
                            </h4>
                            {user.mealPreference && (
                              <div>
                                <div className="text-[8px] font-black uppercase text-white/30 tracking-widest mb-1">Preference</div>
                                <div className="text-xs font-bold uppercase text-white/80">{user.mealPreference}</div>
                              </div>
                            )}
                            {user.mealTypes && (
                              <div>
                                <div className="text-[8px] font-black uppercase text-white/30 tracking-widest mb-1">Meal Types</div>
                                <div className="text-xs font-bold uppercase text-white/80">{user.mealTypes}</div>
                              </div>
                            )}
                            {user.foodAllergies && (
                              <div>
                                <div className="text-[8px] font-black uppercase text-red-400/50 tracking-widest mb-1">Allergies</div>
                                <div className="text-xs font-bold uppercase text-red-400">{user.foodAllergies}</div>
                              </div>
                            )}
                            {user.consumptionMethod && (
                              <div>
                                <div className="text-[8px] font-black uppercase text-white/30 tracking-widest mb-1">Consumption</div>
                                <div className="text-xs font-bold uppercase text-white/80">{user.consumptionMethod}</div>
                              </div>
                            )}
                          </div>

                          {/* Logistics */}
                          <div className="space-y-4">
                            <h4 className="text-[10px] font-black uppercase text-red-600 tracking-[0.2em] mb-4 flex items-center gap-2">
                              <Calendar size={14} /> Preferences
                            </h4>
                            {user.preferredTimeSlot && (
                              <div>
                                <div className="text-[8px] font-black uppercase text-white/30 tracking-widest mb-1">Time Slot</div>
                                <div className="text-xs font-bold uppercase text-white/80">{user.preferredTimeSlot}</div>
                              </div>
                            )}
                            
                            <div className="pt-4 mt-2 border-t border-white/10 flex flex-wrap gap-2">
                              {user.upgradeMeals === 'Yes' && <span className="bg-white/10 text-white text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded border border-white/10">Upgrade: Yes</span>}
                              {user.socialMediaFeature === 'Yes' && <span className="bg-white/10 text-white text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded border border-white/10">Social: Yes</span>}
                              {user.fitnessTips === 'Yes' && <span className="bg-white/10 text-white text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded border border-white/10">Tips: Yes</span>}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
