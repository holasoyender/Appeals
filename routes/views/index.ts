import config from "../../config";

export default async (req:any) => {
    let inject: string = `<a class="btn" id="login" style="font-size: 2rem;" href="/api/auth/form">Entra con Discord</a>`;
    if (req.user) {
        let user: any = await req.user;

        let avatar;
        if (user.Avatar !== "https://cdn.discordapp.com/embed/avatars/0.png")
            avatar = `https://cdn.discordapp.com/avatars/${user.ID}/${user.Avatar}.webp`
        else
            avatar = "https://cdn.discordapp.com/embed/avatars/0.png"

        inject = `
        <a class="btn" id="login" style="font-size: 2rem;" href="/api/auth/form">Ir al formulario</a>
        <img src="${avatar}" width="50" class="avatar" height="50" onclick="parent.location='/logout'" alt="Avatar">
        `
    }

    return `
<!DOCTYPE html>
<html lang="en" class="h-100">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
        <link data-n-head="ssr" rel="icon" type="image/png" sizes="512x512" href="${config.img.main_icon}">
        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css" integrity="sha384-JcKb8q3iqJ61gNV9KGb8thSsNjpSL0n8PARn9HuZOnIxN0hoP+VmmDGMN5t9UJ0Z" crossorigin="anonymous">
        <link href="https://fonts.googleapis.com/css2?family=Fira+Sans&display=swap" rel="stylesheet">

        <title>Apelación de ban</title>
    </head>
    <body class="h-100 d-flex flex-column justify-content-center align-items-stretch">
        <div class="jumbotron text-center mb-0">
            <div class="test" >
                <img src="${config.img.banner}" width="800" height="350" class="test"  alt="ibai lol">
            </div>
            <h1 style="margin-top: 20px;" >Apelación de ban en ${config.server_name}</h1>
        </div>

        <div class="flex-fill text-center d-flex h-100 justify-content-center align-items-center">
            ${inject}
        </div>
    </body>
<style>
    body {
    background: #36393f;
    font-family: 'Fira Sans', sans-serif;
}
.test {
    align-self: center;
    border-radius: 10px;
    object-fit: cover;
}
.avatar {
    border-radius: 50px;
    margin-left: 20px;
}
.avatar:hover {
    border-radius: 50px;
    margin-left: 20px;
    transform: scale(1.1);
    cursor: pointer;
    transition: all 0.5s ease-in-out;
}
.jumbotron {
    background: #2f3136;
}
h1 {
    color: white;
}
h2, p {
    color: #b9bbbe;
}
a {
    color: hsl(197,100%,47.8%);
}
button, a.btn {
    color: white !important;
    background-color: hsl(235,85.6%,64.7%) !important;
    border: none !important;
    box-shadow: none !important;
    transition: background-color .17s ease;
}
button:hover, a.btn:hover {
    background-color: hsl(235,51.4%,52.4%) !important;
}
button:active, a.btn:active {
    background-color: hsl(235,46.7%,44.1%) !important;
}
label {
    color: #8e9297;
}
label.radio > span:not(.checkmark) {
    font-weight: 500;
    font-size: 16px;
    line-height: 20px;
    margin-left: 32px;
}
label.radio > input {
    position: absolute;
    opacity: 0;
    cursor: pointer;
}
label.radio > .checkmark > span {
    position: absolute;
    width: 10px;
    height: 10px;
    border-radius: 50%;
}
label.radio.checked > .checkmark > span {
    background-color: hsl(235,86.1%,77.5%);
}
select {
    background-color: #2f3136 !important;
    border: 1px solid #202225 !important;
    cursor: pointer !important;
    color: #dcddde !important;
    border-radius: 4px !important;
    font-weight: 500 !important;
    outline: none !important;
    box-shadow: none !important;
}
select:invalid {
    color: #72767d !important;
}
option {
    color: #b9bbbe;
}
textarea {
    color: #dcddde !important;
    background: rgba(0, 0, 0, 0.1) !important;
    border: 1px solid rgba(0, 0, 0, 0.3) !important;
    outline: none !important;
    box-shadow: none !important;
    transition: border-color .2s ease-in-out;
    resize: none;
    overflow-y: hidden;
}
textarea:hover {
    border-color: #040405 !important;
}
textarea:focus {
    border-color: hsl(197,100%,47.8%) !important;
}
</style>
</html>
`

}