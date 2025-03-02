# Input and output file paths
input_file = 'genes_to_disease.txt'
output_file = 'dag.txt'

# Open the input file for reading and the output file for writing
with open(input_file, 'r') as infile, open(output_file, 'w') as outfile:
    # Skip the header line
    next(infile)
    
    # Process each line in the input file
    for line in infile:
        # Split the line into columns
        columns = line.strip().split('\t')

        if "ORPHA:" in columns[3]:
        
            # Extract the HPO ID and gene ID
            disease_id = columns[3]  # HPO ID is in the third column
            gene_id = columns[1]  # Gene ID is in the second column
        
            # Write the HPO ID and gene ID to the output file, separated by a tab
            outfile.write(f"{disease_id}\t{gene_id}\n")

print(f"Conversion complete. Output saved to {output_file}")