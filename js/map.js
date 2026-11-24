
/* ==========================================
   RNS NAVIGATE
   CAMPUS MAP + FACILITY SEARCH
========================================== */

import * as maplibregl from
"https://unpkg.com/maplibre-gl@6.19.0/dist/maplibre-gl.mjs";

// ==========================================
// 1. CAMPUS FACILITY DATA
// ==========================================

const facilities = [

    // MAIN CAMPUS
    {
        id: "campus",
        name: "RNS Institute of Technology",
        category: "Campus",
        description: "Main RNSIT campus",
        coordinates: [77.5184739, 12.9012543]
    },

    // ENGINEERING DEPARTMENTS
    {
        id: "cse",
        name: "CSE Department",
        category: "Department",
        description: "Computer Science and Engineering",
        coordinates: [77.51792319271713, 12.901982967309449]
    },
    {
        id: "ece",
        name: "ECE Department",
        category: "Department",
        description: "Electronics and Communication Engineering",
        coordinates: [77.5178667791052, 12.902484345116491]
    },
    {
        id: "eee",
        name: "EEE Department",
        category: "Department",
        description: "Electrical and Electronics Engineering",
        coordinates: [77.5190984079474, 12.901652755703868]
    },
    {
        id: "mechanical",
        name: "Mechanical Department",
        category: "Department",
        description: "Mechanical Engineering",
        coordinates: [77.5190984079474, 12.901652755703868]
    },
    {
        id: "data-science",
        name: "Data Science Department",
        category: "Department",
        description: "Computer Science - Data Science",
        coordinates: [77.5190984079474, 12.901652755703868]
    },
    {
        id: "mba",
        name: "MBA Department",
        category: "Department",
        description: "Management studies",
        coordinates: [77.51878467714974, 12.900997144437993]
    },
    {
        id: "civil",
        name: "Civil Block",
        category: "Department",
        description: "Civil Engineering Block",
        coordinates: [77.51755806140841, 12.901736835096278]
    },
    {
        id: "cyber-security",
        name: "Cyber Security Block",
        category: "Department",
        description: "Cyber Security Department",
        coordinates: [77.5173683689213, 12.901460473664356]
    },

    // HOSTELS
    {
        id: "boys-hostel",
        name: "Boys Hostel",
        category: "Hostel",
        description: "Boys residential facility",
        coordinates: [77.51711641887431, 12.901802134635767]
    },
    {
        id: "girls-hostel",
        name: "Girls Hostel",
        category: "Hostel",
        description: "Girls residential facility",
        coordinates: [77.51740719008096, 12.902432266502439]
    },

    // CAMPUS FACILITIES
    {
        id: "library",
        name: "Library",
        category: "Facility",
        description: "College library",
        coordinates: [77.51790845199041, 12.900662877475174]
    },
    {
        id: "temple",
        name: "RNSIT Temple",
        category: "Facility",
        description: "Campus temple",
        coordinates: [77.51844279400655, 12.8999507538357]
    },
    {
        id: "gallery",
        name: "Gallery",
        category: "Facility",
        description: "Campus gallery",
        coordinates: [77.51857059799245, 12.902113021245858]
    },
    {
        id: "admin",
        name: "Admin Block",
        category: "Administration",
        description: "Administrative office",
        coordinates: [77.51860144538693, 12.902290153486746]
    },
    {
        id: "canteen",
        name: "Canteen",
        category: "Food",
        description: "Campus canteen",
        coordinates: [77.51808509417451, 12.90074238530015]
    },

    // ENTRANCE AND PARKING
    {
        id: "main-entrance",
        name: "Main Entrance",
        category: "Entrance",
        description: "Main campus entrance",
        coordinates: [77.5192045161297, 12.902553942804538]
    },
    {
        id: "parking",
        name: "Parking Area",
        category: "Parking",
        description: "Campus parking area",
        coordinates: [77.51812462770418, 12.89979190352434]
    },

    // PLAYGROUND AND OTHER INSTITUTIONS
    {
        id: "playground",
        name: "RNSIT Playground",
        category: "Sports",
        description: "Campus playground",
        coordinates: [77.5160160830609, 12.899452590266124]
    },
    {
        id: "rns-school",
        name: "RNS School",
        category: "Educational Institution",
        description: "RNS School",
        coordinates: [77.51683865936256, 12.900671522354397]
    },
    {
        id: "pu-college",
        name: "RNS PU College",
        category: "Educational Institution",
        description: "RNS Pre-University College",
        coordinates: [77.51886414500929, 12.9007217446207]
    },
    {
        id: "first-grade-college",
        name: "RNS First Grade College",
        category: "Educational Institution",
        description: "RNS First Grade College",
        coordinates: [77.51752338643695, 12.901092654011052]
    }

];


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

