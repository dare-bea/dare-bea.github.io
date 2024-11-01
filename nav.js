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

function cookieNotice(cvalue) {
    document.cookie = 'cookies=' + cvalue + '; path=/; max-age=31536000; SameSite=Lax';
    if (cvalue == "ok") { changeTheme() };
    document.getElementById("cookie-notice").remove();
}

async function loadNavigation() {
    const navDOM = await getSourceAsDOM("/nav.html");
    const navhtml = navDOM.body.innerHTML;
    
    if (getCookie("cookies") == null) {
        const cookiesDOM = await getSourceAsDOM("/cookienotice.html");
        const cookieshtml = cookiesDOM.body.innerHTML;
        document.getElementById("header").innerHTML = cookieshtml + navhtml;
    } else {
        document.getElementById("header").innerHTML = navhtml;
    }
}

// Call the async function
loadNavigation()
.then(runTheme);
