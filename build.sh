#!/bin/bash

rollup=./node_modules/.bin/rollup

rm build/*.js build/*.map build/*.d.ts
rmdir build
$rollup -c rollup.config.js
$rollup -c rollup.config.js --full
$rollup -c rollup.config.js --prod
cp src/index.d.ts build/
