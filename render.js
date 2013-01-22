// render.js - frontend js for the testYourself flashcard game
//
// author: Tom Ladendorf (tladendo)

/* OBJECTS! */

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
LL.prototype.toString = function() {
	var ans = "";
	var currentNode = this.head;
	while (currentNode != null) {
		ans += currentNode.value + ", ";
		currentNode = currentNode.next;
	}
	return ans;
}
LL.prototype.shuffle = function() {
	var currentNode = this.head;
	var arr = [];
	while (currentNode != null) {
		arr.push(currentNode.value);
		currentNode = currentNode.next;
	}
	for (var i = 0; i < this.length; i++) {
		var j = Math.floor(Math.random() * this.length);
		var temp = arr[i];
		arr[i] = arr[j];
		arr[j] = temp;
	}
	this.head = new Node(arr[0]);
	currentNode = this.head;
	for (var i = 1; i < this.length; i++) {
		var newNode = new Node(arr[i]);
		currentNode.setNext(newNode);
		currentNode = newNode;
	}
	this.tail = currentNode;
}

// Card object that represents flashcards
function Card() {}
function Card(question, answer) {
	this.question = question;
	this.answer = answer;
	this.current = question;
	this.other = answer;
	this.onQuestion = true;
}

Card.prototype.flip = function() {
	if (this.onQuestion == true) {
		this.current = this.answer;
		this.other = this.question;
		this.onQuestion = false;
	} else {
		this.current = this.question;
		this.other = this.answer;
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
	master.flipped = false;
}


Master.prototype.init = function(card) {
	this.currentCard = card;
	this.currentCardNode = new Node(card);
	this.cardList = new LL(this.currentCardNode);
	this.length = 1;
	this.index = 0;
}

Master.prototype.update = function() {
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

Master.prototype.shuffle = function() {
	this.cardList.shuffle();
	this.currentCardNode = this.cardList.head;
	this.currentCard = this.currentCardNode.value;
	this.index = 0;
	this.displayCurrent();
}

Master.prototype.permanentlyRemove = function() {
	//$.ajax({type: 'POST', url: 'delcard.cgi?tablename=' + this.tableName + '&question=' + this.currentCard.question, async: false, success: function() { }});
	$.post("delcard.cgi", "question=" + this.currentCard.question + "&tablename=" + this.tableName, function(data) { });
	this.deleteFromSession();
}

Master.prototype.deleteFromSession = function() {
	// $.ajax({type: 'POST', url: 'delcard.cgi?tablename=' + this.tableName + '&question=' + this.currentCard.question, async: false, success: function(text) { ans = $(text); }});
	if (this.length == 0) return 0;
	this.length--;
	this.cardList.length--;
	var next = this.currentCardNode.next;
	var prev = this.currentCardNode.prev;
	if (prev != null) {
		prev.setNext(next);
		this.cardList.head = next;
	} else {
		next.setPrev(prev);
	}
	if (next == null) {
		this.currentCardNode = prev;
		this.cardList.tail = prev;
	} else {
		this.currentCardNode = next;
	}
	this.currentCard = this.currentCardNode.value;
	this.displayCurrent();
}

Master.prototype.displayCurrent = function() {
	if (this.index == this.length) {
		this.index--;
	}
	if (this.flipped) {
		$("#display").text(this.currentCard.other);
	} else {
		$("#display").text(this.currentCard.current);
	}
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

Master.prototype.flipAll = function() {
	if (this.flipped) {
		this.flipped = false;
	} else {
		this.flipped = true;
	}
	this.displayCurrent();
}

Master.prototype.actionInit = function() {
	var master = this;
	$("#card").click(function() { master.flip(); });
	$("#next").click(function() { master.displayNext(); });
	$("#prev").click(function() { master.displayPrev(); });
	$("#setAside").click(function() { master.deleteFromSession(); });
	$("#delete").click(function() { master.permanentlyRemove(); });
	$("#flipAll").click(function() { master.flipAll(); });
	$("#shuffle").click(function() { master.shuffle(); });
}

Master.prototype.dismantle = function() {
	$("#card").unbind(this.flip);
	$("#next").unbind(this.displayNext);
	$("#prev").unbind(this.displayPrev);
}

/* END OBJECTS */

/* OTHER IMPORTANT FUNCTIONS */

// this function is tied to the "SELECT ANOTHER SET" button
function displaySelectAnother(ev) {
	$("#rightContainer").children().remove();
	$("#selectAnotherMenu").css("display", "inline");
	$("#rightContainer").append($("#selectAnotherMenu"));
	var selectButton = "<a class='button' id='selectSubmitButton'>SELECT</a>";
	$("#rightContainer").append($("<br />")).append($("<br />")).append($(selectButton));
	// add event listener to select button
	$("#selectSubmitButton").click(ev.data, selectNewSet);
}

// this function is tied to the "SELECT ANOTHER SET" > "SELECT" button
function selectNewSet(ev) {
	var master = ev.data
	// As a safety/debugging measure, get rid of all the old cards
	$("div.pair").remove();
	// Make a request for the cards from the desired set and store them in a variable
	var select = $("#selectAnotherMenu").val();
	master.tableName = select;
	// Will return a div jQuery object
	var ans = {};
	// TODO: make this AJAX call work
	$.ajax({type: 'GET', url: 'dbget.cgi?' + select, async: false, success: function(text) { ans = $(text); }});
	function add(elt) {
		$("body").append(elt);
	}
	ans.children().each(function() { add($(this)); });
	master.update();
	global = master;
	/*
	// using "global" is a hack. fix it
	global.ans = ansObj;
	global.reset();
	//var p = $.ajax({type: 'POST', url: 'http://www.tomladendorf.com/flashcards/addcard.cgi', data: "first_name=Tom&last_name=Ladendorf"});
	*/
}

// displays input when "ADD A NEW CARD" is clicked
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
// posts input for a new card
function postInput(ev) {
	//var p = $.ajax({type: 'POST', url: 'http://www.tomladendorf.com/flashcards/addcard.cgi', data: "first_name=Tom&last_name=Ladendorf"});
	var question = $("#questionField").val();
	var answer = $("#answerField").val();
	var master = ev.data;
	var back = $.post("addcard.cgi", "question=" + question + "&answer=" + answer + "&id=" + master.length + "&tablename=" + master.tableName, function(data) {
		//alert("DATA: " + data);
	});
	var newPair = "<div class='pair'><div class='question'>" + question + "</div><div class='answer'>" + answer + "</div></div>";
	$("body").append($(newPair));
	master.add(new Card(question, answer));
	$("#addContainer").remove();
	$("#buttons").append($("<a id='add' class='button'>ADD A NEW CARD</a>"));
	$("#add").click(ev.data, displayInput);
	$("body").append($(back));
}
// cancels adding a new card
function cancel(ev) {
	$("#addContainer").remove();
	$("#buttons").append($("<a id='add' class='button'>ADD A NEW CARD</a>"));
	$("#add").click(ev.data, displayInput);
}

/* END ADDL FUNCTIONS */

// for debugging purposes
var global = {};

// This is where everything happens
$("document").ready(function() {
	// Create the master object and pull in all the existing divs
	var master = new Master();
	master.actionInit();
	global = master;
	$("#selectAnotherButton").click(master, displaySelectAnother);
	master.tableName = "cards";
	$("#add").click(master, displayInput);
});

