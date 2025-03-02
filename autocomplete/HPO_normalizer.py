import json
from fuzzywuzzy import process
import pandas as pd

# Load synonym dictionary
with open("hpo_synonyms.json") as f:
    hpo_synonyms = json.load(f)

# Load HPO dictionary
hpo_df = pd.read_csv("hpo_dictionary.csv")
hpo_terms = dict(zip(hpo_df["HPO Term"], hpo_df["HPO ID"]))

def normalize_symptom(user_input):
    # Check synonyms
    if user_input.lower() in hpo_synonyms:
        return hpo_synonyms[user_input.lower()]
    
    # Use fuzzy matching
    best_match, score = process.extractOne(user_input, hpo_terms.keys())
    
    if score > 80:  # Confidence threshold
        return hpo_terms[best_match]
    
    return None  # No good match

# Example usage
user_symptom = "trouble walking"
matched_hpo = normalize_symptom(user_symptom)
print(f"Matched HPO Code: {matched_hpo}")
