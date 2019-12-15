#!/bin/bash
echo "[---pulling latest code---]"
git pull
echo "[---stopping bot---]"
docker-compose stop bot
echo "[---removing containers---]"
docker-compose rm -f
echo "[---restarting bot---]"
docker-compose -f docker-compose.yml up -d --no-deps bot
