function get_buoy_data() {

    let buoy_data = Rx.Observable.fromPromise(
        fetch("http://127.0.0.1:5000/retrieve-current-readings/UP", {
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
    .flatMap(response => response.json())
    .subscribe(
        response => add_data_to_dom(response),//console.log(response),
        error => console.log(error),
        () => console.log('completed')
    );
}

function add_data_to_dom(data) {
    console.log(data);
    values_div = document.getElementById("values");
    for(let key in data.values) {
        values_div.innerHTML += "<div>" + key + " "  + data.values[key] + " " + data.units[key]  + "</div></br>";
    }
}

get_buoy_data();
