#!/usr/bin/env perl
# This rule disallows camelCase variable names
use strict;
use warnings;
use JSON;
use v5.010;

my $errors = [];

my $linenum = 1;
while (<>) {
  my $line = $_;
  while ($line =~ /\$(\w+)/g) {
    my $name = $1;
    my $start = $-[0];
    if ($name =~ /[A-Z]+/) {
      push @$errors, {
        line => $linenum,
        column => $start + 1,
        message => 'Variable "' . $name . '" contains uppercase.',
        ruleId => 'no-camel-case-variables',
      }
    }
  }
  $linenum++;
}

say encode_json($errors);
