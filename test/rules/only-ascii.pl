#!/usr/bin/env perl
# This rule disallows using non-ascii characters.
use strict;
use warnings;
use JSON;
use v5.010;

my $errors = [];

my $linenum = 1;
while (<>) {
  my $line = $_;
  while ($line =~ /([^[:ascii:]]+)/g) {
    my $start = $-[0];
    push @$errors, {
      line => $linenum,
      column => $start + 1,
      message => 'Don\'t use non-ascii characters.',
      ruleId => 'only-ascii',
    };
  }
  $linenum++;
}

say encode_json($errors);
