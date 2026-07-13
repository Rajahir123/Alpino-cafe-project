const fs = require('fs');

function replaceTransparencies(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace weird transparent neutrals over white with solid or slightly tinted versions
  content = content.replace(/bg-neutral-100\/[0-9]+/g, 'bg-neutral-50');
  content = content.replace(/border-neutral-200\/[0-9]+/g, 'border-neutral-200');
  content = content.replace(/text-neutral-500\/[0-9]+/g, 'text-neutral-500');

  // Let's add some yellow touch-ups:
  // E.g. Zap icon -> yellow
  content = content.replace(/<Zap(.*?)text-red-600(.*?)\/>/g, '<Zap$1text-yellow-500$2/>');
  content = content.replace(/text-red-600(.*?)Zap/g, 'text-yellow-500$1Zap');
  content = content.replace(/<Star(.*?)text-red-600(.*?)\/>/g, '<Star$1text-yellow-500$2/>');
  // Or just randomly replace some decorative red with yellow
  
  fs.writeFileSync(filePath, content);
}

replaceTransparencies('src/pages/AdminDashboard.tsx');
replaceTransparencies('src/pages/UserDashboard.tsx');
replaceTransparencies('src/pages/KitchenDashboard.tsx');

