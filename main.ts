enum RadioMessage {
    handshake = 8146,
    message1 = 49434
}

let moveSpeed = 255
let turnSpeed = 200
let turnIterations = 3

function moveForward() {
    basic.pause(100)
    Maqueen_V5.setRgblLed(Maqueen_V5.DirectionType.All, Maqueen_V5.CarLightColors.Green)
    Maqueen_V5.motorRun(Maqueen_V5.Motors.All, Maqueen_V5.Dir.CW, moveSpeed)
}
function turnLeft() {
    maqueen.motorStop(maqueen.Motors.All)
    Maqueen_V5.setRgblLed(Maqueen_V5.DirectionType.Left, Maqueen_V5.CarLightColors.Yellow)
    for (let index = 0; index < turnIterations; index++) {
        Maqueen_V5.motorRun(Maqueen_V5.Motors.M1, Maqueen_V5.Dir.CCW, turnSpeed)
        Maqueen_V5.motorRun(Maqueen_V5.Motors.M2, Maqueen_V5.Dir.CW, turnSpeed)
        basic.pause(50)
    }
    Maqueen_V5.setRgblLed(Maqueen_V5.DirectionType.Left, Maqueen_V5.CarLightColors.Black)
    maqueen.motorStop(maqueen.Motors.All)
}
function turnRight() {
    maqueen.motorStop(maqueen.Motors.All)
    Maqueen_V5.setRgblLed(Maqueen_V5.DirectionType.Right, Maqueen_V5.CarLightColors.Yellow)
    for (let index = 0; index < turnIterations; index++) {
        Maqueen_V5.motorRun(Maqueen_V5.Motors.M1, Maqueen_V5.Dir.CW, turnSpeed)
        Maqueen_V5.motorRun(Maqueen_V5.Motors.M2, Maqueen_V5.Dir.CCW, turnSpeed)
        basic.pause(50)
    }
    Maqueen_V5.setRgblLed(Maqueen_V5.DirectionType.Right, Maqueen_V5.CarLightColors.Black)
    maqueen.motorStop(maqueen.Motors.All)
}
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
let left = 0
let right = 0
let distance = 0
let leftDistance = 0
let rightDistance = 0
function turnAngled(direction: String) {
    if (direction === "left") {
        Maqueen_V5.setRgblLed(Maqueen_V5.DirectionType.Left, Maqueen_V5.CarLightColors.Yellow)
        for (let index3 = 0; index3 < turnIterations; index3++) {
            maqueen.motorRun(maqueen.Motors.M1, maqueen.Dir.CCW, turnSpeed)
            maqueen.motorRun(maqueen.Motors.M2, maqueen.Dir.CW, turnSpeed)
            basic.pause(25)
            maqueen.motorStop(maqueen.Motors.All)
        }
    } else if (direction === "right") {
        Maqueen_V5.setRgblLed(Maqueen_V5.DirectionType.Right, Maqueen_V5.CarLightColors.Yellow)
        for (let index4 = 0; index4 < turnIterations; index4++) {
            maqueen.motorRun(maqueen.Motors.M1, maqueen.Dir.CW, turnSpeed)
            maqueen.motorRun(maqueen.Motors.M2, maqueen.Dir.CCW, turnSpeed)
            basic.pause(25)
            maqueen.motorStop(maqueen.Motors.All)
        }
    }
    maqueen.motorStop(maqueen.Motors.All)
    Maqueen_V5.setRgblLed(Maqueen_V5.DirectionType.All, Maqueen_V5.CarLightColors.Black)

}
basic.showIcon(IconNames.Silly)
Maqueen_V5.I2CInit()
let strip = neopixel.create(DigitalPin.P15, 4, NeoPixelMode.RGB)
while (maqueen.Ultrasonic() >= 10) {
    Maqueen_V5.setRgblLed(Maqueen_V5.DirectionType.All, Maqueen_V5.CarLightColors.Red)
    strip.showColor(neopixel.colors(NeoPixelColors.Indigo))
    basic.showIcon(IconNames.Happy)
}
while (maqueen.Ultrasonic() <= 10) {
    Maqueen_V5.setRgblLed(Maqueen_V5.DirectionType.All, Maqueen_V5.CarLightColors.Cyan)
    strip.showColor(neopixel.colors(NeoPixelColors.Orange))
    basic.showIcon(IconNames.Silly)
}
Maqueen_V5.setRgblLed(Maqueen_V5.DirectionType.All, Maqueen_V5.CarLightColors.Black)
let init = true
strip.showColor(neopixel.colors(NeoPixelColors.White))
basic.showIcon(IconNames.Happy)
basic.forever(function () {
    distance = maqueen.Ultrasonic()
    if (distance > 10) {
        moveForward()
    } else {
        maqueen.motorStop(maqueen.Motors.All)
        Maqueen_V5.setRgblLed(Maqueen_V5.DirectionType.All, Maqueen_V5.CarLightColors.Red)
        findPath()
        if (rightDistance < 10 && leftDistance < 10) {
            Maqueen_V5.setRgblLed(Maqueen_V5.DirectionType.All, Maqueen_V5.CarLightColors.Purple)
            turnAngled(rightDistance >= leftDistance ? "left" : "right")
            Maqueen_V5.setRgblLed(Maqueen_V5.DirectionType.All, Maqueen_V5.CarLightColors.Black)
            basic.pause(100)
        } else if (rightDistance >= leftDistance) {
            if (right >= 2) {
                turnLeft()
                right += -1
                left += 1
                basic.pause(100)
            } else {
                turnRight()
                left += -1
                right += 1
                basic.pause(100)
            }
        } else {
            if (left >= 2) {
                turnRight()
                left += -1
                right += 1
                basic.pause(100)
            } else {
                turnLeft()
                right += -1
                left += 1
                basic.pause(100)
            }
        }
    }
})

control.inBackground(function () {
    // Wait for initialization
    while (!(init)) {

    }
    while (true) {
        for (let i = 0; i <= 359; i += 5) {
            strip.showRainbow(1 + i, 360 - i)
            basic.pause(50)
        }
    }
})
