const fs = require('fs');

const html = fs.readFileSync('tourisme.html', 'utf8');

const startVisiter = html.indexOf('<!-- 4. SECTION A: VISITER (Sites & Loisirs) -->');
const endSejourner = html.indexOf('<!-- 5. Expériences Locales -->');

if (startVisiter !== -1 && endSejourner !== -1) {
    const newSections = `<!-- 4. SECTION A: VISITER (Sites & Loisirs) -->
            <div id="visiter" style="margin-bottom: 6rem;">
                <div class="section-header" style="margin-bottom:2rem; border-bottom:1px solid #eee; padding-bottom:1rem;">
                    <h2 style="color:var(--color-primary); font-size:2rem;">Découvrir & S'évader</h2>
                    <p style="color:#666;">Les sites historiques, les marchés et les lieux de loisirs.</p>
                </div>
                <div class="cards-grid dynamic-grid" id="visiter-grid" style="grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap:2rem;">
                    <p>Chargement...</p>
                </div>
            </div>

            <!-- 5. SECTION B: SEJOURNER (Hôtels & Restos) -->
            <div id="sejourner" style="margin-bottom: 4rem;">
                <div class="section-header" style="margin-bottom:2rem; border-bottom:1px solid #eee; padding-bottom:1rem;">
                    <h2 style="color:var(--color-primary); font-size:2rem;">Séjourner & Déguster</h2>
                    <p style="color:#666;">Les meilleures adresses pour dormir et manger à Parakou.</p>
                </div>
                <div class="cards-grid dynamic-grid" id="sejourner-grid" style="grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap:2rem;">
                    <p>Chargement...</p>
                </div>
            </div>

            `;

    const newHtml = html.substring(0, startVisiter) + newSections + html.substring(endSejourner);
    fs.writeFileSync('tourisme.html', newHtml);
    console.log("Successfully replaced Tourisme sections.");
} else {
    console.error("Could not find start or end bounds.");
}
