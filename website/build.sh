#!/usr/bin/env bash
set -euo pipefail
mkdir -p website/out
echo '<h1>baseline preview</h1>' > website/out/index.html
(cd website/out && zip -qr ../hostile-artifact.zip .)
