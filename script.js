// ============================================
// TAMIL NADU TOURISM ROUTE PLANNER
// Leaflet Map + DFS + Prim's MST + Dijkstra
// ============================================


// -----------------------------
// CITY DATA
// -----------------------------

const cities = {
    Chennai: {
        lat: 13.0827,
        lng: 80.2707
    },

    Mahabalipuram: {
        lat: 12.6269,
        lng: 80.1927
    },

    Kanchipuram: {
        lat: 12.8342,
        lng: 79.7036
    },

    Vellore: {
        lat: 12.9165,
        lng: 79.1325
    },

    Yelagiri: {
        lat: 12.5797,
        lng: 78.6400
    },

    Salem: {
        lat: 11.6643,
        lng: 78.1460
    },

    Erode: {
        lat: 11.3410,
        lng: 77.7172
    },

    Coimbatore: {
        lat: 11.0168,
        lng: 76.9558
    },

    Ooty: {
        lat: 11.4102,
        lng: 76.6950
    },

    Madurai: {
        lat: 9.9252,
        lng: 78.1198
    },

    Rameswaram: {
        lat: 9.2881,
        lng: 79.3129
    },

    Kanyakumari: {
        lat: 8.0883,
        lng: 77.5385
    },

    Thanjavur: {
        lat: 10.7870,
        lng: 79.1378
    },

    Trichy: {
        lat: 10.7905,
        lng: 78.7047
    },

    Pondicherry: {
        lat: 11.9416,
        lng: 79.8083
    }
};


// -----------------------------
// GRAPH EDGES
// -----------------------------

const edges = [
    { from: "Chennai", to: "Mahabalipuram", weight: 55 },
    { from: "Mahabalipuram", to: "Kanchipuram", weight: 65 },
    { from: "Kanchipuram", to: "Vellore", weight: 80 },
    { from: "Vellore", to: "Yelagiri", weight: 45 },
    { from: "Yelagiri", to: "Salem", weight: 110 },
    { from: "Salem", to: "Erode", weight: 70 },
    { from: "Erode", to: "Coimbatore", weight: 100 },
    { from: "Coimbatore", to: "Ooty", weight: 85 },
    { from: "Salem", to: "Trichy", weight: 160 },
    { from: "Trichy", to: "Thanjavur", weight: 55 },
    { from: "Thanjavur", to: "Madurai", weight: 190 },
    { from: "Madurai", to: "Rameswaram", weight: 170 },
    { from: "Rameswaram", to: "Kanyakumari", weight: 310 },
    { from: "Pondicherry", to: "Mahabalipuram", weight: 95 },
    { from: "Pondicherry", to: "Chennai", weight: 160 },
    { from: "Chennai", to: "Kanchipuram", weight: 75 },
    { from: "Trichy", to: "Madurai", weight: 140 },
    { from: "Erode", to: "Trichy", weight: 120 }
];


// -----------------------------
// GLOBAL VARIABLES
// -----------------------------

let map;

let currentAlgorithm = "dfs";

let animationSteps = [];
let currentStep = 0;
let isAnimating = false;

let cityMarkers = {};
let edgeLines = {};


// -----------------------------
// INITIALIZE MAP
// -----------------------------

function initializeMap() {

    map = L.map("map-container").setView(
        [11.1271, 78.6569],
        7
    );

    L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
            attribution:
                '&copy; OpenStreetMap contributors'
        }
    ).addTo(map);

    drawAllEdges();
    drawAllCities();

    populateDropdowns();
    updateStats();
}


// -----------------------------
// DRAW CITIES
// -----------------------------

function drawAllCities() {

    Object.keys(cities).forEach((city) => {

        const location = cities[city];

        const marker = L.circleMarker(
            [location.lat, location.lng],
            {
                radius: 8,
                color: "#ffffff",
                weight: 2,
                fillColor: "#3498db",
                fillOpacity: 1
            }
        ).addTo(map);

        marker.bindPopup(`
            <b>${city}</b><br>
            Tourist City
        `);

        marker.bindTooltip(city, {
            permanent: true,
            direction: "top",
            offset: [0, -8]
        });

        cityMarkers[city] = marker;

    });
}


