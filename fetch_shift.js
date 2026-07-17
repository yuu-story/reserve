const axios = require('axios');
const { URLSearchParams } = require('url');
const fs = require('fs');
const cheerio = require('cheerio');

async function run() {
  const loginId = '0061';
  const password = '0061';

  try {
    const instance = axios.create({
      baseURL: 'https://www.story-tokyo.com/g_con/',
      headers: { 'User-Agent': 'Mozilla/5.0' },
      withCredentials: true 
    });

    // 1. ログイン
    const loginData = new URLSearchParams();
    loginData.append('girl_user_tel', loginId);
    loginData.append('girl_user_login_pass', password);
    loginData.append('login', 'ログイン');
    await instance.post('./', loginData);
    
    // 2. 出勤表の編集ページへ移動
    console.log("シフトページへアクセス中...");
    const res = await instance.get('./edit_sche.php');
    
    // 3. データの抽出（シフト表のテーブルを特定）
    const $ = cheerio.load(res.data);
    // ページ内でシフトが書かれている場所を特定（formの中のテーブルなど）
    const shiftContent = $('form').html(); 

    // 4. profile.htmlへ書き込み
    let profile = fs.readFileSync('profile.html', 'utf8');
    const regex = /<!-- SHIFT_START -->[\s\S]*?<!-- SHIFT_END -->/;
    const newContent = `<!-- SHIFT_START -->\n<div class="schedule-data">${shiftContent}</div>\n<!-- SHIFT_END -->`;
    
    profile = profile.replace(regex, newContent);
    fs.writeFileSync('profile.html', profile);
    
    console.log("更新完了！");

  } catch (error) {
    console.error("エラー発生:", error.message);
    process.exit(1);
  }
}
run();
