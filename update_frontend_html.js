const fs = require('fs');
const path = require('path');

const tourismePath = path.join(__dirname, 'tourisme.html');
const culturePath = path.join(__dirname, 'culture.html');

let tHtml = fs.readFileSync(tourismePath, 'utf8');
let cHtml = fs.readFileSync(culturePath, 'utf8');

// For tourisme.html
tHtml = tHtml.replace(/<div class="cards-grid" style="grid-template-columns: repeat\(auto-fit, minmax\(280px, 1fr\)\); gap:2rem;">([\s\S]*?)<\/div>/g, '<div class="cards-grid dynamic-grid" style="grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap:2rem;"><p>Chargement...</p></div>');

if (!tHtml.includes('supabaseClient.js')) {
    tHtml = tHtml.replace('</body>', `    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
    <script src="assets/js/supabaseClient.js"></script>
    <script>
    document.addEventListener('DOMContentLoaded', async () => {
        const grids = document.querySelectorAll('.dynamic-grid');
        const visiterGrid = grids[0];
        const sejournerGrid = grids[1];
        
        const { data, error } = await window.supabase.from('tourisme').select('*').order('created_at', { ascending: false });
        if(error) {
            if(visiterGrid) visiterGrid.innerHTML = '<p>Erreur.</p>';
            if(sejournerGrid) sejournerGrid.innerHTML = '<p>Erreur.</p>';
            return;
        }
        
        if(visiterGrid) visiterGrid.innerHTML = '';
        if(sejournerGrid) sejournerGrid.innerHTML = '';

        data.forEach(item => {
            const card = \`
                <div class="listing-card">
                    <img src="\${item.image_url}" alt="\${item.title}" class="listing-img" style="object-position: center; object-fit: cover;">
                    <div class="listing-content">
                        <div class="listing-category">\${item.category}</div>
                        <h3 class="card-title" style="font-size:1.25rem; margin-bottom:0.5rem;">\${item.title}</h3>
                        <p style="color:#666; font-size:0.95rem;">\${item.description}</p>
                        <div class="listing-actions">
                            <a href="\${item.link_details || '#'}" class="btn btn-primary" style="padding:8px 20px; font-size:0.9rem;">Voir détails</a>
                            <a href="\${item.link_map || '#'}" target="_blank" class="action-icon" title="Itinéraire"><i class="ph ph-map-pin"></i></a>
                        </div>
                    </div>
                </div>
            \`;
            
            if (item.category.toLowerCase().includes('hôtel') || item.category.toLowerCase().includes('hotel') || item.category.toLowerCase().includes('restaurant') || item.category.toLowerCase().includes('resto')) {
                if(sejournerGrid) sejournerGrid.innerHTML += card;
                else visiterGrid.innerHTML += card;
            } else {
                if(visiterGrid) visiterGrid.innerHTML += card;
            }
        });
    });
    </script>
</body>`);
}
fs.writeFileSync(tourismePath, tHtml);

// For culture.html
cHtml = cHtml.replace(/<div class="categories-scroll-container">([\s\S]*?)<\/div>\s*<\/div>\s*<\/section>/, '<div class="categories-scroll-container" id="culture-grid" style="display:flex; gap:1.5rem; overflow-x:auto;"><p>Chargement...</p></div></div></section>');

cHtml = cHtml.replace(/<div class="talents-slider">([\s\S]*?)<\/div>\s*<\/div>\s*<\/section>/, '<div class="talents-slider" id="talents-slider"><p>Chargement...</p></div></div></section>');

if (!cHtml.includes('supabaseClient.js')) {
    cHtml = cHtml.replace('</body>', `    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
    <script src="assets/js/supabaseClient.js"></script>
    <script>
    document.addEventListener('DOMContentLoaded', async () => {
        // Culture grid
        const cGrid = document.getElementById('culture-grid');
        const { data: cData } = await window.supabase.from('culture').select('*').order('created_at', { ascending: false });
        if(cData) {
            cGrid.innerHTML = '';
            cData.forEach(item => {
                cGrid.innerHTML += \`
                    <div class="cat-card" style="background-image: url('\${item.image_url}'); flex: 0 0 300px;">
                        <div class="cat-overlay">
                            <h3>\${item.title}</h3>
                            <p>\${item.description}</p>
                        </div>
                    </div>
                \`;
            });
        }

        // Talents
        const tGrid = document.getElementById('talents-slider');
        const { data: tData } = await window.supabase.from('talents').select('*').order('created_at', { ascending: false });
        if(tData) {
            tGrid.innerHTML = '';
            tData.forEach(t => {
                tGrid.innerHTML += \`
                    <div class="talent-card" style="flex: 0 0 350px;">
                        <div class="talent-img">
                            <img src="\${t.image_url}" alt="\${t.name}" style="object-position: top center; width:100%; height:300px; object-fit:cover;">
                        </div>
                        <div class="talent-info">
                            <span class="talent-role">\${t.role}</span>
                            <h3>\${t.name}</h3>
                            <p>"\${t.description}"</p>
                            <a href="\${t.page_link || '#'}" class="link-arrow">Découvrir <i class="ph ph-arrow-right"></i></a>
                        </div>
                    </div>
                \`;
            });
        }
    });
    </script>
</body>`);
}
fs.writeFileSync(culturePath, cHtml);
console.log("Pages success updated.");
