#!/usr/bin/perl

use DBI;

local ($buffer, @pairs, $pair, $name, $value, %FORM, $method);

$ENV{'REQUEST_METHOD'} =~ tr/a-z/A-Z/;
if ($ENV{'REQUEST_METHOD'} eq "POST") {
	read(STDIN, $buffer, $ENV{'CONTENT_LENGTH'});
	$method = "POST";
} else {
	$buffer = $ENV{'QUERY_STRING'};
	$method = "GET";
}
# Split into name / value pairs
@pairs = split(/&/, $buffer);
foreach $pair (@pairs) {
	($name, $value) = split(/=/, $pair);
	$value =~ tr/+/ /;
	$value =~ s/%(..)/pack("C", hex($1))/eg;
	$FORM{$name} = $value;
}
my $question = $FORM{question};
my $answer = $FORM{answer};
my $id = $FORM{id};
my $tablename = $FORM{tablename};
if (length($tablename) == 0) {
	$tablename = "cards";
}

my $hostname = "<INSERT HOSTNAME>";
my $username = "<INSERT USERNAME>";
my $password = "<INSERT PASSWORD>";
my $dbname = "<INSERT DBNAME>";

my $db_handle = DBI->connect("dbi:mysql:database=$dbname;host=$hostname;user=$username;password=$password", {AutoCommit => 1},) or die "Couldn't connect: $DBI::errstr\n";

my $pre = "CREATE TABLE $tablename LIKE cards";
my $statement = $db_handle->prepare($pre) or die "oh no!";
$statement->execute() or die "oh no!";

my $pre = "INSERT INTO $tablename (id, question, answer) VALUES (?, ?, ?)";
my $statement = $db_handle->prepare($pre) or die "oh no!";
$statement->execute($id, $question, $answer) or die "oh no!";
$db_handle->commit;

$db_handle->disconnect();

print "Content-type:text/html\n\n";
print <<END;
<html>
	<head>
		<title>You $method-ed a new card!</title>
	</head>
	<body>
		<p>Question: $question; Answer: $answer</p>
		<p>$success</p>
	</body>
</html>
END
