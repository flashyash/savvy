from disease_finder import disease_finder
from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import googlemaps
from fuzzywuzzy import process
import pandas as pd
import uuid
import os
import json

app = Flask(__name__)

CORS(app)

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

# Store active sessions
sessions = {}

hpo_df = pd.read_csv("autocomplete/hpo_dictionary.csv")
hpo_terms = list(hpo_df["HPO Term"])

@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

@app.route("/suggest", methods=["GET"])
def suggest():
    user_input = request.args.get("query")
    suggestions = process.extract(user_input, hpo_terms, limit=5)
    response = jsonify({"suggestions": [s[0] for s in suggestions]})

    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
    response.headers.add('Access-Control-Allow-Methods', 'GET')
    
    return response

@app.route("/get_disease_and_doctors", methods=["POST"])
def get_disease_and_doctors_api():
    data = request.json
    symptoms = data.get("symptoms")
    location = data.get("location")
    
    if not symptoms or not location:
        return jsonify({"error": "Missing symptoms or location"}), 400

    result = find_specialists(symptoms, location)
    return jsonify(result)


@app.route('/api/start_diagnosis', methods=['POST'])
def start_diagnosis():
    """Start a new diagnostic session with initial symptoms"""

    print("enter")

    data = request.get_json()

    print(data)
    
    # Get initial symptoms and configuration
    initial_symptoms = data.get('symptoms', [])
    n_iterations = data.get('max_iterations', 4)
    m_symptoms = data.get('symptoms_per_iteration', 5)
    
    # Create a new session
    session_id = str(uuid.uuid4())
    finder = disease_finder(initial_symptoms, n_iterations, m_symptoms)
    
    # Get next set of symptoms to ask about
    next_symptoms = finder.iteration()
    
    # Store session
    sessions[session_id] = finder

    possible_diseases = finder.targets[:10] if len(finder.targets) > 10 else finder.targets
    
    # Check done condition serialization
    done_condition = not next_symptoms or len(possible_diseases) <= 3 or finder.iteration_count >= finder.n
    
    # Create response dictionary with validated values
    response_dict = {
        'session_id': session_id,
        'current_symptoms': finder.phenotype,
        'next_symptoms': [str(key) for key in next_symptoms],
        'possible_diseases': [str(key) for key in possible_diseases],
        'disease_count': len(finder.targets),
        'done': done_condition
    }
    
    # Now try to jsonify
    response = jsonify(response_dict)

    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
    response.headers.add('Access-Control-Allow-Methods', 'POST')
    
    return response


@app.route('/api/continue_diagnosis', methods=['POST'])
def continue_diagnosis():
    """Continue an existing diagnostic session with Y/N answers"""
    print("Request started")
    data = request.get_json()
    
    session_id = data.get('session_id')
    responses = data.get('responses', {})  # Dict of {symptom_id: boolean}
    
    if session_id not in sessions:
        print('invalid')
        print(session_id, sessions)
        return jsonify({'error': 'Invalid session ID'}), 400

    finder = sessions[session_id]
    print(finder)

    # Process responses
    for symptom, is_present in responses.items():
        finder.visited.append(symptom)
        if is_present:
            finder.phenotype.append(symptom)
    
    # Increment iteration counter
    
    # Get next set of symptoms
    next_symptoms = finder.iteration()
    
    # Check if we're done
    done = not next_symptoms or len(finder.targets) <= 3 or finder.iteration_count >= finder.n
    
    # If we're done or have very few candidates, return final results
    response_dict = {
        'session_id': session_id,
        'current_symptoms': finder.phenotype,
        'next_symptoms': [str(key) for key in next_symptoms],
        'possible_diseases': [str(key) for key in finder.targets],
        'disease_count': len(finder.targets),
        'done': done
    }
    
    # Add similarity scores for final results
    # if done:
    #     disease_scores = {disease: score for disease, score in finder.similarity_scores.items()}
    #     response_dict['disease_scores'] = disease_scores
        
    #     # Clean up session if we're done
    #     if session_id in sessions:
    #         del sessions[session_id]
    
    return jsonify(response_dict)


@app.route('/api/reset_session', methods=['POST'])
def reset_session():
    """Reset an existing session or create a new one"""
    data = request.get_json()
    session_id = data.get('session_id')
    
    if session_id and session_id in sessions:
        sessions[session_id].reset()
    else:
        session_id = str(uuid.uuid4())
        sessions[session_id] = disease_finder()
    
    return jsonify({
        'session_id': session_id,
        'message': 'Session reset successfully'
    })


if __name__ == '__main__':
    app.run(debug=True, host = '127.0.0.1', port = 5000)
