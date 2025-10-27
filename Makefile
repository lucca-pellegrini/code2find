all: deploy

built/binary.hex: src/*.ts pxt.json tsconfig.json
	pxt build

deploy: built/binary.hex | /run/media/${USER}/MICROBIT
	cp built/binary.hex /run/media/${USER}/MICROBIT

/run/media/${USER}/MICROBIT: | /dev/disk/by-label/MICROBIT
	udisksctl mount --block-device=/dev/disk/by-label/MICROBIT

clean:
	pxt clean

test: test.ts
	pxt test

.PHONY: all deploy clean test
