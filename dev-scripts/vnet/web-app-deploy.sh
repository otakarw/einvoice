#!/bin/bash

docker build -t samo98/einvoice-web-app -f Dockerfile-web-app .
docker push samo98/einvoice-web-app
$JELASTIC_HOME/environment/control/redeploycontainers --envName einvoice-dev --nodeGroup cp --tag latest
