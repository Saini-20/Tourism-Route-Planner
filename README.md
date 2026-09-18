# Tourism Route Planner

A Tamil Nadu Tourism Route Planner built using Graph Theory and JavaScript. The project visualizes tourist cities and travel paths while demonstrating DFS, Prim's, and Dijkstra's algorithms through an interactive graph and map-based interface.

## Features

- Explore connected tourist cities using **Depth-First Search (DFS)**.
- Connect all cities with minimum total travel cost using **Prim's Algorithm (Minimum Spanning Tree)**.
- Find the shortest path between two cities using **Dijkstra's Algorithm**.
- Interactive graph visualization with nodes and weighted edges.
- Interactive map visualization using **Leaflet.js**.
- Display tourist cities and routes on a geographical map.
- Step-by-step algorithm execution with node and edge highlighting.
- Navigate through algorithm execution using Previous Step and Next Step controls.
- Reset the graph and restart the visualization at any time.

## How to Use

1. Open the project in a browser.
2. Select an algorithm from DFS, Prim's, or Dijkstra's.
3. For DFS and Dijkstra's, choose a start city.
4. For Dijkstra's, also select an end city.
5. Click **Run Algorithm** to start the visualization.
6. Use **Previous Step** and **Next Step** to observe the algorithm execution step by step.
7. View the selected cities and routes on the interactive Leaflet map.
8. Click **Reset Graph** to start over.

## Algorithms Used

### DFS (Depth-First Search)

Explores connected cities by visiting one branch as deeply as possible before backtracking.

### Prim's Algorithm

Builds a Minimum Spanning Tree (MST) by connecting all cities with the minimum possible total edge weight without forming cycles.

### Dijkstra's Algorithm

Finds the shortest path between a source city and a destination city using non-negative weighted edges.

## Graph Details

### Nodes (Cities)

The graph contains the following Tamil Nadu tourist cities:

- Chennai
- Coimbatore
- Erode
- Vellore
- Pondicherry
- Mahabalipuram
- Kanchipuram
- Yelagiri
- Thanjavur
- Ooty
- Rameswaram
- Kanyakumari
- Madurai
- Trichy
- Salem

### Edges

Edges represent connections between cities, with weights based on the travel distances between them.

### Visualization

The project provides two forms of visualization:

- **Graph Visualization:** Displays cities as nodes and connections as weighted edges.
- **Map Visualization:** Uses Leaflet.js to display cities geographically and visualize routes between them.

## Technologies Used

- HTML
- CSS
- JavaScript
- Leaflet.js
- Graph Theory and Data Structures

## Project Structure

```text
Tourism-Route-Planner/
│
├── index.html      # Main HTML page with graph and map visualization
├── style.css       # Styling for nodes, edges, panels, and layout
├── script.js       # JavaScript logic for algorithms and visualizations
└── README.md       # Project documentation