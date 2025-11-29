/*
 WormGPT V-9
 buatan: Gilzz1232(L) 
*/
const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");
const fs = require("fs-extra");
const chalk = require("chalk");
const settings = require("./settings");
const path = require("path");

const bot = new TelegramBot(settings.token, { polling: true });
const LIMIT_FILE = "./limits.json";
const USERS_FILE = "./users.json";

// Pastikan file limit ada
if (!fs.existsSync(LIMIT_FILE)) fs.writeJsonSync(LIMIT_FILE, {});
if (!fs.existsSync(USERS_FILE)) fs.writeJsonSync(USERS_FILE, []);

async function getLimit(userId) {
  const data = await fs.readJson(LIMIT_FILE);
  return data[userId] ?? settings.freeLimit;
}
  
async function addUserIfNotExists(userId) {
  const users = await fs.readJson(USERS_FILE);
  if (!users.includes(userId)) {
    users.push(userId);
    await fs.writeJson(USERS_FILE, users);
  }
}

async function reduceLimit(userId) {
  const data = await fs.readJson(LIMIT_FILE);
  if (data[userId] === undefined) data[userId] = settings.freeLimit;
  if (data[userId] > 0) data[userId] -= 1;
  await fs.writeJson(LIMIT_FILE, data);
}

async function addLimit(userId, amount) {
  const data = await fs.readJson(LIMIT_FILE);
  if (!data[userId]) data[userId] = 0;
  data[userId] += amount;
  await fs.writeJson(LIMIT_FILE, data);
}

// === RESET LIMIT OTOMATIS ===
async function resetAllLimits() {
  try {
    const data = await fs.readJson(LIMIT_FILE);
    const userIds = Object.keys(data);
    for (const id of userIds) {
      data[id] = settings.freeLimit;
    }
    await fs.writeJson(LIMIT_FILE, data);
    console.log(chalk.blueBright("🔄 Semua limit telah direset otomatis."));
  } catch (err) {
    console.log(chalk.red("Gagal reset limit:"), err);
  }
}

// Jadwal reset setiap pukul 00:00
setInterval(() => {
  const now = new Date();
  if (now.getHours() === 0 && now.getMinutes() === 0) {
    resetAllLimits();
  }
}, 60 * 1000); // Cek setiap menit

// === COMMANDS ===
bot.onText(/\/start/, (msg) => {
  addUserIfNotExists(msg.from.id);
  bot.sendMessage(
    msg.chat.id,
    `Woi Kontol, Gw Adalah WormGPT-v9. Langsung Pake Aja Y. Kalau Mau Beli Limit Ke @Gilzz1232`,
    {
      reply_markup: {
      inline_keyboard: [
        [
          { text: 'BUY LIMIT', callback_data: 'buy_limit' }, 
          { text: "FREE FITURE", callback_data: "free_fitur" }
        ],
      ],
    },
    parse_mode: 'Markdown'
    }
  );
});

bot.on("callback_query", async (query) => {
  const ChatId = query.message.chat.id;
  const data = query.data;
  
  // Fitur callback
  if (data === "free_fitur") {
    const filenam = "WORMGPT NEW VERSION"
    bot.sendMessage(ChatId, `\`\`\`\n/ngl-spam\n/stalk-tiktok`)
  }
  
  if (data === "buy_limit") {
    bot.sendMessage(ChatId, "Di Bilangin, Langsung Ke @Gilzz1232 Ae kontol")
  }
});

bot.onText(/\/limit/, async (msg) => {
  const sisa = await getLimit(msg.from.id);
  bot.sendMessage(msg.chat.id, `Limit Lu: *${sisa}*`, { parse_mode: "Markdown" });
});

