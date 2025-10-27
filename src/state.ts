// SPDX-License-Identifier: ISC

// Namespace para gerenciar o estado global do robô Maqueen. Contém variáveis
// para prontidão, distâncias medidas, contadores de curvas, e controle da tira
// de LEDs.
namespace State {
  export let running: boolean = false;
  export let paused: boolean = false;
  export let calibrated: boolean = false;
  export let headingCalibration: uint8 = 0;
  export let leftTurnCount: uint8 = 0;
  export let rightTurnCount: uint8 = 0;
  export let forwardDistance: uint16 = 0;
  export let leftDistance: uint16 = 0;
  export let rightDistance: uint16 = 0;
  export let strip: neopixel.Strip | undefined;
};

