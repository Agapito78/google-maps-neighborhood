/**
 * Created by agapi on 6/2/2017.
 */
APP.Controller = (function() {
    //function to add main markers to the map
    function createMarker(position,place) {
        var marker = new google.maps.Marker({
            position: position,
            title: place().name,
            map: APP.Main.map
        });
        //console.
        if (typeof((place().position.lat) == "undefined")) {
        console.log(place().name + ": lat: \"" + position.lat + "\", lng: \"" + position.lng+ "\"" + (place().position));
        }
        //update location stored inside APP.Main.places
        place(new APP.MapLocation({name: place().name,info:place().info, marker: marker }));

        //add click event to the marker
        google.maps.event.addListener(marker, 'click', (function(marker) {
            return function() {
                if (!(APP.Main.checkedPlaceType())) {
                    APP.Controller.showModal("Information is Required", "Please, select place type.");
                    return false;
                }
                //when marker is clicked remove old points of interests of the map
                APP.Main.clearNearbyPlaces();

                //check if default marker exists and change color to default if another marker is clicked
                if ((APP.Main.defaultMarker())&&(APP.Main.defaultMarker() !== marker)) {
                    APP.Controller.setDefaultIcon();
                }
                else {
                    APP.Main.defaultMarker(marker);
                }

                //set content of the infoWindow
                var content = "<h4>" + place().name + "</h4><div class='small' style='padding:5px'>Nearby markers: <strong>" + APP.Main.checkedPlaceType().value + "</strong><br><img width='30' src='https://upload.wikimedia.org/wikipedia/en/thumb/8/80/Wikipedia-logo-v2.svg/1122px-Wikipedia-logo-v2.svg.png'> &nbsp;From Wikipedia</div><ul class='list-group'>" + place().info + "</ul>";
                APP.Main.infowindow.setContent(content);

                //adjust variable to be used as parameter for getFourSquareInfo
                var placeFour = new APP.MapLocation({name: place().name, info: "Local Info",marker: marker.getPosition()});
                APP.Main.map.setZoom(16);
                //get info from Foursquare
                getFourSquareInfo(placeFour).done(function(fourInfo) {
                    APP.Main.infowindow.setContent(content+fourInfo);
                });

                //change Marker color to blue
                place().marker.setIcon("https://mt.google.com/vt/icon?color=ff004C13&name=icons/spotlight/spotlight-waypoint-blue.png");
                APP.Main.infowindow.open(APP.Main.map, marker);
                APP.Controller.getNearbyPlaces(place().marker.getPosition());
                google.maps.event.addListener(APP.Main.infowindow, 'closeclick', function () {
                    APP.Controller.setDefaultIcon();
                });
                APP.Main.defaultMarker(marker);
            };
        })(marker));
        //if search button was clicked than highlight new marker in the map
        if (APP.Main.searchBtnClicked) {
            //set marker color to blue
            place().marker.setIcon("https://mt.google.com/vt/icon?color=ff004C13&name=icons/spotlight/spotlight-waypoint-blue.png");
            //set marker as current marker
            APP.Main.defaultMarker(marker);
            //reset boolean value for search button click event
            APP.Main.searchBtnClicked = false;
        }
    }

    //create marker for points of interest arounf main markers
    function createNearbyMarker(position,place) {
        var marker = ko.observable(new google.maps.Marker({
            position: position.geometry.location,
            title: position.name + "-" + position.vicinity,
            map: APP.Main.map
        }));

        //adjust icon
        var icon = {
            url: position.icon, // url
            scaledSize: new google.maps.Size(22, 22), // scaled size
            origin: new google.maps.Point(0,0), // origin
            anchor: new google.maps.Point(0, 0) // anchor
        };
        //set icon
        marker().setIcon(icon);

        //click event for points of interest marker
        google.maps.event.addListener(marker(), 'click', (function(marker) {
            return function() {
                var content = "<h3>" + position.name + "</h3><ul class='list-group'>" + position.vicinity + "</ul>Nearby markers: <strong>" + APP.Main.checkedPlaceType().value + "</strong><br>";
                APP.Main.infowindow.setContent(content);

                APP.Main.infowindow.open(APP.Main.map, marker());

                //Load Foursquare Info
                getFourSquareInfo(place).done(function(fourInfo) {
                    content += fourInfo;
                    APP.Main.infowindow.setContent(content);

                    //Load Wikipedia Info
                    APP.Controller.getWikipediaInfo(place).done(function(wikiInfo) {
                        content += "<div class='small' style='padding:5px'><img width='30' src='https://upload.wikimedia.org/wikipedia/en/thumb/8/80/Wikipedia-logo-v2.svg/1122px-Wikipedia-logo-v2.svg.png'> &nbsp;Content below from Wikipedia</div>" + wikiInfo;
                        APP.Main.infowindow.setContent(content);
                    });
                });
                //google.maps.event.addListener(APP.Main.infowindow, 'closeclick', function () {
                //    APP.Controller.setDefaultIcon();
                //});
                //APP.Main.defaultMarker(marker);
            };
        })(marker));
        APP.Main.nearbyPlaces.push(marker);
    }

    function setDefaultIcon() {
        if (APP.Main.defaultMarker() !== null) {
            APP.Main.defaultMarker().setIcon("https://mt.googleapis.com/vt/icon/name=icons/spotlight/spotlight-poi.png&scale=1");
        }
    }

    function setBlueIcon() {
        if (APP.Main.defaultMarker() !== null) {
            APP.Main.defaultMarker().setIcon("https://mt.google.com/vt/icon?color=ff004C13&name=icons/spotlight/spotlight-waypoint-blue.png");
        }
    }

    //get lat/lng from address
    function getPositionFromAddress(place) {
        var deferred1 = $.Deferred();
        var geocoder = new google.maps.Geocoder();
        var location = {};
        geocoder.geocode( { 'address': place().name}, function(results, status) {

            if (status == google.maps.GeocoderStatus.OK) {
                location = results[0].geometry.location;
                deferred1.resolve(location);
            }
            else {
                location = null;
                deferred1.resolve(location);
            }
        });

        return $.when(deferred1).done(function(){
            return location;
        }).promise();
    }

    function getAddressFromPosition(location) {
        var deferred1 = $.Deferred();
        var geocoder = new google.maps.Geocoder();
        var address = {};
        var latLng = new google.maps.LatLng(location.lat, location.lng);
        geocoder.geocode( { 'latLng': latLng}, function(results, status) {

            if (status == google.maps.GeocoderStatus.OK) {
                address = results[0].formatted_address.toString();
                deferred1.resolve(address);
            }
            else {
                console.log(status);
                location = null;
                deferred1.resolve(address);
            }
        });

        return $.when(deferred1).done(function(){
            return address;
        }).promise();
    }

    function getCurrentAddress() {
        getAddressFromPosition(APP.Main.defaultPosition()).done(function (address) {
            APP.Main.places().push(
                ko.observable(new APP.MapLocation({name: address, info: null}))
            );
        });
    }

    function loadLocationData(place) {
        if (place) {
            getPositionFromAddress(place).done(function (location) {
                if (location !== null) {
                    APP.Main.defaultPosition({lat: location.lat(), lng: location.lng()});
                    APP.Controller.createMarker(APP.Main.defaultPosition(), place);
                }
                else {
                    showModal("Location not Found!", "Please, check the address.\n"+place().name);
                }
            });
        }
    }

    function getLocation() {
        if (navigator.geolocation) {
            APP.Main.hideNavPanel();
            APP.Main.fadeSearchBar(0.2);
            navigator.geolocation.getCurrentPosition(showPosition,geoError);
        } else {
            showModal("Warning!!!", "Geolocation is not supported by this browser.");
        }
    }

    //callback for getLocation function
    function showPosition(position){
        console.log(position);
        //APP.Main.defaultPosition({lat: position.coords.latitude, lng: position.coords.longitude});
        getAddressFromPosition({lat: position.coords.latitude, lng: position.coords.longitude}).done(function (address) {
            console.log(address);
            var place = ko.observable(new APP.MapLocation({name: address, info: null}));
            APP.Main.defaultPosition({lat: position.coords.latitude, lng: position.coords.longitude});
            APP.Controller.createMarker(APP.Main.defaultPosition(), place);
            APP.Controller.getNearbyPlaces({lat: function(){return position.coords.latitude;}, lng: function(){return position.coords.longitude;}});
            //APP.Main.places.push(
            //    ko.observable(new APP.MapLocation({name: address, info: null}))
            //);
            APP.Main.map.setZoom(16);
        });
    }

    //callback for getLocation function - error handling
    function geoError() {
        showModal("Warning!!!", "Geocoder failed.");
    }

    function getWikipediaInfo(place){
        var deferred1 = $.Deferred();
        var info = "";

        var wikiRequestTimeOut = setTimeout(function(){
            showModal("Wikipedia Alert!","No results were found on Wikipedia!");
        },8000);

        $.ajax({
            url: 'https://en.wikipedia.org/w/api.php',
            data: { action: 'query', list: 'search', srsearch: place.name, format: 'json' },
            dataType: 'jsonp',
            success: processResult
        });

        function processResult(apiResult){
            var strWiki = "";
            var limitArticles = (apiResult.query.search.length>1)?1:apiResult.query.search.length;
            for (var i = 0; i < limitArticles; i++){
                //console.log(apiResult.query.search[i]);
                var urlWiki = "https://en.wikipedia.org/wiki/" + apiResult.query.search[i].title;
                strWiki += '<li class="list-group-item"><a target="_blank" href="' + urlWiki + '">'+apiResult.query.search[i].title+'</a><p>' + apiResult.query.search[i].snippet + '</p></li>';

            }
            deferred1.resolve(strWiki);
            clearTimeout(wikiRequestTimeOut);
        }

        return $.when(deferred1).done(function(){
            return info;
        }).promise();
    }

    function getFourSquareInfo(place){
        var deferred1 = $.Deferred();
        var info = "";
        var fsRequestTimeOut = setTimeout(function(){
            showModal("FourSquare Alert!","There is no results in Foursquare for this location.");
        },8000);

        var fourUrl = 'https://api.foursquare.com/v2/venues/search?ll='+place.marker.lat()+","+place.marker.lng() + "&query=" + place.name + "&client_id=P3THLJJCIS2TLMTE0LD1BBTG54S2LGJN30AUH5NSJ1UIO05X&client_secret=CUYYQ0EJNMNLMETTSD4XTYT2WU0NKLOD1SU2IBXADPY5UELL&v=20120609";
        fourUrl = fourUrl.split(" ").join("+");
        console.log(fourUrl);

        $.getJSON(fourUrl, function(data) {
            $.each(data.response.venues, function(i,venues){
                content = '<div><img style="width:18px" src="images/foursquare-logo-icon-14.png"> View info, photos: <a target="_blank" href="https://foursquare.com/v/' + venues.id + '">' + venues.name + '</a></div>';
                deferred1.resolve(content);
                clearTimeout(fsRequestTimeOut);
            });
        });
        return $.when(deferred1).done(function(){
            return info;
        }).promise();
    }

    function showModal(title,content) {
        $('#myModal').find('.modal-title').text(title);
        $('#myModal').find('.modal-body').text(content);
        $('#myModal').find('.modal-footer > .btn-primary').hide();
        $('#myModal').modal('show');
    }

    //get points of interest around specifc location
    function getNearbyPlaces(location) {
        console.log("Nearby: " + location.lat() + "," + location.lng());
        var latLng = new google.maps.LatLng(location.lat(), location.lng());
        var request = {
            location: latLng,
            radius: APP.Main.checkedRange(),
            type: [APP.Main.checkedPlaceType().value] //inform select value from Place Types Radio Button
        };
        infowindow = new google.maps.InfoWindow();
        var service = new google.maps.places.PlacesService(APP.Main.map);
        service.nearbySearch(request, callback);

        function callback(results, status, pagination) {
            if (status == google.maps.places.PlacesServiceStatus.OK) {
                var idx = 0;
                //get 20 results
                loopResults(idx);
                //get more 20 results
                //loopResults(idx);
            }

            function loopResults(index) {
                for (var i = index; i < results.length; i++) {
                    //console.log(results[i]);
                    var place = new APP.MapLocation({name: results[i].name, info: "Local Info",marker: results[i].geometry.location});
                    createNearbyMarker(results[i], place);

                    //move to the next page
                    //if (pagination.hasNextPage) {
                    //    pagination.nextPage();
                    //}
                }
                idx = index;
            }
        }

    }

    return {
        createMarker: createMarker,
        loadLocationData: loadLocationData,
        setDefaultIcon: setDefaultIcon,
        getWikipediaInfo: getWikipediaInfo,
        getFourSquareInfo: getFourSquareInfo,
        getNearbyPlaces: getNearbyPlaces,
        getLocation: getLocation,
        showModal: showModal
    };
})();
