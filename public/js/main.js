/**
 * Created by agapi on 6/1/2017.
 */

/*
////////////////////////////////////////////////////
MapLocation Class to store main map locations in the list-view
 */
APP.MapLocation = function (args){
    this.name =  args.name;
    this.info =  args.info;
    this.marker =  args.marker;
};

//control variable to confirm if points of interested around main marker must be cleared or not
APP.MapLocation.prototype.clearNearbyPlaces = true;

//display/highlight location in the map (on mouse over in list-view items)
APP.MapLocation.prototype.displayOnMap =  function() {
    //change current icon color to default
    console.log("Highlight marker:" + this.marker.getPosition().lat() + "," + this.marker.getPosition().lng());
    APP.Controller.setDefaultIcon();

    //change marker color
    this.marker.setIcon("https://mt.google.com/vt/icon?color=ff004C13&name=icons/spotlight/spotlight-waypoint-blue.png");
    //set marker of current object as default marker
    APP.Main.defaultMarker(this.marker);

    //adjust map position to centralize in the map // check observable subscription for defaulgPosition
    APP.Main.defaultPosition({lat: this.marker.getPosition().lat(), lng: this.marker.getPosition().lng()});
};

//set on click event for list-view items
APP.MapLocation.prototype.navigateNearbyPlaces =  function() {
    console.log(this);
    this.clearNearbyPlaces = false;
    this.marker.setIcon("https://mt.googleapis.com/vt/icon/name=icons/spotlight/spotlight-poi.png&scale=1");
    APP.Main.defaultMarker(this.marker);
    APP.Main.map.setZoom(16);
    APP.Main.hideNavPanel();
    APP.Main.fadeSearchBar(0.2);
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
        APP.Main.clearNearbyPlaces();
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
    checkedPlaceType: ko.observable("store"),
    nearbyPlaces: ko.observableArray([]) , //array of places nearby main location associated with place types radio list
    //function to remove nearby places from the map
    clearNearbyPlaces: function() {
        ko.utils.arrayForEach(APP.Main.nearbyPlaces(), function (nearPlace) {
            nearPlace().setMap(null);
        });
    },
    //Function to adjust opacity of searchBar element
    fadeSearchBar: function (opacity){
        $(".searchBar").fadeTo( "fast", opacity );
    },
    //Function to adjust opacity of searchBar element
    hideNavPanel: function(){
        $(".navPanel").hide();
    },
    //Function to initialize Google Maps
    initMap: function() {
        console.log("Initialize Map");
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

        //Function to fade in opacity of navPanel element
        function fadeInNavPanel(){
            APP.Main.fadeNavPanel(0.85);
            APP.Main.fadeSearchBar(0.85);
        }

        //Function to fade in opacity of navPanel element
        function fadeOutNavPanel(){
            APP.Main.fadeNavPanel(0);
            APP.Main.fadeSearchBar(0.2);
        }

        //Change opacity of navigation panel when map is clicked
        $("#map").mousedown(function(){
            fadeOutNavPanel();
        });

        //Change opacity of navigation panel when mouse is over or click event
        $(".searchBar").mouseover(function(){
            APP.Main.map.setZoom(12);
            APP.Main.clearNearbyPlaces();
            //APP.Controller.setDefaultIcon();
            fadeInNavPanel();
            APP.Main.infowindow.close();
        });

        //Change opacity of navigation panel when mouse is over or click event
        $(".searchBar").click(function(){
            fadeInNavPanel();
        });

        //equalize widrh of search bar and list-view panel
        $( window ).resize(function() {
            equalizeWidth();
            //$("#navPanel").height($(window).height());
        });

        //Click event handler for Search button
        $("#btnSearch").click(function() {
            if (APP.Main.txtSearch()!=="") {
                var text = APP.Main.txtSearch().toString();
                var searchLoc = ko.observable(new APP.MapLocation({name: text, info: null}));
                APP.Main.loadLocation(searchLoc);
                APP.Main.searchBtnClicked = true;
            }
        });

        //Call this function to request location access to the user
        navigator.geolocation.getCurrentPosition(function(){},function(){});
    },

    viewModel: function(strAddress) {
        APP.Main.searchBtnClicked = false;
        APP.Main.txtSearch(strAddress);
        APP.Main.defaultPosition({lat: 40.704514, lng: -74.032172});
        APP.Main.nearbyPlaces([]);
        APP.Main.places([
                ko.observable(new APP.MapLocation({name: "Hoboken, NJ", info: null})),
                ko.observable(new APP.MapLocation({name: "Statue of Liberty National Monument", info: null})),
                ko.observable(new APP.MapLocation({name: "Liberty Science Center", info: null})),
                ko.observable(new APP.MapLocation({name: "Governors Island, NY", info: null})),
                ko.observable(new APP.MapLocation({name: "Battery Park", info: null})),
                ko.observable(new APP.MapLocation({name: "Roosevelt Island, NY", info: null})),
                ko.observable(new APP.MapLocation({name: "Intrepid Sea, Air & Space Museum", info: null})),
                ko.observable(new APP.MapLocation({name: "Brooklyn Bridge", info: null})),
                ko.observable(new APP.MapLocation({name: "One World Trade Center", info: null})),
                ko.observable(new APP.MapLocation({name: "Madison Square Garden", info: null}))
            ]
        );
        APP.Main.ranges([
            ko.observable({name: "500m", value: "500"}),
            ko.observable({name: "1000m", value: "1000"}),
            ko.observable({name: "1500m", value: "1500"})
        ]);
        APP.Main.placesTypes([
            ko.observable({name: "Amusement Park", value: "amusement_park"}),
            ko.observable({name: "ATM", value: "atm"}),
            ko.observable({name: "Liquore Store", value: "liquor_store"}),
            ko.observable({name: "Museum", value: "museum"}),
            ko.observable({name: "Car Rental", value: "car_rental"}),
            ko.observable({name: "Convenience", value: "convenience_store"}),
            ko.observable({name: "Stores", value: "store"}),
            ko.observable({name: "Eletronics", value: "electronics_store"}),
            ko.observable({name: "Bars", value: "bar"}),
            ko.observable({name: "Restaurants", value: "restaurant"}),
            ko.observable({name: "Parks", value: "park"}),
            ko.observable({name: "Subway Stations", value: "subway_station"})
        ]);
    },
    //Function to adjust opacity of searchBar element
    fadeNavPanel: function(opacity){
        if (opacity>0) {
            $(".navPanel").fadeTo("fast", opacity, function () {
                $(this).css("display","block");
                $(this).css("z-index","99");
            });
        }
        else {
            $(".navPanel").fadeTo("fast", opacity, function () {
                $(this).css("display","none");
                $(this).css("z-index","0");
            });
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
    changes.forEach(function (change) {
        if (change.status === 'added') {
            console.log('New Location added: '+ change.value().name);
            APP.Main.loadLocation(change.value);
        } else if (change.status === 'deleted') {
            console.log('deleted item !!');
        }
    });


}, null, "arrayChange");

//Initialize KnockoutJS with default location
ko.applyBindings(new APP.Main.viewModel("Central Park, NY")); // This makes Knockout get to work

//keep search bar always the same size as nav-bar (list-view)
function equalizeWidth() {
    $( ".navPanel" ).width($( ".searchBar" ).width());
}
