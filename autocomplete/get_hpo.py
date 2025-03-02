import pandas as pd

# Input OBO file (make sure it's in the data folder)
obo_file = "hp.obo"

# Output CSV file
csv_output = "hpo_dictionary.csv"

# List to store HPO ID and Term mappings
hpo_data = []

# Open and parse the OBO file
with open(obo_file, "r", encoding="utf-8") as f:
    current_id = None
    current_name = None

    for line in f:
        line = line.strip()

        if line.startswith("id: HP:"):
            current_id = line.split(": ")[1]

        elif line.startswith("name: "):
            current_name = line.split(": ")[1]

        elif line == "" and current_id and current_name:
            # Store extracted HPO ID and Term
            hpo_data.append({"HPO ID": current_id, "HPO Term": current_name})
            current_id = None
            current_name = None  # Reset for next entry

# Convert list to Pandas DataFrame
df = pd.DataFrame(hpo_data)

# Save as CSV
df.to_csv(csv_output, index=False)
print(f"✅ HPO Dictionary saved to {csv_output}")
