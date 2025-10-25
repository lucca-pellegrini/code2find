// SPDX-License-Identifier: ISC

namespace State {
  export let ready: boolean = false;
  export let left: uint8 = 0;
  export let right: uint8 = 0;
  export let leftDistance: uint16 = 0;
  export let rightDistance: uint16 = 0;
  export let strip: neopixel.Strip | undefined;
};

