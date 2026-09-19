# Code signing & notarization (maintainers)

End users on macOS can install without Terminal once builds are **signed** and **notarized**. Windows SmartScreen is much quieter with an Authenticode certificate. Linux AppImages do not require signing.

## macOS (double-click install)

1. Enroll in the [Apple Developer Program](https://developer.apple.com/programs/) ($99/year).
2. Create a **Developer ID Application** certificate and export it as a `.p12` file.
3. Add these **GitHub repository secrets** (Settings → Secrets and variables → Actions):

   | Secret | Value |
   |--------|--------|
   | `CSC_LINK` | Base64-encoded `.p12` (`base64 -i cert.p12 \| pbcopy`) |
   | `CSC_KEY_PASSWORD` | Password for the `.p12` |
   | `APPLE_ID` | Apple ID email used for notarization |
   | `APPLE_APP_SPECIFIC_PASSWORD` | App-specific password from appleid.apple.com |
   | `APPLE_TEAM_ID` | Team ID from Apple Developer → Membership |

4. On the next tag push (`v*`), the Release workflow passes these to `electron-builder`, which signs with hardened runtime and submits to Apple for notarization.

5. When secrets are configured, add to the `build.mac` section in `package.json` before tagging:

   ```json
   "hardenedRuntime": true,
   "entitlements": "build/entitlements.mac.plist",
   "entitlementsInherit": "build/entitlements.mac.plist"
   ```

   Remove `"identity": "-"` so electron-builder uses the Developer ID certificate from `CSC_LINK`.

Files used: `build/entitlements.mac.plist`.

## Windows

Add an Authenticode certificate as `CSC_LINK` / `CSC_KEY_PASSWORD` on the Windows job (or a separate secret pair). Without it, users use **More info → Run anyway** once.

## Verifying a release

- macOS: `spctl -a -vv -t install release/*.dmg` should report a trusted/notarized app when signing is enabled.
- Ensure `package.json` `version` matches the git tag before pushing the tag so asset names align with the release.
