import { HtmlTagObject } from "html-webpack-plugin";
import { Font } from "./types";
declare function inlineFont(obj: Font | HtmlTagObject): Promise<{
    tagName: string;
    attributes: any;
    voidTag: boolean;
}[]>;
/** */
declare function fontAsLinkTag(attributes: any): {
    tagName: string;
    attributes: any;
    voidTag: boolean;
}[];
export { fontAsLinkTag };
export { inlineFont };
