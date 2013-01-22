#!/usr/bin/perl

use DBI;

print "Content-type:text/html\n\n";
print <<END;
<html><head><title>this is only a test</title>
<link type="text/css" href="style.css" rel="stylesheet" />
<script type="text/javascript" src="jquery-1.7.2.js"></script>
<script type="text/javascript" src="render.js"></script>
</head>
<body>
<div id="header">TEST YOURSELF</div>
<br /><br />
</div>
<br />
<div id="leftContainer">

</div>
<div id="rightContainer">
	<a id="selectAnotherButton" class="button">SELECT ANOTHER SET</a>
	<br />
	<br />
	<a id="createNewButton" class="button">CREATE A NEW SET</a>
</div>
<div id="cardContainer">
	<div id="card">
		<span id="cardNumber">1</span>
		<span id="display">Q: Are we not men?</span>
	</div>
	<div id="buttons">
		<a id="prev" class="button">PREV</a>
		<a id="next" class="button">NEXT</a><br /><br />
		<a id="add" class="button">ADD A NEW CARD</a>
		<a id="setAside" class="button">SET ASIDE CURRENT CARD</a><br /><br />
		<a id="delete" class="button">PERMANENTLY REMOVE CURRENT CARD</a>
		<a id="flipAll" class="button">FLIP ALL CARDS</a>
	</div>
</div>
END

my $hostname = "<INSERT HOSTNAME>";
my $username = "<INSERT USERNAME>";
my $password = "<INSERT PASSWORD>";
my $dbname = "<INSERT DBNAME>";

my $dbh = DBI->connect("dbi:mysql:database=$dbname;host=$hostname;user=$username;password=$password") or die "Couldn't connect: $DBI::errstr\n";

my $pre = "SELECT * FROM cards";
my $statement = $dbh->prepare($pre);
$statement->execute();
while ($row_ref = $statement->fetchrow_hashref()) {
	print "<div class='pair'>";
	print "<div class='question'>$row_ref->{question}</div>";
	print "<div class='answer'>$row_ref->{answer}</div>";
	print "</div>";
	#print "question: $row_ref->{question}<br />answer: $row_ref->{answer}<br /><br />";
}
my @tables_raw = $dbh->tables;
print "<select id='selectAnotherMenu'>";
foreach (@tables_raw) {
	$_ =~ /`.+`(.+)`/;
	print "<option value='$1'>$1</div>";
}

print <<END;
</body>
</html>
END

$dbh->disconnect();
