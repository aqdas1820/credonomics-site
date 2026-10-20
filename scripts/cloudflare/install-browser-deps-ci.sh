#!/usr/bin/env bash
set -euo pipefail
# Disposable GitHub Ubuntu runner only. Keep signed Ubuntu repositories; unrelated
# preinstalled Microsoft package feeds can return 403 and break apt update.
[[ "${GITHUB_ACTIONS:-}" == "true" && "${RUNNER_OS:-}" == "Linux" ]]
[[ -f /etc/apt/sources.list.d/ubuntu.sources ]]
cn_apt_dir=$(mktemp -d)
trap 'rm -rf "$cn_apt_dir"' EXIT
mkdir "$cn_apt_dir/sources"
cp /etc/apt/sources.list.d/ubuntu.sources "$cn_apt_dir/sources/ubuntu.sources"
printf 'Dir::Etc::sourcelist "/dev/null";\nDir::Etc::sourceparts "%s/sources";\n' "$cn_apt_dir" > "$cn_apt_dir/apt.conf"
sudo env "APT_CONFIG=$cn_apt_dir/apt.conf" "$(command -v node)" node_modules/playwright/cli.js install-deps chromium
npx playwright install chromium
