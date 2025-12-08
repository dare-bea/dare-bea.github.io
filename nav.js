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

let header;
let theme;
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
        switch (value) {
            case "hide": {
                for (const elem of document.getElementsByClassName("yuri")) {
                    if (elem.tagName === "DETAILS") {
                        elem.open = false;
                    } else {
                        const notice = document.createElement("span");
                        notice.innerText = "Hidden Content";
                        const showButton = document.createElement("button");
                        showButton.innerText = "Show";
                        showButton.addEventListener("click", function (e) {
                            elem.hidden = !elem.hidden;
                            showButton.innerText = elem.hidden ? "Show" : "Hide"
                        });
                        notice.appendChild(showButton);
                        elem.hidden = true;
                        elem.parentNode.insertBefore(notice, elem);
                    }
                }
                break;
            }
            case "show":
            default: {
                for (const elem of document.getElementsByClassName("yuri")) {
                    if (elem.tagName === "DETAILS") elem.open = true;
                }
                break;
            }
        }
    }
};

const onSettingChangeFuncs = {
    "cl-yuri": function (value) {
        window.location.reload(true);
    }
};

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
        for (const child of elem.getElementsByTagName("*")) {
            const id = child.id;
            if (!id) continue;
            const cookieValue = getCookie(id);
            if (cookieValue != null) {
                child.value = cookieValue;
            }
            child.addEventListener("change", function (e) {
                if (getCookie("cookies") == "ok") {
                    document.cookie = `${id}=${e.target.value}; path=/; max-age=2419200; SameSite=Lax`;
                }
                onSettingChangeFuncs[id]?.(e.target.value);
            });
            onSettingLoadFuncs[id]?.(child.value);
        }
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

document.addEventListener('DOMContentLoaded', function() {
    header = document.getElementById("header");
    theme = document.getElementById('theme');

    loadNavigation()
    .then(function () {
        if (header.classList.contains("cl-settings")) pushOptions("/clsettings.html");
        if (!header.classList.contains("no-theme")) pushThemeSelect();
    })
    .then(function () {
        document.body.scrollTop = document.documentElement.scrollTop = 0;
    });
})