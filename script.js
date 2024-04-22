console.log("Hi World!");

const domain = 'https://dev17042024.jp.auth0.com';
const clientId = 'UAFRe3tTy4YwIzvAIZpeGyq9X1smSiQm';
const realm = 'Username-Password-Authentication';
const scopes = 'openid profile';

function validateCreds() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const myHeaders = new Headers();
    myHeaders.append("content-type", "application/x-www-form-urlencoded");

    const urlencoded = new URLSearchParams();
    urlencoded.append("grant_type", "http://auth0.com/oauth/grant-type/password-realm");
    urlencoded.append("username", username);
    urlencoded.append("password", password);
    urlencoded.append("client_id", clientId);
    urlencoded.append("audience", `${domain}/api/v2/`);
    urlencoded.append("scope", scopes);
    urlencoded.append("realm", realm);

    const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: urlencoded,
        redirect: "follow"
    };

    fetch(`${domain}/oauth/token`, requestOptions)
        .then((response) => response.json())
        .then((result) => { //console.log(result.mfa_token);
            document.getElementById('mfatoken').innerText = result.mfa_token;
            alert("Success! Click 'Send OTP'.");
        })
        .catch((error) => console.error(error));
}

function challengeEmail(authenticatorId) {
    const token = document.getElementById('mfatoken').innerText;

    const myHeaders = new Headers();
    myHeaders.append("content-type", "application/json");

    const raw = JSON.stringify({
        "client_id": clientId,
        "mfa_token": token,
        "challenge_type": "oob",
        "authenticator_id": authenticatorId
    });

    const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: raw,
        redirect: "follow"
    };

    fetch(`${domain}/mfa/challenge`, requestOptions)
        .then((response) => response.json())
        .then((result) => { //console.log(result.mfa_token);
            document.getElementById('oobcode').innerText = result.oob_code;
            alert("Success! Input email OTP and click 'Verify email'.");
        })
        .catch((error) => console.error(error));
}

function getAuthenticatorList() {
    const token = document.getElementById('mfatoken').innerText;
    const myHeaders = new Headers();
    myHeaders.append("Authorization", `Bearer ${token}`);

    const requestOptions = {
        method: "GET",
        headers: myHeaders,
        redirect: "follow"
    };

    fetch(`${domain}/mfa/authenticators`, requestOptions)
        .then((response) => response.json())
        .then((result) => { //console.log(result.mfa_token);

            var activeEmailFactor = false;
            for (let i = 0; i < result.length; i++) {
                if (result[i]["oob_channel"] == "email") {
                    activeEmailFactor = true;
                    challengeEmail(result[i]["id"]);
                }
            }

            if (!activeEmailFactor) {
                alert("No active factor found :(");
            }
        })
        .catch((error) => console.error(error));
}

function verifyEmail() {
    const oobcode = document.getElementById('oobcode').innerText;
    const mfatoken = document.getElementById('mfatoken').innerText;
    const otpcode = document.getElementById('emailotp').value;

    const myHeaders = new Headers();
    myHeaders.append("content-type", "application/x-www-form-urlencoded");

    const urlencoded = new URLSearchParams();
    urlencoded.append("grant_type", "http://auth0.com/oauth/grant-type/mfa-oob");
    urlencoded.append("client_id", clientId);
    urlencoded.append("mfa_token", mfatoken);
    urlencoded.append("oob_code", oobcode);
    urlencoded.append("binding_code", otpcode);

    const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: urlencoded,
        redirect: "follow"
    };

    fetch(`${domain}/oauth/token`, requestOptions)
        .then((response) => {
            if (response.ok) {
                return response.json()
            } else {
                throw new Error('Invalid OTP');
            }
        })
        .then((result) => {
            console.log(result);
            alert("Get access token success!");
        })
        .catch((error) => {
            console.error(error)
            alert("Fail! Wrong OTP or timeout.");
        });
}

document.getElementById('validatepwd').addEventListener('click', validateCreds);
document.getElementById('challenge').addEventListener('click', getAuthenticatorList);
document.getElementById('verifyotp').addEventListener('click', verifyEmail);