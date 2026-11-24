
import sqlite3
import requests

from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

DATABASE = "campus.db"

VALHALLA_URL = "https://valhalla1.openstreetmap.de/route"


# =====================================
# 1. CAMPUS LOCATION DATA
# =====================================

LOCATIONS = [
    {
        "id": "campus",
        "name": "RNS Institute of Technology",
        "category": "Campus",
        "description": "Main RNSIT campus",
        "coordinates": [77.5184739, 12.9012543]
    },
    {
        "id": "cse",
        "name": "CSE Department",
        "category": "Department",
        "description": "Computer Science and Engineering",
        "coordinates": [77.51792319271713, 12.901982967309449]
    },
    {
        "id": "ece",
        "name": "ECE Department",
        "category": "Department",
        "description": "Electronics and Communication Engineering",
        "coordinates": [77.5178667791052, 12.902484345116491]
    },
    {
        "id": "eee",
        "name": "EEE Department",
        "category": "Department",
        "description": "Electrical and Electronics Engineering",
        "coordinates": [77.5190984079474, 12.901652755703868]
    },
    {
        "id": "mechanical",
        "name": "Mechanical Department",
        "category": "Department",
        "description": "Mechanical Engineering",
        "coordinates": [77.5190984079474, 12.901652755703868]
    },
    {
        "id": "data-science",
        "name": "Data Science Department",
        "category": "Department",
        "description": "Computer Science - Data Science",
        "coordinates": [77.5190984079474, 12.901652755703868]
    },
    {
        "id": "mba",
        "name": "MBA Department",
        "category": "Department",
        "description": "Management studies",
        "coordinates": [77.51878467714974, 12.900997144437993]
    },
    {
        "id": "civil",
        "name": "Civil Block",
        "category": "Department",
        "description": "Civil Engineering Block",
        "coordinates": [77.51755806140841, 12.901736835096278]
    },
    {
        "id": "cyber-security",
        "name": "Cyber Security Block",
        "category": "Department",
        "description": "Cyber Security Department",
        "coordinates": [77.5173683689213, 12.901460473664356]
    },
    {
        "id": "boys-hostel",
        "name": "Boys Hostel",
        "category": "Hostel",
        "description": "Boys residential facility",
        "coordinates": [77.51711641887431, 12.901802134635767]
    },
    {
        "id": "girls-hostel",
        "name": "Girls Hostel",
        "category": "Hostel",
        "description": "Girls residential facility",
        "coordinates": [77.51740719008096, 12.902432266502439]
    },
    {
        "id": "library",
        "name": "Library",
        "category": "Facility",
        "description": "College library",
        "coordinates": [77.51790845199041, 12.900662877475174]
    },
    {
        "id": "temple",
        "name": "RNSIT Temple",
        "category": "Facility",
        "description": "Campus temple",
        "coordinates": [77.51844279400655, 12.8999507538357]
    },
    {
        "id": "gallery",
        "name": "Gallery",
        "category": "Facility",
        "description": "Campus gallery",
        "coordinates": [77.51857059799245, 12.902113021245858]
    },
    {
        "id": "admin",
        "name": "Admin Block",
        "category": "Administration",
        "description": "Administrative office",
        "coordinates": [77.51860144538693, 12.902290153486746]
    },
    {
        "id": "canteen",
        "name": "Canteen",
        "category": "Food",
        "description": "Campus canteen",
        "coordinates": [77.51808509417451, 12.90074238530015]
    },
    {
        "id": "main-entrance",
        "name": "Main Entrance",
        "category": "Entrance",
        "description": "Main campus entrance",
        "coordinates": [77.5192045161297, 12.902553942804538]
    },
    {
        "id": "parking",
        "name": "Parking Area",
        "category": "Parking",
        "description": "Campus parking area",
        "coordinates": [77.51812462770418, 12.89979190352434]
    },
    {
        "id": "playground",
        "name": "RNSIT Playground",
        "category": "Sports",
        "description": "Campus playground",
        "coordinates": [77.5160160830609, 12.899452590266124]
    },
    {
        "id": "rns-school",
        "name": "RNS School",
        "category": "Educational Institution",
        "description": "RNS School",
        "coordinates": [77.51683865936256, 12.900671522354397]
    },
    {
        "id": "pu-college",
        "name": "RNS PU College",
        "category": "Educational Institution",
        "description": "RNS Pre-University College",
        "coordinates": [77.51886414500929, 12.9007217446207]
    },
    {
        "id": "first-grade-college",
        "name": "RNS First Grade College",
        "category": "Educational Institution",
        "description": "RNS First Grade College",
        "coordinates": [77.51752338643695, 12.901092654011052]
    }
]


# =====================================
# 2. DATABASE CONNECTION
# =====================================

def get_db():
    connection = sqlite3.connect(DATABASE)
    connection.row_factory = sqlite3.Row
    return connection


