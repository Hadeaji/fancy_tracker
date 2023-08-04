import { Browser, BoundingBox, FileChooser, ElementHandle, Dialog, Page } from "puppeteer-core";
import sharp from "sharp";
import fs from "fs";

async function waitForElementRemoval(page: Page, elementSelector: string) {
  await page.waitForFunction(
    (selector) => !document.querySelector(selector),
    {},
    elementSelector
  );
}

// async function clickOnEitherSelector(page: Page, selector1: string, selector2: string) {
//   // Create a race between the two promises
//   const racePromise = Promise.race([
//     page.waitForSelector(selector1),
//     page.waitForSelector(selector2),
//   ]);

//   // Wait for either selector to become available
//   const elementHandle = await racePromise;

//   if (elementHandle) {
//     // Click on the element that became available first
//     await elementHandle.click();
//   } else {
//     throw new Error('Neither selector was found on the page.');
//   }
// }

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
          background: fillColor,
        })
        .toFile(outputImagePath)
        .then(() => {
          console.log(
            "Image filled with color and boundaries adjusted successfully!"
          );
        })
        .catch((error) => {
          console.error("Error occurred while filling the image:", error);
        });
    })
    .catch((error) => {
      console.error("Error occurred while retrieving image metadata:", error);
    });
}

export async function githubProgress(
  browser: Browser,
  url: string,
  selector: string,
  screenshotPath: string
) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 2 });

  await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'dark' }]);

  await page.goto(url);
  await page.waitForSelector(selector);

  const boundingBox = await page.evaluate((selector) => {
    const element = document.querySelector(selector);
    if (!element) {
      return null;
    }

    let { x, y, width, height } = element.getBoundingClientRect();
    width += 5;
    return { x, y, width, height };
  }, selector);

  if (!boundingBox) {
    throw new Error('Element was not found');
  }

  await page.screenshot({
    path: screenshotPath,
    clip: boundingBox as BoundingBox,
  });
}

export async function updateLinkedin(
  browser: Browser,
  linkedinPass: string,
  linkedinEmail: string,
  _2FA: string
) {
  const loginUrl = "https://www.linkedin.com/login/en";
  const feedUrl = "https://www.linkedin.com/feed";
  const page = await browser.newPage();
  await page.goto(loginUrl);

  // Set the viewport size to a standard resolution
  await page.setViewport({ width: 1366, height: 768, deviceScaleFactor: 2 });
  await page.evaluate(() => {
    window.innerWidth = 1366;
    window.innerHeight = 768;
  });
  const emailSelector = "input[type=text]";
  const passwordSelector = "input[type=password]";
  const submitSelector = "button[type=submit]";
  const _2FASelector = ".input_verification_pin";

  const emailInput = await page.waitForSelector(emailSelector);
  if (emailInput) {
    for (const char of linkedinEmail) {
      await emailInput.type(char, { delay: Math.random() * 100 + 50 });
    }
  }

  const passwordInput = await page.waitForSelector(passwordSelector);
  if (passwordInput) {
    for (const char of linkedinPass) {
      await passwordInput.type(char, { delay: Math.random() * 100 + 50 });
    }
  }
  await page.click(submitSelector);

  try {
    const _2FAInput = await page.waitForSelector(_2FASelector, { timeout: 5000 });
    if (_2FAInput) {
      for (const char of _2FA) {
        await _2FAInput.type(char, { delay: Math.random() * 100 + 50 });
      }
      await page.click(submitSelector);
    }

  } catch (error: unknown) {
    console.log(error);
  }

  await page.goto(feedUrl);
  const profileSelector = ".feed-identity-module__actor-meta a";
  try {
    await page.waitForSelector(profileSelector);
  } catch (error: unknown) {
    return 400;
  }
  await page.click(profileSelector);

  const editBtnSelector = ".profile-topcard-background-image-edit__icon button";
  await page.waitForSelector(editBtnSelector);
  await page.click(editBtnSelector);

  await uploadFileToField(page);
  await waitForElementRemoval(page, ".artdeco-modal-overlay");
  await browser.close();

  // Get the cookies
  // const cookies = await page.cookies();
  // const dataToSave = {
  //   cookies: cookies,
  // };
  // fs.writeFileSync("cookies.json", JSON.stringify(dataToSave, null, 2));
}

export async function cronLinkedin(browser: Browser) {
  const url = "https://www.linkedin.com/feed";

  const page = await browser.newPage();
  await page.goto(url);
  // Read the saved cookies from 'cookies.json' file
  const cookiesString = fs.readFileSync("cookies.json", "utf8");
  const cookies = JSON.parse(cookiesString);
  console.log("============================", cookies);
  // Set the saved cookies for the page
  await page.setCookie(...cookies);

  // Continue with your actions as a logged-in user
  await page.goto(url);

  // await browser.close();
}

export async function uploadFileToField(
  page: Page,
) {
  const fileToUpload = 'results/screenshotmoded.png';
  const fileInputSelector = '#background-image-cropper__file-upload-input';
  const apply = ".image-edit-tool-footer .artdeco-button--primary";

  // Navigate to the page with the file input field
  await page.waitForSelector(fileInputSelector);

  // Set the file input value to the file path
  const fileInputElement = (await page.$(fileInputSelector)) as ElementHandle<HTMLInputElement>;
  if (!fileInputElement) {
    throw new Error('File input element was not found');
  }

  await page.evaluate((selector, className) => {
    const element = document.querySelector(selector);
    if (element) {
      element.classList.remove(className);
    }
  }, fileInputSelector, 'hidden');

  await fileInputElement.uploadFile(fileToUpload);

  // Listen for the 'dialog' event to handle the file chooser
  page.on('dialog', async (dialog: Dialog) => {
    await dialog.accept(fileToUpload);
  });

  await page.waitForSelector("#background-image-cropper__file-upload-input.hidden");
  await page.waitForSelector(apply, { visible: true, });

  await page.click(apply);
}
