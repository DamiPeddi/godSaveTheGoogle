console.log("🧨 GOD SAVE THE GOOGLE 🧨")

var autocomplete_service;
var geocoding_service;

function init(){
    import_jquery()
}

function import_jquery(){
    var script_el = document.createElement('script');
    script_el.setAttribute('src', 'https://code.jquery.com/jquery-3.6.3.js');

    script_el.onload = function() {
      on_jquery_loaded()
    };

    document.head.appendChild(script_el);
}

function on_jquery_loaded(){
    $("body").empty()
    import_google_apis()
}

window.init_map = function(){
    setup_autocomplete()
    setup_geocoding()

    $("body").css({
        "width": "100vw",
        "height": "100vh",
        "display": "flex",
        "flex-direction": "column",
        "justify-content": "center",
        "align-items": "center"
    })
    $("body").append('<div id="status-positive" style="width: 100%; text-align: center">🧨</div>')
}

function setup_autocomplete(){
    autocomplete_service = new google.maps.places.AutocompleteService();
}

function setup_geocoding(){
    geocoding_service = new google.maps.Geocoder();
    /*
    var placeid = "ChIJ2T-carcQmxQRED-64iy9AAU"
    geocoding_service.geocode({
        placeId: placeid
    }).then(function(results){
        console.log(results)
    })
    */
}

function get_formatted_address_results(prompt, countries){
    var id = get_random_id()
    autocomplete_service.getPlacePredictions({
        input: prompt,
        componentRestrictions: {
            country: countries
        },
    }, function(results, status){
        if (results == null || !results.length > 0){
            display_results(id, [])
        }else{
            var result = results[0]
            var placeId = result["place_id"]
            geocoding_service.geocode({
                placeId: placeId
            }).then(function(geo_results){
                if (geo_results.results[0]){
                    var geo_result = geo_results.results[0]
                    display_results(id, geo_result)
                }else{
                    display_results(id, [])
                }


            })
        }


    })

    return id
}

function get_autocomplete_results(prompt, countries, lang){
    var id = get_random_id()
    console.log(countries)
    autocomplete_service.getPlacePredictions({
        input: prompt,
        componentRestrictions: {
            country: countries
        },
        language: lang
    }, function(results, status){
        display_results(id, results)
    })

    return id
}

function display_results(id, results){
    var textarea = document.createElement('textarea')
    textarea.setAttribute('id', id)

    $(textarea).css({
        "width": "0px",
        "height": "0px",
        "position": "absolute",
    })

    if (results == null){
        results = []
    }
    textarea.value = JSON.stringify(results)
    document.body.appendChild(textarea)
}

function clear_response(id){
    $("#" + id).remove()
}

function import_google_apis(){
    var script_el = document.createElement('script');
    script_el.setAttribute('src', 'https://maps.googleapis.com/maps/api/js?key=AIzaSyB41DRUbKWJHPxaFjMAwdrzWzbVKartNGg&callback=init_map&libraries=places&v=weekly');
    document.head.appendChild(script_el);
}

function get_random_id() {
    return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
}

init()