# =====================================
# 3. INITIALIZE DATABASE
# =====================================

def init_db():

    connection = get_db()

    connection.execute("""
        CREATE TABLE IF NOT EXISTS locations (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            category TEXT NOT NULL,
            description TEXT,
            longitude REAL NOT NULL,
            latitude REAL NOT NULL
        )
    """)

    for location in LOCATIONS:

        connection.execute("""
            INSERT OR IGNORE INTO locations
            (id, name, category, description, longitude, latitude)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (
            location["id"],
            location["name"],
            location["category"],
            location["description"],
            location["coordinates"][0],
            location["coordinates"][1]
        ))

    connection.commit()
    connection.close()


# =====================================
# 4. FORMAT DATABASE LOCATION
# =====================================

def format_location(row):

    return {
        "id": row["id"],
        "name": row["name"],
        "category": row["category"],
        "description": row["description"],
        "coordinates": [
            row["longitude"],
            row["latitude"]
        ]
    }


# =====================================
# 5. HOME AND HEALTH APIs
# =====================================

@app.route("/", methods=["GET"])
def home():

    return jsonify({
        "message": "RNSIT Campus Navigation API",
        "status": "running"
    })


@app.route("/api/health", methods=["GET"])
def health():

    return jsonify({
        "status": "healthy",
        "backend": "Flask",
        "database": "SQLite"
    })


# =====================================
# 6. GET ALL LOCATIONS
# =====================================

@app.route("/api/locations", methods=["GET"])
def get_locations():

    connection = get_db()

    rows = connection.execute(
        "SELECT * FROM locations ORDER BY name"
    ).fetchall()

    connection.close()

    locations = [format_location(row) for row in rows]

    return jsonify({
        "count": len(locations),
        "locations": locations
    })


# =====================================
# 7. GET LOCATION BY ID
# =====================================

@app.route("/api/locations/<location_id>", methods=["GET"])
def get_location(location_id):

    connection = get_db()

    row = connection.execute(
        "SELECT * FROM locations WHERE id = ?",
        (location_id,)
    ).fetchone()

    connection.close()

    if row is None:
        return jsonify({
            "error": "Location not found"
        }), 404

    return jsonify(format_location(row))


# =====================================
# 8. SEARCH LOCATIONS
# =====================================

@app.route("/api/search", methods=["GET"])
def search_locations():

    query = request.args.get("q", "").strip()

    if not query:
        return jsonify({
            "error": "Search query is required"
        }), 400

    connection = get_db()

    rows = connection.execute("""
        SELECT * FROM locations
        WHERE name LIKE ?
        OR category LIKE ?
        OR description LIKE ?
        ORDER BY name
    """, (
        f"%{query}%",
        f"%{query}%",
        f"%{query}%"
    )).fetchall()

    connection.close()

    results = [format_location(row) for row in rows]

    return jsonify({
        "query": query,
        "count": len(results),
        "results": results
    })


# =====================================
# 9. GET ALL CATEGORIES
# =====================================

@app.route("/api/categories", methods=["GET"])
def get_categories():

    connection = get_db()

    rows = connection.execute("""
        SELECT DISTINCT category
        FROM locations
        ORDER BY category
    """).fetchall()

    connection.close()

    categories = [row["category"] for row in rows]

    return jsonify({
        "categories": categories
    })


# =====================================
# 10. WALKING NAVIGATION API
# =====================================

@app.route("/api/routes", methods=["POST"])
def get_route():

    data = request.get_json(silent=True) or {}

    start_id = data.get("from_id")
    destination_id = data.get("to_id")

    if not start_id or not destination_id:
        return jsonify({
            "error": "Both from_id and to_id are required"
        }), 400

    connection = get_db()

    start = connection.execute(
        "SELECT * FROM locations WHERE id = ?",
        (start_id,)
    ).fetchone()

    destination = connection.execute(
        "SELECT * FROM locations WHERE id = ?",
        (destination_id,)
    ).fetchone()

    connection.close()

    if start is None or destination is None:
        return jsonify({
            "error": "Invalid starting point or destination"
        }), 404

    if start_id == destination_id:
        return jsonify({
            "error": "Starting point and destination must be different"
        }), 400

    payload = {
        "locations": [
            {
                "lat": start["latitude"],
                "lon": start["longitude"],
                "type": "break",
                "name": start["name"]
            },
            {
                "lat": destination["latitude"],
                "lon": destination["longitude"],
                "type": "break",
                "name": destination["name"]
            }
        ],
        "costing": "pedestrian",
        "units": "km",
        "format": "json",
        "directions_type": "instructions",
        "language": "en"
    }

    try:

        response = requests.post(
            VALHALLA_URL,
            json=payload,
            timeout=20
        )

        response.raise_for_status()

        return jsonify(response.json())

    except requests.RequestException as error:

        return jsonify({
            "error": "Unable to calculate walking route",
            "details": str(error)
        }), 502


# =====================================
# 11. ADD NEW CAMPUS LOCATION
# =====================================

@app.route("/api/locations", methods=["POST"])
def add_location():

    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return jsonify({"error": "Valid JSON object required"}), 400

    required_fields = [
        "id", "name", "category",
        "description", "coordinates"
    ]

    for field in required_fields:
        if field not in data:
            return jsonify({
                "error": f"Missing required field: {field}"
            }), 400

    location_id = data["id"]
    name = data["name"]
    category = data["category"]
    description = data["description"]
    coordinates = data["coordinates"]

    if not all(
        isinstance(value, str) and value.strip()
        for value in [location_id, name, category, description]
    ):
        return jsonify({
            "error": "Location text fields must be non-empty strings"
        }), 400

    if (
        not isinstance(coordinates, list)
        or len(coordinates) != 2
        or any(
            isinstance(value, bool) or
            not isinstance(value, (int, float))
            for value in coordinates
        )
    ):
        return jsonify({
            "error": "Coordinates must be [longitude, latitude]"
        }), 400

    longitude, latitude = coordinates

    if not (-180 <= longitude <= 180 and -90 <= latitude <= 90):
        return jsonify({
            "error": "Invalid longitude or latitude"
        }), 400

    connection = get_db()

    try:
        connection.execute("""
            INSERT INTO locations
            (id, name, category, description, longitude, latitude)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (
            location_id.strip(),
            name.strip(),
            category.strip(),
            description.strip(),
            longitude,
            latitude
        ))

        connection.commit()

        return jsonify({
            "message": "Location added successfully",
            "id": location_id
        }), 201

    except sqlite3.IntegrityError:

        return jsonify({
            "error": "Location ID already exists"
        }), 409

    finally:
        connection.close()


