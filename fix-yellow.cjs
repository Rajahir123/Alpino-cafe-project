const fs = require('fs');

function replaceYellow(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace Zaps and some specific badges with yellow
  content = content.replace(/<Zap(.*?)text-red-600/g, '<Zap$1text-yellow-500');
  content = content.replace(/<Star(.*?)text-red-600/g, '<Star$1text-yellow-500');
  content = content.replace(/<ShieldCheck(.*?)text-red-600/g, '<ShieldCheck$1text-yellow-500');
  content = content.replace(/text-red-600(.*?)Zap/g, 'text-yellow-500$1Zap');
  content = content.replace(/text-red-600(.*?)Star/g, 'text-yellow-500$1Star');
  content = content.replace(/text-red-600(.*?)ShieldCheck/g, 'text-yellow-500$1ShieldCheck');

  // Any text containing "Active" can have yellow highlight
  content = content.replace(/text-red-600(.*?)Protocol: Active/g, 'text-yellow-500$1Protocol: Active');
  content = content.replace(/text-red-600(.*?)Integrity Protocol Active/g, 'text-yellow-500$1Integrity Protocol Active');

  // Some borders
  content = content.replace(/border-red-600\/30/g, 'border-yellow-500/30');

  // Small background highlights that are just text-red-600 can be text-yellow-500 when it's a touchup
  // E.g., The little active dots
  content = content.replace(/bg-red-500(.*?)animate-pulse/g, 'bg-yellow-500$1animate-pulse');

  fs.writeFileSync(filePath, content);
}

replaceYellow('src/pages/AdminDashboard.tsx');
replaceYellow('src/pages/UserDashboard.tsx');
replaceYellow('src/pages/KitchenDashboard.tsx');

