export const loadScript =
  'function $(e,d,c){c=document.createElement("script"),"noModule" in c?(e && (c.src=e,c.type="module",c.crossOrigin="anonymous")):d && (c.src=d,c.async=true),c.src && document.head.appendChild(c)}';
export const safariFixScript = `(function(){var d=document;var c=d.createElement('script');if(!('noModule' in c)&&'onbeforeload' in c){var s=!1;d.addEventListener('beforeload',function(e){if(e.target===c){s=!0}else if(!e.target.hasAttribute('nomodule')||!s){return}e.preventDefault()},!0);c.type='module';c.src='.';d.head.appendChild(c);c.remove()}}())`;
export const ID = "html-webpack-esmodules-plugin";
export const FONT_ID = `${ID}___FONT`;

export const OUTPUT_MODES = {
  EFFICIENT: "efficient",
  MINIMAL: "minimal",
};