// -----------------------------
// DRAW ALL EDGES
// -----------------------------

function drawAllEdges() {

    edges.forEach((edge) => {

        const from = cities[edge.from];
        const to = cities[edge.to];

        const line = L.polyline(
            [
                [from.lat, from.lng],
                [to.lat, to.lng]
            ],
            {
                color: "#95a5a6",
                weight: 3,
                opacity: 0.7
            }
        ).addTo(map);

        line.bindTooltip(
            `${edge.from} ↔ ${edge.to} (${edge.weight} km)`
        );

        edgeLines[getEdgeKey(edge.from, edge.to)] = line;

    });
}


// -----------------------------
// EDGE KEY
// -----------------------------

function getEdgeKey(city1, city2) {

    return [city1, city2]
        .sort()
        .join("--");

}


// -----------------------------
// POPULATE DROPDOWNS
// -----------------------------

function populateDropdowns() {

    const startSelect = document.getElementById("start-city");
    const endSelect = document.getElementById("end-city");

    startSelect.innerHTML = "";
    endSelect.innerHTML = "";

    Object.keys(cities).forEach((city) => {

        const option1 = document.createElement("option");
        option1.value = city;
        option1.textContent = city;

        const option2 = document.createElement("option");
        option2.value = city;
        option2.textContent = city;

        startSelect.appendChild(option1);
        endSelect.appendChild(option2);

    });

    startSelect.value = "Chennai";
    endSelect.value = "Kanyakumari";

}


// -----------------------------
// UPDATE STATISTICS
// -----------------------------

function updateStats() {

    document.getElementById("nodes-count").textContent =
        Object.keys(cities).length;

    document.getElementById("edges-count").textContent =
        edges.length;

    document.getElementById("visited-count").textContent =
        0;

    document.getElementById("current-step").textContent =
        currentStep;

}


// -----------------------------
// SELECT ALGORITHM
// -----------------------------

function selectAlgorithm(event, algorithm) {

    currentAlgorithm = algorithm;

    document.querySelectorAll(".algorithm-btn").forEach((button) => {
        button.classList.remove("active");
    });

    event.currentTarget.classList.add("active");

    const description =
        document.getElementById("algorithm-description");

    if (algorithm === "dfs") {

        description.textContent =
            "DFS explores all connected nodes from a starting point using a stack-based approach. Time Complexity: O(V + E)";

    } else if (algorithm === "prims") {

        description.textContent =
            "Prim's algorithm finds a minimum spanning tree for a weighted undirected graph. Time Complexity: O(E log V)";

    } else {

        description.textContent =
            "Dijkstra's algorithm finds the shortest path between nodes in a weighted graph. Time Complexity: O((V + E) log V)";

    }

    resetGraph();

}


// -----------------------------
// RUN SELECTED ALGORITHM
// -----------------------------

function runAlgorithm() {

    if (isAnimating) return;

    resetGraph();

    const startCity =
        document.getElementById("start-city").value;

    const endCity =
        document.getElementById("end-city").value;

    if (
        startCity === endCity &&
        currentAlgorithm !== "prims"
    ) {
        alert("Please select different start and end cities!");
        return;
    }

    isAnimating = true;

    if (currentAlgorithm === "dfs") {

        runDFS(startCity, endCity);

    } else if (currentAlgorithm === "prims") {

        runPrims(startCity);

    } else {

        runDijkstra(startCity, endCity);

    }

    currentStep = 0;
    executeStep();

}


// ============================================
// DFS
// ============================================

