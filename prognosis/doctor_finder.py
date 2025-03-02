import googlemaps
import os

# Initialize Google Maps API
GOOGLE_MAPS_API_KEY = "AIzaSyCCXRBduYFt6XTnREIE_a2JKGhtSsJe4Q4"
gmaps = googlemaps.Client(key=GOOGLE_MAPS_API_KEY)

def find_specialists(location, disease):
    """Finds nearby specialists for a given disease."""
    query = f"{disease} specialist near {location}"
    
    results = gmaps.places(query=query, type="doctor")

    if "results" in results:
        return [
            {
                "name": doctor["name"],
                "address": doctor["formatted_address"],
                "rating": doctor.get("rating", "No rating"),
                "place_id": doctor["place_id"]
            }
            for doctor in results["results"]
        ]
    return []

# Example usage
if __name__ == "__main__":
    location = "Boston, MA"
    disease = "Ehlers-Danlos syndrome"
    print(find_specialists(location, disease))
