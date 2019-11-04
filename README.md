# Sample OAuth2.0 + PKCE Integration

This application showcases a sample frontend only javascript implementation of OAuth2.0 + PKCE integration against CameraForensics.com.

It's probably not the best javascript ever, but its purpose is to illustrate how someone might get the integration working.

## How do I run it?
First of all, you need to configure it.

Open up `src/auth/index.js` and populate the `CLIENT_ID`, `CLIENT_SECRET` and `REDIRECT_URI` fields with your own data.

The `REDIRECT_URI` field should be `http://localhost:3000/` for this to work standalone. This means that you should have created an Application on [CameraForensics.com](https://www.cameraforensics.com/settings) with that as the `Callback URL`.

Then you can run it:

```
$ yarn start
```

The application will open at `http://localhost:3000/`

It will automatically attempt to authenticate you against CameraForensics.com. When authenticated, it will show an output of the data available from the access token.