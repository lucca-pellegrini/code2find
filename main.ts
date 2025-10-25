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
const MOVE_SPEED = 255
const TURN_SPEED = 200
const TURN_PAUSE = 50
const TURN_ITERATIONS = 3
const WIDE_TURN_PAUSE = 25
const WIDE_TURN_ITERATIONS = 8

// Método para virar 90 graus para a esquerda
function turnLeft() {
  maqueen.motorStop(maqueen.Motors.All)
  Maqueen_V5.setRgblLed(Maqueen_V5.DirectionType.Left, Maqueen_V5.CarLightColors.Yellow)

  for (let i = 0; i < TURN_ITERATIONS; ++i) {
    Maqueen_V5.motorRun(Maqueen_V5.Motors.M1, Maqueen_V5.Dir.CCW, TURN_SPEED)
    Maqueen_V5.motorRun(Maqueen_V5.Motors.M2, Maqueen_V5.Dir.CW, TURN_SPEED)
    basic.pause(TURN_PAUSE)
  }

  Maqueen_V5.setRgblLed(Maqueen_V5.DirectionType.Left, Maqueen_V5.CarLightColors.Black)
  maqueen.motorStop(maqueen.Motors.All)
}

// Método para virar 90 graus para a direita
function turnRight() {
  maqueen.motorStop(maqueen.Motors.All)
  Maqueen_V5.setRgblLed(Maqueen_V5.DirectionType.Right, Maqueen_V5.CarLightColors.Yellow)

  for (let i = 0; i < TURN_ITERATIONS; ++i) {
    Maqueen_V5.motorRun(Maqueen_V5.Motors.M1, Maqueen_V5.Dir.CW, TURN_SPEED)
    Maqueen_V5.motorRun(Maqueen_V5.Motors.M2, Maqueen_V5.Dir.CCW, TURN_SPEED)
    basic.pause(TURN_PAUSE)
  }

  Maqueen_V5.setRgblLed(Maqueen_V5.DirectionType.Right, Maqueen_V5.CarLightColors.Black)
  maqueen.motorStop(maqueen.Motors.All)
}

// Método para olhar para os dois lados e medir a distância da parede em cada um
function findPath() {
  basic.pause(100)
  turnLeft()

  leftDistance = maqueen.Ultrasonic()
  basic.pause(1000)

  turnRight()
  basic.pause(100)
  turnRight()
  basic.pause(100)

  rightDistance = maqueen.Ultrasonic()
  basic.pause(1000)

  turnLeft()
  basic.pause(100)
}

function turnAngled(direction: String) {
  if (direction === "left") {
    Maqueen_V5.setRgblLed(Maqueen_V5.DirectionType.Left, Maqueen_V5.CarLightColors.Yellow)

    for (let i = 0; i < WIDE_TURN_ITERATIONS; ++i) {
      maqueen.motorRun(maqueen.Motors.M1, maqueen.Dir.CCW, TURN_SPEED)
      maqueen.motorRun(maqueen.Motors.M2, maqueen.Dir.CW, TURN_SPEED)
      basic.pause(WIDE_TURN_PAUSE)
      maqueen.motorStop(maqueen.Motors.All)
    }
  } else if (direction === "right") {
    Maqueen_V5.setRgblLed(Maqueen_V5.DirectionType.Right, Maqueen_V5.CarLightColors.Yellow)

    for (let i = 0; i < WIDE_TURN_ITERATIONS; ++i) {
      maqueen.motorRun(maqueen.Motors.M1, maqueen.Dir.CW, TURN_SPEED)
      maqueen.motorRun(maqueen.Motors.M2, maqueen.Dir.CCW, TURN_SPEED)
      basic.pause(WIDE_TURN_PAUSE)
      maqueen.motorStop(maqueen.Motors.All)
    }
  }

  maqueen.motorStop(maqueen.Motors.All)
  Maqueen_V5.setRgblLed(Maqueen_V5.DirectionType.All, Maqueen_V5.CarLightColors.Black)
}

// Contadores para lembrarmos quantas vezes viramos à direita ou à esquerda
let left = 0
let right = 0

