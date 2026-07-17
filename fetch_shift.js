const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

async function run() {
    // セッションの設定（クッキーを自動保持）
    const session = axios.create({
        baseURL: 'https://www.story-tokyo.com',
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' }
    });

    try {
        console.log("ログインページへアクセス中...");
        const loginPage = await session.get('/g_con/');
        const $login = cheerio.load(loginPage.data);

        // 隠しトークンがあれば取得（なければ空文字）
        const token = $login('input[name="token"]').val() || '';

        console.log("ログイン実行中...");
        const params = new URLSearchParams();
        params.append('login_id', '0061');
        params.append('password', '0061');
        params.append('token', token); // トークンがあれば付与
        params.append('login', 'ログイン');

        await session.post('/g_con/', params);

        console.log("スケジュール取得中...");
        const scheduleRes = await session.get('/g_con/schedule.php');
        const $ = cheerio.load(scheduleRes.data);
        
        let shiftData = [];
        // テーブルの行を解析
        $('tr').each((i, el) => {
            const rowText = $(el).text();
            // 日付パターン（例: 07/18）を探す
            const dateMatch = rowText.match(/(\d{1,2}\/\d{1,2})/);
            if (dateMatch) {
                // セレクトボックスで選ばれている値を取得
                const selected = $(el).find('select option:selected').text().trim();
                shiftData.push({ date: dateMatch[1], time: selected || "休み" });
            }
        });

        if (shiftData.length === 0) throw new Error("シフトデータが取得できませんでした。構造が変わった可能性があります。");

        // HTML生成
        let tableHtml = '<table style="width:100%; border-collapse: collapse; color: #e6e6e6; margin-top:10px;">';
        shiftData.forEach(item => {
            tableHtml += `<tr style="border-bottom: 1px solid #333;"><td style="padding: 8px; color:#999;">${item.date}</td><td style="padding: 8px; text-align:right;">${item.time.replace("選択...", "休み")}</td></tr>`;
        });
        tableHtml += '</table>';

        let html = fs.readFileSync('profile.html', 'utf8');
        const newHtml = html.replace(/<!-- SHIFT_START -->[\s\S]*<!-- SHIFT_END -->/, `<!-- SHIFT_START -->${tableHtml}<!-- SHIFT_END -->`);
        fs.writeFileSync('profile.html', newHtml);
        console.log("更新完了！");

    } catch (err) {
        console.error("エラー発生:", err.message);
        process.exit(1); // これがExit code 1の原因
    }
}
run();
