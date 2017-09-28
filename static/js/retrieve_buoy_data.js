function get_station_status() {
    
    let station_status = Rx.Observable.fromPromise(
        fetch(
            "http://127.0.0.1:5000/get-station-status/UP",
            {
                method: 'GET',
            }
        )
    )
    .flatMap(response => response.json())
    .subscribe(
        response => update_station_status_dom(response),
        error => console.log(error),
        () => console.log('completed')   
    );

}

function update_station_status_dom(status_obj) {
    
    let status_val = "";
    if (status_obj.result === 0) {
        status_val = "&uarr;";
        status_color = "#42f495";
    }
    else {
        status_val = "&darr;";
        status_color = "#f4425c";
    }

    let selector = document.getElementById("station_status");

    selector.innerHTML = "<div class='status-indicator rounded-circle' style='background-color:" + status_color + ";'>" + status_val + "</div>"; 

}

function get_buoy_data() {

    let selector = document.getElementById("station_selector");

    let station_selection = Rx.Observable.fromEvent(selector, "change")
    .map(event => event.target.value)
    .startWith("UP")
    .flatMap(station_id => ajax_get_buoy_data(station_id));

    station_selection.subscribe(
        response => add_data_to_dom(response),
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
    .flatMap(response => response.json());

}

function add_data_to_dom(data) {
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

document.addEventListener("DOMContentLoaded", function(event) { 
    get_buoy_data();
    get_station_status();
});
