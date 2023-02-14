#!/bin/sh

set -o verbose

docker build -t balance-observer .
helm uninstall balance-observer-chart
sleep 60
minikube image rm balance-observer
minikube image load balance-observer
helm install balance-observer-chart balance-observer-chart

