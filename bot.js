// bot.js
const { Telegraf } = require('telegraf');
const fetch = require('node-fetch');
const Aria2 = require('aria2');

// Load bot token from environment
const BOT_TOKEN = process.env.BOT_TOKEN;

if (!BOT_TOKEN) {
  console.error('❌ BOT_TOKEN not set');
  process.exit(1);
}

const bot = new Telegraf(BOT_TOKEN);

const aria2 = new Aria2({
  host: 'localhost',
  port: 6800,
  secure: false,
  secret: '',
  path: '/jsonrpc'
});

aria2.open().catch(console.error);

async function startAria2Download(url, ctx) {
  try {
    const gid = await aria2.call('addUri', [url]);
    await ctx.reply(`✅ Download started!\nGID: \`${gid}\``, { parse_mode: 'Markdown' });
  } catch (err) {
    console.error('Aria2 Error:', err);
    await ctx.reply(`❌ Failed to start download: ${err.message}`);
  }
}

async function handleTeraBox(link, ctx) {
  try {
    await ctx.reply('🔍 Getting download link...');
    const response = await fetch('https://ytshorts.savetube.me/api/v1/terabox-downloader', {
      method: 'POST',
      body: new URLSearchParams({ url: link }),
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });

    if (!response.ok) throw new Error('API error');
    const data = await response.json();

    const fast = data.response[0].resolutions['Fast Download'];
    const slow = data.response[0].resolutions['HD Video'];

    const testFast = await fetch(fast);
    if (testFast.ok && testFast.headers.get('content-type').includes('application/octet-stream')) {
      await ctx.reply('🚀 Using fast link!');
      await startAria2Download(fast, ctx);
    } else {
      await ctx.reply('⚠️ Fast link failed. Using HD fallback.');
      await startAria2Download(slow, ctx);
    }
  } catch (err) {
    console.error('TeraBox Error:', err);
    await ctx.reply(`❌ Error: ${err.message}`);
  }
}

bot.start((ctx) => ctx.reply('👋 Send me a TeraBox link to start downloading.'));
bot.on('text', async (ctx) => {
  const msg = ctx.message.text;
  if (msg.includes('terabox.com')) {
    await handleTeraBox(msg, ctx);
  } else {
    ctx.reply('❌ Send a valid TeraBox link.');
  }
});

bot.launch().then(() => console.log('🤖 Bot running...'));
