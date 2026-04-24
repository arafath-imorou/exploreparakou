const fs = require('fs');
const files = fs.readdirSync('.').filter(f => f.endsWith('.html') && f !== 'admin.html');

for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');

    // Skip if already added
    if (content.includes('Espace Admin') || content.includes('Accès Admin')) {
        console.log(`Skipping ${file}, already contains link.`);
        continue;
    }

    // Replace copyright with copyright + link
    const newContent = content.replace(
        /(&copy;\s*202\d\s*Explore Parakou\.)/g,
        '$1 <a href="admin.html" style="color:var(--color-primary); text-decoration:none; margin-left:1rem; font-weight:bold;"><i class="ph ph-lock-key"></i> Accès Admin</a>'
    );

    if (newContent !== content) {
        fs.writeFileSync(file, newContent);
        console.log("Updated", file);
    } else {
        console.log("No match found in", file);
    }
}
