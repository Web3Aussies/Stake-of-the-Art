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

generate_image("A a gloomy and smoke filled abstract background image")