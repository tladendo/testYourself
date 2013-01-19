// render.js - frontend js for the testYourself flashcard game
//
// author: Tom Ladendorf (tladendo)

// First, objects:

// Node for use in the Linked List

function Node(value) {
	this.value = value;
	this.prev = null;
	this.next = null;
}
Node.prototype.setNext = function(node) {
	if (node == null) {
		this.next = null;
		return false;
	} else {
		this.next = node;
		node.prev = this;
	}
}
Node.prototype.setPrev = function(node) {
	if (node == null) {
		this.prev = null;
		return false;
	} else {
		this.prev = node;
		node.next = this;
	}
}
Node.prototype.remove = function() {
	if (this.prev != null) {
		this.prev.setNext(this.next);
	}
	if (this.next != null) {
		this.next.setPrev(this.prev);
	}
}

// Linked List implementation
function LL() {
	this.length = 0;
	this.head = null;
	this.tail = null;
}
function LL(node) {
	this.head = node;
	this.tail = node;
	this.length = 1;
}
LL.prototype.add = function(node) {
	if (this.length == 0) {
		this.head = node;
		this.tail = node;
		this.length = 1;
	}
	else {
		this.tail.setNext(node);
		this.tail = node;
		this.length++;
	}
}


// Card object that represents flashcards
function Card() {}
function Card(question, answer) {
	this.question = question;
	this.answer = answer;
	this.current = question;
	this.onQuestion = true;
}

Card.prototype.flip = function() {
	if (this.onQuestion == true) {
		this.current = this.answer;
		this.onQuestion = false;
	} else {
		this.current = this.question;
		this.onQuestion = true;
	}
}

// Master object takes the place of a global state variable

// Default constructor pulls from divs on page
function Master() {
	var master = this;
	$("div.pair").each(
		function() {
			var kids = $(this).children();
			var question = $(kids[0]).text();
			var answer = $(kids[1]).text();
			master.add(new Card(question, answer));
		});
	master.displayCurrent();
}


Master.prototype.init = function(card) {
	this.currentCard = card;
	this.currentCardNode = new Node(card);
	this.cardList = new LL(this.currentCardNode);
	this.length = 1;
	this.index = 0;
}

Master.prototype.reset = function() {
	// first, let's clean this object up
	this.currentCard = null;
	this.currentCardNode = null;
	this.cardList = null;
	this.length = null;
	this.index = null;
	// next, let's initialize everything from and bring in the new divs
	var master = this;
	$("div.pair").each(
		function() {
			var kids = $(this).children();
			var question = $(kids[0]).text();
			var answer = $(kids[1]).text();
			master.add(new Card(question, answer));
		});
	master.displayCurrent();
	
}

Master.prototype.add = function(card) {
	if (this.length == 0 || this.length == null) {
		this.init(card);
	} else {
		this.cardList.add(new Node(card));
		this.length++;
	}
}

Master.prototype.removeCurrent = function() {
	this.currentCardNode.remove();
	this.length--;
	this.cardList.length--;
}

Master.prototype.displayCurrent = function() {
	$("#display").text(this.currentCard.current);
	$("#cardNumber").text(this.index + 1);
}

Master.prototype.flip = function() {
	this.currentCard.flip();
	this.displayCurrent();
}

Master.prototype.advance = function() {
	if (this.index < this.length - 1) {
		this.index++;
		this.currentCardNode = this.currentCardNode.next;
		this.currentCard = this.currentCardNode.value;
	} else {
		// do nothing
	}
}

Master.prototype.retreat = function() {
	if (this.index > 0) {
		this.index--;
		this.currentCardNode = this.currentCardNode.prev;
		this.currentCard = this.currentCardNode.value;
	} else {
		// do nothing
	}
}

Master.prototype.displayNext = function() {
	this.advance();
	this.displayCurrent();
}

Master.prototype.displayPrev = function() {
	this.retreat();
	this.displayCurrent();
}

Master.prototype.actionInit = function() {
	$("#card").click(this.flip);
	$("#next").click(this.displayNext);
	$("#prev").click(this.displayPrev);
}

Master.prototype.dismantle = function() {
	$("#card").unbind(this.flip);
	$("#next").unbind(this.displayNext);
	$("#prev").unbind(this.displayPrev);
}



var global = {};

$("document").ready(function() {
	// Create the master object and pull in all the existing divs
	var master = new Master();
	master.actionInit();
	global = master;
	$("#selectAnotherButton").click(master, displaySelectAnother);
});
/*
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
	

	$("div.pair").each(function() {
		var question = $($(this).children()[0]).text();
		$("body").append($("<h4>Question " + count++ + ":</h4>"));
		$("body").append($("<p>" + question + "</p>"));
		var answer = $($(this).children()[1]).text();
		$("body").append($("<p>Answer: " + answer + "</p>"));
	});
});
*/
function displaySelectAnother(master) {
	$("#rightContainer").children().remove();
	$("#selectAnotherMenu").css("display", "inline");
	$("#rightContainer").append($("#selectAnotherMenu"));
	var selectButton = "<a class='button' id='selectSubmitButton'>SELECT</a>";
	$("#rightContainer").append($("<br />")).append($("<br />")).append($(selectButton));
	// add event listener to select button
	$("#selectSubmitButton").click(master, selectNewSet);
}
var global = {};
function selectNewSet(master) {
	// As a safety/debugging measure, get rid of all the old cards
	$("div.pair").remove();
	// Make a request for the cards from the desired set and store them in a variable
	var select = $("#selectAnotherMenu").val();
	// Will return a div jQuery object
	var ans = {};
	// TODO: make this AJAX call work
	$.ajax({type: 'GET', url: 'dbget.cgi?' + select, async: false, success: function(text) { ans = $(text); }});
	var ansObj = $(ans.responseText);
	$("body").append(ansObj);
	// using "global" is a hack. fix it
	global.ans = ansObj;
	global.reset();
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
