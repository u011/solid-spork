#!/bin/sh

set -o verbose

KUBE_NAMESPACE='balance-observer'

docker build -t balance-observer .
helm uninstall balance-observer-chart --namespace $KUBE_NAMESPACE
sleep 60
minikube image rm balance-observer
minikube image load balance-observer
helm install balance-observer-chart balance-observer-chart --namespace $KUBE_NAMESPACE

