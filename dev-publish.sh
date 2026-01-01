#!/bin/bash
set -eux
cd "$(dirname "$0")"
tmp=$(mktemp)
cp package.json $tmp
trap "mv $tmp package.json" EXIT
pnpx json -I -f package.json -e 'this.name="@rzymek/react-dsl-editor"; this.version += `-alpha.${new Date().getTime()}`'
npm run build
npm publish --tag dev


