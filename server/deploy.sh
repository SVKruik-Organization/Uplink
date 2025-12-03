#!/bin/sh
export HOME=/home/SVKruik

# Git
cd ..
git config --global --add safe.directory "$HOME/Documents/GitHub/Uplink"
git reset --hard
git pull
echo "Git setup complete"

# Uplink - amqp.stefankruik.com
cd server
npm install
npm run build
[ -d logs ] || mkdir logs

echo "Deployment complete. Reloading server."
sudo systemctl restart uplink-api.service