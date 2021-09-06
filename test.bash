#!/bin/bash

if [[ $# -ne 0 ]]; then
  echo >&2 "usage: $(basename "$0")"
  exit 1
fi

echo "Hello, World!"

exit 0
