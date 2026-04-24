const fs = require('fs');

// Fix tourisme-arzeke.html
let html1 = fs.readFileSync('c:\\Users\\HP\\Desktop\\ITA\\EXPLORE PARAKOU\\ExploreParakou\\tourisme-arzeke.html', 'utf8');
html1 = html1.replace(/ <br><span style="color:var\(--color-primary\); font-size: 0\.9em;">Coordonnées GPS : 9° 20′ 18″ nord, 2° 37′ 44″ est<\/span>/, '');
fs.writeFileSync('c:\\Users\\HP\\Desktop\\ITA\\EXPLORE PARAKOU\\ExploreParakou\\tourisme-arzeke.html', html1);

// Fix tourisme.html
let html2 = fs.readFileSync('c:\\Users\\HP\\Desktop\\ITA\\EXPLORE PARAKOU\\ExploreParakou\\tourisme.html', 'utf8');
const arzekeBlockRegex = /(<h3 class="card-title"[\s\S]*?Marché International Arzeke[\s\S]*?<a href="tourisme-arzeke\.html"[\s\S]*?)<a href="#" class="action-icon" title="Itinéraire">/;
const mapsLink = 'https://maps.google.com/?q=9.338333,2.628889'; // 9°20'18"N 2°37'44"E
html2 = html2.replace(arzekeBlockRegex, `$1<a href="${mapsLink}" target="_blank" class="action-icon" title="Itinéraire">`);
fs.writeFileSync('c:\\Users\\HP\\Desktop\\ITA\\EXPLORE PARAKOU\\ExploreParakou\\tourisme.html', html2);

console.log('done fixing itinerary');
