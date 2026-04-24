const fs = require('fs');
let history = fs.readFileSync('c:\\Users\\HP\\Desktop\\ITA\\EXPLORE PARAKOU\\ExploreParakou\\histoire.html', 'utf8');
history = history.replace(/<a href="decouvrir\.html"[^>]*>Découvrir<\/a>\s*<span[^>]*>\s*>\s*<\/span>\s*/, '');
fs.writeFileSync('c:\\Users\\HP\\Desktop\\ITA\\EXPLORE PARAKOU\\ExploreParakou\\histoire.html', history);

let carte = fs.readFileSync('c:\\Users\\HP\\Desktop\\ITA\\EXPLORE PARAKOU\\ExploreParakou\\carte.html', 'utf8');
carte = carte.replace(/<li>\s*<a href="decouvrir\.html"[^>]*>Découvrir<\/a>\s*<\/li>\n?\s*/, '<li><a href="histoire.html" style="color:white; text-decoration:none;">Histoire</a></li>\n                    ');
fs.writeFileSync('c:\\Users\\HP\\Desktop\\ITA\\EXPLORE PARAKOU\\ExploreParakou\\carte.html', carte);
console.log('successfully removed decouvrir link');
