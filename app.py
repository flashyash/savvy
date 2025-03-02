from flask import Flask, request, jsonify, render_template
from disease_finder import disease_finder
from doctor_finder import find_specialists
import uuid

app = Flask(__name__)

# Store active sessions
sessions = {}

@app.route("/")
def home():
    return render_template("index.html")

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
    data = request.get_json()
    
    # Get initial symptoms and configuration
    initial_symptoms = data.get('symptoms', [])
    n_iterations = data.get('max_iterations', 4)
    m_symptoms = data.get('symptoms_per_iteration', 5)
    
    # Create a new session
    session_id = str(uuid.uuid4())
    finder = disease_finder(initial_symptoms, n_iterations, m_symptoms)
    
    # Get next set of symptoms to ask about
    next_symptoms = finder.get_next_symptoms()
    
    # Store session
    sessions[session_id] = finder
    
    return jsonify({
        'session_id': session_id,
        'current_symptoms': finder.phenotype,
        'next_symptoms': next_symptoms,
        'possible_diseases': finder.targets[:10] if len(finder.targets) > 10 else finder.targets,
        'disease_count': len(finder.targets),
        'done': not next_symptoms or finder.iteration_count >= finder.n
    })


@app.route('/api/continue_diagnosis', methods=['POST'])
def continue_diagnosis():
    """Continue an existing diagnostic session with Y/N answers"""
    data = request.get_json()
    
    session_id = data.get('session_id')
    responses = data.get('responses', {})  # Dict of {symptom_id: boolean}
    
    if session_id not in sessions:
        return jsonify({'error': 'Invalid session ID'}), 400
    
    finder = sessions[session_id]
    
    # Process responses
    for symptom, is_present in responses.items():
        finder.visited.append(symptom)
        if is_present:
            finder.phenotype.append(symptom)
    
    # Increment iteration counter
    finder.iteration_count += 1
    
    # Get next set of symptoms
    next_symptoms = finder.get_next_symptoms()
    
    # Check if we're done
    done = not next_symptoms or finder.iteration_count >= finder.n
    
    # If we're done or have very few candidates, return final results
    response_data = {
        'session_id': session_id,
        'current_symptoms': finder.phenotype,
        'next_symptoms': next_symptoms,
        'possible_diseases': finder.targets[:10] if len(finder.targets) > 10 else finder.targets,
        'disease_count': len(finder.targets),
        'done': done
    }
    
    # Add similarity scores for final results
    if done:
        disease_scores = {disease: score for disease, score in finder.similarity_scores.items()}
        response_data['disease_scores'] = disease_scores
        
        # Clean up session if we're done
        if session_id in sessions:
            del sessions[session_id]
    
    return jsonify(response_data)


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
    app.run(debug=True)
