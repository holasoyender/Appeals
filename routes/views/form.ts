export function getFormHTML(user:any) {

    let avatar = `https://cdn.discordapp.com/avatars/${user.ID}/${user.Avatar}.webp`

    return `
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">

        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css" 
        integrity="sha384-JcKb8q3iqJ61gNV9KGb8thSsNjpSL0n8PARn9HuZOnIxN0hoP+VmmDGMN5t9UJ0Z" crossorigin="anonymous">
        <link href="https://fonts.googleapis.com/css2?family=Fira+Sans&display=swap" rel="stylesheet">

        <title>Formulario de apelación de ban</title>
    </head>
    <body>
        <div class="jumbotron text-center">
            <h1>Formulario de apelación de ban</h1>
        </div>

        <div class="container mb-3">
            <div class="d-flex">
                <img id="avatar" class="rounded-circle" width="64" height="64" alt="Your avatar" src= "${avatar}">
                <h2 id="username" class="ml-3 mb-0 align-self-center">${user.Tag}</h2>
            </div>

            <form class="mt-3" name="appeal" action="form/get">
                
                <div class="form-group">
                    <label for="banReason">¿Por qué has sido baneado?</label>
                    <div class="textInput">
                        <textarea class="form-control" id="banReason" name="banReason" required maxlength="100"></textarea>
                        <div class="remainingLength"></div>
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="appealText">¿Por qué crees que deberíamos levantarte el ban?</label>
                    <div class="textInput">
                        <textarea class="form-control" id="appealText" name="appealText" required maxlength="1024"></textarea>
                        <div class="remainingLength"></div>
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="futureActions">¿Qué harás para evitar ser baneado en el futuro?</label>
                    <div class="textInput">
                        <textarea class="form-control" id="futureActions" name="futureActions" required maxlength="1024"></textarea>
                        <div class="remainingLength"></div>
                    </div>
                </div>
                
                <div class="text-right">
                    <button type="submit" class="btn">Enviar</button>
                </div>
                
            </form>
        </div>

        <script>

            [...document.getElementsByClassName("textInput")].forEach(div => {
                const textarea = div.firstElementChild;

                const updateTextarea = () => {
                    textarea.style.height = "auto";
                    textarea.style.height = textarea.scrollHeight+"px";

                    const charactersRemaining = textarea.maxLength - textarea.textLength;
                    const remainingLength = div.lastElementChild;
                    if (charactersRemaining <= 50) {
                        remainingLength.classList.add("lowOnSpace");
                    } else {
                        remainingLength.classList.remove("lowOnSpace");
                    }
                    remainingLength.textContent = charactersRemaining;
                }

                updateTextarea();
                textarea.oninput = updateTextarea;
            })
           
        </script>
    </body>
    <style>
        body {
    background: #36393f;

    font-family: 'Fira Sans', sans-serif;
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

label.radio {
    position: relative;
    display: block;
    padding: 10px;

    border-radius: 4px;
    background-color: #2f3136;
    color: #b9bbbe;

    margin-bottom: 8px;

    cursor: pointer;
}

label.radio:hover {
    background-color: rgba(79,84,92,0.16);
    color: #dcddde;
}

label.radio.checked {
    background-color: #202225;
    color: #ffffff;
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

label.radio > .checkmark {
    position: absolute;
    top: 12px;
    left: 12px;
    height: 20px;
    width: 20px;
    padding: 3px;

    border-radius: 50%;
    border-width: 2px;
    border-color: #b9bbbe;
    border-style: solid;
}

label.radio:hover > .checkmark {
    border-color: #dcddde;
}

label.radio.checked > .checkmark {
    border-color: #ffffff;
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

.textInput {
    position: relative;
}

.remainingLength {
    position: absolute;
    bottom: 12px;
    right: 14px;
    font-size: 12px;
    font-family: monospace;
    pointer-events: none;
    color: #72767d;
}

.lowOnSpace {
    color: #f36c6c;
}

#username {
    color: white;
}

    </style>
</html>
`
}