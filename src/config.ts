// SPDX-License-Identifier: ISC

// Namespace para configurações do comportamento do robô Maqueen. Define
// constantes para velocidades de movimento, pausas de giro, iterações de
// virada e configurações de LEDs.
namespace Config {
  export const MOVE_SPEED = 255;
  export const TURN_SPEED = 200;
  export const TURN_PAUSE = 50;
  export const TURN_ITERATIONS = 3;
  export const WIDE_TURN_PAUSE = 25;
  export const WIDE_TURN_ITERATIONS = 8;
  export const LEDS_ENABLED = true;
  export const OBTUSE_TURN_CONTINGENCY_ENABLED = false;
}
