const axios = require('axios');
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const https = require('https');


async function parseCockie(page) {
    // Логинимся на TikTok (введите свои учетные данные)
    await page.fill('input[name="username"]', 'stalker942407');
    await page.fill('input[type="password"]', 'Lv3zSwHK@BT~29T');
    await page.click('button[type="submit"]');

    await page.waitForNavigation();

    const cookies = await page.context().cookies();
    fs.writeFileSync('services/temp/cookies.json', JSON.stringify(cookies));
}
async function downloadFile(url) {
    async function checkRedirect() {
        try {
            const response = await axios.get(url, {
                maxRedirects: 0, // Запрещаем следование за редиректами
                validateStatus: (status) => status >= 200 && status < 400, // Обработка кодов редиректа
            });
    
            // Если код 3xx и есть заголовок Location, значит редирект есть
            if (response.status >= 300 && response.status < 400 && response.headers.location) {
                //console.log(`Redirect found: ${response.headers.location}`);
                return response.headers.location;
            } 
        } 
        catch(error) {
            console.error('Error checking redirect:', error.message);
            return 'error';
        }
    }

    const outputPath = 'services/temp/1.mp4';
    const isRedirect = await checkRedirect();

    if(isRedirect !== 'error') return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(outputPath);

        https.get(isRedirect ? isRedirect : url, (res) => {
            res.pipe(file);

            file.on('finish', ()=>  file.close(resolve));
        }).on('error', (error) => {
            fs.unlink(outputPath, () => {});
            reject(error);
        });
    });
}


//pigson94@outlook.com
async function postOnTikTok(videoPath) {
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext({
        // Устанавливаем кастомный user-agent для контекста
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        viewport: { width: 1280, height: 720 },
        geolocation: { latitude: 54.0063, longitude: 13.0112 },
        permissions: ['geolocation']
    });
    const page = await context.newPage();
    const cookies = JSON.parse(fs.readFileSync('services/temp/cookies.json', 'utf-8'));
    await page.context().addCookies(cookies);

    // Открываем страницу входа в TikTok
    await page.goto('https://www.tiktok.com/login/phone-or-email/email');
    await page.waitForNavigation();
    await page.waitForTimeout(3000);

    // Переходим на страницу загрузки видео
    await page.goto('https://www.tiktok.com/upload');
    await page.waitForNavigation();
    await page.waitForTimeout(2000);
    const fileInput = await page.$('input[type="file"]');
    await downloadFile(videoPath);                  
    await fileInput.setInputFiles(path.join(__dirname, '/temp/1.mp4'));


    await page.waitForTimeout(10000);
    await browser.close();
}


//postOnTikTok('https://www.tikwm.com//video/media/play/7463915087078853890.mp4')
