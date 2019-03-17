#!/bin/bash
echo "[---pulling latest code---]"
git pull
echo "[---stopping bot---]"
docker-compose stop bot
echo "[---removing containers---]"
docker-compose rm -f
echo "[---rebuilding bot---]"
docker-compose build bot
echo "[---restarting bot and nginx---]"
docker-compose -f docker-compose.yml up -d --no-deps bot
