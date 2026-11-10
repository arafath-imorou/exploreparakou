const SUPABASE_URL = "https://ampktfwcpopkomrsckjm.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_FMDalRvzL6h5zW_4fTXt5g_I4dvctkD";

// Initialisation globale du client avec le schéma explore_parakou
if (typeof supabase !== 'undefined' && supabase.createClient) {
    window.supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        db: {
            schema: 'explore_parakou'
        }
    });
    console.log("Supabase Client Initialized - ITACORE2 / explore_parakou");
}

/**
 * Cache ultra-rapide Stale-While-Revalidate pour les requêtes publiques Supabase
 * Permet un affichage instantané (0ms) dès la seconde visite ou rechargement,
 * tout en rafraîchissant les données en arrière-plan sans bloquer l'UI.
 */
window.fastSupabaseFetch = async function (cacheKey, fetchPromiseFn, onDataReady, ttlMs = 15 * 60 * 1000) {
    const storageKey = 'ep_cache_' + cacheKey;
    let hasRenderedCached = false;

    // 1. Essai de lecture immédiate depuis le cache local (0ms)
    try {
        const cachedRaw = localStorage.getItem(storageKey);
        if (cachedRaw) {
            const cachedObj = JSON.parse(cachedRaw);
            if (cachedObj && cachedObj.data && (Array.isArray(cachedObj.data) ? cachedObj.data.length > 0 : true)) {
                onDataReady(cachedObj.data, true);
                hasRenderedCached = true;
            }
        }
    } catch (e) {
        console.warn("[FastCache] Lecture cache échouée:", e);
    }

    // 2. Requête réseau asynchrone pour obtenir les données à jour
    try {
        const result = await fetchPromiseFn();
        if (result && !result.error && result.data) {
            // Sauvegarder dans le cache local
            try {
                localStorage.setItem(storageKey, JSON.stringify({
                    timestamp: Date.now(),
                    data: result.data
                }));
            } catch (e) {
                console.warn("[FastCache] Sauvegarde cache échouée:", e);
            }
            // Rendu avec les données à jour
            onDataReady(result.data, false);
        } else if (result && result.error) {
            console.error("[FastCache] Erreur Supabase:", result.error);
        }
        return result;
    } catch (err) {
        if (!hasRenderedCached) {
            console.error("[FastCache] Exception réseau:", err);
        }
    }
};
