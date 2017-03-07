#!/bin/bash

rm build/*.js build/*.map
rmdir build
rollup -c rollup.config.js
rollup -c rollup.config.js --full
rollup -c rollup.config.js --prod
