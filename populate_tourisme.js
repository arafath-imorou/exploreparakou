const { createClient } = require('@supabase/supabase-js');
const SUPABASE_URL = "https://aneucltybifkuitpjyqd.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_Qsgkbx2vwAP3G7VPJoSA0Q_fxIl9ygl";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const dataToInsert = [
    {
        title: "Musée Ethnographique et de Plein Air",
        category: "Musée • Culture",
        description: "Une riche collection de l'histoire et de l'architecture traditionnelle du Borgou avec ses fameux tatas.",
        image_url: "assets/images/tourisme-hero.png",
        link_details: "tourisme-musee.html",
        link_map: ""
    },
    {
        title: "Marché International Arzeke",
        category: "Commerce • Découverte",
        description: "Le deuxième plus grand marché à ciel ouvert du Bénin, point de rencontre économique incontournable.",
        image_url: "assets/images/market.png",
        link_details: "tourisme-arzeke.html",
        link_map: "https://maps.google.com/?q=9.338333,2.628889"
    },
    {
        title: "Place Hubert Maga",
        category: "Site Historique",
        description: "Monument érigé à la gloire du premier président du Bénin indépendant.",
        image_url: "assets/images/STATUT HUBERT MAGA.jpg",
        link_details: "tourisme-maga.html",
        link_map: ""
    },
    {
        title: "Place Bio Guerra",
        category: "Site Historique",
        description: "Le symbole de la résistance. Un monument incontournable situé dans le quartier Ladji Farani.",
        image_url: "assets/images/PLACE BIO GUERRA.jpg",
        link_details: "tourisme-bioguerra.html",
        link_map: ""
    },
    {
        title: "Hôtel Kobourou City",
        category: "Hôtel",
        description: "Le confort moderne au cœur de Parakou. Piscine, restaurant gastronomique.",
        image_url: "assets/images/tourisme-hero.png",
        link_details: "",
        link_map: ""
    },
    {
        title: "Saveurs du Borgou",
        category: "Restaurant • Local",
        description: "Découvrez la vraie igname pilée et le fromage peuhl dans un cadre authentique.",
        image_url: "assets/images/cat-food.png",
        link_details: "",
        link_map: ""
    }
];

async function populate() {
    console.log("Signing in...");
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: 'groupita25@gmail.com',
        password: 'Admin123.',
    });

    if (authError) {
        console.error("Auth Error:", authError.message);
        return;
    }
    console.log("Signed in successfully!");

    for (const item of dataToInsert) {
        const { data: existing } = await supabase.from('tourisme').select('*').eq('title', item.title);
        if (existing && existing.length > 0) {
            console.log(`Skipping ${item.title}, already exists.`);
            continue;
        }

        const { data, error } = await supabase.from('tourisme').insert([item]);
        if (error) {
            console.error(`Error inserting ${item.title}:`, error);
        } else {
            console.log(`Inserted ${item.title}`);
        }
    }
    console.log("Done");
}

populate();
