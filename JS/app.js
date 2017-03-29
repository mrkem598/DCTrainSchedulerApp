// Initialize Firebase and return database object  
function initFirebase () {
  var config = {
    apiKey: "AIzaSyCSto1e8t8uPFIWEPxLz1JSu8TbJnelbdk",
    authDomain: "dctrainescheduleapp.firebaseapp.com",
    databaseURL: "https://dctrainescheduleapp.firebaseio.com",
    storageBucket: "dctrainescheduleapp.appspot.com",
    messagingSenderId: "752714268344"
  };
  firebase.initializeApp(config);
  return firebase.database();
}
  //Generic function to write new object to designated firebase path
  function writeNewObj (dataObj, itemPath) {
  // Generate a uid to associate with object in database
  var newKey = firebase.database().ref().child(itemPath).push().key;
  //Call update function with new UID and return what comes back from updateObj
  return updateObj(dataObj, itemPath, newKey);
}
//Update object in the database
function updateObj(dataObj, itemPath, key) {
  //Create empty updates object and add uid/dataObj to updates object
  var updates = {};
  //Iterate over dataobj and add all key/value pairs to updates object
  for (var subKey in dataObj) {
    updates['/' + itemPath +'/' + key + '/' + subKey] = dataObj[subKey];
  }
  console.log(updates);
  //Return array with Promise and uid 
  return [firebase.database().ref().update(updates), key];
}
function calcNextArrival(train) {
  //Create new moment object at current time (default)
  var currTime = moment();
  //THE time is military time system
  //Create new moment object with first arrival information
  var firstArrival = moment(train.firstArrival, 'HH:mm a');
  train.minutesAway = Math.abs(currTime.diff(firstArrival, 'minutes') % train.frequency);
  train.nextArrival = currTime.add(train.minutesAway, 'minutes').format('HH:mm a');
  //Return train object with minutesAway and nextArrival keys add. Interpreter should know that the key value = variable value
  return train;
}
//Add Train to train-table element
function writeTrain(train, key){
    //Add next arrival and minutes away to train object
    train = calcNextArrival(train);
    //Create button elements outside of append for ease of reading
    var removeBtn = '<button class="btn btn-danger btn-sm remove-train" type="submit" data-key="'  + key + '">Remove</button>';
    var updateBtn = '<button class="btn btn-primary btn-sm update-train" type="submit" data-key="' + key +'">Update</button>';
  //Insert row into Train Table with train information and train firebase key as data-key element on remove button (for retrieval)
  $("#train-table").append( '<tr><td contenteditable=true>'  + train.name + 
    '</td><td contenteditable=true>' + train.destination + 
    '</td><td contenteditable=true>' + train.frequency + 
    '</td><td>' + train.nextArrival + 
    '</td><td contenteditable=true>' + train.minutesAway +
    '</td><td>' + updateBtn + 
    '</td><td>' + removeBtn + '</td></tr>');

}
function removeTrain(button){
  //Get uid of train to be removed
  var key = button.attr("data-key");
  //Remove train from firebase database
  database.ref('trains').child(key).remove();
  //Remove train's row from table
  button.parent().parent().remove();
}
// Capture Add Train button click
$("#submit-train").on("click", function(event) {
  //Stop default action on submit
  event.preventDefault();
  //Create a train object from form fields
  var newTrain = {
    "name" : $("#train-name").val().trim(), 
    "destination" : $("#destination").val().trim(), 
    "frequency" : $("#frequency").val().trim(),
    "firstArrival" : $("#first-train").val().trim()
  };
  //Clear out all input elements in the add train form
  $("#add-train-form :input").val("");
  //write a new train object to the database
  writeNewObj(newTrain, 'trains');
});
//REMOVE TRAINS: Capture remove train button click (note: document or container needed to listen for dynamic element)
$("#train-table").on('click', '.remove-train', function(e) {
  //Stop the default action on submit
  event.preventDefault();
  //Call function to remove train element
  removeTrain($(this));
});
//UPDATE TRAINS: Capture update train button click (note: document or container needed to listen for dynamic element)
$("#train-table").on('click', '.update-train', function(e) {
  //Stop the default action on submit
  event.preventDefault();
  //Get the firebase key from data attribute
  var key = $(this).attr("data-key");
  //Get the row element two levels above button
  var row = $(this).parent().parent();
  //Create updated train object from table
  var updatedTrain = {
    name : row.children().eq(0).text().trim(),
    destination : row.children().eq(1).text().trim(),
    frequency : row.children().eq(2).text().trim()
  };
  //Update Firebase with train information
  updateObj(updatedTrain, 'trains', key);
});
//Call function to initialize firebase
var database = initFirebase();
//Set up authentication
var provider = new firebase.auth.GoogleAuthProvider();
firebase.auth().signInWithPopup(provider).then(function(result) {
  // This gives you a Google Access Token. You can use it to access the Google API.
  var token = result.credential.accessToken;
  // The signed-in user info.
  var user = result.user;
}).catch(function(error) {
  // Handle Errors here.
  var errorCode = error.code;
  var errorMessage = error.message;
  // The email of the user's account used.
  var email = error.email;
  // The firebase.auth.AuthCredential type that was used.
  var credential = error.credential;
});
//Write firebase train data to table and listen for additions
//child_added event will return all children when attached
database.ref('trains').on("child_added", function(snapshot, prevChild) {
  writeTrain(snapshot.val(), snapshot.getKey());
   //Log out any error received
 }, function (errorObject) {
  console.log("The read failed: " + errorObject.code);
});
//Listen for any changes to trains within the database and update table
database.ref('trains').on("child_changed", function(snapshot, prevChild) {
  //Pull the row containing updated train based on data-key element tied to remove button
  var row = $("[data-key=" + snapshot.getKey()).parent().parent();
  //Take firebase object and add next arrival information
  var train = calcNextArrival(snapshot.val());
  //Populate row with updated train information
  row.children().eq(0).text(train.name);
  row.children().eq(1).text(train.destination);
  row.children().eq(2).text(train.frequency);
  row.children().eq(3).text(train.nextArrival);
  row.children().eq(4).text(train.minutesAway);
     //Log out any error received
   }, function (errorObject) {
    console.log("The read failed: " + errorObject.code);
   
  });
//Listen for any changes to trains within the database and update table
database.ref('trains').on("child_removed", function(snapshot, prevChild) {
  //Remove the row containing deleted train based on data-key element tied to remove button
  $("[data-key=" + snapshot.getKey()).parent().parent().remove();
     //Log out any error received
   }, function (errorObject) {
    console.log("The read failed: " + errorObject.code);
  });


