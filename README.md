# Appeals

Sistema de apelación de baneos permanentes del servidor de **LA CABRA**
Para cualquier pregunta/sugerencia siempre podéis abrir una **issue**

## Como usar

1 - Crea una aplicación en Discord y añade el siguiente link a la sección Oauth2:
```https://<URL>:<PUERTO>/api/auth/discord/redirect```

2 - Rellena el archivo [.env](https://github.com/holasoyender/Appeals#ejemplo-de-arcivo-env)

3 - Añade el bot al servidor con los siguientes permisos: `Banear usuarios` y `Mandar mensajes`

## Ejemplo de arcivo .env
```
PORT=4000
CLIENT_ID=781240994833104907
CLIENT_SECRET=elsecretdetucleinte
APP_SECRET=holasoyender
GUILD_ID=704029755975925841
CHANNEL_ID=755000173922615336
BOT_TOKEN=eltokendelbotparalaapp
MONGODB_URL=mongodb://localhost/Appeals
ADMINISTRADORES=396683727868264449, 351378361114951690
ROL_MODERADOR=728584717879869461
```

### PORT (Puerto)

El puerto en el que se va a iniciar el servidor.

### CLIENT_ID (ID del Cliente)

La ID de la app de Discord para el sistema oauth.

[![fotico](https://i.imgur.com/yW9neR4.png)](https://www.youtube.com/watch?v=dQw4w9WgXcQ)

### CLIENT_SECRET (Secret del Cliente)

El código secreto de la app de Discord para el sistema oauth.

[![fotico otra vez](https://i.imgur.com/SvTpAl3.png)](https://www.youtube.com/watch?v=dQw4w9WgXcQ)

### APP_SECRET (Secret de la APP)

Clave única para desencriptar las cookies del servidor.

### GUILD_ID (ID del Servidor)

La ID del servidor al que se le va a aplicar este sistema de apelaciones.

### CHANNEL_ID (ID del Canal de apelaciones)

La ID del canal en el que se mandaran los mensajes de apelaciones.

### BOT_TOKEN (Token del Bot)

El token del bot que estará en tu servidor para comprobar los bans y enviar el mensaje de apelación.

### MONGODB_URL (URL de MongoDB)

URL de la base de datos en MongoDB para guardar toda la información.

### ADMINISTRADORES (Administradores)

Lista de los administradores del sistema de apelaciones.

### ROL_MODERADOR (Rol de Moderador)

La ID del rol con el que los moderadores podrán votar en las apelaciones