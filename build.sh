#!/bin/bash

rollup=./node_modules/.bin/rollup

rm build/*.js build/*.map build/*.d.ts
rmdir build
$rollup -c rollup.config.js
$rollup -c rollup.config.js --full
$rollup -c rollup.config.js --prod
cp src/interfaces.d.ts lib/
./node_modules/dts-bundle/lib/dts-bundle.js --name rxrest --main lib/index.d.ts --outputAsModuleFolder
cp lib/rxrest.d.ts build/
