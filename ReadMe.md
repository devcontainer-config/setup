# 🚧

```sh
alias create-devcontainer='docker run --rm -it \
    -u $(id -u):$(id -g) -v ${PWD}:${PWD} -w ${PWD} \
    ghcr.io/devcontainer-config/setup'
```
