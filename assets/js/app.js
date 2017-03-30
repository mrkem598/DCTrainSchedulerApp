$(document).ready(function(){

/*Firebase personal link*/
var scheduleData = new Firebase("https://dctrainescheduleapp.firebaseio.com/");

/*Create button for adding trains to schedule*/
$('#addTrainBtn').on("click", function(event){
	event.preventDefault();
	/*These variables will grab the data that the user inputs*/
	var trainName = $('#trainNameInput').val().trim();
	var destinationPoint = $('#destinationInput').val().trim();
	var firstTrainTime = $("#firstTrainInput").val().trim();
	var frequency = $("#frequencyInput").val().trim();

	/*Create a temp train object for storing the data*/
	var trainData = {
		name: trainName,
		destination: destinationPoint,
		firstTrain: firstTrainTime,
		frequency: frequency,
	};

	/*Use the traindata and push it to Firebase using scheduledata variable*/
	scheduleData.push(trainData);


	/*Console.log trainData object*/
	console.log(trainData.name);
	console.log(trainData.destination);
	console.log(trainData.firstTrain);
	console.log(trainData.frequency);

	/*Alert to let user know train was successfully added*/
	//alert("Train was successfully added");

	/*Clear out divs*/
	trainName = $("#trainNameInput").val("");
	destinationPoint = $("#destinationInput").val("");
	firstTrainTime = $("#firstTrainInput").val("");
	frequency = $("#frequencyInput").val("");

	/*Prevents moving to new page*/
	//return false;
/*Closes out addTrainBtn onclick function*/	
}); 

function trainTable(){
/*Create an event that adds the train data to the database, and to the html*/
scheduleData.on("child_added", function(childSnapshot, prevChildKey){

	/*Create variables to store the data inside of*/
	var locoName = childSnapshot.val().name;
	var locoDestination = childSnapshot.val().destination;
	var locoFrequency = childSnapshot.val().frequency;
	var locoFirstTrain = childSnapshot.val().firstTrain;

		/*Create variables for time storage*/
		var firstTimeTransfered = moment(locoFirstTrain, "hh:mm").subtract(1, "years");
			console.log(firstTimeTransfered);

		var presentTime = moment();
			console.log("Current Time: " + moment(presentTime).format("hh:mm"));

		var differenceInTimes = moment().diff(moment(firstTimeTransfered), "minutes");
			console.log("Time difference: " + differenceInTimes);

		var timeRemainder = differenceInTimes % locoFrequency;
			console.log(timeRemainder);

		var minutesTilTrain = locoFrequency - timeRemainder;
			console.log("Minutes til train: " + minutesTilTrain);

		var nextTrain = moment().add(minutesTilTrain, "minutes");
			console.log("Next train arrival: " + moment(nextTrain).format("hh:mm"));

		var nextTime = moment(nextTrain).format("hh:mm");

	/*Add the train data into table*/
	$("tbody").append("<tr><td>" + locoName + "</td><td>" + locoDestination + "</td><td>" + locoFrequency + "</td><td>" + nextTime + "</td><td>" + minutesTilTrain + "</td></tr>");

/*Childsnapshot and prevchildkey function*/
});

/*close function*/
}

/*Call the function*/
trainTable();


}); //end of document.ready 