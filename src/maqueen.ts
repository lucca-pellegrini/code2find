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

  // Função para tocar um efeito sonoro
  export function play(expression: SoundExpression) {
    music.play(
      music.builtinPlayableSoundEffect(expression),
      music.PlaybackMode.InBackground
    );
  }

  // Calibração inicial do robô.
  export function calibrateHeading() {
    basic.pause(200);
    State.headingCalibration = meanCompassHeadingStable(12, 12); // média inicial (estabiliza)
    State.calibrated = true;
  }

  // Método para olhar para os dois lados e medir a distância da parede em cada
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

  // Método para virar aproximadamente 90 graus para a esquerda,
  // com ajuste fino opcional para precisão.
  export function turnLeft() {
    motorStop(MAll);
    setHeadlight(DirLeft, Yellow);
    basic.pause(200);

    // Pega heading absoluto antes da manobra para calcular target
    const originalAbsolute = meanCompassHeadingStable(8, 12);
    for (let i = 0; i < Config.TURN_ITERATIONS; ++i) {
      motorRun(M1, CCW, Config.TURN_SPEED);
      motorRun(M2, CW, Config.TURN_SPEED);
      basic.pause(Config.LEFT_TURN_PAUSE);
    }
    motorStop(MAll);
    setHeadlight(DirLeft, Black);

    if (Config.TURN_FINE_ADJUSTMENT_ENABLED) {
      // Target absoluto = original - 90
      const targetAbs = (originalAbsolute + 360 - 90) % 360;
      // Se calibrado, passa target relativo ao fineTurnAdjustment
      if (State.calibrated) {
        const targetRel = (targetAbs - State.headingCalibration + 360) % 360;
        fineTurnAdjustment(targetRel);
      } else {
        fineTurnAdjustment(targetAbs);
      }
    }
  }

  // Método para virar aproximadamente 90 graus para a direita,
  // com ajuste fino opcional para precisão.
  export function turnRight() {
    motorStop(MAll);
    setHeadlight(DirRight, Yellow);
    basic.pause(200);
    const originalAbsolute = meanCompassHeadingStable(8, 12);

    for (let i = 0; i < Config.TURN_ITERATIONS; ++i) {
      motorRun(M1, CW, Config.TURN_SPEED);
      motorRun(M2, CCW, Config.TURN_SPEED);
      basic.pause(Config.RIGHT_TURN_PAUSE);
    }

    motorStop(MAll);
    setHeadlight(DirRight, Black);

    if (Config.TURN_FINE_ADJUSTMENT_ENABLED) {
      // Target absoluto = original + 90
      const targetAbs = (originalAbsolute + 90) % 360;
      // Se calibrado, passa target relativo ao fineTurnAdjustment
      if (State.calibrated) {
        const targetRel = (targetAbs - State.headingCalibration + 360) % 360;
        fineTurnAdjustment(targetRel);
      } else {
        fineTurnAdjustment(targetAbs);
      }
    }
  }

  // Método interno para fazer ajustes finos na orientação usando a bússola,
  // e controle proporcional com estabilidade via acelerômetro para alcançar o
  // ângulo alvo com precisão.
  // targetRel: Ângulo relativo à frente do robô (0..360)
  function fineTurnAdjustment(targetRel: number) {
    // Sem calibragem, presume que targetRel é absoluto (compatibilidade)
    if (!State.calibrated)
      targetRel = (targetRel + 360) % 360;

    basic.pause(200);
    const startTime = input.runningTime();

    const Kp = 1.4;       // Ganho proporcional (ajuste)
    const Ki = 0.01;      // Integral (NOTE: pode deixar 0 se instável)
    const Kd = 0.12;      // Derivativo (amorte)
    const dtTargetMs = 60;// Loop time target
    let integral = 0;
    let prevErr = 0;
    let prevTime = input.runningTime();

    const accelToleranceDuringTurn = 300; // Se aceleração grande → pular correção
    const settleHoldMs = 80; // Espera para estabilizar antes de aceitar

    while (true) {
      const now = input.runningTime();
      const dt = Math.max(1, (now - prevTime) / 1000.0);
      prevTime = now;

      // Leitura rápida: usamos a leitura média curta para reduzir ruido
      const absHeading = meanCompassHeadingStable(4, 8);

      // Converte para relativo se calibrado
      let headingRel = absHeading;
      if (State.calibrated) {
        headingRel = (absHeading - State.headingCalibration) % 360;
        if (headingRel < 0) headingRel += 360;
      }

      let err = shortestDelta(headingRel, targetRel); // sinal: >0 → direita

      // Condições de saída
      if (Math.abs(err) <= Config.TURN_TOLERANCE_DEGREES) break;
      if (Math.abs(err) >= Config.MAX_FINE_ADJUSTMENT_ANGLE) break;
      if (input.runningTime() - startTime > Config.FINE_TURN_TIMOUT_MS) {
        motorStop(MAll);
        break;
      }

      // Se há aceleração/artifício, espera um pouco antes de aplicar correção
      const ax = input.acceleration(Dimension.X);
      const ay = input.acceleration(Dimension.Y);
      const az = input.acceleration(Dimension.Z);
      const mag = Math.sqrt(ax * ax + ay * ay + az * az);
      if (Math.abs(mag - 1024) > accelToleranceDuringTurn) {
        // Se estamos sendo empurrados ou indo para frente/para trás; damos um
        // tempo para estabilizar
        motorStop(MAll);
        basic.pause(30);
        continue;
      }

      // PID
      integral += err * dt;
      // Anti-windup: limite integral
      const maxI = 200;
      if (integral > maxI) integral = maxI;
      if (integral < -maxI) integral = -maxI;
      const derivative = (err - prevErr) / dt;
      prevErr = err;
      let u = Kp * err + Ki * integral + Kd * derivative; // Comando em graus → escalado para velocidade

      // Mapeia u para velocidade 0..Config.FINE_TURN_SPEED
      // (e garante mínimo para vencer atrito)
      let speed = Math.min(Config.FINE_TURN_SPEED, Math.abs(u));
      // if (speed < Config.MIN_TURN_SPEED) speed = Config.MIN_TURN_SPEED; // TODO: tornar velocidade mínima configurável

      // Ativa motores
      if (err > 0) {
        motorRun(M1, CW, speed);
        motorRun(M2, CCW, speed);
      } else {
        motorRun(M1, CCW, speed);
        motorRun(M2, CW, speed);
      }

      basic.pause(dtTargetMs);
      motorStop(MAll);
      basic.pause(settleHoldMs);
    }

    motorStop(MAll);
  }

  // Retorna o heading absoluto da "bússola" já filtrado/estável.
  // Usa accel/rotation para descartar amostras instáveis.
  function meanCompassHeadingStable(samples = 8, delayMs = 12, maxDeviationDeg = 30): number {
    const radians: number[] = [];
    const rotSamples: number[] = [];
    const accelTolerance = 200; // Tolerância ± em relação a ~1024 em milli-g
    const maxRotChangeDeg = 10; // Se rotation muda muito entre amostras, é instável

    let lastPitch = input.rotation(Rotation.Pitch);
    let lastRoll = input.rotation(Rotation.Roll);

    let attempts = 0;
    while (radians.length < samples && attempts < samples * 6) {
      attempts += 1;
      const ax = input.acceleration(Dimension.X);
      const ay = input.acceleration(Dimension.Y);
      const az = input.acceleration(Dimension.Z);
      const mag = Math.sqrt(ax * ax + ay * ay + az * az);

      const pitch = input.rotation(Rotation.Pitch);
      const roll = input.rotation(Rotation.Roll);

      // Rejeitar quando houver aceleração/choque (mag devia estar perto de 1024)
      if (Math.abs(mag - 1024) > accelTolerance) {
        basic.pause(delayMs);
        continue;
      }

      // Rejeitar se a orientação estiver mudando rapidamente
      if (Math.abs(pitch - lastPitch) > maxRotChangeDeg || Math.abs(roll - lastRoll) > maxRotChangeDeg) {
        lastPitch = pitch;
        lastRoll = roll;
        basic.pause(delayMs);
        continue;
      }

      lastPitch = pitch;
      lastRoll = roll;

      // Obtém a leitura "tilt-compensated" que o runtime fornece
      const h = input.compassHeading();
      radians.push(h * Math.PI / 180);
      rotSamples.push(h);

      basic.pause(delayMs);
    }

    if (radians.length == 0) {
      // Fallback: leitura direta
      return input.compassHeading();
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

    // Filtrar outliers pelo desvio angular a partir da primeira média
    const filtered: number[] = [];
    for (let r of radians) {
      let deg = (r * 180 / Math.PI);
      if (deg < 0) deg += 360;
      const dev = Math.abs(shortestDelta(deg, meanDeg));
      if (dev <= maxDeviationDeg) filtered.push(r);
    }

    if (filtered.length >= Math.max(1, Math.floor(samples / 2)))
      meanDeg = circularMeanFromRadians(filtered);

    return meanDeg;
  }

  // Calcula a menor diferença angular entre dois ângulos,
  // retornando um valor em (-180, 180].
  function shortestDelta(from: number, to: number): number {
    return (((to - from + 540) % 360) as number) - 180;
  }

  // Obtem heading relativo ao "frente do robô" (requer calibragem)
  export function robotHeading(): number {
    const abs = meanCompassHeadingStable(6, 10);
    if (!State.calibrated) return abs;
    let rel = (abs - State.headingCalibration) % 360;
    if (rel < 0) rel += 360;
    return rel;
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
}
