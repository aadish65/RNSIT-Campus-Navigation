
/* ==========================================
   RNS NAVIGATE
   CAMPUS MAP + FACILITY SEARCH
========================================== */

import * as maplibregl from
    "https://unpkg.com/maplibre-gl@6.19.0/dist/maplibre-gl.mjs";

// ==========================================
// 1. CAMPUS FACILITY DATA
// ==========================================

const API_BASE = "http://127.0.0.1:5000/api";

let facilities = [];

async function loadFacilities() {
    const response = await fetch(`${API_BASE}/locations`);

    if (!response.ok) {
        throw new Error("Failed to load campus locations");
    }

    const data = await response.json();

    facilities = data.locations;

    console.log("Loaded locations from Flask:", facilities.length);
}


// ==========================================
// 2. MAP INITIALIZATION
// ==========================================

const mapElement = document.getElementById("campusMap");

const mapStatus = document.getElementById("mapStatus");

const searchInput = document.getElementById("facilitySearch");

const resultsContainer = document.getElementById("facilityResults");

const searchFeedback = document.getElementById("searchFeedback");
// ROUTE PLANNER ELEMENTS

const routeFrom = document.getElementById("routeFrom");

const routeTo = document.getElementById("routeTo");

const findRouteButton = document.getElementById("findRoute");

const swapRouteButton = document.getElementById("swapRoute");

const routeStatus = document.getElementById("routeStatus");


// TURN BY TURN DIRECTIONS ELEMENTS

const directionsPanel =
    document.getElementById("directionsPanel");

const directionsFromTo =
    document.getElementById("directionsFromTo");

const directionsDistance =
    document.getElementById("directionsDistance");

const directionsDuration =
    document.getElementById("directionsDuration");

const directionsStepCount =
    document.getElementById("directionsStepCount");

const directionsList =
    document.getElementById("directionsList");


// Route markers

let routeStartMarker = null;

let routeEndMarker = null;

const markers = {};

let campusMap;
let mapIsReady = false;

// ==========================================
// 3. STATUS MESSAGES
// ==========================================

function showStatus(message) {

    if (mapStatus) {
        mapStatus.textContent = message;
        mapStatus.style.display = "flex";
    }

}

function hideStatus() {

    if (mapStatus) {
        mapStatus.style.display = "none";
    }

}


// ==========================================
// 4. CREATE MAP
// ==========================================

function initializeMap() {

    if (!mapElement) {
        showStatus("Map container not found.");
        return;
    }

    campusMap = new maplibregl.Map({

        container: "campusMap",

        style: "https://tiles.openfreemap.org/styles/dark",

        center: [77.5184739, 12.9012543],

        zoom: 17,

        minZoom: 14,

        maxZoom: 20

    });

    campusMap.addControl(
        new maplibregl.NavigationControl(),
        "top-right"
    );

    campusMap.addControl(
        new maplibregl.ScaleControl({
            unit: "metric"
        }),
        "bottom-left"
    );

    campusMap.on("load", function () {

        mapIsReady = true;

        hideStatus();

        addAllMarkers();

        populateRouteOptions();

        findRouteButton.disabled = false;

        console.log("RNSIT map loaded successfully.");

    });

    campusMap.on("error", function (event) {

        console.error(
            "[RNSIT MAP ERROR]",
            event.error || event
        );

        // Only show the blocking error when
        // the map has not initialized yet.

        if (!mapIsReady) {

            showStatus(
                "Unable to initialize the map. Check the browser console."
            );

        }

    });

    window.addEventListener("resize", () => {
        campusMap.resize();
    });

}


// ==========================================
// 5. ADD FACILITY MARKERS
// ==========================================

function addAllMarkers() {

    const locationGroups = new Map();

    // Group facilities by their exact coordinates
    facilities.forEach(facility => {

        if (!facility.coordinates) return;

        const key = facility.coordinates.join(",");

        if (!locationGroups.has(key)) {
            locationGroups.set(key, []);
        }

        locationGroups.get(key).push(facility);

    });

    // Create one marker for each unique location
    locationGroups.forEach(group => {

        const popupContent = document.createElement("div");
        popupContent.className = "campus-popup";

        const heading = document.createElement("h3");

        heading.textContent =
            group.length > 1
                ? "Departments at this location"
                : group[0].name;

        popupContent.appendChild(heading);

        group.forEach(facility => {

            const item = document.createElement("div");
            item.className = "campus-popup-item";

            const name = document.createElement("strong");
            name.textContent = facility.name;

            const category = document.createElement("p");
            category.textContent = facility.category;

            const description = document.createElement("p");
            description.textContent = facility.description;

            item.appendChild(name);
            item.appendChild(category);
            item.appendChild(description);

            popupContent.appendChild(item);

        });

        const popup = new maplibregl.Popup({
            offset: 25
        }).setDOMContent(popupContent);

        const marker = new maplibregl.Marker({
            color: "#91AFC5"
        })
            .setLngLat(group[0].coordinates)
            .setPopup(popup)
            .addTo(campusMap);

        // Allow search to find the marker for each facility
        group.forEach(facility => {
            markers[facility.id] = marker;
        });

    });

    console.log(
        "Total facilities:",
        facilities.length
    );

    console.log(
        "Unique marker locations:",
        locationGroups.size
    );

}



