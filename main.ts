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

// Inicializa matriz de LEDs com uma carinha de esforço
basic.showIcon(IconNames.Silly);

// Inicialização da faixa de LEDs, se habilitada
if (Config.LEDS_ENABLED) {
  Maqueen.I2CInit();
  State.strip = neopixel.create(DigitalPin.P15, 4, NeoPixelMode.RGB);
}

// Aguarda o início do gesto de largada
while (Maqueen.Ultrasonic() >= 10) {
  Maqueen.setHeadlight(Maqueen.DirAll, Maqueen.Red);
  if (Config.LEDS_ENABLED && State.strip)
    State.strip.showColor(neopixel.colors(NeoPixelColors.Indigo));
  basic.showIcon(IconNames.Happy);
}

// Aguarda o fim do gesto de largada
while (Maqueen.Ultrasonic() <= 10) {
  Maqueen.setHeadlight(Maqueen.DirAll, Maqueen.Cyan);
  if (Config.LEDS_ENABLED && State.strip)
    State.strip.showColor(neopixel.colors(NeoPixelColors.Orange));
  basic.showIcon(IconNames.Silly);
}

// Seta os LEDs e a flag para indicar o início do percurso
State.ready = true;
Maqueen.setHeadlight(Maqueen.DirAll, Maqueen.Black);
if (Config.LEDS_ENABLED && State.strip)
  State.strip.showColor(neopixel.colors(NeoPixelColors.White));
basic.showIcon(IconNames.Happy);

if (Config.LEDS_ENABLED && State.strip) {
  // Armazena referência para que o TypeScript saiba que a variável está
  // definida no método assíncrono abaixo
  let localStrip = State.strip;

  // Método de segundo plano para iterar sobre os matizes na faixa de LEDs
  control.inBackground(() => {
    do
      basic.pause(2500) // Aguarda pelo menos 2.5 segundos após a inicialização
    while (!(State.ready));

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
  if (Maqueen.Ultrasonic() > 10) {
    // Se não estivermos dentro de 10 centímetros de um obstáculo, continuamos
    Maqueen.run();
  } else if (
    Config.OBTUSE_TURN_CONTINGENCY_ENABLED
    && State.rightDistance < 10 && State.leftDistance < 10
    && (State.right >= 2 || State.left >= 2)
  ) {
    // Se estivermos presos em uma esquina, e a contingência estiver
    // habilitada, faremos uma rotação num ângulo obtuso para tentar escapar
    Maqueen.setHeadlight(Maqueen.DirAll, Maqueen.Purple);
    basic.pause(2000);

    State.left = State.right = 0; // Zeramos os contadores
    Maqueen.turnAngled(State.rightDistance >= State.leftDistance ? Maqueen.DirLeft : Maqueen.DirRight);

    Maqueen.setHeadlight(Maqueen.DirAll, Maqueen.Black);
    basic.pause(2000)

  } else {
    // Caso contrário, paramos o robô
    Maqueen.stop();

    // Computamos qual dos lados perpendiculares têm a maior distância medida
    Maqueen.findPath();

    // Verifica se a distância à direita é maior ou igual à distância à esquerda
    if (State.rightDistance >= State.leftDistance) {
      if (State.right >= 2) {
        // Se já viramos à direita duas vezes, viramos à esquerda
        Maqueen.turnLeft();
        State.right += -1;
        State.left += 1;
        Maqueen.setHeadlight(Maqueen.DirLeft, Maqueen.Cyan);
      } else {
        // Caso contrário, executa a virada à direita
        Maqueen.turnRight();
        State.left += -1;
        State.right += 1;
        Maqueen.setHeadlight(Maqueen.DirRight, Maqueen.Cyan);
      }
    } else {
      if (State.left >= 2) {
        // Se a distância à esquerda é maior, seguimos a lógica inversa:
        // Se já viramos à esquerda duas vezes, viramos à direita
        Maqueen.turnRight();
        State.left += -1;
        State.right += 1;
        Maqueen.setHeadlight(Maqueen.DirRight, Maqueen.Cyan);
      } else {
        // Caso contrário, executa a virada à esquerda
        Maqueen.turnLeft();
        State.right += -1;
        State.left += 1;
        Maqueen.setHeadlight(Maqueen.DirLeft, Maqueen.Cyan);
      }
    }

    basic.pause(500);
  }
});
