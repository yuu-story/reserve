const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

async function run() {
    const session = axios.create({ baseURL: 'https://www.story-tokyo.com', headers: { 'User-Agent': 'Mozilla/5.0' } });

    // ログイン処理
    const params = new URLSearchParams();
    params.append('login_id', '0061');
    params.append('password', '0061');
    params.append('login', 'ログイン');
    await session.post('/g_con/', params);

    // スケジュール取得
    const res = await session.get('/g_con/schedule.php');
    const $ = cheerio.load(res.data);
    let shiftData = [];

    // 日付とシフト情報の取得（テーブルの行ごとに処理）
    $('tr').each((i, el) => {
        const text = $(el).text();
        const dateMatch = text.match(/(\d{1,2}\/\d{1,2})/); // 7/18 等を抽出
        if (dateMatch) {
            const time = $(el).find('select option:selected').text().trim() || "休み";
            shiftData.push({ date: dateMatch[1], time: time.replace("選択...", "休み") });
        }
    });

    // HTML生成
    let tableHtml = '\n<table style="width:100%; border-collapse: collapse; color: #e6e6e6;">\n';
    shiftData.forEach(item => {
        tableHtml += `  <tr style="border-bottom: 1px solid #333;"><td style="padding: 10px; color:#999;">${item.date}</td><td style="padding: 10px; text-align:right;">${item.time}</td></tr>\n`;
    });
    tableHtml += '</table>\n';

    // ファイル書き込み
    let html = fs.readFileSync('profile.html', 'utf8');
    const newHtml = html.replace(/<!-- SHIFT_START -->[\s\S]*<!-- SHIFT_END -->/, `<!-- SHIFT_START -->${tableHtml}<!-- SHIFT_END -->`);
    fs.writeFileSync('profile.html', newHtml);
    console.log("更新完了");
}
run();
