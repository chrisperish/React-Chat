 var myDataRef = new Firebase('https://boiling-torch-250.firebaseio.com/'); 
 myDataRef.push({from: "from-me", message: "This is a test"});
 myDataRef.on('child_added', function(snapshot) {
        var messages = snapshot.val();
        alert(JSON.stringify(messages));
      });
 // sample data
var sampleData = [
	{from: "from-me", message: "This is a test"},
	{from: "from-me", message: "This is a test"},
	{from: "from-me", message: "This is a test"},
	{from: "from-them", message: "This is a test"}
];