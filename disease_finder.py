import phrank.phrank as phrank

THRESHOLD = 0.0 # TODO: Replace
FINAL_THRESHOLD = 0.0 # TODO: Replace



phenotype = ['''Input initial symptoms''']
disease_symptoms = {'''Add code for initialization'''}
diseases = set(disease_symptoms.keys())
similarity_scores = {disease: 0.0 for disease in diseases.keys()}

DAG = ''
DISEASE_TO_PHENO="data/disease_to_pheno.build127.txt"
p_hpo = phrank.Phrank(DAG, diseaseannotationsfile=DISEASE_TO_PHENO)

# computing the similarity scores for each disease
for disease in disease_symptoms:
    symptoms = disease_symptoms[disease]
    similarity_score = p_hpo.compute_phenotype_match(phenotype, symptoms)
    similarity_scores[disease] = similarity_score

# find the new set of diseases
diseases = set([disease for disease in diseases if similarity_scores[disease] > THRESHOLD])

# iterate until there exists a threshold



    