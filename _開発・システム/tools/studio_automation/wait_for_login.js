const CDPClient = require('./cdp_client');
const path = require('path');

async function main() {
    const client = new CDPClient(9222);
    try {
        console.log('Connecting to Chrome on port 9222...');
        const target = await client.connect('studio.design');
        console.log('Monitoring login status...');

        const targetProjectUrl = 'https://app.studio.design/projects/NxqgmljEW1/dashboard/home';
        let loggedIn = false;

        for (let i = 0; i < 60; i++) { // 最大3分待機
            const currentUrl = await client.evaluate('window.location.href');
            console.log(`[Check ${i + 1}] Current URL: ${currentUrl}`);

            if (!currentUrl.includes('/login') && !currentUrl.includes('accounts.google.com')) {
                console.log('🎉 Login detected! Successfully authenticated.');
                loggedIn = true;
                break;
            }

            await new Promise(r => setTimeout(r, 3000));
        }

        if (loggedIn) {
            console.log(`Navigating to target project dashboard: ${targetProjectUrl}`);
            await client.navigate(targetProjectUrl);
            await new Promise(r => setTimeout(r, 4000));

            const screenshotPath = path.join(__dirname, 'dashboard_status.png');
            await client.screenshot(screenshotPath);
            console.log(`Screenshot saved to: ${screenshotPath}`);

            const pageTitle = await client.evaluate('document.title');
            console.log(`Current Dashboard Title: ${pageTitle}`);
        } else {
            console.log('Login wait timeout. Please try again.');
        }

        await client.close();
    } catch (e) {
        console.error('Error:', e.message);
        process.exit(1);
    }
}

main();
