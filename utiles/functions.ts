import { Browser, ScreenshotOptions, BoundingBox } from "puppeteer-core";
import sharp from "sharp";
import fs from "fs";
import crypto from "crypto";

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

  const _2FAInput = await page.waitForSelector(_2FASelector);
  if (_2FAInput) {
    for (const char of _2FA) {
      await _2FAInput.type(char, { delay: Math.random() * 100 + 50 });
    }
  }

  await page.click(submitSelector);

  // Get the cookies
  const cookies = await page.cookies();

  // Create a new object to store cookies along with additional data (encrypted password)
  const dataToSave = {
    linkedinEmail: linkedinEmail,
    linkedinPass: linkedinPass, // Encrypt the password before saving
    cookies: cookies,
  };

  // Save the data to 'cookies.json' file
  fs.writeFileSync("cookies.json", JSON.stringify(dataToSave, null, 2));

  // navigate to feed
  // await page.goto(feedUrl);
  // // click on global-nav__primary-link-me-menu-trigger
  // const feedSelector = ".global-nav__primary-link-me-menu-trigger";
  // await page.waitForSelector(feedSelector);

  // await page.click(feedSelector);
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

// function encrypt(text: string): string {
//   const iv = crypto.randomBytes(16);
//   const cipher = crypto.createCipheriv(
//     "aes-256-cbc",
//     Buffer.from("ENCRYPTION_KEY"),
//     iv
//   );
//   let encrypted = cipher.update(text, "utf8", "hex");
//   encrypted += cipher.final("hex");
//   return iv.toString("hex") + ":" + encrypted;
// }

// function decrypt(encryptedText: string): string {
//   const parts = encryptedText.split(":");
//   const iv = Buffer.from(parts[0], "hex");
//   const encrypted = parts[1];
//   const decipher = crypto.createDecipheriv(
//     "aes-256-cbc",
//     Buffer.from("ENCRYPTION_KEY"),
//     iv
//   );
//   let decrypted = decipher.update(encrypted, "hex", "utf8");
//   decrypted += decipher.final("utf8");
//   return decrypted;
// }
