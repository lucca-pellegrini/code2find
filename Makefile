all: deploy

build: src/*.ts
	pxt build

deploy:
	pxt deploy

test:
	pxt test