bot.onText(/\/addlimit (.+)/, async (msg, match) => {
  const userId = msg.from.id;
  if (userId !== settings.owner)
    return bot.sendMessage(msg.chat.id, "Kontol Lu bukan Admin Gw Ngentod😛");

  const [target, jumlah] = match[1].split(" ");
  if (!target || !jumlah)
    return bot.sendMessage(msg.chat.id, "Format: `/addlimit <user_id> <jumlah>`", { parse_mode: "Markdown" });

  await addLimit(target, parseInt(jumlah));
  bot.sendMessage(msg.chat.id, `✅ Berhasil menambah ${jumlah} limit ke user ${target}`);
    bot.sendMessage(target, `\`\`\`📢 PENGUMUMAN 📢\n\n\`\`\`\🤖 Berhasil menambah ${jumlah} limit\n\nEnjoy For WORMGPT`)
});

bot.onText(/\/ngl-spam (.+)/, async (msg, match) => {
  const [targeturl, pesanlu, jumlah] = match[1].split(" ");
  if(!targeturl || !pesanlu || !jumlah) return bot.sendMessage(msg.chat.id, "Format Salah nih")
  
  const url = 'https://api.siputzx.my.id/api/tools/ngl';
  const params = {
    link: targeturl,  // Ganti dengan link yang diinginkan
    text: pesanlu   // Ganti dengan teks yang diinginkan
  };
    for (let i = 0; i < jumlah; i++) {
      axios.get(url, { params })
      .then(response => {
        console.log('Respon dari API:', response.data);
      })
      .catch(error => {
        console.error('Terjadi kesalahan:', error);
      });
    }
    bot.sendChatAction(msg.chat.id, "typing");
    bot.sendMessage(msg.chat.id, `Berhasil spam to ${targeturl}`)
})

bot.onText(/\/stalk-tiktok (.+)/, async (msg, match) => {
  const username = match[1];
  bot.sendChatAction(msg.chat.id, "typing")
  try {
    const url = "https://tiktok-scraper7.p.rapidapi.com/user/info";
    const querystring = { unique_id: username };
    const headers = {
      "X-RapidAPI-Key": "1a1537d560mshbad07893adb9308p1f0fb2jsn3484472e8f81",
      "X-RapidAPI-Host": "tiktok-scraper7.p.rapidapi.com"
    };
    const response = await axios.get(url, { headers, params: querystring });
    const output = response.data;
    let message = `ID TikTok: ${output.data.user.id}\nUsername TikTok: ${output.data.user.uniqueId}\nNickname TikTok: ${output.data.user.nickname}\nAvatar Thumb: ${output.data.user.avatarThumb}\nAvatar Medium: ${output.data.user.avatarMedium}\nAvatar Larger: ${output.data.user.avatarLarger}\nSignature: ${output.data.user.signature}\nVerified: ${output.data.user.verified}\nUID: ${output.data.user.secUid}\nSecret: ${output.data.user.secret}\nFTC: ${output.data.user.ftc}\nRelation: ${output.data.user.relation}\nOpen Favorite: ${output.data.user.openFavorite}\nKomen Setting: ${output.data.user.commentSetting}\nDuet Setting: ${output.data.user.duetSetting}\nStitch Setting: ${output.data.user.stitchSetting}\nPrivate Account: ${output.data.user.privateAccount}\nAD Virtual: ${output.data.user.isADVirtual}\nAge: ${output.data.user.isUnderAge18}\nIns ID: ${output.data.user.ins_id}\nTwitter ID: ${output.data.user.twitter_id}\nJudul YouTube Channel: ${output.data.user.youtube_channel_title}\nID YouTube Channel: ${output.data.user.youtube_channel_id}\nJumlah Following: ${output.data.stats.followingCount}\nJumlah Followers: ${output.data.stats.followerCount}\nHeart Count: ${output.data.stats.heartCount}\nJumlah Video: ${output.data.stats.videoCount}\nDiggCount: ${output.data.stats.diggCount}\nID TikTok: ${output.data.stats.heart}`;

        bot.sendMessage(msg.chat.id, message);
    } catch (error) {
        bot.sendMessage(msg.chat.id, 'Terdapat kesalahan saat mengambil data. Silahkan coba lagi.');
        console.error(error);
    }
});

