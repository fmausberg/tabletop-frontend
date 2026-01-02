## Commands for cert-issuer manifest

- In this Case helm is just using the oci image

helm template origin-ca-issuer oci://ghcr.io/cloudflare/origin-ca-issuer-charts/origin-ca-issuer \
--version 0.5.11 \
--namespace production \
--set crds.enabled=true \
> origin-ca-issuer.yaml

helm template origin-ca-issuer cloudflare/cloudflare-origin-ca-issuer \
--version 0.5.11 \
--namespace production \
--set crds.enabled=true \
> origin-ca-issuer.yaml

## Commands for cert-manager manifest
`helm repo add jetstack https://charts.jetstack.io --force-update`

helm template \
cert-manager jetstack/cert-manager \
--namespace cert-manager \
--create-namespace \
--version v1.17.2 \
--set crds.enabled=true \
> cert-manager.yaml


## Commadns for ingress-controller manifest
`helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx`

helm template \
ingress-nginx ingress-nginx/ingress-nginx \
--namespace ingress-nginx \
--create-namespace \
--version 4.12.1 \
--set crds.enabled=true \
> ingress-nginx.yaml

## usefull commands
# maybe
`helm search repo ingress-nginx/ingress-nginx --versions`
