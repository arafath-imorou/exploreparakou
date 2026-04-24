const fs = require('fs');
let html = fs.readFileSync('c:\\Users\\HP\\Desktop\\ITA\\EXPLORE PARAKOU\\ExploreParakou\\tourisme-arzeke.html', 'utf8');

const regex = /Superficie de 10 530 m² située dans le quartier Baparapé à Parakou\./;
html = html.replace(regex, 'Superficie de 10 530 m² située dans le quartier Baparapé à Parakou. <br><span style="color:var(--color-primary); font-size: 0.9em;">Coordonnées GPS : 9° 20′ 18″ nord, 2° 37′ 44″ est</span>');

fs.writeFileSync('c:\\Users\\HP\\Desktop\\ITA\\EXPLORE PARAKOU\\ExploreParakou\\tourisme-arzeke.html', html);
console.log('done replacing coords');
