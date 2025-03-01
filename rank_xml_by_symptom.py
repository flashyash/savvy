import xml.etree.ElementTree as ET
import pandas as pd

# Load the XML file
xml_file = "en_product4.xml"

# Parse the XML
tree = ET.parse(xml_file)
root = tree.getroot()

# Define a custom function to convert frequency strings to numeric values for sorting
def frequency_to_numeric(freq):
    mapping = {
        "Very frequent (99-80%)": 5,
        "Frequent (79-30%)": 4,
        "Occasional (29-5%)": 3,
        "Rare (4-1%)": 2,
        "Very rare (<1%)": 1
    }
    return mapping.get(freq, 0)  # Default to 0 if not found

# List to store data
data = []

# Navigate the XML and extract data
for disorder in root.findall(".//Disorder"):
    orpha_code = disorder.find("OrphaCode").text.strip() if disorder.find("OrphaCode") is not None else "N/A"
    disorder_name = disorder.find("Name").text.strip() if disorder.find("Name") is not None else "N/A"

    # Find all HPO associations inside this disorder
    for association in disorder.findall(".//HPODisorderAssociation"):
        hpo_id = association.find("HPO/HPOId").text.strip() if association.find("HPO/HPOId") is not None else "N/A"
        hpo_term = association.find("HPO/HPOTerm").text.strip() if association.find("HPO/HPOTerm") is not None else "N/A"
        frequency = association.find("HPOFrequency/Name").text.strip() if association.find("HPOFrequency/Name") is not None else "N/A"

        # Append data as separate rows per symptom-disease pair
        data.append({
            "HPO ID": hpo_id,
            "HPO Term": hpo_term,
            "Frequency": frequency,
            "Frequency Numeric": frequency_to_numeric(frequency),  # Numeric value for sorting
            "OrphaCode": orpha_code,
            "Disorder Name": disorder_name
        })

# Convert to a Pandas DataFrame
df = pd.DataFrame(data)

# Sort DataFrame by HPO ID, then by Frequency (high to low), then by OrphaCode
df = df.sort_values(by=["HPO ID", "Frequency Numeric", "OrphaCode"], ascending=[True, False, True])

# Drop the extra numeric frequency column before saving
df = df.drop(columns=["Frequency Numeric"])

# Print to check extracted data
print(df)

# Save to CSV
df.to_csv("outputHPO.csv", index=False)
print("Data successfully saved to outputHPO.csv")
