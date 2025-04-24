# ElevenLabs TTS Interface (unofficial)

A Firefox extension that converts selected text to speech using ElevenLabs' text-to-speech API.

[Official Link](https://addons.mozilla.org/en-US/firefox/addon/elevenlabs-tts-interface/) - currently experimental release.

## Features

- Convert any selected text on a webpage to speech
- Choose from multiple ElevenLabs voices
- Preview voices before using them
- Simple and intuitive interface
- Customizable keyboard shortcuts

## Installation

1. Download or clone this repository
2. Open Firefox and navigate to `about:debugging`
3. Click "This Firefox" in the left sidebar
4. Click "Load Temporary Add-on"
5. Select the `manifest.json` file from the extension directory

## Configuration

1. Click the extension icon in your Firefox toolbar
2. Click the "Settings" button
3. Enter your ElevenLabs API key (you can get one from [ElevenLabs](https://elevenlabs.io/))
4. Select your preferred voice from the dropdown menu
5. (Optional) Set a custom keyboard shortcut:
   - Click in the shortcut input field
   - Press the keys you want to use (e.g., Ctrl+Shift+Y)
   - The shortcut must include at least two keys
   - Use Ctrl/Command, Shift, and a letter or number
6. Click "Save Settings"

## Usage

### Using the Popup
1. Select any text on a webpage
2. Click the extension icon in your Firefox toolbar
3. The selected text will appear in the popup
4. Click "Play Text" to hear the text-to-speech conversion

### Using Keyboard Shortcuts
- **Default Shortcut**: `Ctrl+Y` (Windows/Linux) or `Command+Y` (Mac)
- **Custom Shortcut**: Use your configured shortcut (if set)

The keyboard shortcut will:
1. Get the currently selected text
2. Use your configured voice and API key
3. Play the text immediately
4. Show a notification if there's an error

## Voice Selection

The extension includes several pre-configured voices:
- Rachel (Female)
- Adam (Male)
- Domi (Female)
- Josh (Male)

You can preview each voice in the settings page before using it.

## Troubleshooting

If you encounter any issues:

1. **Invalid API Key**: Make sure you've entered your ElevenLabs API key correctly in the settings
2. **Quota Exceeded**: You may have reached your API quota limit. Check your ElevenLabs account for usage details
3. **Text Too Long**: The selected text may be too long. Try selecting a shorter portion of text
4. **No Audio**: Ensure your system's audio is working and not muted
5. **Keyboard Shortcut Not Working**: 
   - Make sure you have configured the extension with an API key and voice
   - Check if the shortcut conflicts with other extensions
   - Try selecting text before using the shortcut
   - Ensure your custom shortcut includes at least two keys
   - Try using the default shortcut if your custom one doesn't work

## Privacy

This extension:
- Only sends the text you select to ElevenLabs' API
- Stores your API key locally in your browser
- Does not collect or transmit any other data

## License

This project is licensed under the MIT License - see the LICENSE file for details. 

It is an unofficial extension created as a personal project to enable quick access to Elevenlabs TTS. Please feel free to report issues but I take no responsability for unintended usage of the project or deviations. Use at your own risk, and please act responsibly.