// ==========================================
// 6. FACILITY SEARCH
// ==========================================


async function displaySearchResults(query) {

    resultsContainer.innerHTML = "";
    searchFeedback.textContent = "";

    if (!query.trim()) {
        resultsContainer.hidden = true;
        return;
    }

    try {
        const response = await fetch(
            `${API_BASE}/search?q=${encodeURIComponent(query)}`
        );

        const data = await response.json();

        resultsContainer.hidden = false;

        if (!data.results || data.results.length === 0) {
            resultsContainer.innerHTML =
                "<p class='no-results'>No facilities found.</p>";
            return;
        }

        data.results.forEach(facility => {

            const result = document.createElement("button");
            result.type = "button";
            result.className = "facility-result";

            const name = document.createElement("strong");
            name.textContent = facility.name;

            const category = document.createElement("span");
            category.textContent = facility.category;

            result.append(name, category);

            result.addEventListener("click", () => {
                selectFacility(facility);
            });

            resultsContainer.appendChild(result);
        });

    } catch (error) {
        console.error("Search error:", error);
        searchFeedback.textContent = "Unable to search locations.";
    }
}



// ==========================================
// 7. SELECT A FACILITY
// ==========================================

function selectFacility(facility) {

    if (!facility.coordinates) {

        searchFeedback.textContent =
            "Exact map location is not verified yet. We need to add its coordinates.";

        return;

    }

    searchFeedback.textContent =
        facility.name + " selected.";

    campusMap.flyTo({

        center: facility.coordinates,

        zoom: 19,

        speed: 1.2,

        essential: true

    });

    const marker = markers[facility.id];

    if (marker) {
        marker.togglePopup();
    }

    resultsContainer.hidden = true;

}


// ==========================================
// 8. SEARCH INPUT EVENT
// ==========================================

if (searchInput) {

    searchInput.addEventListener("input", function () {

        displaySearchResults(this.value);

    });

}


// ==========================================
// 9. START APPLICATION
// ==========================================

// ==========================================
// 10. POPULATE ROUTE DROPDOWNS
// ==========================================

function populateRouteOptions() {

    const availableFacilities = facilities.filter(
        facility =>
            Array.isArray(facility.coordinates) &&
            facility.coordinates.length === 2
    );

    routeFrom.innerHTML =
        '<option value="">Choose starting point</option>';

    routeTo.innerHTML =
        '<option value="">Choose destination</option>';

    availableFacilities.forEach(facility => {

        const option1 = new Option(
            facility.name,
            facility.id
        );

        const option2 = new Option(
            facility.name,
            facility.id
        );

        routeFrom.add(option1);
        routeTo.add(option2);

    });

    // Default example

    routeFrom.value = "main-entrance";
    routeTo.value = "cse";

}


// ==========================================
// 11. DISTANCE CALCULATION
// ==========================================

function calculateDistance(pointA, pointB) {

    const toRadians = value => value * Math.PI / 180;

    const [lon1, lat1] = pointA;
    const [lon2, lat2] = pointB;

    const earthRadius = 6371000;

    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRadians(lat1)) *
        Math.cos(toRadians(lat2)) *
        Math.sin(dLon / 2) ** 2;

    return 2 * earthRadius *
        Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

}


// ==========================================
// 12. FIND ROUTE PREVIEW
// ==========================================


/* ==========================================
   REAL WALKING ROUTE USING VALHALLA
========================================== */

/* ==========================================
   DECODE VALHALLA POLYLINE6
========================================== */

function decodePolyline6(encoded) {

    let index = 0;
    let latitude = 0;
    let longitude = 0;

    const coordinates = [];

    function decodeValue() {

        let result = 0;
        let shift = 0;
        let byte;

        do {

            if (index >= encoded.length) {
                throw new Error("Invalid route polyline.");
            }

            byte = encoded.charCodeAt(index++) - 63;

            result |= (byte & 0x1f) << shift;

            shift += 5;

        } while (byte >= 0x20);

        return (result & 1)
            ? ~(result >> 1)
            : (result >> 1);

    }

    while (index < encoded.length) {

        latitude += decodeValue();
        longitude += decodeValue();

        // GeoJSON uses longitude first
        coordinates.push([
            longitude / 1000000,
            latitude / 1000000
        ]);

    }

    return coordinates;

}


