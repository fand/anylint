#!/usr/bin/env perl
# This rule disallows camelCase variable names
use strict;
use warnings;
use JSON;
use v5.010;

my $errors = [];

my $linenum = 1;
while (<>) {
  if (length($_) > 80) {
    push @$errors, {
      line => $linenum,
      column => 1,
      message => 'Line is too long',
      ruleId => 'line-length',
    };
  }
  $linenum++;
}

say encode_json($errors);
