/**
 * Created by agapi on 6/1/2017.
 */

var PlaceTypes = function(args) {
    this.name = args.name;
    this.value = args.value;
};

/*
 ////////////////////////////////////////////////////
 MapLocation Class to store main map locations in the list-view
 */
APP.MapLocation = function (args){
    this.name =  args.name;
    this.position =  {lat: args.lat, lng:args.lng};
    this.info =  args.info;
    this.marker =  args.marker;
    this.visibility = true;
};

//control variable to confirm if points of interested around main marker must be cleared or not
APP.MapLocation.prototype.clearNearbyPlaces = true;

//display/highlight location in the map (on mouse over in list-view items)
APP.MapLocation.prototype.displayOnMap =  function() {
    //change current icon color to default
    //APP.Main.nearbyPlaces.removeAll();
    console.log("Highlight marker:" + this.marker.getPosition().lat() + "," + this.marker.getPosition().lng());
    APP.Controller.setDefaultIcon();

    //change marker color
    this.marker.setIcon("https://mt.google.com/vt/icon?color=ff004C13&name=icons/spotlight/spotlight-waypoint-blue.png");
    //set marker of current object as default marker
    APP.Main.defaultMarker(this.marker);

    //adjust map position to centralize in the map // check observable subscription for defaulgPosition
    APP.Main.defaultPosition({lat: this.marker.getPosition().lat(), lng: this.marker.getPosition().lng()});
    //APP.Controller.getNearbyPlaces(this.marker.getPosition());
};

//set on click event for list-view items
APP.MapLocation.prototype.navigateNearbyPlaces =  function() {
    var i = APP.Main.nearbyPlaces().length;
    APP.Main.currentLocation(APP.Main.defaultMarker());
    console.log(i);
    if (!(APP.Main.checkedPlaceType())) {
        APP.Controller.showModal("Information is Required", "Please, select place type.");
        return false;
    }
    this.clearNearbyPlaces = false;

    if (i>0) {
        APP.Main.clearNearbyPlaces();
        APP.Main.nearbyPlaces([]);
    }

    //return false;
    this.marker.setIcon("https://mt.googleapis.com/vt/icon/name=icons/spotlight/spotlight-poi.png&scale=1");
    APP.Main.defaultMarker(this.marker);
    //APP.Main.map.setZoom(16);
    //APP.Main.hideNavPanel();
    //APP.Main.fadeSearchBar(0.2);
    this.marker.setIcon("https://mt.google.com/vt/icon?color=ff004C13&name=icons/spotlight/spotlight-waypoint-blue.png");
    APP.Main.defaultMarker(this.marker);
    APP.Main.defaultPosition({lat: this.marker.getPosition().lat(), lng: this.marker.getPosition().lng()});

    APP.Controller.getNearbyPlaces(this.marker.getPosition());
};

//hide poins of interest (restaurant, bars, etc) nearby main markers
APP.MapLocation.prototype.hideDetails =  function() {
    if (this.clearNearbyPlaces) {
        if (this.marker !== null) {
            this.marker.setIcon("https://mt.googleapis.com/vt/icon/name=icons/spotlight/spotlight-poi.png&scale=1");
        }
        //APP.Main.clearNearbyPlaces();
    }
    this.clearNearbyPlaces = true;
};
/*
 End of MapLocation Class
 ////////////////////////////////////////////////////
 */

/*
 ////////////////////////////////////////////////////
 Main APP Object
 */