/* ==========================================
   ACTUAL WALKING ROUTE
========================================== */

/* ==========================================
   STAGE 5 - ROUTE INSTRUCTIONS
========================================== */

// Convert route distance into readable format

function formatRouteDistance(km) {

    if (!Number.isFinite(km)) {
        return "--";
    }

    if (km < 1) {
        return Math.round(km * 1000) + " metres";
    }

    return km.toFixed(2) + " km";

}


// Convert seconds into minutes and hours

function formatRouteDuration(seconds) {

    if (!Number.isFinite(seconds) || seconds < 0) {
        return "--";
    }

    const totalMinutes = Math.round(seconds / 60);

    if (totalMinutes < 60) {
        return Math.max(1, totalMinutes) + " min";
    }

    const hours = Math.floor(totalMinutes / 60);

    const remainingMinutes = totalMinutes % 60;

    return remainingMinutes
        ? hours + " hr " + remainingMinutes + " min"
        : hours + " hr";

}


// Display individual navigation instructions

function renderRouteDirections(
    leg,
    trip,
    start,
    destination
) {

    if (!directionsPanel || !directionsList) {
        return;
    }

    const summary = trip.summary || leg.summary || {};

    const maneuvers = Array.isArray(leg.maneuvers)
        ? leg.maneuvers
        : [];

    // Show selected journey

    directionsFromTo.textContent =
        start.name + " → " + destination.name;

    // Display summary information

    directionsDistance.textContent =
        formatRouteDistance(summary.length);

    directionsDuration.textContent =
        formatRouteDuration(summary.time);

    directionsStepCount.textContent =
        maneuvers.length;

    // Clear old directions

    directionsList.replaceChildren();

    // Handle missing maneuver information

    if (maneuvers.length === 0) {

        const message = document.createElement("p");

        message.className = "no-directions";

        message.textContent =
            "The routing service did not return detailed " +
            "walking instructions for this route.";

        directionsList.appendChild(message);

        directionsPanel.hidden = false;

        return;

    }

    // Generate each instruction

    maneuvers.forEach((maneuver, index) => {

        const step = document.createElement("div");

        step.className = "direction-step";

        // Step number

        const number = document.createElement("div");

        number.className = "direction-step-number";

        number.textContent = index + 1;

        // Instruction content

        const content = document.createElement("div");

        content.className = "direction-step-content";

        const instruction = document.createElement("h5");

        instruction.textContent =
            maneuver.instruction ||
            "Continue along the mapped route.";

        const details = [];

        if (Number.isFinite(maneuver.length)) {

            details.push(
                formatRouteDistance(maneuver.length)
            );

        }

        if (
            Number.isFinite(maneuver.time) &&
            maneuver.time > 0
        ) {

            details.push(
                formatRouteDuration(maneuver.time)
            );

        }

        const detailText = document.createElement("p");

        detailText.className = "direction-step-details";

        detailText.textContent = details.join(" · ");

        content.appendChild(instruction);

        if (details.length > 0) {
            content.appendChild(detailText);
        }

        step.appendChild(number);

        step.appendChild(content);

        directionsList.appendChild(step);

    });

    // Make panel visible

    directionsPanel.hidden = false;

}



