#!/bin/sh

set -o verbose

## In development, used colima as docker engine
# colima start --memory 7

## And docker engine as a minikube driver
# minikube config set driver docker

## Run minikube with kubernetes 1.23.0 and 6GB memory for kube-prometheus-stack
## All parameters are from https://github.com/prometheus-operator/kube-prometheus#minikube
# minikube delete
minikube start --kubernetes-version=v1.23.0 --memory=6g --bootstrapper=kubeadm --extra-config=kubelet.authentication-token-webhook=true --extra-config=kubelet.authorization-mode=Webhook --extra-config=scheduler.bind-address=0.0.0.0 --extra-config=controller-manager.bind-address=0.0.0.0

## Install external prometheus stack, 'k8s-prom-stack-release' release name is arbitrary
# helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
# helm repo update
export PROMETHEUS_STACK_RELEASE='k8s-prom-stack-release'
helm install -f values-kube-prometheus-stack.yml $PROMETHEUS_STACK_RELEASE prometheus-community/kube-prometheus-stack

## Build app container
docker build -t balance-observer .

## Load image to minikube (to be change for organisation repository)
minikube image load balance-observer

## Create or choose a namespace
KUBE_NAMESPACE='balance-observer'
kubectl create namespace $KUBE_NAMESPACE 

## Install monitoring app
helm install balance-observer-chart balance-observer-chart --namespace $KUBE_NAMESPACE