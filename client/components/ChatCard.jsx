/** @jsx React.DOM */

var Chat = React.createClass({
  getInitialState: function () {
    return {
      message: "",
      messages: []   
    };
  },
  componentWillReceiveProps: function () {
    this.setState({messages: this.props.messages});
  },
  componentDidMount: function () {
    var context = this;
    socket.on('newMessage', function(message) {
      var updatedMessages = context.state.messages;
      if(message.spotId === context.props.spotId) {
        updatedMessages.push(message);
        context.setState({messages: updatedMessages});
      }
    })
  },
  handleSubmit: function(event) {
    event.preventDefault();

    var timeStamp = new Date();

    var message = {
      spotId: this.props.spotId,
      username: localStorage.getItem('username'),
      text: this.state.message,
      timeStamp: timeStamp
    }
    socket.emit('messageSend', message);
    this.setState({message: ""});
  },

  handleChange: function(event) {
    this.setState({message: event.target.value})
    console.log("MESSAGE", this.state.message);
  },

  render: function () {

    var messages = this.state.messages.map(function(message) {
      return (
        <div className="user-bubble">
          <span>{message.timeStamp}: </span><span>{message.username} - </span><span>{message.text}</span>
        </div>
      )
    }, this);

    return (
      <div className="chat-card">

        <div className="chat-container">

          <div className="chat">
          {messages}
          </div>

        </div>

        <div className="chat-form-container">

          <form className="chat-form" onSubmit={this.handleSubmit}>

            <input type="text" value={this.state.message} placeholder="speak yo mind, russell" name="message" onChange={this.handleChange}/>

            <input type="submit" value="send" />
          </form>

        </div>
      </div>
    );  
  }
});