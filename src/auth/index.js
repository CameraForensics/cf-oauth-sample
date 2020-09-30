import { sha256 } from "js-sha256";
import base64url from "base64url";
import axios from "axios";
import queryString from "query-string";
import uuidv1 from "uuid/v1";

global.Buffer = global.Buffer || require("buffer").Buffer;

var data = JSON.parse(localStorage.getItem("data") || "null");
var user = JSON.parse(localStorage.getItem("user") || "null");

const CLIENT_ID = "ahVnfmNhbWVyYWZvcmVuc2ljcy1sZG5yGAsSC0FwcGxpY2F0aW9uGICAoOOfto0JDA";
const CLIENT_SECRET = "d5c70f7af7934daf9c02edd263476d2f";
const REDIRECT_URI = "http://localhost:3000/";
const CF_SERVER = "https://api.cameraforensics.com";

const generateChallengeAndVerifier = () => {
  let { challenge, verifier, state } = data || {};

  if (!challenge || !verifier || !state) {
    var array = new Uint32Array(10);
    window.crypto.getRandomValues(array);
    verifier = base64url(array);
    challenge = base64url(
      sha256
        .create()
        .update(verifier)
        .digest()
    );
    state = uuidv1();
    data = { challenge, verifier, state };
    localStorage.setItem("data", JSON.stringify(data));
  }
  return data;
};

export const logout = () => {
  user = null;
};

export const getUser = () => {
  return user;
};

export const setUser = newUser => {
  user = newUser;
  localStorage.setItem("user", JSON.stringify(user));
};

export const tokenRequest = (code, verifier, callback) => {
  return axios({
    method: 'post',
    url: `${CF_SERVER}/v1/oauth/token`,
    withCredentials: true,
    data: queryString.stringify({
      code,
      redirect_uri: REDIRECT_URI,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      code_verifier: verifier,
      grant_type: "authorization_code"          
    })
  }).then(response => {
    console.log("Token request: ", response.data);
    setUser(response.data);
    callback(getUser());
  });
};

export const authenticate = (code, callback) => {

  if (code) {
    return tokenRequest(code, data.verifier, callback);
  }

  const user = getUser();
  if (user) {
    return user;
  }

  const { challenge, verifier, state } = generateChallengeAndVerifier();
  var oauthParams = {
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    scope: "profile",
    code_challenge_method: "S256",
    code_challenge: challenge,
    state: state
  };

  const params = queryString.stringify(oauthParams);
  console.log(params);

  return axios({
    method: "get",
    url: `${CF_SERVER}/v1/oauth/authorize?${params}` + params,
    withCredentials: true,
    headers: {
      "No-Redirect": "true"
    }
  }).then(response => {
    // handle success
    if (response.status === 200 && response.data.redirect_uri) {
      window.location = response.data.redirect_uri;
    } else {
      const { code, state } = response.data;
      tokenRequest(code, verifier, callback);
    }
  });
};

export const handleResponse = response => {
  console.log("handleResponse", response, response.status);
  if ([401, 403].indexOf(response.status) !== -1) {
    // auto logout if 401 Unauthorized or 403 Forbidden response returned from api
    console.log("Received a 401 or 403. Removing user...");
    logout();
    window.location.reload(true);
  }

  return response;
};