function displaySearchResults(query) {

    resultsContainer.innerHTML = "";

    searchFeedback.textContent = "";

    if (!query.trim()) {

        resultsContainer.hidden = true;
        return;

    }

    const filteredFacilities = facilities.filter(facility => {

        return (

            facility.name.toLowerCase().includes(query.toLowerCase()) ||

            facility.category.toLowerCase().includes(query.toLowerCase())

        );

    });

    resultsContainer.hidden = false;

    if (filteredFacilities.length === 0) {

        resultsContainer.innerHTML =
            "<p class='no-results'>No facilities found.</p>";

        return;

    }

    filteredFacilities.forEach(facility => {

        const result = document.createElement("button");

        result.type = "button";

        result.className = "facility-result";

        const name = document.createElement("strong");
        name.textContent = facility.name;

        const category = document.createElement("span");
        category.textContent = facility.coordinates
            ? facility.category
            : facility.category + " · Pin pending";

        result.append(name, category);

        result.addEventListener("click", () => {

            selectFacility(facility);

        });

        resultsContainer.appendChild(result);

    });

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

    if (
        start.coordinates[0] === destination.coordinates[0] &&
        start.coordinates[1] === destination.coordinates[1]
    ) {

        routeStatus.textContent =
            "Both locations have the same coordinates.";

        return;

    }

    findRouteButton.disabled = true;
    // Hide previous instructions while finding a new route

directionsPanel.hidden = true;
    routeStatus.textContent =
        "Calculating walking directions...";

    try {

        // VALHALLA ROUTE REQUEST

        const requestData = {

            locations: [

                {
                    lat: start.coordinates[1],
                    lon: start.coordinates[0],
                    type: "break",
                    name: start.name
                },

                {
                    lat: destination.coordinates[1],
                    lon: destination.coordinates[0],
                    type: "break",
                    name: destination.name
                }

            ],

            costing: "pedestrian",

            units: "km",

            format: "json",

            directions_type: "instructions",

            language: "en"

        };

        const response = await fetch(
            "https://valhalla1.openstreetmap.de/route",
            {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(requestData)

            }
        );

        if (!response.ok) {

            throw new Error(
                "Routing service error: " + response.status
            );

        }

        const data = await response.json();

        // NATIVE VALHALLA RESPONSE

        const trip = data.trip;

        const leg = trip?.legs?.[0];

        if (!leg || !leg.shape) {

            throw new Error(
                data.status_message ||
                "No walking route was found."
            );

        }

        // Decode actual route geometry

        const routeCoordinates =
            decodePolyline6(leg.shape);

        if (routeCoordinates.length < 2) {

            throw new Error(
                "The walking route has invalid geometry."
            );

        }

        console.log(
            "Walking route coordinates:",
            routeCoordinates
        );

        // GEOJSON ROUTE

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

        // REMOVE OLD ROUTE

        if (campusMap.getLayer("campus-route-line")) {
            campusMap.removeLayer("campus-route-line");
        }

        if (campusMap.getLayer("campus-route-casing")) {
            campusMap.removeLayer("campus-route-casing");
        }

        if (campusMap.getSource("campus-route")) {
            campusMap.removeSource("campus-route");
        }

        // ADD NEW ROUTE SOURCE

        campusMap.addSource("campus-route", {

            type: "geojson",

            data: routeGeoJSON

        });

        // OUTER ROUTE LINE

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

        // MAIN BLUE ROUTE LINE

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

        // START MARKER

        if (routeStartMarker) {
            routeStartMarker.remove();
        }

        routeStartMarker = new maplibregl.Marker({
            color: "#39B68A"
        })
        .setLngLat(start.coordinates)
        .addTo(campusMap);

        // DESTINATION MARKER

        if (routeEndMarker) {
            routeEndMarker.remove();
        }

        routeEndMarker = new maplibregl.Marker({
            color: "#91AFC5"
        })
        .setLngLat(destination.coordinates)
        .addTo(campusMap);

        // FIT MAP TO ROUTE

        const bounds = new maplibregl.LngLatBounds();

        routeCoordinates.forEach(point => {
            bounds.extend(point);
        });

        campusMap.fitBounds(bounds, {

            padding: 100,

            maxZoom: 19,

            duration: 1200

        });

        // CORRECT DISTANCE AND TIME

        const distanceKm = trip.summary.length;

        const durationSeconds = trip.summary.time;

        const distanceText = distanceKm < 1
            ? Math.round(distanceKm * 1000) + " metres"
            : distanceKm.toFixed(2) + " km";

        const walkingMinutes = Math.max(
            1,
            Math.round(durationSeconds / 60)
        );

        routeStatus.textContent =
            "Walking route: " +
            start.name +
            " → " +
            destination.name +
            " | " +
            distanceText +
            " | Approximately " +
            walkingMinutes +
            " minutes.";
        // Display turn-by-turn instructions

renderRouteDirections(
    leg,
    trip,
    start,
    destination
);
        console.log("Route successfully drawn.");

    }

    catch (error) {

        console.error("Route error:", error);

        routeStatus.textContent =
            "Unable to display walking route: " +
            error.message;

    }

    finally {

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


initializeMap();