# =====================================
# 12. UPDATE CAMPUS LOCATION
# =====================================

@app.route("/api/locations/<location_id>", methods=["PUT"])
def update_location(location_id):

    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return jsonify({"error": "Valid JSON object required"}), 400

    required_fields = [
        "name", "category",
        "description", "coordinates"
    ]

    for field in required_fields:
        if field not in data:
            return jsonify({
                "error": f"Missing required field: {field}"
            }), 400

    name = data["name"]
    category = data["category"]
    description = data["description"]
    coordinates = data["coordinates"]

    if not all(
        isinstance(value, str) and value.strip()
        for value in [name, category, description]
    ):
        return jsonify({
            "error": "Location text fields must be non-empty strings"
        }), 400

    if (
        not isinstance(coordinates, list)
        or len(coordinates) != 2
        or any(
            isinstance(value, bool) or
            not isinstance(value, (int, float))
            for value in coordinates
        )
    ):
        return jsonify({
            "error": "Coordinates must be [longitude, latitude]"
        }), 400

    longitude, latitude = coordinates

    if not (-180 <= longitude <= 180 and -90 <= latitude <= 90):
        return jsonify({
            "error": "Invalid longitude or latitude"
        }), 400

    connection = get_db()

    cursor = connection.execute("""
        UPDATE locations
        SET name = ?,
            category = ?,
            description = ?,
            longitude = ?,
            latitude = ?
        WHERE id = ?
    """, (
        name.strip(),
        category.strip(),
        description.strip(),
        longitude,
        latitude,
        location_id
    ))

    connection.commit()

    if cursor.rowcount == 0:
        connection.close()

        return jsonify({
            "error": "Location not found"
        }), 404

    connection.close()

    return jsonify({
        "message": "Location updated successfully",
        "id": location_id
    })


# =====================================
# 13. DELETE CAMPUS LOCATION
# =====================================

@app.route("/api/locations/<location_id>", methods=["DELETE"])
def delete_location(location_id):

    connection = get_db()

    cursor = connection.execute(
        "DELETE FROM locations WHERE id = ?",
        (location_id,)
    )

    connection.commit()

    if cursor.rowcount == 0:
        connection.close()

        return jsonify({
            "error": "Location not found"
        }), 404

    connection.close()

    return jsonify({
        "message": "Location deleted successfully",
        "id": location_id
    })

# =====================================
# 11. ERROR HANDLERS
# =====================================

@app.errorhandler(404)
def not_found(error):

    return jsonify({
        "error": "API endpoint not found"
    }), 404


@app.errorhandler(500)
def server_error(error):

    return jsonify({
        "error": "Internal server error"
    }), 500


# =====================================
# 12. START SERVER
# =====================================

if __name__ == "__main__":

    init_db()

    print("RNSIT Campus Navigation Backend Started")

    app.run(
        host="127.0.0.1",
        port=5000,
        debug=True
    )
