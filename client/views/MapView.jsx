// Load react.js from index.html for browser environment, or npm for test environment.
var React = React || require('react');

// Define the minimum time (ms) to show welcome-view-container on first run.
var welcomeScreenTimeout = 1000;

var MapView = React.createClass({

  // Create a lookup for CSS classes.
  getDefaultProps: function () {
    return {
      collapseButtonContainer: "collapse-button-container",
      filterSearchClass: "filter-search",
      refreshButtonContainer: "refresh-button-container",
      centerButtonContainer: "center-button-container",
      aboutButtonContainer: "about-button-container"
    };
  },

  getInitialState: function () {
    return {
      spots: globalState.spots,
      selected: {},
      location: globalState.location,
      refreshingClass: "",
      buttonClass: "hide",
      filterClass: "hide",
      showButtonClass: "",
      markers: []
    };
  },

  componentDidMount: function() {

    var context = this;

    // Listen for spots created by other users and create new map marker on spotDrop.
    socket.on('spotDrop', function (newSpot) {
      createMarker(newSpot, true, context);
    });

    // Check whether location has been set globally.
    // If not, get location and initialize map with nearby spots.
    // Otherwise, just initialize the map.
    if(!globalState.location) {
      context.setState({showScreen: true})
      setTimeout(function() {
        getLocation(function(location) {
          initMap(location, context, function(map) {
            map.setOptions({zoomControl: true});
            context.setState({buttonClass: "circle"});
            context.setState({filterClass: ""});
            context.setState({location: location});
            context.setState({center: location});
            context.getSpots(true);
          });
        }, context);
      }, welcomeScreenTimeout);
    } else {
      context.setState({showScreen: false})
      initMap(globalState.location, context, function(map) {
        map.setOptions({zoomControl: true});
        context.setState({buttonClass: "circle"});
        context.setState({filterClass: ""});
        context.setState({center: globalState.location}, function() {
          context.getSpots();
        });
      });
    };
  },

  // Make AJAX call to server to retrieve spot data near center of map.
  // Server calculates distance and returns only spots within 50 miles.
  getSpots: function (animate) {

    var context = this;

    this.setState({refreshingClass: " spin"});
    $.ajax({
      method: 'GET',
      url: '/api/map',
      dataType: 'json',
      data: {"location": context.state.center},
      success: function (data) {
        globalState.spots = data;
        context.setState({spots: data});
        context.setState({refreshingClass: ""});
        sweepMarkers(context, function() {
          context.initSpots(false);
        })
      },
      error: function (error) {
        context.setState({refreshingClass: ""});
      }
    });
  },

  // Loop through spot data from server.
  // Generate a map marker and summary bubble for each spot.
  initSpots: function (animate) {
    var context = this;

    for(var i = 0; i < context.state.spots.length; i++) {
      console.log(spot);
      var spot = this.state.spots[i];
      // Skips spots where the start time is in past or if spot is tracker
      if (spot.lastId || timeController.stringifyTime(spot).charAt(0) === "-") {
        continue;
      };
      createMarker(spot, animate, context);
    };
  },

  // Center the map on the user's current GPS location.
  center: function() {
    this.state.map.offsetPan(this.state.position, 0, -50);
  },

  // Toggle visibility of button drawer via CSS class.
  collapseClick: function () {
    var newState = {};
    if (this.state.showButtonClass === "") {
      newState.showButtonClass = "-show";
    } else {
      newState.showButtonClass = "";
    }
    this.setState(newState);
  },

  render: function () {
    return (
      <div className="map-view-container">
        <ScreenSizeWarning />
        <div id="map">
          {this.state.showScreen ? <LoadScreen /> : null}
        </div>
        <div className="create-button-container">
          <a href="#/create" className={this.state.buttonClass}>
            <i className="material-icons">add</i>
          </a>
        </div>
        <div className={this.props.collapseButtonContainer + " " + this.props.collapseButtonContainer + this.state.showButtonClass} onClick={this.collapseClick}>
          <a className={this.state.buttonClass}>
            <i className="fa fa-ellipsis-h"></i>
          </a>
        </div>
        <div className={this.props.refreshButtonContainer + " " + this.props.refreshButtonContainer + this.state.showButtonClass + this.state.refreshingClass}>
          <a onClick={this.getSpots} className={this.state.buttonClass}>
            <i className="material-icons">refresh</i>
          </a>
        </div>
        <div className={this.props.centerButtonContainer + " " + this.props.centerButtonContainer + this.state.showButtonClass}>
          <a onClick={this.center} className={this.state.buttonClass}>
            <i className="material-icons">gps_fixed</i>
          </a>
        </div>
        <div className={this.props.filterSearchClass + " " + this.props.filterSearchClass + this.state.showButtonClass}>
          <FilterSearch filterClass={this.state.filterClass} markers={this.state.markers} />
        </div>
        <div className={this.props.aboutButtonContainer + " " + this.props.aboutButtonContainer + this.state.showButtonClass}>
          <a href="http://www.irl.events/" target="_blank" className={this.state.buttonClass}>
            <i className="material-icons">info_outline</i>
          </a>
        </div>
      </div>
    );
  }
});

// Display welcome message on first run.
var LoadScreen = React.createClass({
  render: function() {
    return (
      <div className="welcome-container">
        <div>
          <h1>irl</h1>
          <h2>welcome!</h2>
          <p>your map is loading...</p>
        </div>
      </div>
    )
  }
});

// Toggle visibility of on-screen map markers depending on user text input.
var FilterSearch = React.createClass({
  getInitialState: function () {
    return {
      filter: ''
    }
  },

  handleChange: function (event) {
    var search = new RegExp(event.target.value, 'gi');
    this.props.markers.forEach(function(marker) {
      var fields = marker.getFields();
      if(fields.match(search)) {
        marker.setVisible(true);
      } else {
        marker.setVisible(false);
      }
    });
  },
  
  render: function () {
    return (
      <div style={{width: 'calc(100vw / 2)', opacity: '.75'}}>
        <form className={this.props.filterClass} style={{padding: '0px'}} onChange={this.handleChange}>
          <input style={{boxShadow: '0px 0px 0px 0px #CCCCCC'}} type="text" id="filter-search" placeholder="Filter" defaultValue={this.state.filter || ''} autoComplete='off' />
        </form>
      </div>
    )
  }
});
