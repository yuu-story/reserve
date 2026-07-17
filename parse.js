const cheerio = require('cheerio');
const fs = require('fs');

try {
    // profile.html を読み込む設定
    if (!fs.existsSync('profile.html')) {
        throw new Error('profile.html が見つかりません。');
    }
    const html = fs.readFileSync('profile.html', 'utf8');
    const $ = cheerio.load(html);
    const shifts = [];

    $('.sche_dl').each((i, el) => {
        const date = $(el).find('dt').text().replace(/\s+/g, ' ').trim();
        const startTime = $(el).find('select[name^="sc_st"]').val();
        const endTime = $(el).find('select[name^="sc_ed"]').val();
        const status = $(el).find('input[type="radio"]:checked').next('label').text().trim();

        shifts.push({
            date: date,
            startTime: startTime === 'non' ? '未設定' : startTime,
            endTime: endTime === 'non' ? '未設定' : endTime,
            status: status || '未設定'
        });
    });

    fs.writeFileSync('result.json', JSON.stringify(shifts, null, 2));
    console.log('解析成功！result.json を作成・更新しました。');

} catch (err) {
    console.error('実行エラー:', err.message);
    process.exit(1);
}
