#!/bin/bash
docker stop npmrepo
set -eux
cd "$(dirname "$0")"
docker run --network host --detach --rm --name npmrepo verdaccio/verdaccio
until nc -z localhost 4873; do sleep 1; done
export NPM_PASS="$(openssl rand -base64 12)";
export NPM_USER=local;
export NPM_EMAIL=local@localhost.local;
pnpx npm-cli-login -r http://localhost:4873/
AUTH=$(echo -n "$NPM_USER:$NPM_PASS" | base64 -w 0)
npm config set //localhost:4873/:_auth $AUTH --registry http://localhost:4873/

npm publish --registry http://localhost:4873/ --provenance=false --tag rc