APP.Main = {
    map:  null,
    searchBtnClicked: false,
    defaultPosition: ko.observable({}), //define the current position
    defaultMarker: ko.observable(null), //define the default marker clicked by the user
    txtSearch: ko.observable(""),  //input to search and set new markers
    infowindow: {}, //global infoWindow
    places: ko.observableArray([]) , //list of main markers in the map (list-view)
    ranges: ko.observableArray([]) , //array of ranges (radius aroung main marker),
    checkedRange: ko.observable("500"),
    placesTypes: ko.observableArray([]) , //array of location types (bars, restaurants, etc) used to viw nearby places related to main location
    checkedPlaceType: ko.observable(),
    currentLocation: ko.observable(),
    nearbyPlaces: ko.observableArray() , //array of places nearby main location associated with place types radio list
    //function to remove nearby places from the map
    clearNearbyPlaces: function() {
        ko.utils.arrayForEach(APP.Main.nearbyPlaces(), function (nearPlace) {
            nearPlace().setMap(null);
        });
    },
    //Function to adjust opacity of searchBar element
    fadeSearchBar: function (opacity){
        document.getElementById("menu").style.opacity = opacity;
        //$(".searchBar").fadeTo( "fast", opacity );
    },
    //Function to adjust opacity of searchBar element
    hideNavPanel: function(){
        //$("$navPanel").hide();
        //document.getElementById("navPanel").style.visibility = "hidden";
    },
    //Function to fade in opacity of navPanel element
    fadeOutNavPanel: function (){
        APP.Main.fadeNavPanel(0);
        APP.Main.fadeSearchBar(0.2);
    },
    //Function to fade in opacity of navPanel element
    fadeInNavPanel: function (){
        APP.Main.fadeNavPanel(0.85);
        APP.Main.fadeSearchBar(0.85);
        APP.Main.infowindow.close();
    },
    //function to create marker using search results
    addMarker: function (){
        if (APP.Main.txtSearch()!=="") {
            var text = APP.Main.txtSearch().toString();
            var searchLoc = ko.observable(new APP.MapLocation({name: text, info: null}));
            APP.Main.loadLocation(searchLoc);
            APP.Main.searchBtnClicked = true;
        }
    },
    //Click event handler for Search button
    filterMarker: function (){
        ko.utils.arrayForEach(APP.Main.places(), function (place) {
            console.log(place().name + "==" + APP.Main.txtSearch() + "==>" + (!(place().name.indexOf(APP.Main.txtSearch()))));

            var string = place().name.toUpperCase(),
                expr = APP.Main.txtSearch().toUpperCase();
            if ((string.indexOf(expr))>=0) {
                place().marker.setVisible(true);
                place().visibility = true;
                place(place());
            }
            else {
                //var marker = place().marker;
                place().marker.setVisible(false);
                //place(marker);
                place().visibility = false;
                place(place());
            }

        });
    },
    //Function to initialize Google Maps
    initMap: function() {
        console.log("Initialize Map");
        APP.Main.places([
            ko.observable(new APP.MapLocation({name: "American Museum of Natural History , New York, New York",lat: "40.7813241", lng: "-73.97398820000001", info: null})),
            ko.observable(new APP.MapLocation({name: "Roosevelt Island, New York",info: null})),
            ko.observable(new APP.MapLocation({name: "SOHO, New York",info: null})),
            ko.observable(new APP.MapLocation({name: "Empire State buiding, New York",info: null})),
            ko.observable(new APP.MapLocation({name: "United Nations, New York",info: null})),
            ko.observable(new APP.MapLocation({name: "Little Italy, New York",info: null})),
            ko.observable(new APP.MapLocation({name: "Upper East Side, New York",info: null})),
            ko.observable(new APP.MapLocation({name: "Statue of Liberty National Monument",lat: "40.6892494", lng: "-74.0445004",info: null})),
            ko.observable(new APP.MapLocation({name: "Battery Park",lat: "40.7032775", lng: "-74.01702790000002", info: null})),
            ko.observable(new APP.MapLocation({name: "Intrepid Sea, Air & Space Museum",lat: "40.7645266", lng: "-73.99960759999999", info: null})),
            ko.observable(new APP.MapLocation({name: "Brooklyn Bridge",lat: "40.7060855", lng: "-73.99686429999997", info: null})),
            ko.observable(new APP.MapLocation({name: "One World Observatory, New York",lat: "40.7133444", lng: "-74.0133677", info: null})),
            ko.observable(new APP.MapLocation({name: "Rockefeller Center, NY",lat: "40.7587402", lng: "-73.97867359999998", info: null})),
            ko.observable(new APP.MapLocation({name: "Times Square, NY",lat: "40.758895", lng: "-73.98513100000002", info: null})),
            ko.observable(new APP.MapLocation({name: "Chrysler Building, NY",lat: "40.7516208", lng: "-73.975502", info: null})),
            ko.observable(new APP.MapLocation({name: "Central Park, NY",lat: "40.7828647", lng: "-73.96535510000001", info: null}))
            ]
        );

        APP.Main.infowindow = new google.maps.InfoWindow();
        APP.Main.map = new google.maps.Map(document.getElementById('map'), {
            zoom: 12,
            center: APP.Main.defaultPosition(),
            mapTypeControl: true,
            mapTypeControlOptions: {
                style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
                position: google.maps.ControlPosition.BOTTOM_LEFT
            }
        });

        //Close current infoWindow when map is clicked.
        google.maps.event.addListener(APP.Main.map, 'click', function() {
            APP.Main.infowindow.close();
            //Set current market to default color
            APP.Controller.setDefaultIcon();
        });

        //equalize widrh of search bar and list-view panel
        $( window ).resize(function() {
            equalizeWidth();
        });

        //Call this function to request location access to the user
        //navigator.geolocation.getCurrentPosition(function(){},function(){});
    },

    viewModel: function(strAddress) {
        APP.Main.searchBtnClicked = false;
        APP.Main.txtSearch(strAddress);
        APP.Main.nearbyPlaces =  ko.observableArray([]);
        APP.Main.defaultPosition({lat: 40.704514, lng: -74.032172});
        //APP.Main.checkedPlaceType(new PlaceTypes({name: "Amusement Park", value: "amusement_park"}));
        APP.Main.ranges([
            ko.observable({name: "500m", value: "500"}),
            ko.observable({name: "1000m", value: "1000"}),
            ko.observable({name: "1500m", value: "1500"})
        ]);
        APP.Main.placesTypes([
            new PlaceTypes({name: "Amusement Parks", value: "amusement_park"}),
            new PlaceTypes({name: "ATMs", value: "atm"}),
            new PlaceTypes({name: "Liquore Stores", value: "liquor_store"}),
            new PlaceTypes({name: "Museums", value: "museum"}),
            new PlaceTypes({name: "Car Rentals", value: "car_rental"}),
            new PlaceTypes({name: "Convenience Stores", value: "convenience_store"}),
            new PlaceTypes({name: "Stores", value: "store"}),
            new PlaceTypes({name: "Eletronics", value: "electronics_store"}),
            new PlaceTypes({name: "Bars", value: "bar"}),
            new PlaceTypes({name: "Restaurants", value: "restaurant"}),
            new PlaceTypes({name: "Parks", value: "park"}),
            new PlaceTypes({name: "Subway Stations", value: "subway_station"})
        ]);
    },
    //Function to adjust opacity of searchBar element
    fadeNavPanel: function(opacity){
        if (opacity>0) {
            document.getElementById("navPanel").style.visibility = "visible";
            document.getElementById("navPanel").style.opacity = opacity;
            /*
            $(".navPanel").fadeTo("fast", opacity, function () {
                $(this).css("display","block");
                $(this).css("z-index","99");
            });
            */
        }
        else {
            document.getElementById("navPanel").style.opacity = opacity;
            /*
            $(".navPanel").fadeTo("fast", opacity, function () {
                $(this).css("display","none");
                $(this).css("z-index","0");
            });
            */
        }
    },
    loadLocation: function(place){
        //load default locations
        APP.Controller.getWikipediaInfo(place()).done(function(wikiInfo) {
            place().info = wikiInfo;

            APP.Controller.loadLocationData(place);
        });
    }

};

