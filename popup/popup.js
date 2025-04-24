document.addEventListener('DOMContentLoaded', function() {
    const selectedTextDiv = document.getElementById('selectedText');
    const playButton = document.getElementById('playButton');
    const settingsButton = document.getElementById('settingsButton');
    let currentText = '';

    // Get selected text from content script
    function updateSelectedText() {
        browser.tabs.query({active: true, currentWindow: true})
            .then(tabs => {
                return browser.tabs.sendMessage(tabs[0].id, {action: 'getSelectedText'});
            })
            .then(response => {
                if (response && response.text) {
                    currentText = response.text;
                    selectedTextDiv.innerHTML = `<p>${currentText}</p>`;
                    playButton.disabled = false;
                } else {
                    currentText = '';
                    selectedTextDiv.innerHTML = '<p>No text selected</p>';
                    playButton.disabled = true;
                }
            })
            .catch(error => {
                console.error('Error getting selected text:', error);
                selectedTextDiv.innerHTML = '<p>Error getting selected text</p>';
                playButton.disabled = true;
            });
    }

    // Open settings page
    settingsButton.addEventListener('click', function() {
        browser.runtime.openOptionsPage();
    });

    // Play selected text using ElevenLabs API
    playButton.addEventListener('click', function() {
        if (!currentText) return;

        browser.storage.local.get(['apiKey', 'voiceId'])
            .then(result => {
                if (!result.apiKey) {
                    alert('Please set your ElevenLabs API key in the settings first.');
                    return;
                }

                if (!result.voiceId) {
                    alert('Please select a voice in the settings first.');
                    return;
                }

                playButton.disabled = true;
                playButton.textContent = 'Processing...';

                // Call ElevenLabs API
                fetch(`https://api.elevenlabs.io/v1/text-to-speech/${result.voiceId}`, {
                    method: 'POST',
                    headers: {
                        'Accept': 'audio/mpeg',
                        'Content-Type': 'application/json',
                        'xi-api-key': result.apiKey
                    },
                    body: JSON.stringify({
                        text: currentText,
                        model_id: "eleven_monolingual_v1",
                        voice_settings: {
                            stability: 0.5,
                            similarity_boost: 0.5
                        }
                    })
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
                    
                    audio.onended = function() {
                        playButton.disabled = false;
                        playButton.textContent = 'Play Text';
                    };
                })
                .catch(error => {
                    console.error('Error:', error);
                    let errorMessage = 'Error playing text. ';
                    
                    if (error.message.includes('quota')) {
                        errorMessage += 'You have reached your API quota limit.';
                    } else if (error.message.includes('invalid')) {
                        errorMessage += 'Invalid API key. Please check your settings.';
                    } else if (error.message.includes('text too long')) {
                        errorMessage += 'The selected text is too long. Please select a shorter text.';
                    } else {
                        errorMessage += 'Please check your API key and try again.';
                    }
                    
                    alert(errorMessage);
                    playButton.disabled = false;
                    playButton.textContent = 'Play Text';
                });
            });
    });

    // Update selected text when popup opens
    updateSelectedText();

    // Listen for text selection updates
    browser.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        if (request.action === 'textSelected') {
            currentText = request.text;
            selectedTextDiv.innerHTML = `<p>${currentText}</p>`;
            playButton.disabled = false;
        }
    });
}); 