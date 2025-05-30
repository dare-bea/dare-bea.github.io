function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return null;
}

function changeTheme() {
    var theme_url = theme_select.value;
    if (getCookie("cookies") == "ok") {
        document.cookie = "theme=" + theme_url + "; path=/; max-age=2419200; SameSite=Lax";
    }
    if (theme_url == "os-default") {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            theme_url = "/css/dark.css";
        } else {
            theme_url = "/css/light.css"
        }
    }
    theme.setAttribute('href', theme_url);
}

function runTheme () {
    const theme = document.getElementById('theme');
    window.theme_select = document.getElementById('theme-select');
    if (getCookie("theme") != null) {
        theme_select.value = getCookie("theme");
    }
    changeTheme()

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', changeTheme);
}