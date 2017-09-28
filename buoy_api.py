from flask import Flask, jsonify, render_template

import buoy_jsonrpc

app = Flask(__name__, static_url_path = '/static')
app.config.from_object('config')

NOAA_URL = app.config['NOAA_URL']
NOAA_API_KEY = app.config['NOAA_API_KEY']

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/get-station-status/<station_id>')
def getStationStatus(station_id):

    if _check_station_id(station_id):

        noaa_method = "GetStationStatus"

        response = buoy_jsonrpc.request_noaa_data(NOAA_URL, NOAA_API_KEY, station_id, noaa_method)

        return jsonify(response)

    else:
        return "Invalid station ID."


@app.route('/retrieve-current-readings/<station_id>')
def retrieveCurrentReadings(station_id):

    if _check_station_id(station_id):

        noaa_method = "RetrieveCurrentReadings"

        response = buoy_jsonrpc.request_noaa_data(NOAA_URL, NOAA_API_KEY, station_id, noaa_method)
        
        labels = response['result']['measurement']
        values = response['result']['value']
        units = response['result']['units']
        time =  response['result']['time']
        data = {
            "labels": {
                "air_temp_celsius": "air_temp_celsius",
                "air_temp_fahrenheit": "air_temp_fahrenheit",
                "water_temp_celsius": "water_temp_celsius",
                "water_temp_fahrenheit": "water_temp_fahrenheit",
                "wind_direction": labels[17],
                "wind_speed": labels[18],
                "wind_gust": labels[19]
            },
            "values": {
                "imperial": {
                    "wind_speed_miles": _metric_to_miles(values[18]),
                    "wind_gust_miles": _metric_to_miles(values[19]),
                    "air_temp_fahrenheit": _celsius_to_fahrenheit(values[1]),
                    "water_temp_fahrenheit": _celsius_to_fahrenheit(values[14]),
                },
                "metric": {
                    "wind_speed_mps": values[18],
                    "wind_speed_kmph": _mps_to_kmph(values[18]),
                    "wind_gust_mps": values[19],
                    "wind_gust_kmph": _mps_to_kmph(values[19]),
                    "air_temp_celsius": round(values[1], 1),
                    "water_temp_celsius": round(values[14], 1),
                },
                "wind_direction_degree": values[17],
                "wind_direction": _compass_direction(values[17]),
                "wind_speed_knots": _metric_to_knots(values[18]),
                "wind_gust_knots": _metric_to_knots(values[19])
            },
            "units": {
                "imperial": {
                    "wind_speed_miles": "mi/h",
                    "wind_gust_miles": "mi/h",
                    "air_temp_fahrenheit": "&ordm;F",
                    "water_temp_fahrenheit": "&ordm;F",
                },
                "metric": {
                    "wind_speed_mps": units[18],
                    "wind_speed_kmph": "km/h",
                    "wind_gust_mps": units[19],
                    "wind_gust_kmph": "km/h",
                    "air_temp_celsius": "&ordm;" + units[1],
                    "water_temp_celsius": "&ordm;C",
                },
                "wind_direction_degree": "&ordm;",
                "wind_direction": "direction",
                "wind_speed_knots": "kn",
                "wind_gust_knots": "kn"
            },
            "time": {
                "air_temp": time[1],
                "water_temp": time[14],
                "wind_direction": time[17],
                "wind_speed": time[18],
                "wind_gust": time[19]               
            }
        }

        return jsonify(data)

    else:
        return "Invalid station ID."




def _check_station_id(station_id):

    station_list = ["SN", "PL", "J", "SR", "S", "N", "AN", "UP", "GR", "FL", "RC"]

    if station_id in station_list:
        return True
    else:
        return False
        



def _celsius_to_fahrenheit(t):
    return round(t * 9/5 + 32, 1)




def _mps_to_kmph(m):
    return round(m * 3.6, 1)




def _metric_to_knots(m):
    return round(m * 1.9438444924574, 1)




def _metric_to_miles(m):
    return round(m * 2.2369, 1)




def _compass_direction(degree):
    val = int( (degree / 22.5) + .5)
    arr = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"]
    return arr[ (val % 16) ]




#def _compass_direction(d):
#    if d >= 348.75 or d <= 11.25:
#        return 'N'
#    elif d >= 11.25 and d <= 33.75:
#        return 'NNE'
#    elif d >= 33.75 and d <= 56.25:
#        return 'NE'
#    elif d >= 56.25 and d <= 78.75:
#        return 'ENE'
#    elif d >= 78.75 and d <= 101.25:
#        return 'E'
#    elif d >= 101.25 and d <= 123.75:
#        return 'ESE'
#    elif d >= 123.75 and d <= 146.25:
#        return 'SE'
#    elif d >= 146.25 and d <= 168.75:
#        return 'SSE'
#    elif d >= 168.75 and d <= 191.25:
#        return 'S'
#    elif d >= 191.25 and d <= 213.75:
#        return 'SSW'
#    elif d >= 213.75 and d <= 236.25:
#        return 'SW'
#    elif d >= 236.25 and d <= 258.75:
#        return 'WSW'
#    elif d >= 258.75 and d <= 281.25:
#        return 'W'
#    elif d >= 281.25 and d <= 303.75:
#        return 'WNW'
#    elif d >= 303.75 and d <= 326.25:
#        return 'NW'
#    elif d >= 326.25 and d <= 348.75:
#        return 'NNW'




###

#functionn returnDirection(degree):
    #need north twice... 0 and 360
    # needs to be sorted
#    directionList = {0:"N",45:"NE", 90: "E", 135: "SE", 180:"S", 225: "SW",270: "W", 315:"NW", 360:"N"}
    
    #look up min()
    # look up abs()
# look up lambda
#    return directionList[ min( directionList, key=lambda x:abs(x-degree) ) ]
