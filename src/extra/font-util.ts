import {HtmlTagObject} from "html-webpack-plugin";

import {Font} from "./types";

const _fetch =
  typeof fetch === "undefined" ? require("node-fetch") : globalThis.fetch;

const urlReg = /url\s*\((\s*["']?)\s*(\/)(?!\/)/gm;
const USER_AGENT =
  "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36";

async function inlineFont(obj: Font | HtmlTagObject) {
  if ("href" in obj) {
    const {href, ...rest} = obj;
    try {
      if (href.startsWith("http")) {
        console.log("GET:", href);
        const u = new URL(href);
        const orig = u.origin;
        const response = await _fetch(href, {
          headers: {"user-agent": USER_AGENT},
        });
        const text = await response.text();

        const tag = {
          tagName: "style",
          voidTag: false,
          innerHTML: text.replace(urlReg, function relativeToAbsolute(match) {
            const doubleQuote = match.includes('"') ? '"' : "";
            const singleQuote = match.includes("'") ? "'" : "";
            return `url(${doubleQuote}${singleQuote}${orig}/`;
          }),
          attributes: {
            "data-extract": href,
            "data-extract-ts": +new Date(),
          },
        };
        return [tag];
      }
    } catch (e) {
      console.error("Caught:", e);
      return fontAsLinkTag({href, ...rest});
    }
  } else {
    return fontAsLinkTag(obj);
  }
}
/** */
function fontAsLinkTag(attributes) {
  const {href, ...rest} = attributes;
  const preloadAttributes = {href, rel: "preload", as: "style"};
  const stylesheetAttributes = {
    href,
    rel: "stylesheet",
    media: "print",
    onload: "this.media='all'",
  };
  return [
    {
      tagName: "link",
      attributes: Object.assign(stylesheetAttributes, rest),
      voidTag: true,
    },
    {
      tagName: "link",
      attributes: Object.assign(preloadAttributes, rest),
      voidTag: true,
    },
  ];
}
export {fontAsLinkTag};
export {inlineFont};
