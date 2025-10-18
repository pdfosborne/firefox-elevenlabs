document.addEventListener('DOMContentLoaded', function() {
    const apiKeyInput = document.getElementById('apiKey');
    const voiceIdSelect = document.getElementById('voiceId');
    const saveButton = document.getElementById('save');
    const statusDiv = document.getElementById('status');
    const voicePreviewStatus = document.getElementById('voicePreviewStatus');

    const DEFAULT_SHORTCUT = 'Ctrl+Y';
    const PREVIEW_TEXT = 'Thank you for trying out our extension, please select the voice you find most comfortable';
    let currentAudio = null;

    // Load saved settings
    browser.storage.local.get(['apiKey', 'voiceId'])
        .then(result => {
            if (result.apiKey) {
                apiKeyInput.value = result.apiKey;
            }
            if (result.voiceId) {
                voiceIdSelect.value = result.voiceId;
            }
        });

    // Handle voice selection change
    voiceIdSelect.addEventListener('change', async function() {
        const apiKey = apiKeyInput.value.trim();
        const voiceId = voiceIdSelect.value;
        
        if (!apiKey) {
            showStatus('Please enter an API key first', 'error');
            return;
        }

        // Stop any currently playing audio
        if (currentAudio) {
            currentAudio.pause();
            currentAudio = null;
        }

        voicePreviewStatus.style.display = 'block';

        try {
            const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
                method: 'POST',
                headers: {
                    'Accept': 'audio/mpeg',
                    'Content-Type': 'application/json',
                    'xi-api-key': apiKey
                },
                body: JSON.stringify({
                    text: PREVIEW_TEXT,
                    model_id: "eleven_monolingual_v1",
                    voice_settings: {
                        stability: 0.5,
                        similarity_boost: 0.5
                    }
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || 'API request failed');
            }

            const blob = await response.blob();
            const audioUrl = URL.createObjectURL(blob);
            currentAudio = new Audio();
            
            currentAudio.src = audioUrl;
            currentAudio.type = 'audio/mpeg';
            
            currentAudio.onended = () => {
                voicePreviewStatus.style.display = 'none';
                URL.revokeObjectURL(audioUrl);
                currentAudio = null;
            };

            currentAudio.onerror = (e) => {
                console.error('Audio error:', e);
                showStatus('Error playing voice preview', 'error');
                voicePreviewStatus.style.display = 'none';
                URL.revokeObjectURL(audioUrl);
                currentAudio = null;
            };

            await currentAudio.play();
        } catch (error) {
            console.error('Preview error:', error);
            showStatus(`Error: ${error.message}`, 'error');
            voicePreviewStatus.style.display = 'none';
        }
    });

    saveButton.addEventListener('click', function() {
        const apiKey = apiKeyInput.value.trim();
        const voiceId = voiceIdSelect.value;
        
        if (!apiKey) {
            showStatus('Please enter an API key', 'error');
            return;
        }

        browser.storage.local.set({ 
            apiKey: apiKey,
            voiceId: voiceId,
            shortcut: DEFAULT_SHORTCUT
        })
        .then(() => {
            // Update the command shortcut to the fixed Ctrl+Y
            return browser.commands.update({
                name: 'play-selected-text',
                shortcut: DEFAULT_SHORTCUT
            });
        })
        .then(() => {
            showStatus('Settings saved successfully!', 'success');
        })
        .catch(error => {
            showStatus('Error saving settings: ' + error.message, 'error');
        });
    });

    function showStatus(message, type) {
        statusDiv.textContent = message;
        statusDiv.className = 'status ' + type;
        statusDiv.style.display = 'block';
        
        setTimeout(() => {
            statusDiv.style.display = 'none';
        }, 3000);
    }
}); 