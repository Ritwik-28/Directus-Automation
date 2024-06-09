import requests

# Replace with your actual Directus credentials and URL
DIRECTUS_URL = 'http://yourdirectus.instance.com'
EMAIL = 'your_email_address'
PASSWORD = 'your_password'

def authenticate():
    url = f'{DIRECTUS_URL}/auth/login'
    payload = {
        'email': EMAIL,
        'password': PASSWORD
    }
    response = requests.post(url, json=payload)
    if response.status_code == 200:
        data = response.json()
        return data['data']['access_token']
    else:
        print(f"Failed to authenticate. Status code: {response.status_code}")
        print(response.text)
        return None

def fetch_collection_schema(token, collection_name):
    url = f'{DIRECTUS_URL}/collections/{collection_name}'
    headers = {
        'Authorization': f'Bearer {token}',
    }
    
    response = requests.get(url, headers=headers)
    
    if response.status_code == 200:
        schema = response.json()
        print("Collection Schema:")
        print(schema)
    else:
        print(f"Failed to fetch collection schema. Status code: {response.status_code}")
        print(response.text)

def fetch_collection_items(token, collection_name):
    url = f'{DIRECTUS_URL}/items/{collection_name}'
    headers = {
        'Authorization': f'Bearer {token}',
    }
    
    response = requests.get(url, headers=headers)
    
    if response.status_code == 200:
        items = response.json()
        print("Collection Items:")
        print(items)
    else:
        print(f"Failed to fetch collection items. Status code: {response.status_code}")
        print(response.text)

if __name__ == "__main__":
    token = authenticate()
    if token:
        collection_name = 'shareable_assets'  # Replace with your collection name
        fetch_collection_schema(token, collection_name)
        fetch_collection_items(token, collection_name)
