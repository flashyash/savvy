# Input and output file paths
input_file = 'genes_to_phenotype.txt'
output_file = 'genes_to_pheno.txt'

# Open the input file for reading and the output file for writing
with open(input_file, 'r') as infile, open(output_file, 'w') as outfile:
    # Skip the header line
    next(infile)
    
    # Process each line in the input file
    for line in infile:
        # Split the line into columns
        columns = line.strip().split('\t')
        
        # Extract the HPO ID and gene ID
        hpo_id = columns[2]  # HPO ID is in the third column
        gene_id = columns[1]  # Gene ID is in the second column
        
        # Write the HPO ID and gene ID to the output file, separated by a tab
        outfile.write(f"{hpo_id}\t{gene_id}\n")

print(f"Conversion complete. Output saved to {output_file}")