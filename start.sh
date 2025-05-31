##!/bin/bash

echo "🔧 Starting aria2c..."
aria2c --enable-rpc --rpc-listen-all=true --rpc-allow-origin-all=true --dir=/app/downloads --continue=true --max-connection-per-server=5 --rpc-listen-port=6800 --max-concurrent-downloads=5 --daemon=true

echo "🤖 Starting the bot..."
python3 bot.py
