from flask import Flask, request, jsonify
from fuzzywuzzy import process
import pandas as pd

app = Flask(__name__)

# Load HPO dictionary
hpo_df = pd.read_csv("hpo_dictionary.csv")
hpo_terms = list(hpo_df["HPO Term"])

@app.route("/suggest", methods=["GET"])
def suggest():
    user_input = request.args.get("query")
    suggestions = process.extract(user_input, hpo_terms, limit=5)
    
    return jsonify({"suggestions": [s[0] for s in suggestions]})

if __name__ == "__main__":
    app.run(debug=True)
