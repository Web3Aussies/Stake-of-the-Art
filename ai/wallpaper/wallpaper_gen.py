import os
import requests
import time
from dotenv import load_dotenv

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
    filename = filename + file_extension
    image_path = os.path.join(folder_path, filename)
    
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

wallpaper_url = generate_image("A rocket blasting off into space. Thick plumes of fire and smoke trail behind it as it ascends into the sky.")
save_image_from_url("rocket", wallpaper_url)