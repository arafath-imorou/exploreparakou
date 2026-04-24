
// Map Logic
document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Map
    // Coordinates for Parakou, Benin
    const PARAKOU_CENTER = [9.3371, 2.6276];
    const map = L.map('map', {
        zoomControl: false // We will place zoom control manually if needed or rely on pinch/scroll
    }).setView(PARAKOU_CENTER, 13);

    // Add Tile Layer (OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
    }).addTo(map);

    // Add Zoom Control to bottom right or top right (custom position)
    L.control.zoom({
        position: 'bottomright'
    }).addTo(map);

    // 2. Mock Data for Parakou
    const places = [
        {
            id: 1,
            name: "Statue Bio Guerra",
            category: "tourisme",
            coords: [9.3500, 2.6167], // Approx
            image: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Place_Bio_Guerra_Parakou.jpg/800px-Place_Bio_Guerra_Parakou.jpg",
            desc: "Monument emblématique rendant hommage au héros national Bio Guerra.",
            address: "Place Bio Guerra, Centre-ville",
            phone: "+229 00 00 00 00",
            rating: 4.8
        },
        {
            id: 2,
            name: "Musée de Plein Air de Parakou",
            category: "tourisme",
            coords: [9.3250, 2.6300],
            image: "https://upload.wikimedia.org/wikipedia/commons/2/25/Entr%C3%A9e_du_Mus%C3%A9e_ethnographique_et_de_plein_air_de_Parakou.jpg",
            desc: "Découvrez l'histoire et la culture des peuples du Borgou.",
            address: "Route de Malanville",
            phone: "+229 23 61 00 00",
            rating: 4.5
        },
        {
            id: 3,
            name: "Grand Marché Azèkè",
            category: "commerce",
            coords: [9.3450, 2.6250],
            image: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/15/8e/3c/6e/grand-marche-azeke.jpg?w=1200&h=-1&s=1",
            desc: "Le cœur économique de la ville, vibrant et coloré.",
            address: "Centre commercial, Parakou",
            phone: "-",
            rating: 4.3
        },
        {
            id: 4,
            name: "Hôtel Kobourou City",
            category: "hebergement",
            coords: [9.3300, 2.6100],
            image: "https://cf.bstatic.com/xdata/images/hotel/max1024x768/250462000.jpg?k=3f20000000000000000000000000000000000000000000000000000000000000&o=&hp=1",
            desc: "Hôtel moderne offrant confort et services haut de gamme.",
            address: "Quartier Arafat",
            phone: "+229 60 60 60 60",
            rating: 4.7
        },
        {
            id: 5,
            name: "La Pirogue",
            category: "restaurant",
            coords: [9.3400, 2.6200],
            image: "https://img.freepik.com/premium-photo/restaurant-interior-design_23-2149499805.jpg", // Placeholder
            desc: "Restaurant gastronomique servant des spécialités locales et internationales.",
            address: "Rue du Commerce",
            phone: "+229 97 00 00 00",
            rating: 4.4
        },
        {
            id: 6,
            name: "Forêt Classée de la Tékabo",
            category: "tourisme",
            coords: [9.3600, 2.6500],
            image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ00000000000000000000000000000000000&s",
            desc: "Un espace vert paisible pour les amoureux de la nature.",
            address: "Sortie Nord",
            phone: "-",
            rating: 4.2
        },
        {
            id: 7,
            name: "Bar Restaurant Le Manguier",
            category: "restaurant",
            coords: [9.3350, 2.6150],
            image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ00000000000000000000000000000000000&s", // Placeholder
            desc: "Ambiance conviviale et plats savoureux.",
            address: "Quartier Ladji",
            phone: "+229 95 00 00 00",
            rating: 4.1
        },
        {
            id: 8,
            name: "Centre Culturel Français",
            category: "loisirs",
            coords: [9.3520, 2.6180],
            image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ00000000000000000000000000000000000&s",
            desc: "Lieu de promotion culturelle, bibliothèque et spectacles.",
            address: "Centre ville",
            phone: "+229 23 00 00 00",
            rating: 4.6
        }
    ];

    let markers = [];
    const markerCluster = L.markerClusterGroup();
    map.addLayer(markerCluster);

    // 3. Functions to Render Markers
    const customIcon = (category) => {
        let color = '#D4A017'; // Default Ocre
        let iconName = 'map-pin';

        // Define colors per category
        switch (category) {
            case 'tourisme': color = '#D4A017'; iconName = 'bank'; break;
            case 'hebergement': color = '#4CAF50'; iconName = 'bed'; break;
            case 'restaurant': color = '#2196F3'; iconName = 'fork-knife'; break;
            case 'loisirs': color = '#9C27B0'; iconName = 'confetti'; break;
            case 'commerce': color = '#FF5722'; iconName = 'shopping-bag'; break;
            case 'admin': color = '#607D8B'; iconName = 'buildings'; break;
        }

        // Create HTML Icon
        return L.divIcon({
            className: 'custom-map-marker',
            html: `<div style="background-color: ${color}; width: 32px; height: 32px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px rgba(0,0,0,0.3);">
                    <i class="ph ph-${iconName}" style="color: white; font-size: 16px;"></i>
                   </div>`,
            iconSize: [32, 32],
            iconAnchor: [16, 32], // Bottom center
            popupAnchor: [0, -32]
        });
    };

    function addMarkers(filterCategory = 'all') {
        markerCluster.clearLayers();
        markers = []; // Reset reference array

        places.forEach(place => {
            if (filterCategory === 'all' || place.category === filterCategory) {
                const marker = L.marker(place.coords, { icon: customIcon(place.category) });

                // Interaction: Click Marker -> Show Bottom Sheet
                marker.on('click', () => {
                    openBottomSheet(place);
                    map.flyTo(place.coords, 16); // Smooth zoom to location
                });

                markerCluster.addLayer(marker);
                markers.push({ ...place, marker }); // Store ref
            }
        });
    }

    addMarkers(); // Initial load

    // 4. Interaction Logic

    // Filters
    const filterChips = document.querySelectorAll('.filter-chip');
    filterChips.forEach(chip => {
        chip.addEventListener('click', () => {
            // UI Toggle
            filterChips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');

            // Logic
            const category = chip.dataset.category;
            addMarkers(category);
        });
    });

    // Search
    const searchInput = document.getElementById('map-search');
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();

        // Find first match
        const match = places.find(p => p.name.toLowerCase().includes(query));

        if (match) {
            // Ideally we'd filter the map or show a list. 
            // For now, let's just pan to the first match if it's strong enough?
            // Better: just filtering visually is safest.
            // Or highlighting?
            // Let's implement robust filtering:
            // Convert markers based on search?

            // Simpler: Just rely on markers being filtered by the loop logic if we wanted.
            // But let's simplify: if user hits enter or pauses, fly to first result.
        }
    });

    // Better Search: Filter markers in real-time
    searchInput.addEventListener('keyup', (e) => {
        const query = e.target.value.toLowerCase();
        markerCluster.clearLayers();

        places.forEach(place => {
            if (place.name.toLowerCase().includes(query) || place.category.includes(query)) {
                const marker = L.marker(place.coords, { icon: customIcon(place.category) });
                marker.on('click', () => {
                    openBottomSheet(place);
                    map.flyTo(place.coords, 16);
                });
                markerCluster.addLayer(marker);
            }
        });
    });

    // Geolocation
    const btnLocate = document.getElementById('btn-locate-me');
    btnLocate.addEventListener('click', () => {
        if (navigator.geolocation) {
            btnLocate.innerHTML = '<i class="ph ph-spinner ph-spin"></i>'; // Loading state
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;

                    // Add user marker
                    L.marker([lat, lng], {
                        icon: L.divIcon({
                            className: 'user-marker',
                            html: '<div style="width: 20px; height: 20px; background: #2196F3; border: 3px solid white; border-radius: 50%; box-shadow: 0 0 0 5px rgba(33, 150, 243, 0.3);"></div>',
                            iconSize: [20, 20]
                        })
                    }).addTo(map);

                    map.flyTo([lat, lng], 15);
                    btnLocate.innerHTML = '<i class="ph ph-navigation-arrow"></i>';
                },
                () => {
                    alert('Impossible de récupérer votre position.');
                    btnLocate.innerHTML = '<i class="ph ph-navigation-arrow"></i>';
                }
            );
        } else {
            alert('La géolocalisation n\'est pas supportée par votre navigateur.');
        }
    });

    // Bottom Sheet Logic
    const bottomSheet = document.getElementById('place-sheet');
    const sheetClose = document.getElementById('sheet-close');
    const sheetContent = bottomSheet.querySelector('.sheet-content');

    function openBottomSheet(place) {
        // Populate Data
        const html = `
            <img src="${place.image}" alt="${place.name}" class="place-card-banner">
            <span class="place-category">${place.category}</span>
            <h3 class="place-title">${place.name}</h3>
            <div class="place-rating">
                ${generateStars(place.rating)} <span>(${place.rating})</span>
            </div>
            
            <p style="margin-bottom: 15px; color: #555; line-height: 1.5;">${place.desc}</p>
            
            <div class="place-info-row">
                <i class="ph ph-map-pin"></i>
                <span>${place.address}</span>
            </div>
            <div class="place-info-row">
                <i class="ph ph-phone"></i>
                <span>${place.phone}</span>
            </div>

            <div class="place-actions">
                <a href="#" class="btn-place-action btn-call" onclick="window.location.href='tel:${place.phone}'">
                    <i class="ph ph-phone"></i> Appeler
                </a>
                <a href="https://www.google.com/maps/dir/?api=1&destination=${place.coords[0]},${place.coords[1]}" target="_blank" class="btn-place-action btn-route">
                    <i class="ph ph-arrow-bend-up-right"></i> Itinéraire
                </a>
            </div>
        `;

        sheetContent.innerHTML = html;
        bottomSheet.classList.add('active');
    }

    // Close Sheet
    sheetClose.addEventListener('click', () => {
        bottomSheet.classList.remove('active');
    });

    // Click outside to close (optional, maybe tricky with map clicks)
    // Map click already triggers closes? 
    map.on('click', () => {
        // If clicking on map background, close sheet
        // We need to check if we clicked a marker. 
        // Marker click logic fires after map click logic usually
        // Actually map event fires first or bubbling?
        // Let's manually delay or just check target
        bottomSheet.classList.remove('active');
    });

    // Helper: Stars
    function generateStars(rating) {
        let stars = '';
        for (let i = 1; i <= 5; i++) {
            if (i <= Math.floor(rating)) {
                stars += '<i class="ph ph-star-fill"></i>';
            } else if (i === Math.ceil(rating) && !Number.isInteger(rating)) {
                stars += '<i class="ph ph-star-half-fill"></i>';
            } else {
                stars += '<i class="ph ph-star"></i>';
            }
        }
        return stars;
    }
});
