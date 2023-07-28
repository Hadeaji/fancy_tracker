import { Browser, ScreenshotOptions, BoundingBox } from 'puppeteer-core';
import sharp from 'sharp';

export function resizePhoto(inputImagePath: string, outputImagePath: string) {
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

export async function githubProgress(browser: Browser, url: string, selector: string, screenshotPath: string) {
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
    const screenshotOptions: ScreenshotOptions & { clip?: BoundingBox; } = {
        path: screenshotPath,
    };

    if (boundingBox) {
        screenshotOptions.clip = boundingBox;
    }

    await page.screenshot(screenshotOptions);
}

export async function updateLinkedin(browser: Browser) {
    const url = "https://www.linkedin.com/";
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1280, deviceScaleFactor: 2 });

    await page.emulateMediaFeatures([
        { name: "prefers-color-scheme", value: "dark" },
    ]);

    await page.goto(url);

}