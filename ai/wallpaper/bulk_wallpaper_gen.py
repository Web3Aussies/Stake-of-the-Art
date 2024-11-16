import csv
from wallpaper_gen import generate_and_save_image

# Open and read the CSV file
with open('prompts.csv', mode='r') as csv_file:
    csv_reader = csv.DictReader(csv_file, delimiter=',', quotechar='"', skipinitialspace=True)
    
    # Iterate over each row in the CSV file
    for row in csv_reader:
        filename = row['filename']
        prompt = row['prompt']
        
        # Run the function for each filename/prompt pair
        print(f"Generating image for {filename} with prompt: {prompt}")
        generate_and_save_image(filename, prompt)
        print(f"Finished generating image: {filename}")