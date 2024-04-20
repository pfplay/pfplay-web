#!/bin/bash

# Find all subdirectories in the current directory
for dir in */
do
  # Create an empty index.ts file in the directory
  touch "${dir}index.ts"
done
