// SPDX-License-Identifier: ISC

// Namespace para interface de controle do hardware do robô Maqueen. Fornece
// constantes e funções para controlar motores, LEDs, movimentos de giro e
// medições do sensor ultrassônico.
namespace Maqueen {

  // Constantes por conveniência. Usadas pois o PXT infelizmente não permite
  // desestruturar o namespace `Maqueen_V5` (nem nenhum outro namespace)...
  // Devemos fazer isso para cada item e função, manualmente! 😭

  // Métodos e constantes desestruturados públicos
  export const DirAll = Maqueen_V5.DirectionType.All;
  export const DirLeft = Maqueen_V5.DirectionType.Left;
  export const DirRight = Maqueen_V5.DirectionType.Right;
  export const I2CInit = Maqueen_V5.I2CInit;
  export const Ultrasonic = Maqueen_V5.Ultrasonic;
  export const Red = Maqueen_V5.CarLightColors.Red;
  export const Green = Maqueen_V5.CarLightColors.Green;
  export const Yellow = Maqueen_V5.CarLightColors.Yellow;
  export const Blue = Maqueen_V5.CarLightColors.Blue;
  export const Purple = Maqueen_V5.CarLightColors.Purple;
  export const Cyan = Maqueen_V5.CarLightColors.Cyan;
  export const White = Maqueen_V5.CarLightColors.White;
  export const Black = Maqueen_V5.CarLightColors.Black;

  // Métodos e constantes desestruturados privados
  const CCW = Maqueen_V5.Dir.CCW;
  const CW = Maqueen_V5.Dir.CW;
  const M1 = Maqueen_V5.Motors.M1;
  const M2 = Maqueen_V5.Motors.M2;
  const MAll = Maqueen_V5.Motors.All;
  const motorRun = Maqueen_V5.motorRun;
  const motorStop = Maqueen_V5.motorStop;
  const setRgblLed = Maqueen_V5.setRgblLed;

  // Função para controlar os faróis RGB do Maqueen, verificando se estão habilitados
  export function setHeadlight(direction: Maqueen_V5.DirectionType, color: Maqueen_V5.CarLightColors) {
    if (Config.LEDS_ENABLED) {
      setRgblLed(DirAll, Black);
      setRgblLed(direction, color);
    }
  }

  // Função para iniciar movimento em linha reta
  export function run() {
    setHeadlight(DirAll, Green);
    motorRun(MAll, CW, Config.MOVE_SPEED);
  }

  // Função para parar qualquer movimento
  export function stop() {
    motorStop(MAll);
    setHeadlight(DirAll, Red);
  }

  // Método para virar 90 graus para a esquerda
  export function turnLeft() {
    motorStop(MAll);
    setHeadlight(DirLeft, Yellow);
    basic.pause(200);
    const h0: number = (Config.TURN_FINE_ADJUSTMENT_ENABLED) ? meanCompassHeading() : 0;

    for (let i = 0; i < Config.TURN_ITERATIONS; ++i) {
      motorRun(M1, CCW, Config.TURN_SPEED);
      motorRun(M2, CW, Config.TURN_SPEED);
      basic.pause(Config.LEFT_TURN_PAUSE);
    }

    motorStop(MAll);
    setHeadlight(DirLeft, Black);
    fineTurnAdjustment((h0 + 360 - 90) % 360); // h0 - 90 mod 360
  }

  // Método para virar 90 graus para a direita
  export function turnRight() {
    motorStop(MAll);
    setHeadlight(DirRight, Yellow);
    basic.pause(200);
    const h0: number = (Config.TURN_FINE_ADJUSTMENT_ENABLED) ? meanCompassHeading() : -1;

    for (let i = 0; i < Config.TURN_ITERATIONS; ++i) {
      motorRun(M1, CW, Config.TURN_SPEED);
      motorRun(M2, CCW, Config.TURN_SPEED);
      basic.pause(Config.RIGHT_TURN_PAUSE);
    }

    motorStop(MAll);
    setHeadlight(DirRight, Black);
    fineTurnAdjustment((h0 + 90) % 360); // h0 + 90 mod 360
  }

