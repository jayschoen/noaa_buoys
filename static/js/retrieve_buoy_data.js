function get_buoy_data() {

    let selector = document.getElementById("station_selector");
    console.log('#');
    console.log(selector);

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
        fetch("http://127.0.0.1:5000/retrieve-current-readings/" + station_id, {
            method: 'GET',
        })
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
    console.log(data);
    value_divs = {
        "default_div": document.getElementById("default"),
        "metric_div": document.getElementById("metric"),
        "imperial_div": document.getElementById("imperial")
    }
    value_divs.default_div.innerHTML = "";
    value_divs.metric_div.innerHTML = "";
    value_divs.imperial_div.innerHTML = "";
    for (let key in data.values) {
        if (key === "imperial" || key === "metric") {
            for (let subkey in data.values[key]) {
                value_divs[key + "_div"].innerHTML += "<div>" + subkey + " " + data.values[key][subkey] + " " + data.units[key][subkey] + "</div></br>";
            }
        }
        else {
            value_divs.default_div.innerHTML += "<div>" + key + " "  + data.values[key] + " " + data.units[key]  + "</div></br>";
        }
    }
}

function toggle_units(selectObject) {
    let type = selectObject.value;

    let metric_div = document.getElementById("metric");
    let imperial_div = document.getElementById("imperial");
    if (type === "metric") {
        metric_div.style = "display:unset;";
        imperial_div.style = "display:none;";       
    }
    else {
        metric_div.style = "display:none;";
        imperial_div.style = "display:unset;";       

    }
}

document.addEventListener("DOMContentLoaded", function(event) { 
    get_buoy_data();
});
