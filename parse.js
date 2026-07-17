const cheerio = require('cheerio');
const fs = require('fs');

try {
    // storyindex.html を読み込む
    const html = fs.readFileSync('storyindex.html', 'utf8');
    const $ = cheerio.load(html);
    const shifts = [];

    // 各日の情報を抽出
    $('.sche_dl').each((i, el) => {
        const date = $(el).find('dt').text().trim();
        const startTime = $(el).find('select[name^="sc_st"]').val();
        const endTime = $(el).find('select[name^="sc_ed"]').val();
        // ラジオボタンの隣のテキストを取得
        const status = $(el).find('input[type="radio"]:checked').next('label').text().trim();

        shifts.push({
            date: date,
            startTime: startTime === 'non' ? '未設定' : startTime,
            endTime: endTime === 'non' ? '未設定' : endTime,
            status: status || '未選択'
        });
    });

    // JSONファイルとして保存
    fs.writeFileSync('result.json', JSON.stringify(shifts, null, 2));
    console.log('解析成功！result.json を作成しました。');
} catch (err) {
    console.error('エラーが発生しました:', err);
    process.exit(1);
}
