const fs = require('fs');

let content = fs.readFileSync('src/pages/LandingPage.tsx', 'utf8');

// The file currently has <motion.nav ... style={{...}} \n      >\n        className=...
// I need to find the `<motion.nav` block and extract only the children

const startTagRegex = /<motion\.nav[\s\S]*?\}\}\s*>/g;

let matches = content.match(startTagRegex);
if (matches) {
    let startTag = matches[0];
    
    // Now we need to remove the old attributes that were accidentally placed as text
    // They look like:
    //         className={`fixed top-3 ...`}
    //         style={{...}}
    //       >
    
    // So let's match from the end of startTag to the first >
    let afterStartTag = content.indexOf(startTag) + startTag.length;
    let nextContent = content.substring(afterStartTag);
    
    // Find the first ">" which belongs to the original <nav> tag
    let originalCloseBracket = nextContent.indexOf('>');
    
    if (originalCloseBracket !== -1) {
        let textToRemove = nextContent.substring(0, originalCloseBracket + 1);
        
        let newContent = content.substring(0, afterStartTag) + nextContent.substring(originalCloseBracket + 1);
        fs.writeFileSync('src/pages/LandingPage.tsx', newContent);
    }
}
