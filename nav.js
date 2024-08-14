function getSourceAsDOM(url) {
    xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", url, false);
    xmlhttp.send();
    parser = new DOMParser();
    return parser.parseFromString(xmlhttp.responseText, "text/html");
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
    document.cookie = 'cookies=' + cvalue + '; path=/; max-age=31536000';
    if (cvalue == "ok") { changeTheme() };
    document.getElementById("cookie-notice").remove();
}

const navhtml = getSourceAsDOM("/nav.html").body.innerHTML;

if (getCookie("cookies") == null) {
    const cookieshtml = getSourceAsDOM("/cookienotice.html").body.innerHTML;
    document.getElementById("header").innerHTML = cookieshtml + navhtml;
} else {
    document.getElementById("header").innerHTML = navhtml;
}