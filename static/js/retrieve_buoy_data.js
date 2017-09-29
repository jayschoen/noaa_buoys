function get_station_status(id) {

    return Rx.Observable.fromPromise(
        fetch(
            "http://127.0.0.1:5000/get-station-status/" + id,
            {
                method: 'GET',
            }
        )
    )
    .flatMap(response => response.json())
    .map(response => {
        response.id = id
        return response;    
    })
    .catch(error => Rx.Observable.of({"id": id, "error": "Bad Response"}));

}

function update_station_status_dom(status_obj, list_mode) {
    
    let status_val = "";
    if (status_obj.error === null) {
        if (status_obj.result === 0) {
            status_val = "&uarr;";
            status_color = "#42f495";
        }
        else {
            status_val = "&darr;";
            status_color = "#f4425c";
        }
    
        let selector_val = "";
        if (list_mode === true) {
            selector_val = "station_status_" + status_obj.id;
        }
        else {
            selector_val = "station_status";
        }

        let selector = document.getElementById(selector_val);

        selector.innerHTML = "<div class='status-indicator rounded-circle' style='background-color:" + status_color + ";'>" + status_val + "</div>"; 
    }

}

function get_buoy_data() {
    
    let selector = document.getElementById("station_selector");

    let station_selection = Rx.Observable.fromEvent(selector, "change")
    .map(event => event.target.value)
    .startWith("UP")
    .flatMap(station_id => {
        return Rx.Observable.forkJoin(
            ajax_get_buoy_data(station_id),
            get_station_status(station_id)
        );
    });

    station_selection.subscribe(
        response => {
            add_data_to_dom(response[0]);
            update_station_status_dom(response[1]);
        },
        error => console.log(error),
        () => console.log('completed')
    );
    
}

function ajax_get_buoy_data(station_id) {

    return Rx.Observable.fromPromise(
        fetch(
            "http://127.0.0.1:5000/retrieve-current-readings/" + station_id,
            {
                method: 'GET',
            }
        )
    )
    .map(response => {
        if( response.status >= 400 && response.status < 600) {
            let error = new Error(response.statusText);
            error.response = response;
            throw error;
        }
        else {
            return response;
        }
    })
    .flatMap(response => response.json())
    .catch(error => Rx.Observable.of({"id": station_id, "error": "Bad Response"})); 

}

function add_data_to_dom(data) {

    if (data.hasOwnProperty('error') && data.error !== null) {
        
        document.getElementById("error").innerHTML = "Unable to retrieve buoy data.";

    }
    else {

        value_divs = {
            "metric_div": document.getElementById("metric"),
            "imperial_div": document.getElementById("imperial")
        }
        value_divs.metric_div.innerHTML = "";
        value_divs.imperial_div.innerHTML = "";

        let selected_unit = document.getElementById('unit_selector').value;
    
        let unit;
        for (let key in data.values) {

            if (key === "imperial" || key === "metric") {
                for (let subkey in data.values[key]) {
                    unit = data.units[key][subkey];
                    value_divs[key + "_div"].innerHTML += "<div class='row table-row-margin'><div class='col-8'>" + _xform_keys(subkey) + "</div><div class='col-4'>" + data.values[key][subkey] + unit + "</div></div>";
                }
            }
            else {
                
                unit = data.units[key];
                if (unit === 'direction') {
                    unit = "";
                }
                value_divs.metric_div.innerHTML += "<div class='row table-row-margin'><div class='col-8'>" + _xform_keys(key) + "</div><div class='col-4'>"  + data.values[key] + unit  + "</div></div>";
                value_divs.imperial_div.innerHTML += "<div class='row table-row-margin'><div class='col-8'>" + _xform_keys(key) + "</div><div class='col-4'>"  + data.values[key] + unit  + "</div></div>";

            }
        }
    }
}

function toggle_units(selectObject) {
    let type = selectObject.value;

    let metric_div = document.getElementById("metric");
    let imperial_div = document.getElementById("imperial");
    if (type === "metric") {
        metric_div.style = "";
        imperial_div.style = "display:none;";       
    }
    else {
        metric_div.style = "display:none;";
        imperial_div.style = "";       

    }
}

function _strip_underscores(str) {
    return str.split('_');
}

function _capitalize_first_char(str) {
    let skip = ['degree', 'knots', 'mps', 'kmph', 'miles', 'celsius', 'fahrenheit'];

    if (skip.indexOf(str) > -1) {
        return str;
    }
    else {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
}

function _xform_keys(key) {
 
    let parts = _strip_underscores(key);
    let modified_keys = '';
    for ( let i = 0; i < parts.length; i++) {
        modified_keys += _capitalize_first_char(parts[i]);
        if (i < (parts.length - 1)) {
            modified_keys += ' ';
        }
    }

    return modified_keys;  
}

function _build_station_list() {
    let stations = [ "AN", "FL", "GR", "J", "N", "PL", "RC", "S", "SN", "SR", "UP" ];

    let station_observables = stations.map(station_id => get_station_status(station_id));

    let obs = Rx.Observable.forkJoin(station_observables)

    let station_list = document.getElementById('station-list-container');

    obs.subscribe(id_list => {
        id_list.map(response => {
            station_list.innerHTML += "<div class='row'><div class='col'><div class='status-label'>" + response.id + "</div></div><div class='col'><div id='station_status_" + response.id + "' " + "class='status-indicator2 rounded-circle'>X</div></div></div>";
            update_station_status_dom(response, true);
        });
    });

}

document.addEventListener("DOMContentLoaded", function(event) { 
    get_buoy_data();
    _build_station_list();
});
