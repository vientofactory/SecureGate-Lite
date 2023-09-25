#!/bin/bash

yarn
yarn build
cp -r src/web/modules/templates dist/web/modules
cp -r src/web/modules/locales dist/web/modules
echo 'completed'