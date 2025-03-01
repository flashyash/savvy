import xml.etree.ElementTree as ET



# Load the XML file
xml_file = "en_product4.xml"

# Parse the XML
tree = ET.parse(xml_file)
root = tree.getroot()

# List to store data
data = []

# Navigate the XML and extract data
for disorder in root.findall(".//Disorder"):
    orpha_code = disorder.find("OrphaCode").text.strip() if disorder.find("OrphaCode") is not None else "N/A"

    # Find all HPO associations inside this disorder
    for association in disorder.findall(".//HPODisorderAssociation"):
        hpo_id = association.find("HPO/HPOId").text.strip() if association.find("HPO/HPOId") is not None else "N/A"

        # Ensure HPO ID has 7 digits
        hpo_id_padded = hpo_id.replace("HP:", "").zfill(7)
        formatted_hpo_id = f"HPO:{hpo_id_padded}"

        # Store the formatted result
        data.append(f"{formatted_hpo_id}  OrphaCode:{orpha_code}")

# Sort the data by HPO ID for better organization
data.sort()

# Write to a text file
output_file = "HPO_Orphanet.txt"
with open(output_file, "w") as f:
    f.write("\n".join(data))

print(f"Data successfully saved to {output_file}")
