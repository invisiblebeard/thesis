/** @jsx React.DOM */

var SearchView = React.createClass({

  getInitialState: function () {
    return {
      query: "",
      results: []
    };
  },

  // Listen for updates to search input field, and update search query in state.
  handleChange: function(event) {
    this.setState({query: event.target.value});
  },

  // Submit search query to server.
  handleSubmit: function(event) {
    event.preventDefault();
    var context = this;
    $.ajax({
      method: 'POST',
      url: '/api/search',
      dataType: 'json',
      data: {
        search: context.state.query
      },
      success: function (data) {
        console.log("SUCCESS: ", data);
        context.setState({results: data});
      },
      error: function (error) {
        console.log(error);
      }
    });
  },

  // Redirect to spot's page on click if search result is a spot.
  spotRedirect: function(spotId) {
    window.location.hash = "/spot/" + spotId;
  },

  // Redirect to user's profile page on click if search result is a user.
  profileRedirect: function(userId) {
    window.location.hash = "/profile/" + userId;
  },

  render: function() {
    // Create a div for each search result returned from handleSubmit AJAX call.
    // Apply different styles depending on whether search result is a user or a spot.
    var results = this.state.results.map(function(result) {
      if(result.email) {
          return (
            <div className="search-result">
              <div className="spot-name-container" onClick={this.profileRedirect.bind(this, result.userId)}>

                <div className='category-icon-container'>
                  <i className='fa fa-user'></i>
                </div>
                <span className='spot-name'><a>{result.username}</a></span>
              </div>
            </div>

        );
      } else {
        return (
          <div className="search-result">
            <div className="spot-name-container" onClick={this.spotRedirect.bind(this, result.spotId)}>

              <div className='category-icon-container'>
                <i className={categories[result.category] || categories.General}></i>
              </div>
              <span className='spot-name'><a onClick={this.spotRedirect.bind(this, result.spotId)}>{result.name}</a></span>
            </div>
            <div> @{timeController.msToTime(result.start)}</div>
          </div>
          );
      }
    }, this);

    return (
      <div className="search-view">
        <form id="search-form" onSubmit={this.handleSubmit}>
          <input type="text" placeholder="Search" value={this.state.query} onChange={this.handleChange} />
          <input type="submit" value="Search" />
        </form>
        <div className="search-results-container">
          {results}
        </div>
      </div>
    );
  }
});
