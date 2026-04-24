const fs = require('fs');
let html = fs.readFileSync('c:\\Users\\HP\\Desktop\\ITA\\EXPLORE PARAKOU\\ExploreParakou\\tourisme.html', 'utf8');

const injection = `
                    <!-- Place 0: Musée -->
                    <div class="listing-card">
                        <img src="assets/images/Musée plein air.jpg" alt="Musée Ethnographique" class="listing-img" style="object-position: center;">
                        <div class="listing-content">
                            <div class="listing-category">Musée • Culture</div>
                            <h3 class="card-title" style="font-size:1.25rem; margin-bottom:0.5rem;">Musée Ethnographique et de Plein Air</h3>
                            <p style="color:#666; font-size:0.95rem;">Une riche collection de l'histoire et de l'architecture traditionnelle du Borgou avec ses fameux tatas.</p>
                            <div class="listing-actions">
                                <a href="tourisme-musee.html" class="btn btn-primary" style="padding:8px 20px; font-size:0.9rem;">Voir détails</a>
                                <a href="#" class="action-icon" title="Itinéraire"><i class="ph ph-map-pin"></i></a>
                            </div>
                        </div>
                    </div>
`;

if (!html.includes('<!-- Place 0: Musée -->')) {
    html = html.replace('<!-- Place 1: Site -->', injection + '\n                    <!-- Place 1: Site -->');
    fs.writeFileSync('c:\\Users\\HP\\Desktop\\ITA\\EXPLORE PARAKOU\\ExploreParakou\\tourisme.html', html);
    console.log('done');
}
