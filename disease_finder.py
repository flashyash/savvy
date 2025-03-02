import phrank.phrank as phrank
from collections import defaultdict
import csv

class disease_finder:
    
    def __init__(self, phenotype: list, n: int, m: int):
        self.disease_symptoms = disease_finder.create_disease_to_hpo_mapping("data/diseases.csv")

        self.n = n
        self.m = m

        DAG='data/dag.txt'
        GENE_TO_PHENO='data/genes_to_pheno.txt'
        self.p_hpo = phrank.Phrank(DAG, geneannotationsfile=GENE_TO_PHENO)

        self.reset()
        self.set_phenotype(phenotype)
        # (self.targets)

    def set_phenotype(self, phenotype):
        self.phenotype = phenotype
        self.visited = list(self.phenotype)

    @staticmethod
    def create_disease_to_hpo_mapping(csv_file, include_frequency=False):
        """
        Read the CSV file and create a dictionary mapping diseases to HPO terms.
        
        Args:
            csv_file (str): Path to the CSV file
            include_frequency (bool): Whether to include frequency information
            
        Returns:
            dict: Dictionary mapping diseases to lists of HPO terms
        """
        disease_to_hpo = defaultdict(list)
        
        with open(csv_file, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            
            for row in reader:
                disease_name = row['Disorder Name']
                hpo_id = row['HPO ID']
                
                if row['Frequency'] in ['Very frequent (99-80%)', 'Frequent (79-30%)', 'Occasional (29-5%)']:
                    disease_to_hpo[disease_name].append(hpo_id)
        
        # Convert defaultdict to regular dict
        return dict(disease_to_hpo)

    @staticmethod
    def get_highest_similarity_cluster(disease_similarity_dict, threshold):
        """
        Returns only the dictionary of items in the highest cluster based on
        a user-specified minimum dropoff threshold.
        
        Parameters:
        -----------
        disease_similarity_dict : dict
            Dictionary mapping disease names to similarity scores
            e.g., {'Disease1': 0.95, 'Disease2': 0.42, 'Disease3': 0.87, ...}
        min_dropoff_threshold : float, optional
            Minimum dropoff size that defines a cluster boundary
            If None, will use the largest dropoff found in the data
        
        Returns:
        --------
        dict
            Dictionary containing only the key-value pairs from the highest cluster
        """
        # If no input dictionary or empty dictionary, return empty dictionary
        if not disease_similarity_dict:
            return {}
        
        # Sort scores in descending order
        sorted_items = sorted(disease_similarity_dict.items(), key=lambda x: x[1], reverse=True)
        size = len(sorted_items)
        return dict([(disease, disease_similarity_dict[disease]) for disease in disease_similarity_dict.keys() if disease_similarity_dict[disease] > threshold])

    def iteration(self):

        # computing the similarity scores for each disease
        for disease in self.targets:
            symptoms = self.disease_symptoms[disease]
    
            if self.p_hpo.compute_phenotype_match(symptoms, symptoms) != 0:
                similarity_score = self.p_hpo.compute_phenotype_match(self.phenotype, symptoms) / self.p_hpo.compute_phenotype_match(symptoms, symptoms)
                self.similarity_scores[disease] = similarity_score

        # find the new set of diseases
        self.similarity_scores = disease_finder.get_highest_similarity_cluster(self.similarity_scores, 1.5e-1)
        self.targets = self.similarity_scores.keys()

        # find least frequent symptoms
        symptom_frequencies = defaultdict(int)
        for disease in self.targets:
            for symptom in self.disease_symptoms[disease]:
                if symptom not in self.phenotype:
                    symptom_frequencies[symptom] += 1

        frequent_symptoms = [x[0] for x in sorted(symptom_frequencies.items(), key = lambda x: x[1], reverse = True) if x[0] not in self.visited][:self.m]
        self.iteration_count += 1

        print(self.phenotype)
        print(self.similarity_scores)
        print(frequent_symptoms)
        
        return frequent_symptoms

        # prompt patient for more symptoms
        # for symptom in frequent_symptoms:
        #     flag = input(f"{symptom} Y/N: ")
        #     if flag == "Y":
        #         self.phenotype.append(symptom)
        #     self.visited.append(symptom)

    def reset(self):
        self.phenotype = []
        self.targets = set(self.disease_symptoms.keys())
        self.similarity_scores = {disease: 0.0 for disease in self.targets}
        self.iteration_count = 0


# iterate until there exists a threshold
# finder = disease_finder(['HP:0000256', 'HP:0002007', 'HP:000235'], 4, 5)
# for _ in range(finder.n):
#     finder.iteration()

# print(finder.targets)