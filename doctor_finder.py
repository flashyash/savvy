import googlemaps
import os

# Load Google Maps API key (set your actual key here)
GOOGLE_MAPS_API_KEY = "AIzaSyCCXRBduYFt6XTnREIE_a2JKGhtSsJe4Q4"
gmaps = googlemaps.Client(key=GOOGLE_MAPS_API_KEY)

def find_doctors_nearby(location, diseases):
    """Find doctors specializing in the given diseases near the provided location."""
    
    # Convert location to latitude and longitude
    geocode_result = gmaps.geocode(location)
    if not geocode_result:
        return {"error": "Invalid location"}

    latlng = geocode_result[0]['geometry']['location']
    
    # Search for doctors near this location
    doctors = []
    for disease in diseases:
        query = f"doctor specializing in {disease} near {location}"
        places_result = gmaps.places(query=query, location=latlng, radius=5000)  # 5km radius

        for place in places_result.get('results', []):
            doctors.append({
                "name": place.get("name"),
                "address": place.get("formatted_address"),
                "rating": place.get("rating", "No rating"),
                "link": f"https://www.google.com/maps/place/?q=place_id:{place.get('place_id')}"
            })

    return doctors
