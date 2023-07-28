import { githubProgress, resizePhoto, updateLinkedin } from '@/utiles/functions';
import type { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';
import puppeteer from 'puppeteer-core';

type Json = {
    message?: string;
    error?: string;
};

const handler: NextApiHandler = async (req, res) => {
    if (req.method !== 'POST') {
        return;
    }
    try {
        console.log("req.body --------->", req.body);
        const url = req.body.github;
        console.log('Received url:', url);
        const selector = ".ContributionCalendar"; // Replace with the CSS selector of the desired element
        const screenshotPath = "results/screenshot.png"; // Specify the desired file path for the screenshot

        // get progress from GH and return image
        const browser = await runBrowser();

        await githubProgress(browser, url, selector, screenshotPath);
        console.log("Screenshot captured and saved to:", screenshotPath);
        // await browser.close();
        //

        // send image to resizer function and choose where to be saved
        const outputImagePath = "results/screenshotmoded.png";
        await resizePhoto(screenshotPath, outputImagePath);
        //

        await updateLinkedin(browser);


        res.status(200).send({ message: "Screenshot captured and processed successfully" });
    } catch (error: unknown) {
        console.log(error);
        const errorMessage = 'An error occurred while getting screenshot';
        const errorResponse: Json = { error: errorMessage };
        res.status(400).json(errorResponse);
    }
}

async function runBrowser() {
    let browser;
    if (process.env.NODE_ENV === 'development') {
        browser = await puppeteer.launch({
            executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
            headless: false
        });
    } else {
        browser = await puppeteer.connect({
            browserWSEndpoint: `wss://chrome.browserless.io?token=${process.env.BLESS_TOKEN}`
        });
    }
    console.log('ran once', new Date());
    return browser;
}

export default handler;