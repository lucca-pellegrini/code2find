enum RadioMessage {
    handshake = 8146,
    message1 = 49434
}
function moveForward () {
    basic.showIcon(IconNames.Happy)
    Maqueen_V5.setRgblLed(Maqueen_V5.DirectionType.All, Maqueen_V5.CarLightColors.White)
    Maqueen_V5.motorRun(Maqueen_V5.Motors.All, Maqueen_V5.Dir.CW, 255)
}
function turnLeft () {
    maqueen.motorStop(maqueen.Motors.All)
    Maqueen_V5.setRgblLed(Maqueen_V5.DirectionType.Left, Maqueen_V5.CarLightColors.Yellow)
    for (let index = 0; index < 7; index++) {
        Maqueen_V5.motorRun(Maqueen_V5.Motors.M1, Maqueen_V5.Dir.CCW, 255)
        Maqueen_V5.motorRun(Maqueen_V5.Motors.M2, Maqueen_V5.Dir.CW, 255)
        basic.pause(50)
    }
    Maqueen_V5.setRgblLed(Maqueen_V5.DirectionType.Left, Maqueen_V5.CarLightColors.Black)
    maqueen.motorStop(maqueen.Motors.All)
}
function turnRight () {
    maqueen.motorStop(maqueen.Motors.All)
    Maqueen_V5.setRgblLed(Maqueen_V5.DirectionType.Right, Maqueen_V5.CarLightColors.Yellow)
    for (let index = 0; index < 7; index++) {
        Maqueen_V5.motorRun(Maqueen_V5.Motors.M1, Maqueen_V5.Dir.CW, 255)
        Maqueen_V5.motorRun(Maqueen_V5.Motors.M2, Maqueen_V5.Dir.CCW, 255)
        basic.pause(50)
    }
    Maqueen_V5.setRgblLed(Maqueen_V5.DirectionType.Right, Maqueen_V5.CarLightColors.Black)
    maqueen.motorStop(maqueen.Motors.All)
}
function findPath () {
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
let rightDistance = 0
let leftDistance = 0
function turnAngled(direction: String) {
    if (direction === "left") {
        Maqueen_V5.setRgblLed(Maqueen_V5.DirectionType.Left, Maqueen_V5.CarLightColors.Yellow)
        for (let index3 = 0; index3 < 5; index3++) {
            maqueen.motorRun(maqueen.Motors.M1, maqueen.Dir.CCW, 255)
            maqueen.motorRun(maqueen.Motors.M2, maqueen.Dir.CW, 255)
            basic.pause(25)
            maqueen.motorStop(maqueen.Motors.All)
        }
    } else if (direction === "right") {
        Maqueen_V5.setRgblLed(Maqueen_V5.DirectionType.Right, Maqueen_V5.CarLightColors.Yellow)
        for (let index4 = 0; index4 < 5; index4++) {
            maqueen.motorRun(maqueen.Motors.M1, maqueen.Dir.CW, 255)
            maqueen.motorRun(maqueen.Motors.M2, maqueen.Dir.CCW, 255)
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
basic.showIcon(IconNames.Happy)
strip.showColor(neopixel.colors(NeoPixelColors.White))
Maqueen_V5.setRgblLed(Maqueen_V5.DirectionType.All, Maqueen_V5.CarLightColors.White)
while (maqueen.Ultrasonic() >= 10) {
	
}
basic.showIcon(IconNames.Silly)
strip.showColor(neopixel.colors(NeoPixelColors.Orange))
Maqueen_V5.setRgblLed(Maqueen_V5.DirectionType.All, Maqueen_V5.CarLightColors.Cyan)
while (maqueen.Ultrasonic() <= 10) {
	
}
Maqueen_V5.setRgblLed(Maqueen_V5.DirectionType.All, Maqueen_V5.CarLightColors.Black)
let init = true
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
