const express = require('express');
const path = require('path');
const fs = require('fs');
const pug = require('pug');
const { chromium } = require('playwright');
const axios = require('axios')
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.render('index')
})

// app.post('/submit', async (req, res) => {
//   try {
//     const url = req.body.url;

//     // Launch a new browser instance
//     const browser = await chromium.launch();

//     // Create a new page in the browser context
//     const page = await browser.newPage();

//     // Navigate to the provided URL
//     await page.goto(url);

//     // Wait for the tweet container to be rendered
//     await page.waitForSelector('article[data-testid="tweet"]');

//     // Extract data
//     const img = await page.$eval('img.css-9pa8cd', img => img.getAttribute('src'));
//     const user_name_href = await page.$eval('a.css-175oi2r.r-1wbh5a2.r-dnmrzs.r-1ny4l3l.r-1loqt21', el => el.getAttribute('href'));
//     const user_name = user_name_href.substring(20);
//     const name = await page.$eval('span.css-1qaijid.r-bcqeeo.r-qvutc0.r-poiln3:nth-child(7)', el => el.textContent);
//     const tweet_body = await page.$eval('span.css-1qaijid.r-bcqeeo.r-qvutc0.r-poiln3:nth-child(9)', el => el.textContent);
//     const time = await page.$eval('time', el => el.textContent);

//     // Output extracted data
//     console.log('Image:', img);
//     console.log('Username:', user_name);
//     console.log('Name:', name);
//     console.log('Tweet Body:', tweet_body);
//     console.log('Time:', time);

//     // Close the browser
//     await browser.close();

//     // Render the template with the extracted data
//     const data = { img, user_name, name, tweet_body, time };
//     const compiledTemplate = pug.compileFile('views/tweets.pug');
//     const renderedHtml = compiledTemplate(data);

//     // Launch a new browser instance
//     const browser2 = await chromium.launch();

//     // Create a new page in the browser context
//     const page2 = await browser2.newPage();

//     // Set the content of the page to the rendered HTML
//     await page2.setContent(renderedHtml);

//     // Wait for the .tweet-container element to be rendered
//     await page2.waitForSelector('.tweet-container');

//     // Take a screenshot of the .tweet-container
//     const screenshot = await page2.screenshot({ path: 'screenshot.png' });

//     // Close the browser
//     await browser2.close();

//     // Send the screenshot as the response
//     res.type('image/png').send(screenshot);
//   } catch (error) {
//     console.error('Error:', error);
//     res.status(500).send('Internal Server Error');
//   }
// });


app.post('/submit', async (req, res) => {
  try {
    const url = req.body.url;
    const width = 420
    // extract the data
    const response = await axios.post('http://127.0.0.1:5000/scrape', { url });
    const data = response.data
    console.log(typeof (data))

    // Do something with the responseData if needed
    const compiledTemplate = pug.compileFile('views/tweets.pug');
    // Render the compiled template with the dynamic data
    const renderedHtml = compiledTemplate(data);

    // Take ss part
    const browser = await chromium.launch();
    const context = await browser.newContext({
      viewport: { width, height:500 }, // Specify the desired width and height
    });
    const page = await context.newPage();
    await page.setContent(renderedHtml);

    // Wait for the .tweet-container element to be rendered
    await page.waitForSelector('.tweet-container');

    // Set a higher device scale factor to capture higher quality screenshot
    // await page.setViewportSize({
    //   deviceScaleFactor: 2 // Set a higher device scale factor (e.g., 2 for double resolution)
    // });

    // Take a screenshot of the entire page
    const screenshot = await page.locator('.tweet-container').screenshot({ path: 'screenshot.jpg', quality:100 });
     // Convert the rendered HTML to a base64-encoded string
     const base64Html = Buffer.from(renderedHtml).toString('base64');
    await browser.close();

    res.send(renderedHtml);
    // res.type('image/png').send(screenshot)
  } catch (error) {
    console.log(error);
  }

})

// Use express.urlencoded for form data



const PORT = process.env.PORT || 9000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
