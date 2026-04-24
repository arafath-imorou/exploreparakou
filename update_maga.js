const fs = require('fs');
let html = fs.readFileSync('c:\\Users\\HP\\Desktop\\ITA\\EXPLORE PARAKOU\\ExploreParakou\\tourisme.html', 'utf8');

const regex = /<img src="assets\/images\/STATUT HUBERT MAGA\.jpg"[\s\S]*?<div class="listing-actions">[\s\S]*?<a href="#" class="btn btn-primary"[\s\S]*?>Voir[\s\S]*?détails<\/a>/m;

const replacement = `<img src="assets/images/STATUT HUBERT MAGA.jpg" alt="Place Hubert Maga" class="listing-img">
                        <div class="listing-content">
                            <div class="listing-category">Site Historique</div>
                            <h3 class="card-title" style="font-size:1.25rem; margin-bottom:0.5rem;">Place Hubert Maga</h3>
                            <p style="color:#666; font-size:0.95rem;">Monument érigé à la gloire du premier président du Bénin indépendant.</p>
                            <div class="listing-actions">
                                <a href="tourisme-maga.html" class="btn btn-primary" style="padding:8px 20px; font-size:0.9rem;">Voir détails</a>`;

html = html.replace(regex, replacement);
fs.writeFileSync('c:\\Users\\HP\\Desktop\\ITA\\EXPLORE PARAKOU\\ExploreParakou\\tourisme.html', html);
console.log('done updating maga');
