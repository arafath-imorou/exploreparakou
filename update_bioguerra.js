const fs = require('fs');

// Update tourisme.html
let tourisme = fs.readFileSync('c:\\Users\\HP\\Desktop\\ITA\\EXPLORE PARAKOU\\ExploreParakou\\tourisme.html', 'utf8');

const oldBioCard = /<img src="assets\/images\/PLACE BIO GUERRA\.jpg"[\s\S]*?<div class="listing-actions">[\s\S]*?<a href="#" class="btn btn-primary"[\s\S]*?>Voir[\s\S]*?détails<\/a>/m;
const newBioCard = `<img src="assets/images/PLACE BIO GUERRA.jpg" alt="Place Bio Guerra" class="listing-img">
                        <div class="listing-content">
                            <div class="listing-category">Site Historique</div>
                            <h3 class="card-title" style="font-size:1.25rem; margin-bottom:0.5rem;">Place Bio Guerra</h3>
                            <p style="color:#666; font-size:0.95rem;">Le symbole de la résistance. Un monument incontournable situé dans le quartier Ladji Farani.</p>
                            <div class="listing-actions">
                                <a href="tourisme-bioguerra.html" class="btn btn-primary" style="padding:8px 20px; font-size:0.9rem;">Voir détails</a>`;

tourisme = tourisme.replace(oldBioCard, newBioCard);
fs.writeFileSync('c:\\Users\\HP\\Desktop\\ITA\\EXPLORE PARAKOU\\ExploreParakou\\tourisme.html', tourisme);

// Update histoire.html
let histoire = fs.readFileSync('c:\\Users\\HP\\Desktop\\ITA\\EXPLORE PARAKOU\\ExploreParakou\\histoire.html', 'utf8');

const oldHistCardBlock = /<div class="card-overlay"[\s\S]*?<h3 class="card-title"[\s\S]*?>Place Bio Guerra<\/h3>[\s\S]*?<\/div>/m;
const newHistCardBlock = `<a href="tourisme-bioguerra.html" style="display:block; width:100%; height:100%; z-index:10; position:absolute; top:0; left:0;">
                            <div class="card-overlay"
                                style="position:absolute; bottom:0; left:0; width:100%; padding:30px; background:linear-gradient(to top, rgba(0,0,0,0.9), transparent); color:white;">
                                <h3 class="card-title" style="margin:0; font-size:1.5rem;">Place Bio Guerra</h3>
                                <p style="margin-top:10px; opacity:0.8; font-size:0.9rem;">Héros de la résistance nationale. (Cliquez pour lire l'histoire complète)
                                </p>
                            </div>
                        </a>`;

histoire = histoire.replace(oldHistCardBlock, newHistCardBlock);
fs.writeFileSync('c:\\Users\\HP\\Desktop\\ITA\\EXPLORE PARAKOU\\ExploreParakou\\histoire.html', histoire);
console.log('done');
