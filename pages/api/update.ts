import {
  githubProgress,
  resizePhoto,
  updateLinkedin,
} from "@/utiles/functions";
import type { NextApiHandler } from "next";
import puppeteer from "puppeteer-core";

type Json = {
  message?: string;
  error?: string;
};

const handler: NextApiHandler = async (req, res) => {
  if (req.method !== "POST") {
    return;
  }
  try {
    const url = req.body.github;
    const selector = ".ContributionCalendardddd";
    const screenshotPath = "results/screenshot.png";

    const browser = await runBrowser();

    const res1 = await githubProgress(browser, url, selector, screenshotPath);
    console.log("=======================", res1);
    if (res1.status == "githubSelector") {
      return res
        .status(404)
        .send({ message: "githubSelector not found" });
    } else {
      console.log("Screenshot captured and saved to:", screenshotPath);
      // await browser.close();
      const outputImagePath = "results/screenshotmoded.png";
      await resizePhoto(screenshotPath, outputImagePath);
      res
        .status(200)
        .send({ message: "Screenshot captured and processed successfully" });
    }

  } catch (error: unknown) {
    console.log(error);
    const errorMessage = "An error occurred while getting screenshot";
    const errorResponse: Json = { error: errorMessage };
    res.status(400).json(errorResponse);
  }
};

async function runBrowser() {
  let browser;
  if (process.env.NODE_ENV === "development") {
    browser = await puppeteer.launch({
      executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
      headless: false,
    });
  } else {
    browser = await puppeteer.connect({
      browserWSEndpoint: `wss://chrome.browserless.io?token=${process.env.BLESS_TOKEN}`,
    });
  }
  // console.log("ran once", new Date());
  return browser;
}

export default handler;
