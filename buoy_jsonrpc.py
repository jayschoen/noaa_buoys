import requests
import json

def request_noaa_data(url, api_key, station_id, method):

    headers = {'content-type': 'application/json'}
    payload = {
        "method": method,
        "params": [
            "cbibs",
            station_id,
            api_key
        ],
        "jsonrpc": "2.0",
        "id": 0,
    }
    response = requests.post(
        url,
        data=json.dumps(payload),
        headers=headers
    )
    
    return response.json()