function runDFS(startCity, endCity) {

    animationSteps = [];

    const visited = new Set();

    const stack = [
        [startCity, [startCity]]
    ];

    let found = false;

    animationSteps.push({
        action: "start",
        message: `🚀 Starting DFS from ${startCity} to find ${endCity}`,
        visited: new Set(),
        current: startCity,
        path: [startCity]
    });

    while (stack.length > 0 && !found) {

        const [current, path] = stack.pop();

        if (!visited.has(current)) {

            visited.add(current);

            animationSteps.push({
                action: "visit",
                node: current,
                message: `🔍 Visiting ${current} (${visited.size}/${Object.keys(cities).length} cities explored)`,
                visited: new Set(visited),
                current: current,
                path: [...path]
            });

            if (current === endCity) {

                found = true;

                animationSteps.push({
                    action: "found",
                    node: current,
                    message: `🎉 Destination ${endCity} found! Path: ${path.join(" → ")}`,
                    visited: new Set(visited),
                    current: current,
                    path: [...path]
                });

                break;
            }

            const neighbors = getNeighbors(current)
                .filter((neighbor) => !visited.has(neighbor));

            for (const neighbor of neighbors.reverse()) {

                const newPath = [...path, neighbor];

                animationSteps.push({
                    action: "discover",
                    from: current,
                    to: neighbor,
                    message: `🔗 Discovering ${neighbor} from ${current}`,
                    visited: new Set(visited),
                    current: current,
                    path: [...path]
                });

                stack.push([neighbor, newPath]);
            }
        }
    }

    if (!found) {

        animationSteps.push({
            action: "notfound",
            message: `❌ Path from ${startCity} to ${endCity} not found!`,
            visited: new Set(visited),
            path: []
        });

    }

}


// ============================================
// PRIM'S MST
// ============================================

function runPrims(startCity) {

    animationSteps = [];

    const visited = new Set([startCity]);
    const mstEdges = [];
    const priorityQueue = [];

    getNeighbors(startCity).forEach((neighbor) => {

        const edge = getEdge(startCity, neighbor);

        if (edge) {
            priorityQueue.push({
                ...edge,
                priority: edge.weight
            });
        }

    });

    priorityQueue.sort((a, b) => a.weight - b.weight);

    animationSteps.push({
        action: "start",
        message: `🌳 Starting Prim's MST algorithm from ${startCity}`,
        visited: new Set(visited),
        current: startCity,
        mstEdges: []
    });

    while (
        visited.size < Object.keys(cities).length &&
        priorityQueue.length > 0
    ) {

        const minEdge = priorityQueue.shift();

        const newCity = visited.has(minEdge.from)
            ? minEdge.to
            : minEdge.from;

        if (visited.has(newCity)) continue;

        visited.add(newCity);
        mstEdges.push(minEdge);

        animationSteps.push({
            action: "visit",
            node: newCity,
            message: `➕ Adding ${newCity} to MST via ${minEdge.from} ↔ ${minEdge.to} (weight: ${minEdge.weight})`,
            visited: new Set(visited),
            current: newCity,
            edge: minEdge,
            mstEdges: [...mstEdges]
        });

        getNeighbors(newCity).forEach((neighbor) => {

            if (!visited.has(neighbor)) {

                const edge = getEdge(newCity, neighbor);

                if (edge) {

                    priorityQueue.push({
                        ...edge,
                        priority: edge.weight
                    });

                    priorityQueue.sort(
                        (a, b) => a.weight - b.weight
                    );
                }
            }

        });

    }

    const totalWeight = mstEdges.reduce(
        (sum, edge) => sum + edge.weight,
        0
    );

    animationSteps.push({
        action: "complete",
        message: `✅ Prim's MST completed! Total weight: ${totalWeight} km, Edges: ${mstEdges.length}`,
        visited: new Set(visited),
        mstEdges: [...mstEdges]
    });

}


// ============================================
// DIJKSTRA
// ============================================

