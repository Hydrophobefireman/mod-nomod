"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// src/index.ts
var import_path = __toESM(require("path"));
var import_fs_extra = __toESM(require("fs-extra"));
var import_html_webpack_plugin = __toESM(require("html-webpack-plugin"));
var import_webpack2 = require("webpack");

// src/constants.ts
var loadScript = 'function $(e,d,c){c=document.createElement("script"),"noModule" in c?(e && (c.src=e,c.type="module",c.crossOrigin="anonymous")):d && (c.src=d,c.async=true),c.src && document.head.appendChild(c)}';
var safariFixScript = `(function(){var d=document;var c=d.createElement('script');if(!('noModule' in c)&&'onbeforeload' in c){var s=!1;d.addEventListener('beforeload',function(e){if(e.target===c){s=!0}else if(!e.target.hasAttribute('nomodule')||!s){return}e.preventDefault()},!0);c.type='module';c.src='.';d.head.appendChild(c);c.remove()}}())`;
var ID = "html-webpack-esmodules-plugin";
var FONT_ID = `${ID}___FONT`;
var OUTPUT_MODES = {
  EFFICIENT: "efficient",
  MINIMAL: "minimal"
};

// src/font-inline.ts
var import_webpack = require("webpack");

// src/extra/font-util.ts
var _fetch = typeof fetch === "undefined" ? require("node-fetch") : globalThis.fetch;
var urlReg = /url\s*\((\s*["']?)\s*(\/)(?!\/)/gm;
var USER_AGENT = "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36";
async function inlineFont(obj) {
  if ("href" in obj) {
    const { href, ...rest } = obj;
    try {
      if (href.startsWith("http")) {
        console.log("GET:", href);
        const u = new URL(href);
        const orig = u.origin;
        const response = await _fetch(href, {
          headers: { "user-agent": USER_AGENT }
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
            "data-extract-ts": +/* @__PURE__ */ new Date()
          }
        };
        return [tag];
      }
    } catch (e) {
      console.error("Caught:", e);
      return fontAsLinkTag({ href, ...rest });
    }
  } else {
    return fontAsLinkTag(obj);
  }
}
function fontAsLinkTag(attributes) {
  const { href, ...rest } = attributes;
  const preloadAttributes = { href, rel: "preload", as: "style" };
  const stylesheetAttributes = {
    href,
    rel: "stylesheet",
    media: "print",
    onload: "this.media='all'"
  };
  return [
    {
      tagName: "link",
      attributes: Object.assign(stylesheetAttributes, rest),
      voidTag: true
    },
    {
      tagName: "link",
      attributes: Object.assign(preloadAttributes, rest),
      voidTag: true
    }
  ];
}

// src/font-inline.ts
var HtmlWebpackPlugin = require("html-webpack-plugin");
var FontInlineWebpackPlugin = class {
  constructor({ fonts = [] }) {
    this._fonts = fonts;
    this._inlineFonts = process.env.NODE_ENV === "production";
    this._isWebpack5 = import_webpack.version.split(".")[0] === "5";
  }
  apply(compiler) {
    compiler.hooks.compilation.tap(FONT_ID, (compilation) => {
      if (HtmlWebpackPlugin.getHooks) {
        HtmlWebpackPlugin.getHooks(compilation).alterAssetTagGroups.tapAsync(
          { name: FONT_ID, stage: Infinity },
          this.alterAssetTagGroups.bind(this, compiler, compilation)
        );
      } else {
        compilation.hooks.htmlWebpackPluginAlterAssetTags.tapAsync(
          { name: FONT_ID, stage: Infinity },
          this.alterAssetTagGroups.bind(this, compiler, compilation)
        );
      }
    });
  }
  alterAssetTagGroups(_a, _b, { plugin, bodyTags: body, headTags: head, ...rest }, cb) {
    if (!body)
      body = rest.body;
    if (!head)
      head = rest.head;
    !this._inlineFonts && this._fonts && this._fonts.forEach((x) => head.push(...fontAsLinkTag(x)));
    if (this._inlineFonts) {
      console.log("Inlining fonts");
      Promise.all(
        this._fonts.map(async (font) => {
          head.push(...await inlineFont(font));
        })
      ).then(() => cb());
    } else {
      console.log("Keeping fonts as link tags");
      this._fonts.map((x) => head.push(...fontAsLinkTag(x)));
      cb();
    }
  }
};

// src/utils.ts
function makeLoadScript(modern, legacy) {
  return `
    addEventListener('DOMContentLoaded',function() {
    ${loadScript}
    ${(modern.length > legacy.length ? modern : legacy).reduce(
    (acc, _m, i) => `
  ${acc}$(${modern[i] ? `"${modern[i].attributes.src}"` : 0},${legacy[i] ? `"${legacy[i].attributes.src}"` : 0})
    `,
    ""
  ).trim()}
  })`;
}

// src/index.ts
var HtmlWebpackEsmodulesPlugin = class {
  constructor({ mode = "modern", outputMode = OUTPUT_MODES.EFFICIENT }) {
    this.outputMode = outputMode;
    switch (mode) {
      case "module":
      case "modern":
        this.mode = "modern";
        break;
      case "nomodule":
      case "legacy":
        this.mode = "legacy";
        break;
      default:
        throw new Error(
          `The mode has to be one of: [modern, legacy, module, nomodule], you provided ${mode}.`
        );
    }
    this._isWebpack5 = import_webpack2.version.split(".")[0] === "5";
  }
  apply(compiler) {
    compiler.hooks.compilation.tap(ID, (compilation) => {
      if (import_html_webpack_plugin.default.getHooks) {
        import_html_webpack_plugin.default.getHooks(compilation).alterAssetTagGroups.tapAsync(
          { name: ID, stage: Infinity },
          this.alterAssetTagGroups.bind(this, compiler, compilation)
        );
        if (this.outputMode === OUTPUT_MODES.MINIMAL) {
          import_html_webpack_plugin.default.getHooks(compilation).beforeEmit.tap(
            ID,
            this.beforeEmitHtml.bind(this)
          );
        }
      } else {
        compilation.hooks.htmlWebpackPluginAlterAssetTags.tapAsync(
          { name: ID, stage: Infinity },
          this.alterAssetTagGroups.bind(this, compiler, compilation)
        );
        if (this.outputMode === OUTPUT_MODES.MINIMAL) {
          compilation.hooks.htmlWebpackPluginAfterHtmlProcessing.tap(
            ID,
            this.beforeEmitHtml.bind(this)
          );
        }
      }
    });
  }
  alterAssetTagGroups(compiler, compilation, { plugin, bodyTags: body, headTags: head, ...rest }, cb) {
    if (!body)
      body = rest.body;
    if (!head)
      head = rest.head;
    const targetDir = compiler.options.output.path;
    const htmlName = import_path.default.basename(plugin.options.filename);
    const htmlPath = import_path.default.dirname(plugin.options.filename);
    const assetName = import_path.default.join(htmlPath, `assets-${htmlName}.json`);
    const tempFilename = import_path.default.join(targetDir, assetName);
    if (!import_fs_extra.default.existsSync(tempFilename)) {
      import_fs_extra.default.mkdirpSync(import_path.default.dirname(tempFilename));
      const newBody = body.filter(
        (a) => a.tagName === "script" && a.attributes
      );
      if (this.mode === "legacy") {
        newBody.forEach((a) => {
          a.attributes.nomodule = "";
        });
      } else {
        newBody.forEach((a) => {
          a.attributes.type = "module";
          a.attributes.crossOrigin = "anonymous";
        });
      }
      const assetContents = JSON.stringify(newBody);
      if (this._isWebpack5) {
        const { RawSource } = require("webpack-sources");
        compilation.emitAsset(assetName, new RawSource(assetContents));
      }
      import_fs_extra.default.writeFileSync(tempFilename, assetContents);
      return cb();
    }
    const existingAssets = JSON.parse(import_fs_extra.default.readFileSync(tempFilename, "utf-8"));
    if (this.mode === "modern") {
      body.forEach((tag) => {
        if (tag.tagName === "script" && tag.attributes) {
          tag.attributes.type = "module";
          tag.attributes.crossOrigin = "anonymous";
        }
      });
    } else {
      body.forEach((tag) => {
        if (tag.tagName === "script" && tag.attributes) {
          tag.attributes.nomodule = "";
        }
      });
    }
    if (this.outputMode === OUTPUT_MODES.MINIMAL) {
      this.sizeEfficient(existingAssets, body);
    } else if (this.outputMode === OUTPUT_MODES.EFFICIENT) {
      this.downloadEfficient(existingAssets, body, head);
    }
    if (this._isWebpack5) {
      compilation.deleteAsset(assetName);
    }
    import_fs_extra.default.removeSync(tempFilename);
    cb();
  }
  beforeEmitHtml(data) {
    data.html = data.html.replace(/\snomodule="">/g, " nomodule>");
  }
  downloadEfficient(existingAssets, body, head) {
    const isModern = this.mode === "modern";
    const legacyScripts = (isModern ? existingAssets : body).filter(
      (tag) => tag.tagName === "script" && tag.attributes.type !== "module"
    );
    const modernScripts = (isModern ? body : existingAssets).filter(
      (tag) => tag.tagName === "script" && tag.attributes.type === "module"
    );
    const scripts = body.filter((tag) => tag.tagName === "script");
    scripts.forEach((s) => {
      body.splice(body.indexOf(s), 1);
    });
    modernScripts.forEach((modernScript) => {
      head.push({
        tagName: "link",
        attributes: { rel: "modulepreload", href: modernScript.attributes.src }
      });
    });
    const loadScript2 = makeLoadScript(modernScripts, legacyScripts);
    head.push({ tagName: "script", innerHTML: loadScript2, voidTag: false });
  }
  sizeEfficient(existingAssets, body) {
    const safariFixScriptTag = {
      tagName: "script",
      closeTag: true,
      innerHTML: safariFixScript
    };
    if (this.mode === "legacy") {
      body.unshift(...existingAssets, safariFixScriptTag);
    } else {
      body.push(safariFixScriptTag, ...existingAssets);
    }
  }
};
exports.OUTPUT_MODES = OUTPUT_MODES;
module.exports = { HtmlWebpackEsmodulesPlugin, FontInlineWebpackPlugin };
