Trusted Web Activity (TWA) setup for Daribati

What these files do
- `public/.well-known/assetlinks.json` — the Digital Asset Links file that must be served from your HTTPS site at `https://<your-domain>/.well-known/assetlinks.json`. Replace placeholders with your Android package name and SHA-256 fingerprint.
- `twa/bubblewrap-config.json` — a Bubblewrap config template. Use it with `bubblewrap init --config twa/bubblewrap-config.json` or copy values when running `bubblewrap init` interactively.

Quick checklist before building a TWA
1. Host your site on HTTPS and ensure the manifest is accessible at `https(s)://<your-domain>/manifest.json`.
2. Make sure `public/manifest.json` has the correct `start_url`, `scope`, `name`, `icons` and `background_color`.
3. Confirm a service worker is generated and working (the app should be installable as a PWA).
4. Add your Android package name and SHA-256 signing fingerprint to `public/.well-known/assetlinks.json`.

How to get the SHA-256 fingerprint
- If you already have a keystore (recommended for releasing):
  Open PowerShell and run (adjust paths/alias):

  # Windows PowerShell
  & "C:\Program Files\Java\jdk-<version>\bin\keytool.exe" -list -v -keystore "C:\path\to\your\keystore.jks" -alias your_alias

  Look for the `SHA256:` line and copy the fingerprint (format as uppercase colon-separated or colon-less, Bubblewrap accepts colon-less).

- For debug builds use the debug key (not recommended for production). The debug keystore is usually in `%USERPROFILE%\.android\debug.keystore` with alias `androiddebugkey` and password `android`.

Create `assetlinks.json` entry example

[
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "com.example.daribati",
      "sha256_cert_fingerprints": [
        "A1B2C3D4E5F6...REPLACE_WITH_REAL_SHA256"
      ]
    }
  }
]

Using Bubblewrap (local steps)
1. Install Bubblewrap CLI (Node.js required):

  npm install -g @bubblewrap/cli

2. Initialize a TWA project (either interactive or using the config file):

  # interactive
  bubblewrap init --manifest=https://YOUR_DOMAIN/manifest.json

  # or using the config file (from repo root)
  bubblewrap init --config=twa/bubblewrap-config.json

3. Build the Android project and APK/AAB (requires Android SDK + build tools):

  cd <generated-android-project>
  # open in Android Studio and build a signed bundle/APK, or
  ./gradlew bundleRelease

Notes about CI / GitHub Actions
- Building a signed Android app in CI requires storing a signing keystore (as a secret) and configuring the Android SDK in the runner. If you want, I can add a workflow template but you'll need to supply secrets (keystore, password, alias).

Troubleshooting
- `assetlinks.json` must be reachable over HTTPS at `/.well-known/assetlinks.json` and return `200`.
- Package name and SHA-256 must match the signed APK/AAB.
- If the app doesn't open links in TWA, check logcat for `DigitalAssetLinks` verification errors.

Want me to do more?
- I can create a GitHub Actions template to build a signed AAB (you'll need to add the keystore as a secret).
- I can run `bubblewrap init` here if you provide the final domain, package name, and (optionally) the signing fingerprint — but I cannot run Android builds in this environment.
- I can verify the PWA (manifest + service worker) more thoroughly and fix `next-pwa` config if needed.

Tell me which next step you'd like: generate a CI workflow, run `bubblewrap init` with your domain/package (no signing key needed for init), or help produce the final `assetlinks.json` with your signing fingerprint.