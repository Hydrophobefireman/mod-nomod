import {loadScript} from "./constants";

export function makeLoadScript(modern, legacy) {
  return `
    addEventListener('DOMContentLoaded',function() {
    ${loadScript}
    ${(modern.length > legacy.length ? modern : legacy)
      .reduce(
        (acc, _m, i) => `
  ${acc}$(${modern[i] ? `"${modern[i].attributes.src}"` : 0},${
          legacy[i] ? `"${legacy[i].attributes.src}"` : 0
        })
    `,
        ""
      )
      .trim()}
  })`;
}
