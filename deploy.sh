#!/bin/sh
export HOME=/home/SVKruik

# Git
git config --global --add safe.directory "$HOME/Documents/GitHub/Uplink"
git reset --hard
git pull
echo "Git setup complete"

# Uplink - amqp.stefankruik.com
npm install
npm run build
[ -d logs ] || mkdir logs

echo "Uplink update complete. Reloading server."
sudo systemctl restart uplink-api.service
