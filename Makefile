all: deploy

built/binary.hex: src/*.ts pxt.json tsconfig.json
	pxt build

deploy: built/binary.hex | /run/media/${USER}/MICROBIT
	cp built/binary.hex /run/media/${USER}/MICROBIT

/run/media/${USER}/MICROBIT: | /dev/disk/by-label/MICROBIT
	udisksctl mount --block-device=/dev/disk/by-label/MICROBIT

/dev/disk/by-label/MICROBIT:
	@echo "==> Waiting for micro:bit to be connected..."
	@inotifywait -e create /dev/disk/by-label/ --include 'MICROBIT' >/dev/null 2>&1

clean:
	pxt clean

test: test.ts
	pxt test

.PHONY: all deploy clean test
