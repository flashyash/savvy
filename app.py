from flask import Flask, request, jsonify
from disease_finder import get_disease_and_doctors

app = Flask(__name__)

@app.route("/get_disease_and_doctors", methods=["POST"])
def get_disease_and_doctors_api():
    data = request.json
    symptoms = data.get("symptoms")
    location = data.get("location")
    
    if not symptoms or not location:
        return jsonify({"error": "Missing symptoms or location"}), 400

    result = get_disease_and_doctors(symptoms, location)
    return jsonify(result)

if __name__ == "__main__":
    app.run(debug=True)
