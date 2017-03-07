#!/bin/bash

[[ '' == $1 ]] && echo "Please provide patch, minor, major argument" && exit 1

npm run lint
npm run build
npm run bundle
npm test
newver=$(npm --no-git-tag-version version $1)
git add -f build package.json
git commit -m $newver
git tag $newver
npm publish
git reset --hard HEAD~1
newver=$(npm --no-git-tag-version version $1)
git add package.json
git commit -m $newver
git push --tags
git push
