const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(/<Route path="\/plans" element=\{user \? \(profile\?\.role === 'admin' \? <Navigate to="\/admin" \/> : profile\?\.role === 'kitchen' \? <Navigate to="\/kitchen" \/> : <PlanSelection \/>\) : <Navigate to="\/login" \/>\} \/>/, '<Route path="/plans" element={user ? (profile?.role === \'kitchen\' ? <Navigate to="/kitchen" /> : <PlanSelection />) : <Navigate to="/login" />} />');

content = content.replace(/<Route path="\/payment" element=\{user \? \(profile\?\.role === 'admin' \? <Navigate to="\/admin" \/> : profile\?\.role === 'kitchen' \? <Navigate to="\/kitchen" \/> : <PaymentPage \/>\) : <Navigate to="\/login" \/>\} \/>/, '<Route path="/payment" element={user ? (profile?.role === \'kitchen\' ? <Navigate to="/kitchen" /> : <PaymentPage />) : <Navigate to="/login" />} />');

content = content.replace(/<Route path="\/setup" element=\{user \? \(profile\?\.role === 'admin' \? <Navigate to="\/admin" \/> : profile\?\.role === 'kitchen' \? <Navigate to="\/kitchen" \/> : <ProfileSetup \/>\) : <Navigate to="\/login" \/>\} \/>/, '<Route path="/setup" element={user ? (profile?.role === \'kitchen\' ? <Navigate to="/kitchen" /> : <ProfileSetup />) : <Navigate to="/login" />} />');

fs.writeFileSync('src/App.tsx', content);
