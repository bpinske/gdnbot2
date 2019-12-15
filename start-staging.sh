#!/bin/bash
echo "[---pulling latest code---]"
git pull
echo "[---stopping staging bot---]"
docker-compose stop bot
echo "[---removing containers---]"
docker-compose rm -f
echo "[---restarting staging bot---]"
docker-compose -f docker-compose.yml -f docker-compose.staging.yml up -d --no-deps bot
