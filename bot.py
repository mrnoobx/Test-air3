# bot.py

import asyncio
import os
import logging
import aiohttp
import aria2p
from pyrogram import Client, filters

logging.basicConfig(level=logging.INFO)

BOT_TOKEN = os.environ.get("BOT_TOKEN")
API_ID = int(os.environ.get("API_ID", "12345"))
API_HASH = os.environ.get("API_HASH", "your_api_hash")

app = Client("terabox-bot", bot_token=BOT_TOKEN, api_id=API_ID, api_hash=API_HASH)

aria2 = aria2p.API(
    aria2p.Client(host="http://localhost", port=6800, secret="")
)

async def get_terabox_link(link):
    async with aiohttp.ClientSession() as session:
        try:
            response = await session.post(
                "https://ytshorts.savetube.me/api/v1/terabox-downloader",
                data={"url": link},
                headers={"User-Agent": "Mozilla/5.0"}
            )
            data = await response.json()
            fast = data["response"][0]["resolutions"].get("Fast Download")
            slow = data["response"][0]["resolutions"].get("HD Video")
            return fast or slow
        except Exception as e:
            logging.error(f"Error getting link: {e}")
            return None

@app.on_message(filters.command("start"))
async def start(client, message):
    await message.reply("👋 Send me a TeraBox link to download.")

@app.on_message(filters.text & ~filters.command("start"))
async def handle_link(client, message):
    url = message.text.strip()
    await message.reply("🔍 Generating download link...")
    download_url = await get_terabox_link(url)
    if not download_url:
        await message.reply("❌ Failed to generate download link.")
        return

    await message.reply("📥 Starting download with Aria2...")
    try:
        download = aria2.add_uris([download_url])
        await message.reply(f"✅ Download started!\n\nFile: `{download.name}`", parse_mode="markdown")
    except Exception as e:
        await message.reply(f"❌ Aria2 error: {e}")

if __name__ == "__main__":
    app.run()