function runDijkstra(startCity, endCity) {

    animationSteps = [];

    const distances = {};
    const previous = {};
    const visited = new Set();

    const priorityQueue = [];

    Object.keys(cities).forEach((city) => {

        distances[city] =
            city === startCity ? 0 : Infinity;

        previous[city] = null;

        priorityQueue.push({
            city: city,
            distance: distances[city]
        });

    });

    priorityQueue.sort(
        (a, b) => a.distance - b.distance
    );

    animationSteps.push({
        action: "start",
        message: `🎯 Starting Dijkstra's algorithm from ${startCity} to ${endCity}`,
        visited: new Set(),
        current: startCity,
        distances: { ...distances }
    });

    while (priorityQueue.length > 0) {

        const currentItem = priorityQueue.shift();
        const current = currentItem.city;

        if (visited.has(current)) continue;

        if (distances[current] === Infinity) break;

        visited.add(current);

        animationSteps.push({
            action: "visit",
            node: current,
            message: `📍 Processing ${current} with distance ${distances[current]} km`,
            visited: new Set(visited),
            current: current,
            distances: { ...distances }
        });

        if (current === endCity) {

            const path = [];

            let pathNode = endCity;

            while (pathNode !== null) {

                path.unshift(pathNode);
                pathNode = previous[pathNode];

            }

            animationSteps.push({
                action: "found",
                node: current,
                message: `🎉 Shortest path found! Distance: ${distances[current]} km. Path: ${path.join(" → ")}`,
                visited: new Set(visited),
                current: current,
                distances: { ...distances },
                path: path
            });

            break;
        }

        const neighbors = getNeighbors(current);

        for (const neighbor of neighbors) {

            if (!visited.has(neighbor)) {

                const edge = getEdge(current, neighbor);

                if (edge) {

                    const alt =
                        distances[current] + edge.weight;

                    if (alt < distances[neighbor]) {

                        distances[neighbor] = alt;
                        previous[neighbor] = current;

                        const index = priorityQueue.findIndex(
                            (item) => item.city === neighbor
                        );

                        if (index !== -1) {

                            priorityQueue[index].distance = alt;

                            priorityQueue.sort(
                                (a, b) => a.distance - b.distance
                            );

                        }

                        animationSteps.push({
                            action: "discover",
                            from: current,
                            to: neighbor,
                            message: `🔄 Updated distance to ${neighbor}: ${alt} km via ${current}`,
                            visited: new Set(visited),
                            current: current,
                            distances: { ...distances }
                        });
                    }
                }
            }
        }
    }

    if (distances[endCity] === Infinity) {

        animationSteps.push({
            action: "notfound",
            message: `❌ No path found from ${startCity} to ${endCity}`,
            visited: new Set(visited),
            distances: { ...distances }
        });

    }

}


// ============================================
// GRAPH HELPER FUNCTIONS
// ============================================

function getNeighbors(city) {

    const neighbors = [];

    edges.forEach((edge) => {

        if (edge.from === city) {
            neighbors.push(edge.to);
        }

        if (edge.to === city) {
            neighbors.push(edge.from);
        }

    });

    return neighbors;

}


function getEdge(city1, city2) {

    return edges.find((edge) =>

        (edge.from === city1 && edge.to === city2) ||
        (edge.from === city2 && edge.to === city1)

    );

}


// ============================================
// VISUALIZATION
// ============================================

function executeStep() {

    if (currentStep >= animationSteps.length) {

        document.getElementById("step-info").textContent =
            "🏁 Algorithm completed!";

        isAnimating = false;
        return;
    }

    const step = animationSteps[currentStep];

    document.getElementById("step-info").textContent =
        step.message;

    resetGraphVisuals();

    if (step.visited) {

        document.getElementById("visited-count").textContent =
            step.visited.size;

        step.visited.forEach((city) => {

            updateCityMarker(city, "visited");

        });
    }

    if (step.current) {

        updateCityMarker(step.current, "current");

    }

    if (step.action === "discover") {

        highlightEdge(
            step.from,
            step.to,
            "active"
        );

    }

    if (step.path && step.action === "found") {

        highlightPath(step.path);

    }

    if (step.mstEdges) {

        step.mstEdges.forEach((edge) => {

            highlightEdge(
                edge.from,
                edge.to,
                "path"
            );

        });

    }

    document.getElementById("current-step").textContent =
        currentStep + 1;

    currentStep++;

}


