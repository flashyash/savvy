import xml.etree.ElementTree as ET
import pandas as pd


xml_file = "en_product4.xml"


tree = ET.parse(xml_file)
root = tree.getroot()

data = []


for disorder in root.findall(".//Disorder"):
    orpha_code = disorder.find("OrphaCode").text.strip() if disorder.find("OrphaCode") is not None else "N/A"
    disorder_name = disorder.find("Name").text.strip() if disorder.find("Name") is not None else "N/A"


    for association in disorder.findall(".//HPODisorderAssociation"):
        hpo_id = association.find("HPO/HPOId").text.strip() if association.find("HPO/HPOId") is not None else "N/A"
        hpo_term = association.find("HPO/HPOTerm").text.strip() if association.find("HPO/HPOTerm") is not None else "N/A"
        frequency = association.find("HPOFrequency/Name").text.strip() if association.find("HPOFrequency/Name") is not None else "N/A"


        data.append({
            "OrphaCode": orpha_code,
            "Disorder Name": disorder_name,
            "HPO ID": hpo_id,
            "HPO Term": hpo_term,
            "Frequency": frequency
        })


df = pd.DataFrame(data)

print(df)


df.to_csv("output.csv", index=False)
print("Data successfully saved to output.csv")
