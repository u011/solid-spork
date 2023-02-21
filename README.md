# Balance Observer
App container to monitor distributed ledger addresses balances on Kusama network. Includes kubernetes deployment and prometheus-stack integrations.

## The app

Provides:
- Prometheus alert AccountBalanceBelowDesired
- Calculated as difference between exposed metrics for current and desired balance
- For each address and desired balance in `accounts.yaml`
- Exposes metrics for current balance, block height, and internal errors counter, and alert for service being up

## Installation

**If you want to run the app outside of minikube:**
1. Build an image with `docker build -t balance-observer .`
2. Configure image location in `balance-observer-chart/Chart.yaml` or push to cluster manually
3. Configure `servicemonitor.yaml` and `prometheusrule-alert.yaml` for prometheus to discover, as well as a separate namespace
4. Deploy the chart `helm install balance-observer-chart`

**Run the app in minikube:**
``` bash
## In development, used colima as docker engine
#colima start --memory 7

## And docker engine as a minikube driver
#minikube config set driver docker

## Run minikube with kubernetes 1.23.0 and 6GB memory for kube-prometheus-stack
## All parameters are from https://github.com/prometheus-operator/kube-prometheus#minikube
#minikube delete
minikube start --kubernetes-version=v1.23.0 --memory=6g --bootstrapper=kubeadm --extra-config=kubelet.authentication-token-webhook=true --extra-config=kubelet.authorization-mode=Webhook --extra-config=scheduler.bind-address=0.0.0.0 --extra-config=controller-manager.bind-address=0.0.0.0

## Install external prometheus stack
#minikube addons disable metrics-server
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update
export PROMETHEUS_STACK_RELEASE='k8s-prom-stack-release'
helm install -f values-kube-prometheus-stack.yml $PROMETHEUS_STACK_RELEASE prometheus-community/kube-prometheus-stack

## Build app container
docker build -t balance-observer .

## Load image to minikube (expected to be changed for your repository)
minikube image load balance-observer

## Create or choose a namespace
KUBE_NAMESPACE='balance-observer'
kubectl create namespace $KUBE_NAMESPACE 

## Install monitoring app
helm install balance-observer-chart balance-observer-chart --namespace $KUBE_NAMESPACE

## To access all the installed web interfaces run:
minikube service --all
```

There is a script `install-all.sh` to run all the commands above.
To unninstall delete minikube or run helm uninstall for the release names.
Tested on: m1 mac, osx:latest

## Development

See package.json for available commands, like `yarn test`. May use `./update.sh` to rebuild the image, and redeploy the chart.

## Notes

- Default grafana credentials: admin:prom-operator . Change in prometheus-community/kube-prometheus-stack values.
- Using lagging kubernetes version, verified to work with [kube-prometheus](https://github.com/prometheus-operator/kube-prometheus#compatibility)
