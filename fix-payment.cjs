const fs = require('fs');

let content = fs.readFileSync('src/pages/PaymentPage.tsx', 'utf8');

content = content.replace(/if \(!profile \|\| !transactionId\) return;/g, 'if (!profile || !screenshotUrl) return;');

content = content.replace(/disabled=\{!transactionId \|\| !screenshotUrl \|\| uploading\}/g, 'disabled={!screenshotUrl || uploading}');

content = content.replace(/transactionId && screenshotUrl \? 'bg-red-600 hover:bg-red-700 text-white shadow-red-600\/20'/g, 'screenshotUrl ? \'bg-red-600 hover:bg-red-700 text-white shadow-red-600/20\'');

// Also update the input placeholder or label to indicate it's optional?
content = content.replace(/>Transaction ID \/ Reference No\.<\/label>/g, '>Transaction ID / Reference No. (Optional)</label>');

fs.writeFileSync('src/pages/PaymentPage.tsx', content);
