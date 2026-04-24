const fs = require('fs');
let html = fs.readFileSync('c:\\Users\\HP\\Desktop\\ITA\\EXPLORE PARAKOU\\ExploreParakou\\tourisme.html', 'utf8');

const regex = /\s*<!-- Place 3: Loisirs \(New\) -->[\s\S]*?Grand Marché Arzeke[\s\S]*?Explorer<\/a>[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/;
html = html.replace(regex, '');

fs.writeFileSync('c:\\Users\\HP\\Desktop\\ITA\\EXPLORE PARAKOU\\ExploreParakou\\tourisme.html', html);
console.log('done removing old card');
