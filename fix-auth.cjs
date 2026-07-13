const fs = require('fs');
let content = fs.readFileSync('src/hooks/useAuth.ts', 'utf8');

content = content.replace(
`            // Special case for initial admin
            if (firebaseUser.email && ['denyteny123@gmail.com', 'yuvraj.gurjar.ai@gmail.com'].includes(firebaseUser.email)) {
              newProfile.role = 'admin';
            }`,
`            // Special case for initial admin
            if (firebaseUser.email && ['denyteny123@gmail.com', 'yuvraj.gurjar.ai@gmail.com'].includes(firebaseUser.email)) {
              newProfile.role = 'admin';
              newProfile.planStatus = 'active';
              newProfile.planId = 'muscle_gain_pro';
              newProfile.daysRemaining = 30;
              newProfile.phone = 'Admin';
              newProfile.address = 'Admin HQ';
            }`
);

content = content.replace(
`            // Force admin for specific email even if document already exists
            if (firebaseUser.email && ['denyteny123@gmail.com', 'yuvraj.gurjar.ai@gmail.com'].includes(firebaseUser.email) && data.role !== 'admin') {
              data.role = 'admin';
              await setDoc(userRef, { role: 'admin' }, { merge: true });
            }`,
`            // Force admin for specific email even if document already exists
            if (firebaseUser.email && ['denyteny123@gmail.com', 'yuvraj.gurjar.ai@gmail.com'].includes(firebaseUser.email)) {
              let updates = {};
              if (data.role !== 'admin') {
                data.role = 'admin';
                updates.role = 'admin';
              }
              if (!data.phone || !data.address || data.planStatus === 'none' || data.planStatus === 'pending') {
                data.planStatus = 'active';
                data.planId = data.planId || 'muscle_gain_pro';
                data.daysRemaining = Math.max(data.daysRemaining || 0, 30);
                data.phone = data.phone || 'Admin';
                data.address = data.address || 'Admin HQ';
                
                updates.planStatus = data.planStatus;
                updates.planId = data.planId;
                updates.daysRemaining = data.daysRemaining;
                updates.phone = data.phone;
                updates.address = data.address;
              }
              if (Object.keys(updates).length > 0) {
                await setDoc(userRef, updates, { merge: true });
              }
            }`
);

fs.writeFileSync('src/hooks/useAuth.ts', content);
