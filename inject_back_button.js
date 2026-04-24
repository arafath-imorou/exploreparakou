const fs = require('fs');
const path = require('path');
const files = ['talent-djangoun.html', 'tourisme-arzeke.html', 'tourisme-bioguerra.html', 'tourisme-maga.html', 'tourisme-musee.html'];
const btn = `
                <a href="javascript:history.back()" style="display:inline-flex; align-items:center; gap:8px; color:#666; text-decoration:none; margin-bottom:20px; font-weight:600; font-size:1.05rem; transition:color 0.3s;" onmouseover="this.style.color='var(--color-primary)'" onmouseout="this.style.color='#666'"><i class="ph ph-arrow-left"></i> Retour</a>`;

files.forEach(file => {
    const p = path.join('c:\\Users\\HP\\Desktop\\ITA\\EXPLORE PARAKOU\\ExploreParakou', file);
    if (fs.existsSync(p)) {
        let html = fs.readFileSync(p, 'utf8');
        const regex = /(<section class="section"[^>]*>\s*<div class="container">)/;
        if (html.includes('<i class="ph ph-arrow-left"></i> Retour</a>')) {
            console.log('Already has back button: ' + file);
        } else {
            html = html.replace(regex, `$1${btn}`);
            fs.writeFileSync(p, html);
            console.log('Injected back button in: ' + file);
        }
    }
});