// -----------------------------
// UPDATE MARKER COLOR
// -----------------------------

function updateCityMarker(city, state) {

    const marker = cityMarkers[city];

    if (!marker) return;

    let color = "#3498db";

    if (state === "visited") {
        color = "#2ecc71";
    }

    if (state === "current") {
        color = "#e74c3c";
    }

    if (state === "path") {
        color = "#f39c12";
    }

    marker.setStyle({
        fillColor: color,
        color: "#ffffff",
        radius: state === "current" ? 12 : 8
    });

}


// -----------------------------
// HIGHLIGHT EDGE
// -----------------------------

function highlightEdge(city1, city2, state) {

    const key = getEdgeKey(city1, city2);
    const line = edgeLines[key];

    if (!line) return;

    if (state === "active") {

        line.setStyle({
            color: "#e74c3c",
            weight: 6,
            opacity: 1
        });

    } else if (state === "path") {

        line.setStyle({
            color: "#f39c12",
            weight: 7,
            opacity: 1
        });

    }

}


// -----------------------------
// HIGHLIGHT FINAL PATH
// -----------------------------

function highlightPath(path) {

    if (!path || path.length === 0) return;

    path.forEach((city) => {

        updateCityMarker(city, "path");

    });

    for (let i = 0; i < path.length - 1; i++) {

        highlightEdge(
            path[i],
            path[i + 1],
            "path"
        );

    }

}


// -----------------------------
// RESET MAP VISUALS
// -----------------------------

function resetGraphVisuals() {

    Object.keys(cityMarkers).forEach((city) => {

        cityMarkers[city].setStyle({
            fillColor: "#3498db",
            color: "#ffffff",
            radius: 8
        });

    });

    Object.values(edgeLines).forEach((line) => {

        line.setStyle({
            color: "#95a5a6",
            weight: 3,
            opacity: 0.7
        });

    });

}


// ============================================
// RESET FUNCTIONS
// ============================================

function resetGraph() {

    resetGraphVisuals();

    animationSteps = [];
    currentStep = 0;
    isAnimating = false;

    document.getElementById("visited-count").textContent = "0";
    document.getElementById("current-step").textContent = "0";

    document.getElementById("step-info").textContent =
        "Click 'Run Algorithm' to start the visualization";

}


function resetVisualization() {

    resetGraph();

    const description =
        document.getElementById("algorithm-description");

    if (currentAlgorithm === "dfs") {

        description.textContent =
            "DFS explores all connected nodes from a starting point using a stack-based approach. Time Complexity: O(V + E)";

    } else if (currentAlgorithm === "prims") {

        description.textContent =
            "Prim's algorithm finds a minimum spanning tree for a weighted undirected graph. Time Complexity: O(E log V)";

    } else {

        description.textContent =
            "Dijkstra's algorithm finds the shortest path between nodes in a weighted graph. Time Complexity: O((V + E) log V)";

    }

}


// ============================================
// STEP CONTROLS
// ============================================

function stepAlgorithm() {

    if (!isAnimating && animationSteps.length === 0) {

        alert("Please run an algorithm first!");
        return;

    }

    executeStep();

}


function stepBack() {

    if (currentStep <= 1) return;

    currentStep -= 2;

    executeStep();

}


// ============================================
// INITIALIZE WHEN PAGE LOADS
// ============================================

window.addEventListener("load", function () {

    initializeMap();

});


// ============================================
// KEYBOARD SHORTCUTS
// ============================================

document.addEventListener("keydown", function (event) {

    if (event.key === "ArrowRight" || event.key === " ") {

        event.preventDefault();
        stepAlgorithm();

    } else if (event.key === "ArrowLeft") {

        event.preventDefault();
        stepBack();

    } else if (event.key === "Enter") {

        event.preventDefault();
        runAlgorithm();

    } else if (event.key === "Escape") {

        event.preventDefault();
        resetVisualization();

    }

});