// Variáveis globais para as distâncias medidas de cada lado
let leftDistance = 0
let rightDistance = 0

// Funções de inicialização
basic.showIcon(IconNames.Silly)
Maqueen_V5.I2CInit()
let strip = neopixel.create(DigitalPin.P15, 4, NeoPixelMode.RGB)

// Aguarda o início do gesto de largada
while (maqueen.Ultrasonic() >= 10) {
  Maqueen_V5.setRgblLed(Maqueen_V5.DirectionType.All, Maqueen_V5.CarLightColors.Red)
  strip.showColor(neopixel.colors(NeoPixelColors.Indigo))
  basic.showIcon(IconNames.Happy)
}

// Aguarda o fim do gesto de largada
while (maqueen.Ultrasonic() <= 10) {
  Maqueen_V5.setRgblLed(Maqueen_V5.DirectionType.All, Maqueen_V5.CarLightColors.Cyan)
  strip.showColor(neopixel.colors(NeoPixelColors.Orange))
  basic.showIcon(IconNames.Silly)
}

// Seta os LEDs e a flag para indicar o início do percurso
let init = true
Maqueen_V5.setRgblLed(Maqueen_V5.DirectionType.All, Maqueen_V5.CarLightColors.Black)
strip.showColor(neopixel.colors(NeoPixelColors.White))
basic.showIcon(IconNames.Happy)

// Método de segundo plano para iterar sobre os matizes na faixa de LEDs
control.inBackground(function() {
  // Aguarda pelo menos 2.5 segundos após a inicialização
  do
    basic.pause(2500)
  while (!(init));

  while (true) {
    for (let i = 0; i < 360; i += 5) {
      strip.showRainbow(1 + i, 360 - i)
      basic.pause(50)
    }
  }
})

// Loop principal do programa
basic.forever(function() {
  if (maqueen.Ultrasonic() > 10) {
    // Se não estivermos dentro de 10 centímetros de um obstáculo, continuamos
    Maqueen_V5.setRgblLed(Maqueen_V5.DirectionType.All, Maqueen_V5.CarLightColors.Green)
    Maqueen_V5.motorRun(Maqueen_V5.Motors.All, Maqueen_V5.Dir.CW, MOVE_SPEED)

    // Descomente as linhas abaixo para habilitar o método auxiliar de detecção
    // de esquinas. Não deve ser necessário na maioria dos labirintos. Pelo
    // contrário, pois invalidará a contagem de direções tomadas.

    /* } else if (rightDistance < 10 && leftDistance < 10) {
      Maqueen_V5.setRgblLed(Maqueen_V5.DirectionType.All, Maqueen_V5.CarLightColors.Purple)
      turnAngled(rightDistance >= leftDistance ? "left" : "right")
      Maqueen_V5.setRgblLed(Maqueen_V5.DirectionType.All, Maqueen_V5.CarLightColors.Black)
      basic.pause(100) */
  } else {
    // Caso contrário, paramos o robô
    Maqueen_V5.motorStop(maqueen.Motors.All)
    Maqueen_V5.setRgblLed(Maqueen_V5.DirectionType.All, Maqueen_V5.CarLightColors.Red)

    // Computamos qual dos lados perpendiculares têm a maior distância medida
    findPath()

    // Verifica se a distância à direita é maior ou igual à distância à esquerda
    if (rightDistance >= leftDistance) {
      // Se já viramos à direita duas vezes, viramos à esquerda
      if (right >= 2) {
        // Executa a virada à esquerda
        turnLeft()
        right += -1
        left += 1
        basic.pause(100)
      } else {
        // Caso contrário, executa a virada à direita
        turnRight()
        left += -1
        right += 1
        basic.pause(100)
      }
    } else {
      // Se a distância à esquerda é maior, seguimos a lógica inversa
      if (left >= 2) {
        // Se já viramos à esquerda duas vezes, viramos à direita
        turnRight()
        left += -1
        right += 1
        basic.pause(100)
      } else {
        // Caso contrário, executa a virada à esquerda
        turnLeft()
        right += -1
        left += 1
        basic.pause(100)
      }
    }
  }
})
