# Cristalia para Android (APK)

App Android bem pequeno (~50 KB) que abre o jogo em tela cheia. O jogo de verdade fica no site
**https://laminasombria1-dotco.github.io/YonkouTestes/** (pasta `apps/cristalia`), então:

- **Atualizações do jogo chegam sozinhas:** não é preciso instalar um APK novo quando o jogo muda.
- **Sem internet:** abre a última versão guardada. Na primeira vez, precisa de internet.
- **Progresso salvo:** fica dentro do app, no celular.

## Instalar no celular
1. Baixe o `Cristalia.apk` no celular.
2. Toque nele. O Android vai pedir para **permitir instalar apps desta fonte** (do navegador ou do gerenciador de arquivos): permita.
3. Toque em **Instalar**. Se o Play Protect avisar "app desconhecido", toque em **Instalar mesmo assim**: o aviso aparece porque o app não veio da Play Store.

## Quando precisa de um APK novo?
Só quando mudar algo do **app** em si (nome, ícone, endereço do site). Mudanças no **jogo** não precisam.

## Assinatura (importante)
Todo APK é "assinado" com uma chave. Para instalar uma versão nova **por cima** da antiga, sem perder o progresso,
a chave precisa ser **a mesma**. A chave fica nos arquivos `cristalia.jks` e `assinatura.properties`, que **não**
ficam no repositório (ele é público). Guarde a cópia que recebeu num lugar seguro, como o Google Drive.
Sem ela, um APK novo só instala depois de desinstalar o antigo, e o progresso salvo se perde.

## Montar o APK (para quem for mexer no código)
1. Coloque `cristalia.jks` e `assinatura.properties` nesta pasta.
2. Crie `local.properties` com `sdk.dir=` apontando para o Android SDK.
3. Rode `./gradlew assembleRelease`. O APK sai em `app/build/outputs/apk/release/app-release.apk`.

Antes de montar um APK novo, aumente `versionCode` em `app/build.gradle`.

| Arquivo | O que faz |
|---|---|
| `app/src/main/java/.../Principal.java` | A tela do app: abre o site em tela cheia, guarda o progresso e trata a falta de internet |
| `app/src/main/assets/sem-internet.html` | Aviso quando não há internet na primeira vez |
| `app/src/main/AndroidManifest.xml` | Nome, ícone, permissão de internet e giro de tela |
| `app/build.gradle` | Versão do app e assinatura |
