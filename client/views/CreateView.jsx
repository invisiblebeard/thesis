// This component renders the page to create a new spot.
var CreateView = React.createClass({

  // Sets current user location and creates the map.
  componentDidMount: function() {
    var context = this;
    var setLocation = globalState.location;
    if(!setLocation) {
      getLocation(function(location) {
        initMap(location, context, context.searchMap);
      }, this);
    } else {
      initMap(setLocation, context, context.searchMap);
    }
  },

  getInitialState: function () {
    var state = {};
    if (globalState.createState) {
      state = globalState.createState;
    }
    return state;
  },

  // Handles search for autocomplete location.
  // Initiates a new map for CreateView.
  // Sets up listener to update map and marker based on address input value.
  searchMap: function (map, position, marker) {

    google.maps.event.clearListeners(map, 'zoom_changed');

    map.setOptions({disableDefaultUI: true});

    marker.setIcon('/img/map/you_test.png');

    marker.setOptions({optimized: false});

    var context = this;

    // Create a new Google Maps autocomplete object based on addess input field.
    var autocomplete = new google.maps.places.Autocomplete(document.getElementById('address'));

    // Bind autocomplete object to current map.
    autocomplete.bindTo('bounds', map);

    var infowindow = new google.maps.InfoWindow({
      allow: true,
      maxWidth: 200
    });

    this.setState({infowindow: infowindow});

    this.setState({marker: marker}, function() {

      // Listen for new address autocomplete value, and update map marker.
      google.maps.event.addListener(autocomplete, 'place_changed', function() {

        var place = autocomplete.getPlace();

        if (typeof place.address_components === 'undefined') {
          var first = $(".pac-container .pac-item:first").text();
          var service = new google.maps.places.PlacesService(map);
          service.textSearch({query: place.name, bounds: map.getBounds()}, function(results, status) {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
              placeMarker(context, results[0], infowindow, map);
            }
          })
        } else {
          placeMarker(context, place, infowindow, map);
        }
      });
    });
  },

  // POST new spot to server for storage in database.
  // Calculates event duration.
  // On success, emits socket event to notify other clients to update.
  sendSpot: function (event) {
    event.preventDefault();
    var context = this;

    var duration = timeController.hoursToMS(this.state.hours) + timeController.minutesToMS(this.state.minutes);
    console.log("DURATION =========>", duration);
    $.ajax({
      method: 'POST',
      url: '/api/create',
      dataType: 'json',
      data: {
        name: context.state.name,
        category: context.state.category,
        location: context.state.location,
        address: context.state.address,
        description: context.state.description,
        start: timeController.timeToMS(context.state.start),
        end: duration.toString()
      },
      success: function (data) {
        console.log("DATA ===========>", data);
        globalState.createState = undefined;
        socket.emit('newSpot', data);
        window.location = '/#/';
      },
      error: function (error) {
      }
    })
  },

  // Converts device GPS coords into a street address.
  getAddress: function (event) {
    if (event) {
      event.preventDefault();
    }

    var context = this;

    var request = {
      location: location,
      type: 'address_components'
    }

    var geocoder = new google.maps.Geocoder;

    var location = {
      lat: globalState.location.latitude,
      lng: globalState.location.longitude
    }

    geocoder.geocode({location: location}, function(results, status) {
      if (status !== 'OK') {
        return console.error('Cannot find user address from location');
      }
      placeMarker(context, results[0], context.state.infowindow, context.state.map, 'My Location');

    })
  },

  // Updates event category when user changes category selector.
  selectChange: function(category) {
    this.setState({category: category});
  },

  // Turns input field red when character limit is reached.
  handleChange: function (event) {
    var context = this;
    var newState = {};
    if (event.target.maxLength) {
      if (event.target.value.length >= event.target.maxLength) {
        event.target.style["background-color"] = "#eaadae";
      } else {
        event.target.style["background-color"] = "";
      }
    }

    newState[event.target.id] = event.target.value;
    this.setState(newState);
  },

  // Updates address in state when location field is updated.
  changeAddress: function (event) {
    this.setState({address: event.target.value});
  },


  render: function () {
    // Saves user input in case user navigates away from page.
    globalState.createState = this.state;

    // Handles 2-way data binding for category drop-down selector.
    // Uses it's own change handler (selectChange) instead of handleChange.
    var valueLink = {
      value: this.state.category,
      requestChange: this.selectChange
    };

    return (
      <div>
        <div className="create-map-view-container">
          <div id="map"></div>
        </div>
        <div className="reset-button-container">
          <a className="circle gps-found" onClick={this.getAddress}>
            <i className="material-icons">gps_fixed</i>
          </a>
        </div>
        <div>
          <form id="createSpotForm" onChange={this.handleChange}>
            <input type="text" id="name" placeholder="Title" defaultValue={this.state.name || ''} maxLength="50" required autoComplete='off'/>
            <input type="text" id="address" placeholder="Location" onChange={this.changeAddress} value={this.state.address || ''} required />
            <select valueLink={valueLink}>
              <option id="category">Select Category</option>
              <option id="category" value="General">General</option>
              <option id="category" value="Food">Food</option>
              <option id="category" value="Entertainment">Entertainment</option>
              <option id="category" value="Health & Fitness">Health & Fitness</option>
              <option id="category" value="Arts & Culture">Arts & Culture</option>
              <option id="category" value="Parties & Nightlife">Parties & Nightlife</option>
              <option id="category" value="Nature & Outdoors">Nature & Outdoors</option>
              <option id="category" value="Politics">Politics</option>
              <option id="category" value="Education">Education</option>
            </select>
            <input type="text" id="description" placeholder="Description" defaultValue={this.state.description || ''} required autoComplete='off'/>
            <span className="time-input">Start Time</span>
            <input type="time" id="start" step="900" placeholder="Start" defaultValue={this.state.start || ''} required />
            <span className="time-input">Duration</span>
            <div className="duration-input-container">
              <input type="number" className="duration-input" step="1" min="1" max="24" id="hours" placeholder="Hours" defaultValue={this.state.hours || 0} />
              <input type="number" className="duration-input" step="15" min="0" max="60" id="minutes" placeholder="Minutes" defaultValue={this.state.minutes || 0}/>
            </div>
              <div className="button" onClick={this.sendSpot}>Submit</div>
          </form>
        </div>
        <LoginRequired />
      </div>
    );
  }
});
