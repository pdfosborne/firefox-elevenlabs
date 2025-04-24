// Listen for installation
browser.runtime.onInstalled.addListener(function() {
    console.log('Extension installed');
});

// Listen for keyboard shortcut
browser.commands.onCommand.addListener(function(command) {
    if (command === "play-selected-text") {
        // Get the selected text from the active tab
        browser.tabs.query({active: true, currentWindow: true})
            .then(tabs => {
                return browser.tabs.sendMessage(tabs[0].id, {action: 'getSelectedText'});
            })
            .then(response => {
                if (response && response.text) {
                    // Get API key and voice ID
                    return browser.storage.local.get(['apiKey', 'voiceId'])
                        .then(result => {
                            if (!result.apiKey || !result.voiceId) {
                                throw new Error('API key or voice not configured');
                            }
                            return {text: response.text, apiKey: result.apiKey, voiceId: result.voiceId};
                        });
                }
                throw new Error('No text selected');
            })
            .then(data => {
                // Call ElevenLabs API
                return fetch(`https://api.elevenlabs.io/v1/text-to-speech/${data.voiceId}`, {
                    method: 'POST',
                    headers: {
                        'Accept': 'audio/mpeg',
                        'Content-Type': 'application/json',
                        'xi-api-key': data.apiKey
                    },
                    body: JSON.stringify({
                        text: data.text,
                        model_id: "eleven_monolingual_v1",
                        voice_settings: {
                            stability: 0.5,
                            similarity_boost: 0.5
                        }
                    })
                });
            })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(err => {
                        throw new Error(err.detail || 'API request failed');
                    });
                }
                return response.blob();
            })
            .then(blob => {
                const audioUrl = URL.createObjectURL(blob);
                const audio = new Audio(audioUrl);
                audio.play();
            })
            .catch(error => {
                console.error('Error playing text:', error);
                // Show error notification
                browser.notifications.create({
                    type: 'basic',
                    iconUrl: 'icons/icon-48.png',
                    title: 'ElevenLabs Error',
                    message: error.message
                });
            });
    }
});

// Example background functionality
browser.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === "getTabInfo") {
        browser.tabs.query({active: true, currentWindow: true})
            .then(tabs => {
                sendResponse({url: tabs[0].url});
            });
        return true; // Required for async response
    }
}); 