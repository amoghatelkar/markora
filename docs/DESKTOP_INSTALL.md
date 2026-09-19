# Installing Markora (no Terminal)

Markora desktop builds are open source and distributed from [GitHub Releases](https://github.com/amoghatelkar/markora/releases/latest). Until installers are signed with paid certificates (see [CODE_SIGNING.md](./CODE_SIGNING.md)), each operating system shows a one-time security prompt. You can clear it **using only menus and dialogs** — no command line required.

## macOS (recommended steps)

1. Download **`Markora-*.dmg`** from [Releases](https://github.com/amoghatelkar/markora/releases/latest). The file should be **about 100 MB**. If it is only a few kilobytes, the download failed — try again in another browser.
2. Double-click the `.dmg` to open it.
3. Drag **Markora** into **Applications**.
4. Open **Finder** → **Applications**.
5. **Right-click** (or Control-click) **Markora** → **Open**.
6. In the dialog, click **Open** again.

After this first launch, you can start Markora with a normal double-click.

### If you already double-clicked and macOS blocked the app

1. Open **System Settings** → **Privacy & Security**.
2. Scroll down to the security message about Markora.
3. Click **Open Anyway**, then confirm **Open**.

### When will a normal double-click work without these steps?

When the project publishes **notarized** macOS builds (requires an Apple Developer account on the release pipeline). See [CODE_SIGNING.md](./CODE_SIGNING.md).

## Windows

1. Download **`Markora-Setup-*.exe`** from Releases.
2. Run the installer and finish the setup wizard.
3. If **Microsoft Defender SmartScreen** appears: click **More info** → **Run anyway**.

## Linux (AppImage)

1. Download **`Markora-*.AppImage`** from Releases.
2. In your file manager, open **Downloads**.
3. **Right-click** the AppImage → **Properties** (or **Permissions**).
4. Enable **Allow executing file as program** (exact wording varies by desktop).
5. Close the dialog and **double-click** the AppImage to launch.
