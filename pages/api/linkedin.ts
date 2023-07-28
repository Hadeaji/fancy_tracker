import { cronLinkedin, updateLinkedin } from "@/utiles/functions";
import type { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
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
    const { linkedinPass, linkedinEmail, verification } = req.body;
    // console.log("Received body:", req.body);
    const browser = await runBrowser();

    await updateLinkedin(browser, linkedinPass, linkedinEmail, verification);
    res.status(200).send({ message: "successfully" });
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
  return browser;
}

export default handler;
