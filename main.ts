// SPDX-License-Identifier: ISC

/*
 * Code2Find — simples programa de navegação de labirintos para um
 *             micro:Maqueen V5, com BBC micro:bit V2 (Nordic nRF52).
 *
 * Copyright © 2025 Lucca M. A. Pellegrini <lucca@verticordia.com>
 *
 * Permission to use, copy, modify, and/or distribute this software for any
 * purpose with or without fee is hereby granted, provided that the above
 * copyright notice and this permission notice appear in all copies.
 *
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
 * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY
 * SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
 * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION
 * OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN
 * CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 */


// Constantes para calibração do movimento do robô
const MOVE_SPEED: uint8 = 255;
const TURN_SPEED: uint8 = 200;
const TURN_PAUSE: uint8 = 50;
const TURN_ITERATIONS: uint8 = 3;
const WIDE_TURN_PAUSE: uint8 = 25;
const WIDE_TURN_ITERATIONS: uint8 = 8;

// Constante para controlar se os LEDs estão habilitados (para economizar energia)
const LEDS_ENABLED: boolean = true;

// Constante para controlar se deve tomar a medida emergencial ao ficar preso
const OBTUSE_TURN_CONTINGENCY_ENABLED: boolean = false;


// Constantes por conveniência. Usadas pois o PXT infelizmente não permite
// desestruturar o namespace `Maqueen_V5`, devemos fazer isso para cada item e
// função, manualmente... 😭
const CCW = Maqueen_V5.Dir.CCW;
const CW = Maqueen_V5.Dir.CW;
const DirAll = Maqueen_V5.DirectionType.All;
const DirLeft = Maqueen_V5.DirectionType.Left;
const DirRight = Maqueen_V5.DirectionType.Right;
const M1 = Maqueen_V5.Motors.M1;
const M2 = Maqueen_V5.Motors.M2;
const MAll = Maqueen_V5.Motors.All;
const I2CInit = Maqueen_V5.I2CInit;
const Ultrasonic = Maqueen_V5.Ultrasonic;
const motorRun = Maqueen_V5.motorRun;
const motorStop = Maqueen_V5.motorStop;
const setRgblLed = Maqueen_V5.setRgblLed;
const Black = Maqueen_V5.CarLightColors.Black;
const Cyan = Maqueen_V5.CarLightColors.Cyan;
const Green = Maqueen_V5.CarLightColors.Green;
const Purple = Maqueen_V5.CarLightColors.Purple;
const Red = Maqueen_V5.CarLightColors.Red;
const Yellow = Maqueen_V5.CarLightColors.Yellow;


// Função para controlar os faróis RGB do Maqueen, verificando se estão habilitados
function setHeadlight(direction: Maqueen_V5.DirectionType, color: Maqueen_V5.CarLightColors) {
  if (!LEDS_ENABLED)
    return

  setRgblLed(DirAll, Black);
  setRgblLed(direction, color);
}

// Método para virar 90 graus para a esquerda
function turnLeft() {
  motorStop(MAll);
  setHeadlight(DirLeft, Yellow);

  for (let i = 0; i < TURN_ITERATIONS; ++i) {
    motorRun(M1, CCW, TURN_SPEED);
    motorRun(M2, CW, TURN_SPEED);
    basic.pause(TURN_PAUSE);
  }

  setHeadlight(DirLeft, Black);
  motorStop(MAll);
}

// Método para virar 90 graus para a direita
function turnRight() {
  motorStop(MAll);
  setHeadlight(DirRight, Yellow);

  for (let i = 0; i < TURN_ITERATIONS; ++i) {
    motorRun(M1, CW, TURN_SPEED);
    motorRun(M2, CCW, TURN_SPEED);
    basic.pause(TURN_PAUSE);
  }

  setHeadlight(DirRight, Black);
  motorStop(MAll);
}

// Método para olhar para os dois lados e medir a distância da parede em cada um
function findPath() {
  basic.pause(100);
  turnLeft();

  leftDistance = Ultrasonic();
  basic.pause(1000);

  turnRight();
  basic.pause(100);
  turnRight();
  basic.pause(100);

  rightDistance = Ultrasonic();
  basic.pause(1000);

  turnLeft();
  basic.pause(100);
}

// Método auxiliar para virar em um ângulo obtuso, caso fiquemos presos
function turnAngled(direction: Maqueen_V5.DirectionType) {
  if (direction === DirLeft) {
    setHeadlight(DirLeft, Yellow);

    for (let i = 0; i < WIDE_TURN_ITERATIONS; ++i) {
      motorRun(M1, CCW, TURN_SPEED);
      motorRun(M2, CW, TURN_SPEED);
      basic.pause(WIDE_TURN_PAUSE);
      motorStop(MAll);
    }
  } else if (direction === DirRight) {
    setHeadlight(DirRight, Yellow);

    for (let i = 0; i < WIDE_TURN_ITERATIONS; ++i) {
      motorRun(M1, CW, TURN_SPEED);
      motorRun(M2, CCW, TURN_SPEED);
      basic.pause(WIDE_TURN_PAUSE);
      motorStop(MAll);
    }
  }

  motorStop(MAll);
  setHeadlight(DirAll, Black);
}


