from flask import Flask
import requests
import json


def main():
    # url = "http://mw.buoybay.org/studs/studs_cdrh/jsonrpc_cdrh/server.php"
    url = "http://mw.buoybay.noaa.gov/studs/studs_cdrh/jsonrpc_cdrh/server.php"

    headers = {'content-type': 'application/json'}

    payload = {
        "method": "RetrieveCurrentReadings", #"GetStationStatus",
        "params": ["cbibs", "UP", "a1655be60c484b273ffec1595f3661b2b9f15c1a"],
        "jsonrpc": "2.0",
        "id": 0,
    }
    response = requests.post(
        url, data=json.dumps(payload), headers=headers).json()

    #assert response["result"] == "echome!"
#   assert response["jsonrpc"]
#   assert response["id"] == 0

    print response

if __name__ == "__main__":
    main()
