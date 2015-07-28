/** @jsx React.DOM */
//Sorting criteria
function compare(a,b) {
  if (a.timestamp < b.timestamp)
    return -1;
  if (a.timestamp > b.timestamp)
    return 1;
  return 0;
}

//Chat components
var ChatList = React.createClass({
  render: function() {
    var strToUsr = this.props.toUsr;
    var createItem = function(message, index) {
      var messageClass = "from-me";
      if (message.from == strToUsr)
      {
        messageClass = "from-them";
      }
      return (
      	<div key={index}>
      	<div className="clear"></div>
        <div className={messageClass} >
          <p>{message.msg}</p>
        </div>
      	</div>
      	);
    };
    return <div>{this.props.items.map(createItem)}</div>;
  }
});
var ChatApp = React.createClass({
  getInitialState: function() {
    return {
      items: [],
      currentUserItems: [],
      toUsrItems: [],
      text: '',
      currentUser: 'user1',
      toUsr: 'user2',
      numItems: 5
    };
  },
  componentWillMount: function() {
    this.firebaseRef = new Firebase("https://boiling-torch-250.firebaseio.com/chat");
    this.getFBData(this.state.currentUser, this.state.toUsr, this.state.numItems);
  },
  componentWillUnmount: function() {
  this.firebaseRef.off();
  },
  onChange: function(e) {
    this.setState({text: e.target.value});
  },
  setCurrentUser: function(e) {
    this.setState({currentUser: e.target.value});
    this.firebaseRef.off();
    this.getFBData(e.target.value, this.state.toUsr, this.state.numItems);
  },
  setRec: function(e) {
    this.setState({toUsr: e.target.value});
    this.firebaseRef.off();
    this.getFBData(this.state.currentUser, e.target.value, this.state.numItems);
  },
  getFBData: function(newCurrentUser, newToUsr, newLimit) {
    console.log(newCurrentUser + newToUsr + newLimit);
    //CurrentUser listener
    this.firebaseRef.child(newCurrentUser + "/" + newToUsr).limitToLast(newLimit).on('value', function(dataSnapshot) {
      var items = [];
      dataSnapshot.forEach(function(childSnapshot) {
          var item = childSnapshot.val();
          items.push(item);
      });
      var sortedItems = items.concat(this.state.toUsrItems);
      sortedItems.sort(compare);
      console.log(JSON.stringify(sortedItems));
      this.setState({
        currentUserItems: items,
        items: sortedItems
      });
    }.bind(this));
    console.log("Listening for changes on: " + newCurrentUser + "/" + newToUsr);
    //toUser Listener
    this.firebaseRef.child(newToUsr + "/" + newCurrentUser).limitToLast(newLimit).on('value', function(dataSnapshot) {
      var items = [];
      dataSnapshot.forEach(function(childSnapshot) {
          var item = childSnapshot.val();
          items.push(item);
      });
      var sortedItems2 = items.concat(this.state.currentUserItems);
      sortedItems2.sort(compare);
      this.setState({
        toUsrItems: items,
        items: sortedItems2
      });
    }.bind(this));
    console.log("Listening for changes on: " + newToUsr + "/" + newCurrentUser);
  },
  alertTest: function(){
    console.log("testworks");
  },
  handleSubmit: function(e) {
    e.preventDefault();
    if (this.state.text && this.state.text.trim().length !== 0) {
      var txtText = this.state.text;
      var objMessage = {from: this.state.currentUser, to: this.state.toUsr, msg: txtText, timestamp: Date.now()};
      this.firebaseRef.child(this.state.toUsr + "/" + this.state.currentUser).push(objMessage);
      this.setState({
        text: ''
      });
    }
  },
  render: function() {
    return (
      <div>
        <div className="page-header">
          <h1 className="text-center">Chatting with {this.state.toUsr}</h1>
        </div>
        <form>
          Your user name: <input onChange={this.setCurrentUser} value={this.state.currentUser}/>
          Send to user: <input onChange={this.setRec} value={this.state.toUsr}/>
        </form>
        <section>
        <ChatList items={this.state.items} toUsr={this.state.toUsr}/>
        </section>
        <div className="container">
        <form className="formMessage" onSubmit={this.handleSubmit}>
          <input className="col-md-8" onChange={this.onChange} value={this.state.text} placeholder="Send us a message..." />
          <button className="btn btn-default col-md-4">Send Us a Message</button>
        </form>
        </div>
      </div>
    );
  }
});
//Render call
React.render(<ChatApp />,
	document.getElementById('chatBox'));