async function showCampusRoute() {

    const start = facilities.find(
        f => f.id === routeFrom.value
    );

    const destination = facilities.find(
        f => f.id === routeTo.value
    );

    // Validate selections
    if (!start || !destination) {
        routeStatus.textContent =
            "Please select both locations.";
        return;
    }

    if (!start.coordinates || !destination.coordinates) {
        routeStatus.textContent =
            "Location coordinates are missing.";
        return;
    }

    if (start.id === destination.id) {
        routeStatus.textContent =
            "Starting point and destination must be different.";
        return;
    }

    if (
        start.coordinates[0] === destination.coordinates[0] &&
        start.coordinates[1] === destination.coordinates[1]
    ) {
        routeStatus.textContent =
            "Both locations have the same coordinates.";
        return;
    }

    findRouteButton.disabled = true;
    directionsPanel.hidden = true;

    routeStatus.textContent =
        "Calculating walking directions...";

    try {

        // =================================
        // 1. REQUEST ROUTE FROM FLASK
        // =================================

        const response = await fetch(
            `${API_BASE}/routes`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    from_id: start.id,
                    to_id: destination.id
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.error || "Route calculation failed."
            );
        }

        // =================================
        // 2. EXTRACT VALHALLA RESPONSE
        // =================================

        const trip = data.trip;

        if (!trip || !trip.legs || !trip.legs.length) {
            throw new Error(
                data.status_message ||
                "No walking route found."
            );
        }

        const leg = trip.legs[0];

        if (!leg.shape) {
            throw new Error("Route geometry is missing.");
        }

        // =================================
        // 3. DECODE POLYLINE
        // =================================

        const routeCoordinates =
            decodePolyline6(leg.shape);

        if (routeCoordinates.length < 2) {
            throw new Error("Invalid route geometry.");
        }

        // =================================
        // 4. CREATE GEOJSON
        // =================================

        const routeGeoJSON = {
            type: "Feature",
            properties: {
                name: "RNSIT Walking Route"
            },
            geometry: {
                type: "LineString",
                coordinates: routeCoordinates
            }
        };

        // =================================
        // 5. REMOVE PREVIOUS ROUTE
        // =================================

        if (campusMap.getLayer("campus-route-line")) {
            campusMap.removeLayer("campus-route-line");
        }

        if (campusMap.getLayer("campus-route-casing")) {
            campusMap.removeLayer("campus-route-casing");
        }

        if (campusMap.getSource("campus-route")) {
            campusMap.removeSource("campus-route");
        }

        // =================================
        // 6. ADD ROUTE SOURCE
        // =================================

        campusMap.addSource("campus-route", {
            type: "geojson",
            data: routeGeoJSON
        });

        // Outer route line
        campusMap.addLayer({
            id: "campus-route-casing",
            type: "line",
            source: "campus-route",

            layout: {
                "line-cap": "round",
                "line-join": "round"
            },

            paint: {
                "line-color": "#FFFFFF",
                "line-width": 10,
                "line-opacity": 0.85
            }
        });

        // Main route line
        campusMap.addLayer({
            id: "campus-route-line",
            type: "line",
            source: "campus-route",

            layout: {
                "line-cap": "round",
                "line-join": "round"
            },

            paint: {
                "line-color": "#49B5F5",
                "line-width": 6,
                "line-opacity": 1
            }
        });

        // =================================
        // 7. START MARKER
        // =================================

        if (routeStartMarker) {
            routeStartMarker.remove();
        }

        routeStartMarker = new maplibregl.Marker({
            color: "#39B68A"
        })
            .setLngLat(start.coordinates)
            .addTo(campusMap);

        // =================================
        // 8. DESTINATION MARKER
        // =================================

        if (routeEndMarker) {
            routeEndMarker.remove();
        }

        routeEndMarker = new maplibregl.Marker({
            color: "#91AFC5"
        })
            .setLngLat(destination.coordinates)
            .addTo(campusMap);

        // =================================
        // 9. FIT MAP TO ROUTE
        // =================================

        const bounds = new maplibregl.LngLatBounds();

        routeCoordinates.forEach(point => {
            bounds.extend(point);
        });

        campusMap.fitBounds(bounds, {
            padding: 100,
            maxZoom: 19,
            duration: 1200
        });

        // =================================
        // 10. ROUTE DISTANCE AND DURATION
        // =================================

        const summary = trip.summary || leg.summary || {};

        const distanceKm = summary.length;
        const durationSeconds = summary.time;

        const distanceText = formatRouteDistance(distanceKm);

        const durationText = formatRouteDuration(durationSeconds);

        routeStatus.textContent =
            `Walking route: ${start.name} → ${destination.name} | ` +
            `${distanceText} | Approximately ${durationText}.`;

        // =================================
        // 11. TURN-BY-TURN DIRECTIONS
        // =================================

        renderRouteDirections(
            leg,
            trip,
            start,
            destination
        );

        console.log("Route successfully drawn.");

    } catch (error) {

        console.error("Route error:", error);

        routeStatus.textContent =
            "Unable to display walking route: " +
            error.message;

    } finally {

        findRouteButton.disabled = false;

    }
}


// ==========================================
// 13. ROUTE BUTTON EVENTS
// ==========================================

findRouteButton.addEventListener(
    "click",
    showCampusRoute
);


// Swap locations

swapRouteButton.addEventListener("click", () => {

    const oldStart = routeFrom.value;

    routeFrom.value = routeTo.value;

    routeTo.value = oldStart;

});


async function startApplication() {

    try {
        showStatus("Loading campus locations...");

        await loadFacilities();

        initializeMap();

    } catch (error) {

        console.error(error);

        showStatus("Unable to connect to campus backend.");
    }
}

startApplication();
