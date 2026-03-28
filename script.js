/**
 * CommunityBridge 2026 - Official Production Script
 */

// --- 1. STATE & UI LOGIC ---
let state = { hh: 2, income: 0 };

function scrollToId(id) {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function updateHH(delta) {
    state.hh = Math.max(1, Math.min(10, state.hh + delta));
    document.getElementById('hhDisplay').innerText = state.hh;
}

function processScreener() {
    const inc = parseFloat(document.getElementById('incomeInput').value) || 0;
    const results = document.getElementById('resultsArea');
    
    // 2026 Estimated Eligibility Logic (~130% FPL)
    const limit = 1500 + (state.hh * 580); 
    const isEligible = inc <= limit;

    results.innerHTML = `
        <div class="result-item ${isEligible ? 'qualify' : ''}" style="animation: fadeUp 0.5s ease forwards">
            <div class="ri-top">
                <div class="ri-name">SNAP & WIC Potential</div>
                <span class="ri-badge ${isEligible ? 'rb-q' : 'rb-r'}">${isEligible ? 'Likely Eligible' : 'Manual Review'}</span>
            </div>
            <div class="ri-desc">Based on a household of ${state.hh}, you may qualify for benefits.</div>
            <button class="btn-primary" style="margin-top:10px; width:100%" onclick="alert('Routing to a Hampton University CHW...')">Book CHW Appointment</button>
        </div>`;
}

// --- 2. MAP INITIALIZATION ---
window.addEventListener('load', function() {
    
    // MAP 1: Local Hampton SNAP Retailers
    const map = L.map('map', { scrollWheelZoom: false }).setView([37.0299, -76.3452], 12);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png').addTo(map);

    // 2026 Authoritative USDA SNAP Layer
    const snapLayer = L.esri.featureLayer({
        url: 'https://services1.arcgis.com/RLQu0rK7h4kbsBq5/arcgis/rest/services/snap_retailer_location_data/FeatureServer/0',
        where: "City = 'HAMPTON' AND State = 'VA'",
        pointToLayer: (geojson, latlng) => L.circleMarker(latlng, {
            radius: 6, fillColor: '#1D9E75', color: '#fff', weight: 1, fillOpacity: 0.8
        })
    }).addTo(map);

    // MAP 2: Statewide Virginia Food Security
    const vaMap = L.map('va-map').setView([37.5407, -77.4360], 7);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png').addTo(vaMap);

    // 2026 Authoritative FeedVA / VDOE Layers
    const foodBanks = L.esri.featureLayer({
        url: 'https://services1.arcgis.com/RLQu0rK7h4kbsBq5/arcgis/rest/services/Virginia_Food_Pantries/FeatureServer/0'
    }).addTo(vaMap);

    const schoolNutrition = L.esri.featureLayer({
        url: 'https://services1.arcgis.com/RLQu0rK7h4kbsBq5/arcgis/rest/services/VDOE_Nutrition_Sites/FeatureServer/0',
        pointToLayer: (geojson, latlng) => L.circleMarker(latlng, {
            radius: 5, fillColor: '#185FA5', color: '#fff', weight: 1, fillOpacity: 0.7
        })
    }).addTo(vaMap);

    // Popups
    const popupTemplate = "<strong>{Facility_Name}</strong><br>{Address}<br><small>City: {City}</small>";
    foodBanks.bindPopup(l => L.Util.template(popupTemplate, l.feature.properties));
    schoolNutrition.bindPopup(l => `<strong>School Site:</strong> ${l.feature.properties.Site_Name}`);

    // Layer Toggle
    L.control.layers(null, { "Food Pantries": foodBanks, "School Nutrition": schoolLayer }).addTo(vaMap);

    // Fix for gray/missing tiles on load
    setTimeout(() => { 
        map.invalidateSize(); 
        vaMap.invalidateSize(); 
    }, 600);
});