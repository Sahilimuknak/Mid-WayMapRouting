from flask import Flask, request, jsonify, render_template

app = Flask(__name__)

graph = {
    'A': [('B', 5), ('C', 10)],
    'B': [('A', 5), ('C', 3), ('D', 2)],
    'C': [('A', 10), ('B', 3), ('D', 1)],
    'D': [('B', 2), ('C', 1)]
}

# Dijkstra's algorithm function 
def dijkstra(graph, start, end):
    import heapq
    queue = [(0, start)]
    distances = {start: 0}
    previous_nodes = {start: None}

    while queue:
        current_distance, current_node = heapq.heappop(queue)

        if current_node == end:
            break

        for neighbor, weight in graph.get(current_node, []):
            distance = current_distance + weight

            if neighbor not in distances or distance < distances[neighbor]:
                distances[neighbor] = distance
                previous_nodes[neighbor] = current_node
                heapq.heappush(queue, (distance, neighbor))

    path = []
    current_node = end
    while current_node is not None:
        path.insert(0, current_node)
        current_node = previous_nodes.get(current_node)
    
    return distances[end], path

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/calculate-route', methods=['POST'])
def calculate_route():
    data = request.get_json()
    locations = data.get('locations', [])
    
    if len(locations) < 2:
        return jsonify({'error': 'At least two locations are required'}), 400

    start = locations[0]  # Starting location
    end = locations[-1]   # Ending location

    # Call Dijkstra to get the shortest path and its distance
    distance, path = dijkstra(graph, start, end)

    if distance is None:
        return jsonify({'error': 'No path found between the locations'}), 400

    return jsonify({
        'distance': distance,
        'path': path
    })

if __name__ == '__main__':
    app.run(debug=True)
