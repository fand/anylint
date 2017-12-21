#!/usr/bin/env perl
# This rule disallows more than 2 blank lines
use strict;
use warnings;
use JSON;
use v5.010;

my $errors = [];

my $linenum = 1;
my $lastline = 'DUMMY';
while (<>) {
  my $line = $_;
  if ($line =~ /^\s*$/ && $lastline =~ /^\s*$/) {
    push @$errors, {
      line => $linenum,
      column => 1,
      message => 'Too many blank lines!',
      ruleId => 'no-multiple-blank-lines',
    }
  }
  $linenum++;
  $lastline = $line;
}

say encode_json($errors);
