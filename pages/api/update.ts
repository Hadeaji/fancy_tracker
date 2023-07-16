import type { NextApiRequest, NextApiResponse } from 'next';
import puppeteer, { BoundingBox, ScreenshotOptions } from 'puppeteer-core';
import sharp from 'sharp';

type Json = {
    message?: string;
    error?: string;
};

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<Json | Buffer>
) {
    try {
        const url = "https://github.com/Hussien-LTS"; // Replace with the URL of the web page you want to scrape
        const selector = ".ContributionCalendar"; // Replace with the CSS selector of the desired element
        const screenshotPath = "results/screenshot.png"; // Specify the desired file path for the screenshot

        const browser = await runBrowser();
        const page = await browser.newPage();
        await page.setViewport({ width: 1920, height: 1280, deviceScaleFactor: 2 });

        await page.emulateMediaFeatures([
            { name: "prefers-color-scheme", value: "dark" },
        ]);

        await page.goto(url);
        await page.waitForSelector(selector);

        const elementHandle = await page.$(selector);
        if (!elementHandle) {
            throw new Error(`Element was not found`);
        }

        const boundingBox = await elementHandle.boundingBox();
        const screenshotOptions: ScreenshotOptions & { clip?: BoundingBox } = {
            path: screenshotPath,
        };

        if (boundingBox) {
            screenshotOptions.clip = boundingBox;
        }

        await page.screenshot(screenshotOptions);

        await browser.close();

        console.log("Screenshot captured and saved to:", screenshotPath);

        const outputImagePath = "results/screenshotmoded.png";
        await resizePhoto(screenshotPath, outputImagePath);

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
            executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe'
        });
    } else {
        browser = await puppeteer.connect({
            browserWSEndpoint: `wss://chrome.browserless.io?token=${process.env.BLESS_TOKEN}`
        });
    }
    return browser;
}

function resizePhoto(inputImagePath: string, outputImagePath: string) {
    const imageWidth = 1584;
    const imageHeight = 396;
    const fillColor = { r: 13, g: 17, b: 23 };

    return sharp(inputImagePath)
        .metadata()
        .then((metadata) => {
            const widthDifference = imageWidth - metadata.width!;
            const heightDifference = imageHeight - metadata.height!;

            return sharp(inputImagePath)
                .extend({
                    top: Math.floor(heightDifference / 2),
                    bottom: Math.ceil(heightDifference / 2),
                    left: Math.floor(widthDifference / 2),
                    right: Math.ceil(widthDifference / 2),
                    background: fillColor
                })
                .toFile(outputImagePath)
                .then(() => {
                    console.log('Image filled with color and boundaries adjusted successfully!');
                })
                .catch((error) => {
                    console.error('Error occurred while filling the image:', error);
                });
        })
        .catch((error) => {
            console.error('Error occurred while retrieving image metadata:', error);
        });
}
