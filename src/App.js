import React from "react";
import "./App.css";
import queryString from "query-string";
import jwtDecode from "jwt-decode";
import { authenticate, getUser } from "./auth";

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      user: getUser()
    };
  }

  onUser = user => {
    this.setState({ user });
  };

  componentDidMount() {
    const params = queryString.parse(window.location.search || {});
    const user = getUser();
    if (!user) {
      authenticate(params.code, this.onUser);
    }
  }

  render() {
    const user = getUser();

    var decodedToken = {};
    if (user && user.access_token) {
      decodedToken = jwtDecode(user.access_token);
    }

    return (
      <div className="App">
        {user && (
          <>
            <h2>Congratulations! You are authenticated.</h2>
            <dl>
              <dt>Access Token</dt>
              <dd>{user.access_token}</dd>
              <dt>Refresh Token</dt>
              <dd>{user.refresh_token}</dd>
              <dt>Token Type</dt>
              <dd>{user.token_type}</dd>
              <dt>Expires In</dt>
              <dd>{user.expires_in}</dd>
              <dt>Decoded JWT</dt>
              <dd><dl>{Object.keys(decodedToken).map((key, index) => {
                return <><dt>{key}</dt><dd>{decodedToken[key].toString()}</dd></>
              })}</dl></dd>
            </dl>
          </>
        )}{" "}
        {!user && "Authenticating..."}
      </div>
    );
  }
}

export default App;
