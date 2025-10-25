# Code2Find — Programa Simples de Navegação de Labirintos

Este projeto implementa um programa de navegação autônoma para um robô
micro:Maqueen V5 equipado com um BBC micro:bit V2 (Nordic nRF52). O algoritmo
utiliza um único sensor ultrassônico para detectar obstáculos e navegar por
labirintos, priorizando caminhos abertos enquanto mantém um registro das
direções tomadas para evitar loops.

## Instalação

Para trabalhar com este projeto, você precisará do PXT (MakeCode) instalado
globalmente. Siga os passos abaixo:

1. Instale o PXT globalmente usando [pnpm](https://pnpm.io/):

   ```
   pnpm install -g pxt
   ```

2. No diretório do projeto, defina o alvo para a BBC micro:bit:

   ```
   pxt target microbit
   ```

3. Instale as dependências do projeto:
   ```
   pxt install
   ```

## Uso

O projeto inclui um Makefile para facilitar as operações comuns de compilação e
implantação. Os comandos disponíveis são:

- `make build`: Compila o projeto e gera os arquivos necessários.
- `make deploy`: Compila o projeto e implanta o código no micro:bit conectado.
- `make test`: Executa os testes definidos no projeto.
- `make all` ou simplesmente `make`: Equivalente a `make deploy`, compilando e
  implantando o código.

## Como usar no MakeCode

Para modificar o projeto no MakeCode:

- Abra [https://makecode.microbit.org/](https://makecode.microbit.org/)
- Clique em **Importar** e selecione **Importar URL**
- Cole a URL deste repositório e clique em importar

## Licença

Este projeto está licenciado sob a licensa [ISC](LICENSE).
