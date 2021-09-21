# Appeals

Sistema de apelacion de baneos permanentes del servidor de **LA CABRA**

## Ejemplo de arcivo .env
```
PORT=4000
CLIENT_ID=781240994833104907
CLIENT_SECRET=elsecretdetucleinte
APP_SECRET=holasoyender
GUILD_ID=704029755975925841
BOT_TOKEN=eltokendelbotparalaapp
MONGODB_URL=mongodb://localhost/Appeals
USUARIOS_BLOQUEADOS=146681835491950592, 650899812388044830
```

### PORT (Puerto)

El puerto en el que se va a iniciar el servidor.

### CLIENT_ID (ID del Cliente)

La ID de la app de Discord para el sistema oauth.
[una foto]

### CLIENT_SECRET (Secret del Cliente)

El código secreto de la app de Discord para el sistema oauth.
[![fotico](https://i.imgur.com/SvTpAl3.png)](https://www.youtube.com/watch?v=dQw4w9WgXcQ)

### APP_SECRET (Secret de la APP)

Clave única para desencriptar las cookies del servidor.

### GUILD_ID (ID del Servidor)

La ID del servidor al que se le va a aplicar este sistema de apelaciones.

### BOT_TOKEN (Token del Bot)

El token del oot que estará en tu servidor para comprobar los bans y enviar el mensaje de apelación.

### MONGODB_URL (URL de MongoDB)

URL de la base de datos en MongoDB para guardar toda la información.

### USUARIOS_BLOQUEADOS (Usuarios bloqueados)

Lista de los usuarios bloqueados y que no pueden realizar una apelación.