let ready: boolean = false;

// Contadores para lembrarmos quantas vezes viramos à direita ou à esquerda
let left: uint8 = 0;
let right: uint8 = 0;

// Variáveis globais para as distâncias medidas de cada lado, em centímetros
let leftDistance: uint16 = 0;
let rightDistance: uint16 = 0;

// Objeto representando a faixa de LEDs inferior do Maqueen, se habilitada
let strip: neopixel.Strip | undefined;


// Funções de inicialização
basic.showIcon(IconNames.Silly);
if (LEDS_ENABLED) {
  I2CInit();
  strip = neopixel.create(DigitalPin.P15, 4, NeoPixelMode.RGB);
}

// Aguarda o início do gesto de largada
while (Ultrasonic() >= 10) {
  setHeadlight(DirAll, Red);
  if (LEDS_ENABLED && strip)
    strip.showColor(neopixel.colors(NeoPixelColors.Indigo));
  basic.showIcon(IconNames.Happy);
}

// Aguarda o fim do gesto de largada
while (Ultrasonic() <= 10) {
  setHeadlight(DirAll, Cyan);
  if (LEDS_ENABLED && strip)
    strip.showColor(neopixel.colors(NeoPixelColors.Orange));
  basic.showIcon(IconNames.Silly);
}

// Seta os LEDs e a flag para indicar o início do percurso
ready = true;
setHeadlight(DirAll, Black);
if (LEDS_ENABLED && strip) {
  strip.showColor(neopixel.colors(NeoPixelColors.White));
}
basic.showIcon(IconNames.Happy);


if (LEDS_ENABLED && strip) {
  // Armazena referência para que o TypeScript saiba que a variável está
  // definida no método assíncrono abaixo
  let localStrip = strip;

  // Método de segundo plano para iterar sobre os matizes na faixa de LEDs
  control.inBackground(() => {
    do
      basic.pause(2500) // Aguarda pelo menos 2.5 segundos após a inicialização
    while (!(ready));

    while (true) {
      for (let i = 0; i < 360; i += 5) {
        localStrip.showRainbow(1 + i, 360 - i);
        basic.pause(50);
      }
    }
  });
}


// Loop principal do programa
basic.forever(() => {
  if (Ultrasonic() > 10) {
    // Se não estivermos dentro de 10 centímetros de um obstáculo, continuamos
    setHeadlight(DirAll, Green);
    motorRun(MAll, CW, MOVE_SPEED);

  } else if (
    OBTUSE_TURN_CONTINGENCY_ENABLED
    && rightDistance < 10 && leftDistance < 10
    && (right >= 2 || left >= 2)
  ) {
    // Se estivermos presos em uma esquina, e a contingência estiver
    // habilitada, faremos uma rotação num ângulo obtuso para tentar escapar
    setHeadlight(DirAll, Purple);
    basic.pause(2000);

    left = right = 0; // Zeramos os contadores
    turnAngled(rightDistance >= leftDistance ? DirLeft : DirRight);

    setHeadlight(DirAll, Black);
    basic.pause(2000)

  } else {
    // Caso contrário, paramos o robô
    motorStop(MAll);
    setHeadlight(DirAll, Red);

    // Computamos qual dos lados perpendiculares têm a maior distância medida
    findPath();

    // Verifica se a distância à direita é maior ou igual à distância à esquerda
    if (rightDistance >= leftDistance) {
      if (right >= 2) {
        // Se já viramos à direita duas vezes, viramos à esquerda
        turnLeft();
        right += -1;
        left += 1;
        setHeadlight(DirLeft, Cyan);
      } else {
        // Caso contrário, executa a virada à direita
        turnRight();
        left += -1;
        right += 1;
        setHeadlight(DirRight, Cyan);
      }
    } else {
      if (left >= 2) {
        // Se a distância à esquerda é maior, seguimos a lógica inversa:
        // Se já viramos à esquerda duas vezes, viramos à direita
        turnRight();
        left += -1;
        right += 1;
        setHeadlight(DirRight, Cyan);
      } else {
        // Caso contrário, executa a virada à esquerda
        turnLeft();
        right += -1;
        left += 1;
        setHeadlight(DirLeft, Cyan);
      }
    }

    basic.pause(500);
  }
});