/* =================================
 Preloader - Show animation while page is loading
 =================================== */
if ((".loader").length) {
    // show Preloader until the website is loaded
    $(window).on('load', function() {
        //when page loads hide Loader
        $(".loader").fadeOut("fast");

        //equalize width of search bar and list-view panel
        equalizeWidth();
    });
}

/* =================================
 KnockoutJS Bind
 =================================== */

//center map according current location on map
APP.Main.defaultMarker.subscribe(function(newVal) {
    //APP.Main.defaultMarker().setIcon("https://mt.google.com/vt/icon?color=ff004C13&name=icons/spotlight/spotlight-waypoint-blue.png");
});
//center map according current location on map
APP.Main.defaultPosition.subscribe(function(newVal) {
    if (APP.Main.map !== null) {
        APP.Main.map.setCenter(new google.maps.LatLng(newVal));
    }
});

//Subscribe array of markers
APP.Main.places.subscribe(function (changes) {

    //Add Location to the Map
    var i=0;
    changes.forEach(function (change) {
        (function(i){
            setTimeout(function(){
        if (change.status === 'added') {
            console.log('New Location added: '+ change.value().name);

            if (typeof (change.value().position.lat)!=="undefined") {
                var latLng = new google.maps.LatLng(change.value().position.lat, change.value().position.lng);
                APP.Controller.createMarker(latLng,change.value);
            }
            else {
                APP.Main.loadLocation(change.value);
            }

        } else if (change.status === 'deleted') {
            console.log('deleted item !!');
        }
            }, 10 * i);
        }(i));
        i++;
    });


}, null, "arrayChange");

//Initialize KnockoutJS with default location
ko.applyBindings(new APP.Main.viewModel("")); // This makes Knockout get to work

//keep search bar always the same size as nav-bar (list-view)
function equalizeWidth() {
    document.getElementById("navPanel").style.width = document.getElementById("menu").clientWidth+"px";
}