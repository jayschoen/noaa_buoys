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
    values_div = document.getElementById("values");
    values_div.innerHTML = "";
    for(let key in data.values) {
        values_div.innerHTML += "<div>" + key + " "  + data.values[key] + " " + data.units[key]  + "</div></br>";
    }
}

document.addEventListener("DOMContentLoaded", function(event) { 
    get_buoy_data();
});
