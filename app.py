from flask import Flask, request, jsonify, render_template
import googlemaps
import os

app = Flask(__name__)

# ✅ Load Google Maps API Key from environment variable
GOOGLE_MAPS_API_KEY = "AIzaSyCCXRBduYFt6XTnREIE_a2JKGhtSsJe4Q4"

gmaps = googlemaps.Client(key=GOOGLE_MAPS_API_KEY)

def find_doctors_nearby(location, disease):
    """Find doctors specializing in the given disease near the provided location."""
    
    # ✅ Convert location to latitude and longitude
    geocode_result = gmaps.geocode(location)
    if not geocode_result:
        return jsonify({"error": "Invalid location"}), 400

    latlng = geocode_result[0]['geometry']['location']
    
    # ✅ Search for doctors near this location
    query = f"doctor specializing in {disease}"
    
    try:
        places_result = gmaps.places(query=query, location=latlng, radius=50000)  # 50km radius
    except googlemaps.exceptions.ApiError as e:
        return jsonify({"error": f"Google Maps API Error: {str(e)}"}), 500

    doctors = []
    for place in places_result.get('results', []):
        doctors.append({
            "name": place.get("name"),
            "address": place.get("formatted_address", "Address not available"),
            "rating": place.get("rating", "No rating"),
            "lat": place["geometry"]["location"]["lat"],
            "lng": place["geometry"]["location"]["lng"],
            "link": f"https://www.google.com/maps/place/?q=place_id:{place.get('place_id')}"
        })

    return jsonify(doctors)  # Ensure response is properly formatted JSON


@app.route("/")
def home():
    return render_template("index.html", google_maps_api_key=GOOGLE_MAPS_API_KEY)

@app.route("/about")
def about():
    return render_template("about.html")

@app.route("/get_doctors", methods=["POST"])
def get_doctors():
    """API to get doctors based on location and disease."""
    try:
        data = request.json
        disease = data.get("disease")
        location = data.get("location")

        if not disease or not location:
            return jsonify({"error": "❌ Missing disease or location"}), 400

        doctors = find_doctors_nearby(location, disease)
        return doctors  # Already a JSON response

    except Exception as e:
        return jsonify({"error": str(e)}), 500  # Return JSON error message

if __name__ == "__main__":
    app.run(debug=True)
