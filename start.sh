#!/bin/bash
echo "🚀 Starting aria2c..."
aria2c --enable-rpc --rpc-listen-all=true --rpc-allow-origin-all --daemon=true

echo "🤖 Starting Telegram bot..."
node bot.js
