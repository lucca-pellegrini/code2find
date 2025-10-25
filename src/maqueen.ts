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

    for (let i = 0; i < Config.TURN_ITERATIONS; ++i) {
      motorRun(M1, CCW, Config.TURN_SPEED);
      motorRun(M2, CW, Config.TURN_SPEED);
      basic.pause(Config.TURN_PAUSE);
    }

    setHeadlight(DirLeft, Black);
    motorStop(MAll);
  }

  // Método para virar 90 graus para a direita
  export function turnRight() {
    motorStop(MAll);
    setHeadlight(DirRight, Yellow);

    for (let i = 0; i < Config.TURN_ITERATIONS; ++i) {
      motorRun(M1, CW, Config.TURN_SPEED);
      motorRun(M2, CCW, Config.TURN_SPEED);
      basic.pause(Config.TURN_PAUSE);
    }

    setHeadlight(DirRight, Black);
    motorStop(MAll);
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
    turnLeft();

    State.leftDistance = Ultrasonic();
    basic.pause(1000);

    turnRight();
    basic.pause(100);
    turnRight();
    basic.pause(100);

    State.rightDistance = Ultrasonic();
    basic.pause(1000);

    turnLeft();
    basic.pause(100);
  }
}
