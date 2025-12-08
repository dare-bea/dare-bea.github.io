async function getSourceAsDOM(url) {
    const response = await fetch(url);
    const text = await response.text();
    const parser = new DOMParser();
    return parser.parseFromString(text, "text/html");
}

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

/* NAV FUNCTIONS */

const header = document.getElementById("header");
const theme = document.getElementById('theme');
let theme_select;

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

function cookieNotice(cvalue) {
    document.cookie = 'cookies=' + cvalue + '; path=/; max-age=31536000; SameSite=Lax';
    if (cvalue == "ok") { changeTheme() };
    document.getElementById("cookie-notice").remove();
}

const onSettingLoadFuncs = {
    "cl-yuri": function (value) {
        for (const elem of document.getElementsByClassName("yuri")) {
            if (elem.tagName === "details") elem.open = value;
        }
    }
}

const onSettingChangeFuncs = {
    "cl-yuri": function (value) {
        window.location.reload();
    }
}

async function pushThemeSelect () {
    const themeSelectDOM = await getSourceAsDOM("/themeselect.html");
    const navbar = document.getElementById('topnav');
    for (const elem of themeSelectDOM.body.children) {
        navbar.appendChild(elem);
    }
    theme_select = document.getElementById('theme-select');
    if (getCookie("theme") != null) {
        theme_select.value = getCookie("theme");
    }
    changeTheme()

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', changeTheme);
}

async function pushOptions (url) {
    const DOM = await getSourceAsDOM(url);
    const navbar = document.getElementById('topnav');
    for (const elem of DOM.body.children) {
        navbar.appendChild(elem);
        if (!elem.id) continue;
        const cookieValue = getCookie(elem.id);
        if (cookieValue != null) {
            elem.value = cookieValue;
        }
        elem.addEventListener("change", function (e) {
            onSettingChangeFuncs[elem.id]?.(e.target.value)
        });
        onSettingLoadFuncs[elem.id]?.(elem.value);
    }
}

async function loadNavigation() {
    const navDOM = await getSourceAsDOM("/nav.html");
    const navhtml = navDOM.body.innerHTML;
    
    if (getCookie("cookies") == null) {
        const cookiesDOM = await getSourceAsDOM("/cookienotice.html");
        const cookieshtml = cookiesDOM.body.innerHTML;
        header.innerHTML = cookieshtml + navhtml;
    } else {
        header.innerHTML = navhtml;
    }
}

// Call the async function
loadNavigation()
.then(function () {
    if (header.classList.contains("cl-settings")) pushOptions("/clsettings.html");
    if (!header.classList.contains("no-theme")) pushThemeSelect();
})
.then(function () {
    document.body.scrollTop = document.documentElement.scrollTop = 0;
});