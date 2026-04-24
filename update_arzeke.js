const fs = require('fs');
let html = fs.readFileSync('c:\\Users\\HP\\Desktop\\ITA\\EXPLORE PARAKOU\\ExploreParakou\\tourisme.html', 'utf8');

const injection = `
                    <!-- Place 3: Marché Arzeke -->
                    <div class="listing-card">
                        <img src="assets/images/market.png" alt="Marché Arzeke" class="listing-img">
                        <div class="listing-content">
                            <div class="listing-category">Commerce • Découverte</div>
                            <h3 class="card-title" style="font-size:1.25rem; margin-bottom:0.5rem;">Marché International Arzeke</h3>
                            <p style="color:#666; font-size:0.95rem;">Le deuxième plus grand marché à ciel ouvert du Bénin, point de rencontre économique incontournable.</p>
                            <div class="listing-actions">
                                <a href="tourisme-arzeke.html" class="btn btn-primary" style="padding:8px 20px; font-size:0.9rem;">Voir détails</a>
                                <a href="#" class="action-icon" title="Itinéraire"><i class="ph ph-map-pin"></i></a>
                            </div>
                        </div>
                    </div>
`;

if (!html.includes('<!-- Place 3: Marché Arzeke -->')) {
    html = html.replace('<!-- Place 1: Site -->', injection + '\n                    <!-- Place 1: Site -->');
    fs.writeFileSync('c:\\Users\\HP\\Desktop\\ITA\\EXPLORE PARAKOU\\ExploreParakou\\tourisme.html', html);
    console.log('done');
}
