// SPDX-License-Identifier: ISC

// Namespace para configurações do comportamento do robô Maqueen. Define
// constantes para velocidades de movimento, pausas de giro, iterações de
// virada e configurações de LEDs.
namespace Config {
  // Constante para controlar se os LEDs estão habilitados, para economizar
  // energia e garantir que o sensor ultrassônico tenha corrente suficiente
  // para funcionar.
  export const LEDS_ENABLED: boolean = true;

  export const TURN_COUNTER_ENABLED: boolean = false;
 
  // Constante para controlar se deve tomar a medida emergencial ao ficar
  // preso. Recomenda-se deixar essa opção desabilitada, pois interfere com a
  // capacidade do robô de evitar entrar em loop.
  export const OBTUSE_TURN_CONTINGENCY_ENABLED: boolean = false;

  export const MIN_WALL_DISTANCE: uint8 = 15;
 
  // Constantes para calibração do movimento do robô.
  export const MOVE_SPEED: uint8 = 255; // Velocidade de movimento padrão
  export const TURN_SPEED: uint8 = 200; // Velocidade para fazer curvas

  // Quantos millissegundos esperar entre iterações durante uma curva, e
  // quantas iterações executar no total.
  export const TURN_PAUSE: uint8 = 50;
  export const TURN_ITERATIONS: uint8 = 3;

  // Como acima, mas referente às curvas obtusas emergenciais.
  export const WIDE_TURN_PAUSE: uint8 = 25;
  export const WIDE_TURN_ITERATIONS: uint8 = 8;
}