  // Método interno para fazer ajustes finos, para alcançar uma orientação alvo
  // na bússola.
  function fineTurnAdjustment(target: number) {
    basic.pause(200);

    const fineSpeed: number = Math.max(10, Math.floor(Config.TURN_SPEED / 4));
    const burstMs = 25;   // curta rajada de ajuste
    const settleMs = 100; // espera maior para estabilizar após a rajada
    const timeoutMs = 6000; // timeout total de segurança (ms)
    const startTime = input.runningTime();

    while (Config.TURN_FINE_ADJUSTMENT_ENABLED) {
      let h1 = meanCompassHeading();

      const delta = shortestDelta(h1, target); // quanto falta, com sinal

      if (
        Math.abs(delta) <= Config.TURN_TOLERANCE_DEGREES
        || Math.abs(delta) >= Config.MAX_FINE_ADJUSTMENT_ANGLE
      ) {
        break;
      }

      // timeout de segurança
      if (input.runningTime() - startTime > timeoutMs) {
        motorStop(MAll);
        break;
      }

      // delta > 0 -> precisamos AUMENTAR o heading -> girar para a direita
      // delta < 0 -> precisamos DIMINUIR o heading -> girar para a esquerda
      if (delta > 0) {
        // girar para a direita (clockwise)
        motorRun(M1, CW, fineSpeed);
        motorRun(M2, CCW, fineSpeed);
      } else {
        // girar para a esquerda (counter-clockwise)
        motorRun(M1, CCW, fineSpeed);
        motorRun(M2, CW, fineSpeed);
      }

      basic.pause(burstMs);
      motorStop(MAll);

      // pequena espera para o robô estabilizar e para a bússola "assentar"
      basic.pause(settleMs);
    }
  }


  function shortestDelta(from: number, to: number): int32 {
    // menor ângulo com sinal na faixa (-180, +179)
    return (((to - from + 540) % 360) as int32) - 180;
  }

  // Retorna heading médio em [0,360)
  function meanCompassHeading(samples = 12, delayMs = 20, maxDeviationDeg = 30): number {
    const radians: number[] = [];
    for (let i = 0; i < samples; ++i) {
      radians.push(input.compassHeading() * Math.PI / 180);
      basic.pause(delayMs);
    }

    function circularMeanFromRadians(arr: number[]): number {
      let sx = 0, sy = 0;
      for (let r of arr) { sx += Math.cos(r); sy += Math.sin(r); }
      let m = Math.atan2(sy, sx) * 180 / Math.PI;
      if (m < 0) m += 360;
      return m;
    }

    // 1ª média
    let meanDeg = circularMeanFromRadians(radians);

    // calc desviacões e filtra outliers
    const filtered: number[] = [];
    for (let r of radians) {
      let deg = (r * 180 / Math.PI);
      if (deg < 0) deg += 360;
      const dev = Math.abs(shortestDelta(deg, meanDeg));
      if (dev <= maxDeviationDeg) filtered.push(r);
    }

    // se a filtragem removeu poucas amostras, recomputa média; senão mantém a primeira
    if (filtered.length >= Math.max(1, Math.idiv(samples, 2)))
      meanDeg = circularMeanFromRadians(filtered);

    return meanDeg;
  }

  // Método auxiliar para virar em um ângulo obtuso, caso fiquemos presos
  export function turnAngled(direction: Maqueen_V5.DirectionType) {
    if (direction === DirLeft) {
      setHeadlight(DirLeft, Yellow);

      for (let i = 0; i < Config.WIDE_TURN_ITERATIONS; ++i) {
        motorRun(M1, CCW, Config.TURN_SPEED);
        motorRun(M2, CW, Config.TURN_SPEED);
        basic.pause(Config.WIDE_TURN_PAUSE);
        motorStop(MAll);
      }
    } else if (direction === DirRight) {
      setHeadlight(DirRight, Yellow);

      for (let i = 0; i < Config.WIDE_TURN_ITERATIONS; ++i) {
        motorRun(M1, CW, Config.TURN_SPEED);
        motorRun(M2, CCW, Config.TURN_SPEED);
        basic.pause(Config.WIDE_TURN_PAUSE);
        motorStop(MAll);
      }
    }

    motorStop(MAll);
    setHeadlight(DirAll, Black);
  }

  // Método para olhar para os dois lados e medir a distância da parede em cada um
  export function findPath() {
    basic.pause(100);
    // basic.showArrow(2);
    turnLeft();

    State.leftDistance = Ultrasonic();
    // basic.showNumber(State.leftDistance);
    // basic.pause(1000);

    turnRight();
    basic.pause(100);
    // basic.showArrow(6);
    turnRight();
    basic.pause(100);

    State.rightDistance = Ultrasonic();
    // basic.showNumber(State.rightDistance);
    // basic.pause(1000);
  }
}
