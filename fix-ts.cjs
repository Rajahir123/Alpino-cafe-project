const fs = require('fs');
let content = fs.readFileSync('src/hooks/useAuth.ts', 'utf8');

content = content.replace(/let updates = \{\};/g, 'let updates: Partial<UserProfile> = {};');

fs.writeFileSync('src/hooks/useAuth.ts', content);
