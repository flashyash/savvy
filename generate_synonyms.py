import json
import re

# Input OBO file
obo_file = "hp.obo"
json_output = "hpo_synonyms.json"

# Dictionary to store synonyms
hpo_synonyms = {}

# Open and parse the OBO file
with open(obo_file, "r", encoding="utf-8") as f:
    current_id = None

    for line in f:
        line = line.strip()

        if line.startswith("id: HP:"):
            current_id = line.split(": ")[1]

        elif line.startswith("alt_id: HP:"):
            current_id = line.split(": ")[1]  # Capture alternative IDs

        elif line.startswith("synonym: "):  # Extract synonyms
            match = re.search(r'"(.+?)"', line)
            if match and current_id:
                synonym = match.group(1).lower()  # Store as lowercase for case-insensitive matching
                hpo_synonyms[synonym] = current_id

# Save to JSON
with open(json_output, "w", encoding="utf-8") as f:
    json.dump(hpo_synonyms, f, indent=4)

print(f"✅ HPO Synonyms saved to {json_output}")
