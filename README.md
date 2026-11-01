# Karpenter website-preview artifact lab

This lab mirrors the `aws/karpenter-provider-aws` split between an untrusted PR site build and a privileged `workflow_run` preview deployment with OIDC and repository-write permissions.

The attacker overlay adds a symlink to a crafted site ZIP and uploads those exact archive bytes with the PR job's ordinary artifact-service credential. The vulnerable positive control extracts and follows it while creating a public-preview hash. The hardened control rejects non-regular files before publication. Only a synthetic secret hash is published; the secret itself is never logged or uploaded.

The first negative control established that supported `actions/upload-artifact@v7` dereferences symlinks. Direct ZIP upload is therefore a required attacker capability for this historical shape.

The upstream Karpenter workflow is currently hardened. This lab reproduces the historical trust-boundary failure and its negative control, not a current Karpenter vulnerability.
