const HtmlWebpackPlugin = require("html-webpack-plugin");

import {Compiler, WebpackPluginInstance, version} from "webpack";

import {FONT_ID} from "./constants";
import {fontAsLinkTag, inlineFont} from "./extra/font-util.js";
import {Font} from "./extra/types";

class FontInlineWebpackPlugin implements WebpackPluginInstance {
  _fonts: Font[];
  _inlineFonts: boolean;
  _isWebpack5: boolean;
  constructor({fonts = []}) {
    this._fonts = fonts;
    this._inlineFonts = process.env.NODE_ENV === "production";
    this._isWebpack5 = version.split(".")[0] === "5";
  }

  apply(compiler: Compiler) {
    compiler.hooks.compilation.tap(FONT_ID, (compilation) => {
      // Support newest and oldest version.
      if (HtmlWebpackPlugin.getHooks) {
        HtmlWebpackPlugin.getHooks(compilation).alterAssetTagGroups.tapAsync(
          {name: FONT_ID, stage: Infinity},
          this.alterAssetTagGroups.bind(this, compiler, compilation)
        );
      } else {
        //@ts-ignore
        compilation.hooks.htmlWebpackPluginAlterAssetTags.tapAsync(
          {name: FONT_ID, stage: Infinity},
          this.alterAssetTagGroups.bind(this, compiler, compilation)
        );
      }
    });
  }

  alterAssetTagGroups(
    _a: any,
    _b: any,
    {plugin, bodyTags: body, headTags: head, ...rest},
    cb: any
  ) {
    // Older webpack compat
    if (!body) body = rest.body;
    if (!head) head = rest.head;

    !this._inlineFonts &&
      this._fonts &&
      this._fonts.forEach((x) => head.push(...fontAsLinkTag(x)));

    if (this._inlineFonts) {
      console.log("Inlining fonts");
      Promise.all(
        this._fonts.map(async (font) => {
          head.push(...(await inlineFont(font)));
        })
      ).then(() => cb());
    } else {
      console.log("Keeping fonts as link tags");
      this._fonts.map((x) => head.push(...fontAsLinkTag(x)));
      cb();
    }
  }
}

export {FontInlineWebpackPlugin};
