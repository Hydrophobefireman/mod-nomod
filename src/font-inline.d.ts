import { Compiler, WebpackPluginInstance } from "webpack";
import { Font } from "./extra/types";
declare class FontInlineWebpackPlugin implements WebpackPluginInstance {
    _fonts: Font[];
    _inlineFonts: boolean;
    _isWebpack5: boolean;
    constructor({ fonts }: {
        fonts?: any[];
    });
    apply(compiler: Compiler): void;
    alterAssetTagGroups(_a: any, _b: any, { plugin, bodyTags: body, headTags: head, ...rest }: {
        [x: string]: any;
        plugin: any;
        bodyTags: any;
        headTags: any;
    }, cb: any): void;
}
export { FontInlineWebpackPlugin };