bot.onText(/\/broadcast (.+)/, async (msg, match) => {
  if (msg.from.id !== settings.owner)
    return bot.sendMessage(msg.chat.id, "❌ Kamu bukan owner!");
  const pesan = match[1];
  const users = await fs.readJson(USERS_FILE);
  bot.sendMessage(msg.chat.id, `📢 Mengirim broadcast ke ${users.length} user...`);
  let sukses = 0;
  for (const id of users) {
    try {
      await bot.sendMessage(id, `📢 *Pesan dari Admin:*\n${pesan}`, { parse_mode: "Markdown" });
      sukses++;
    } catch (e) {
      console.log(`Gagal kirim ke ${id}`);
    }
  }
  bot.sendMessage(msg.chat.id, `✅ Broadcast terkirim ke ${sukses} user.`);
});

// === CHAT AI ===
bot.on("message", async (msg) => {
  const text = msg.text;
  const userId = msg.from.id;
  if (!text || text.startsWith("/")) return;

  // ====== CEK LIMIT ======
  let limit = await getLimit(userId);
  if (limit <= 0) {
    return bot.sendMessage(
      msg.chat.id,
      "Yihaa, Limit Mu Telah Habis😛. Coba Lagi Besok Ya Kontol😹",
      { parse_mode: "Markdown" }
    );
  }

  bot.sendChatAction(msg.chat.id, "typing");

  try {
    // ====== REQUEST KE AI ======
    const response = await axios.post(
      "https://api.wrmgpt.com/v1/chat/completions",
      {
        model: "wormgpt-v9",
        messages: [{ role: "user", content: text }],
      },
      {
        headers: {
          Authorization: `Bearer ${settings.apiKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    const reply = response.data.choices?.[0]?.message?.content || "Tidak ada respons dari AI.";

    // ====== DETEKSI PERMINTAAN CODE ======
    const isCodeRequest = /buat.*code|buatkan.*code|script|kode|coding|generate.*code/i.test(text);

    if (!isCodeRequest) {
      await bot.sendMessage(msg.chat.id, `🤖 ${reply}`);
      await reduceLimit(userId);
      return;
    }

    bot.sendMessage(msg.chat.id, "📦 Mengemas kode ke dalam file...");

    // ====== DETEKSI JENIS FILE DARI BAHASA ======
    let ext = "txt"; // default
    const lower = reply.toLowerCase();

    if (lower.includes("```javascript") || lower.includes("```js")) ext = "js";
    else if (lower.includes("```python") || lower.includes("```py")) ext = "py";
    else if (lower.includes("```php")) ext = "php";
    else if (lower.includes("```html")) ext = "html";
    else if (lower.includes("```css")) ext = "css";
    else if (lower.includes("```json")) ext = "json";
    else if (lower.includes("```bash") || lower.includes("```sh")) ext = "sh";

    // ====== BERSIHKAN FORMAT ``` ======
    const cleaned = reply.replace(/```[\s\S]*?\n?/, "").replace(/```/g, "");

    // ====== BUAT FILE & KIRIM ======
    const fileName = `code_${Date.now()}.${ext}`;
    const filePath = path.join(__dirname, fileName);

    fs.writeFileSync(filePath, cleaned);

    await bot.sendDocument(msg.chat.id, filePath, {
      caption: `✅ Kode selesai dibuat (${ext}).`
    });

    fs.unlinkSync(filePath);
    await reduceLimit(userId);

  } catch (err) {
    console.log(`Error API: ${err.message}`);
    bot.sendMessage(msg.chat.id, "❌ Terjadi kesalahan pada server AI.");
  }
});

console.log("🤖 WormGPT-v9 aktif dan siap digunakan!");
