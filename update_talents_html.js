const fs = require('fs');
const path = require('path');

const p = path.join('c:\\Users\\HP\\Desktop\\ITA\\EXPLORE PARAKOU\\ExploreParakou', 'talents.html');
let html = fs.readFileSync(p, 'utf8');

// Replace static grid items with an empty base (keeping no-results)
const gridRegex = /<div class="talents-grid" id="talents-grid">([\s\S]*?)<\/div>\s*<\/div>\s*<\/section>/;

const newGrid = `
                <div class="talents-grid" id="talents-grid">
                    <div id="loading" style="grid-column: 1 / -1; text-align: center; padding: 40px;">
                        Chargement des talents...
                    </div>
                    <div id="no-results" style="display:none; grid-column: 1 / -1; text-align: center; padding: 60px 20px;">
                        <i class="ph ph-magnifying-glass" style="font-size: 4rem; color: #ccc; margin-bottom: 20px;"></i>
                        <h3 style="font-size: 1.5rem; color: #555;">Aucun talent trouvé.</h3>
                        <p style="color: #777;">De nouveaux profils seront ajoutés très bientôt !</p>
                    </div>
                </div>
            </div>
        </section>`;

html = html.replace(gridRegex, newGrid);

// Append the data loading script right before the Supabase script
const fetchScript = `
    <script>
        document.addEventListener('DOMContentLoaded', async () => {
            const grid = document.getElementById('talents-grid');
            const noResults = document.getElementById('no-results');
            const loading = document.getElementById('loading');
            
            // Wait for supabaseClient to be ready
            setTimeout(async () => {
                const { data: talents, error } = await supabase
                    .from('talents')
                    .select('*')
                    .order('created_at', { ascending: false });
                    
                loading.style.display = 'none';

                if (error) {
                    console.error('Error fetching talents:', error);
                    return;
                }

                if (talents.length > 0) {
                    talents.forEach(t => {
                        const div = document.createElement('div');
                        div.className = 'talent-card-item';
                        div.setAttribute('data-category', 'all'); // For now, all talents are visible on all filters or we can add DB field later
                        div.innerHTML = \`
                            <a href="\${t.page_link || '#'}" style="text-decoration:none; display:flex; flex-direction:column; height:100%;">
                                <img src="\${t.image_url}" alt="\${t.name}" class="tc-img">
                                <div class="tc-content">
                                    <span class="tc-cat">\${t.role}</span>
                                    <h3 class="tc-title">\${t.name}</h3>
                                    <p class="tc-desc">\${t.description}</p>
                                    <span class="link-arrow" style="color:var(--color-primary, #E85D04); font-weight:600; margin-top:auto;">Découvrir le profil <i class="ph ph-arrow-right"></i></span>
                                </div>
                            </a>
                        \`;
                        grid.insertBefore(div, noResults);
                    });
                } else {
                    noResults.style.display = 'block';
                }
            }, 300); // 300ms to ensure window.supabase is attached
        });
    </script>
`;

// Insert the script before </body>
html = html.replace('</body>', fetchScript + '\n</body>');

fs.writeFileSync(p, html);
console.log('talents.html updated to fetch from Supabase dynamically.');
