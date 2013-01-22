#!/usr/bin/perl

use DBI;

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
print "Content-type:text/plain\n\n";
print "<div>\n";

my $hostname = "<INSERT HOSTNAME>";
my $username = "<INSERT USERNAME>";
my $password = "<INSERT PASSWORD>";
my $dbname = "<INSERT DBNAME>";

my $dbh = DBI->connect("dbi:mysql:database=$dbname;host=$hostname;user=$username;password=$password") or die "Couldn't connect: $DBI::errstr\n";

my $table = $FORM{table};

my $pre = "SELECT * FROM `$table`";
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

print <<END;
</div>
END

$dbh->disconnect();
