import os
import requests
import time
from dotenv import load_dotenv

def generate_and_save_image(filename, prompt):
    image_result = generate_image(prompt)
    if image_result is not None:
        save_image_from_url(filename, image_result)

def generate_image(prompt):

    # Load environment variables from .env file
    isEnvLoaded = load_dotenv()

    request = requests.post(
        'https://api.bfl.ml/v1/flux-pro-1.1',
        headers={
            'accept': 'application/json',
            'x-key': os.environ.get("BFL_API_KEY"),
            'Content-Type': 'application/json',
        },
        json={
            'prompt': prompt,
            'width': 768,
            'height': 1344,
        },
    ).json()
    print(request)
    request_id = request["id"]

    # get the generated image
    while True:
        time.sleep(1)
        result = requests.get(
            'https://api.bfl.ml/v1/get_result',
            headers={
                'accept': 'application/json',
                'x-key': os.environ.get("BFL_API_KEY"),
            },
            params={
                'id': request_id,
            },
        ).json()

        # Ready. Return Image
        if result["status"] == "Ready":
            print(f"Result: {result['result']['sample']}")
            return(result['result']['sample'])
        # Not Ready
        else:
            print(f"Status: {result['status']}")

def save_image_from_url(filename, image_url):
    # Specify the folder where you want to save the image
    folder_path = '.\images' 
    file_extension = '.jpg'
    base_filename = filename
    file_name = ensure_unique_file_name(folder_path, file_extension, base_filename)
    image_path = os.path.join(folder_path, file_name)
    
    # Ensure the folder exists
    os.makedirs(folder_path, exist_ok=True)

    # Download and save the image
    response = requests.get(image_url)

    # Check if the download was successful
    if response.status_code == 200:
        with open(image_path, 'wb') as file:
            file.write(response.content)
        print(f"Image successfully downloaded to: {image_path}")
    else:
        print(f"Failed to download image. Status code: {response.status_code}")

def ensure_unique_file_name(folder_path, file_extension, base_filename):
    file_path = os.path.join(folder_path, f"{base_filename}{file_extension}")

    if os.path.exists(file_path) == False:
        return f"{base_filename}{file_extension}"

    # Check if file exists, and if so, create a new name with a suffix
    counter = 1
    while os.path.exists(file_path):
        file_path = os.path.join(folder_path, f"{base_filename}_{counter}{file_extension}")
        counter += 1

    return f"{base_filename}_{counter}{file_extension}"

generate_and_save_image("vector_landscape", "A vector art landscape, with a sunset and sun in the center. Bold and flat colors. The colors are psychedelic and vibrant. Dark and rich in front layers and pastel towards the background")