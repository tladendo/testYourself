// TODO: refactor and take an object-oriented approach.
// this is a little hard to read.

$("document").ready(function() {
	// find all the question/answer pairs
	var pairs = $("div.pair");
	var pairIndex = 0;
	var max = pairs.size();
	// captures the first pair in a variable as a jQuery object
	var currentPair = $(pairs[pairIndex]);
	// gets the test of the current pair's question
	var currentQuestion = $(currentPair.children()[0]).text();
	// gets the test of the current pair's answer
	var currentAnswer = $(currentPair.children()[1]).text();
	// master variable
	var data = {pairs: pairs, currentPair: currentPair, onDisplay: currentQuestion, currentQuestion: currentQuestion, currentAnswer: currentAnswer, pairIndex: pairIndex, max: max, table: "cards"};
	// for DEBUG purposes
	global.data = data;
	$("#cardNumber").text(pairIndex + 1);
	$("#display").text(currentQuestion);
	$("#card").click(data, flip);
	$("#next").click(data, advance);
	$("#prev").click(data, retreat);
	$("#add").click(data, displayInput);
	// button to select another set
	$("#selectAnotherButton").click(data, displaySelectAnother);
	// button to create a new card
	$("#createNewButton").click(data, displayCreateNew);
	/*
	$("div.pair").each(function() {
		var question = $($(this).children()[0]).text();
		$("body").append($("<h4>Question " + count++ + ":</h4>"));
		$("body").append($("<p>" + question + "</p>"));
		var answer = $($(this).children()[1]).text();
		$("body").append($("<p>Answer: " + answer + "</p>"));
	});
	*/
});
function displaySelectAnother(ev) {
	$("#rightContainer").children().remove();
	$("#selectAnotherMenu").css("display", "inline");
	$("#rightContainer").append($("#selectAnotherMenu"));
	var selectButton = "<a class='button' id='selectSubmitButton'>SELECT</a>";
	$("#rightContainer").append($("<br />")).append($("<br />")).append($(selectButton));
	// add event listener to select button
	$("#selectSubmitButton").click(ev.data, selectNewSet);
}
var global = {};
function selectNewSet(ev) {
	// As a safety/debugging measure, get rid of all the old cards
	$("div.pair").remove();
	ev.data.pairs = [];
	ev.data.pairIndex = 0;
	ev.data.max = 0;
	// Make a request for the cards from the desired set and store them in a variable
	var select = $("#selectAnotherMenu").val();
	ev.data.table = select;
	// Will return a div jQuery object
	var ans = {};
	$.ajax({type: 'GET', url: 'dbget.cgi?' + select, async: false, success: function(text) { ans = $(text); }});
	var ansObj = $(ans.responseText);
	// find all the question/answer pairs
	var pairs = $($("div.pair", ans));
	global.pairs = pairs;
	var max = pairs.size();
	// captures the first pair in a variable as a jQuery object
	var currentPair = $(pairs[0]);
	// gets the test of the current pair's question
	var currentQuestion = $(currentPair.children()[0]).text();
	// gets the test of the current pair's answer
	var currentAnswer = $(currentPair.children()[1]).text();
	ev.data.pairs = pairs;
	ev.data.currentPair = currentPair;
	ev.data.onDisplay = currentQuestion;
	ev.data.currentQuestion = currentQuestion;
	ev.data.currentAnswer= currentAnswer;
	ev.data.pairIndex = 0;
	ev.data.max = max;
	update(ev.data);
	for (var i = 0; i < ev.data.max; i++) {
		var currentPair = $(ev.data.pairs[i]);
		var question = $(currentPair.children()[0]).text();
		var answer = $(currentPair.children()[1]).text();
		var newPair = "<div class='pair'><div class='question'>" + question + "</div><div class='answer'>" + answer + "</div></div>";
		$("body").append($(newPair));
	}
	//var p = $.ajax({type: 'POST', url: 'http://www.tomladendorf.com/flashcards/addcard.cgi', data: "first_name=Tom&last_name=Ladendorf"});
}
function displayCreateNew(ev) {

}
function flip(ev) {
	if (ev.data.onDisplay == ev.data.currentQuestion) {
		ev.data.onDisplay = ev.data.currentAnswer;
		$("#display").text(ev.data.onDisplay);
	}
	else {
		ev.data.onDisplay = ev.data.currentQuestion;
		$("#display").text(ev.data.onDisplay);
	}
}
// Use when index has been updated to update everything else and display the next question
function update(data) {
	data.currentPair = $(data.pairs[data.pairIndex]);
	if (data.currentPair == null) {
		$("#cardNumber").text('');
		$("#display").text("{null card set}");
	}
	data.currentQuestion = $(data.currentPair.children()[0]).text();
	data.currentAnswer = $(data.currentPair.children()[1]).text();
	data.onDisplay = data.currentQuestion;
	$("#cardNumber").text(data.pairIndex + 1);
	$("#display").text(data.currentQuestion);
}

function del(data) {
	data.max--;
	data.currentPair = null;
	data.pairs[data.pairIndex] = null;
	data.currentQuestion = null;
	data.currentAnswer = null;
	var ev = {};
	ev.data = data;
	advance(ev);
}

function advance(ev) {
	ev.data.pairIndex++;
	if (ev.data.pairIndex >= ev.data.max) {
		ev.data.pairIndex--;
		return;
	}
	else {
		update(ev.data);
	}
}
function retreat(ev) {
	ev.data.pairIndex--;
	if (ev.data.pairIndex < 0) {
		ev.data.pairIndex++;
		return;
	}
	else {
		update(ev.data);
	}
}
function displayInput(ev) {
	$("#buttons a:last-child").remove();
	var form = "<form id='addForm'>Q: "
	+ "<input type='text' id='questionField' /><br />" +
	"A: <input type='text' id='answerField' /></form>";
	$("#buttons").append($("<div id='addContainer'></div>"));
	$("#addContainer").append($(form));
	$("#addContainer").append($("<a id='newCardSubmit' class='button'>" +
	"ADD NEW CARD</a>"));
	$("#newCardSubmit").click(ev.data, postInput);
	$("#addContainer").append($("<span>&nbsp;&nbsp</span>"));
	$("#addContainer").append($("<a id='cancel' class='button'>CANCEL</a>"));
	$("#cancel").click(ev.data, cancel);
}
function postInput(ev) {
	//var p = $.ajax({type: 'POST', url: 'http://www.tomladendorf.com/flashcards/addcard.cgi', data: "first_name=Tom&last_name=Ladendorf"});
	var question = $("#questionField").val();
	var answer = $("#answerField").val();
	var id = ev.data.max;
	var back = $.post("addcard.cgi", "question=" + question + "&answer=" + answer + "&id=" + id + "&tablename=" + ev.data.table, function(data) {
		//alert("DATA: " + data);
	});
	var newPair = "<div class='pair'><div class='question'>" + question + "</div><div class='answer'>" + answer + "</div></div>";
	$("body").append($(newPair));
	ev.data.pairs = $("div.pair");
	ev.data.max = ev.data.pairs.size();
	$("#addContainer").remove();
	$("#buttons").append($("<a id='add' class='button'>ADD A NEW CARD</a>"));
	$("#add").click(ev.data, displayInput);
	$("body").append($(back));
}
function cancel(ev) {
	$("#addContainer").remove();
	$("#buttons").append($("<a id='add' class='button'>ADD A NEW CARD</a>"));
	$("#add").click(ev.data, displayInput);
}
