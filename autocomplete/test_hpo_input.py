import json
import pandas as pd
from fuzzywuzzy import process

# Load HPO Synonyms
with open("hpo_synonyms.json", "r", encoding="utf-8") as f:
    hpo_synonyms = json.load(f)

# Load HPO Dictionary (HPO ID → Term mappings)
hpo_df = pd.read_csv("hpo_dictionary.csv")
hpo_dict = dict(zip(hpo_df["HPO Term"].str.lower(), hpo_df["HPO ID"]))

def get_hpo_id(user_input):
    """Returns the HPO ID for a given symptom input using synonyms and dictionary."""
    user_input = user_input.lower().strip()

    # Check synonyms first
    if user_input in hpo_synonyms:
        return hpo_synonyms[user_input]

    # Check exact match in dictionary
    if user_input in hpo_dict:
        return hpo_dict[user_input]

    # Fuzzy match if no direct match found
    best_match, score = process.extractOne(user_input, list(hpo_dict.keys()))
    if score > 80:  # Confidence threshold
        return hpo_dict[best_match]

    return "No match found."

# Test input
while True:
    user_symptom = input("\nEnter a symptom (or type 'exit' to quit): ")
    
    if user_symptom.lower() == "exit":
        break
    
    hpo_id = get_hpo_id(user_symptom)
    print(f"Mapped HPO ID: {hpo_id}")
