document.addEventListener('DOMContentLoaded', function() {
    const apiKeyInput = document.getElementById('apiKey');
    const voiceIdSelect = document.getElementById('voiceId');
    const shortcutInput = document.getElementById('shortcut');
    const clearShortcutButton = document.getElementById('clearShortcut');
    const saveButton = document.getElementById('save');
    const statusDiv = document.getElementById('status');
    const previewKeys = document.getElementById('previewKeys');
    const resetShortcutButton = document.getElementById('resetShortcut');
    const voicePreviewStatus = document.getElementById('voicePreviewStatus');

    let currentKeys = [];
    let isRecording = false;
    const DEFAULT_SHORTCUT = 'Ctrl+Y';
    const PREVIEW_TEXT = 'Thank you for trying out our extension, please select the voice you find most comfortable';
    let currentAudio = null;

    // Load saved settings
    browser.storage.local.get(['apiKey', 'voiceId', 'shortcut'])
        .then(result => {
            if (result.apiKey) {
                apiKeyInput.value = result.apiKey;
            }
            if (result.voiceId) {
                voiceIdSelect.value = result.voiceId;
            }
            if (result.shortcut) {
                shortcutInput.value = result.shortcut;
                updateShortcutPreview(result.shortcut);
            } else {
                shortcutInput.value = DEFAULT_SHORTCUT;
                updateShortcutPreview(DEFAULT_SHORTCUT);
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

    // Handle shortcut recording
    shortcutInput.addEventListener('focus', function() {
        isRecording = true;
        currentKeys = [];
        shortcutInput.value = 'Press keys...';
    });

    shortcutInput.addEventListener('blur', function() {
        isRecording = false;
        if (currentKeys.length === 0) {
            shortcutInput.value = DEFAULT_SHORTCUT;
            updateShortcutPreview(DEFAULT_SHORTCUT);
        }
    });

    document.addEventListener('keydown', function(e) {
        if (!isRecording) return;
        
        e.preventDefault();
        
        // Only allow modifier keys and alphanumeric keys
        if (e.key === 'Control' || e.key === 'Shift' || e.key === 'Meta' || e.key === 'Alt' || 
            /^[a-zA-Z0-9]$/.test(e.key)) {
            
            if (!currentKeys.includes(e.key)) {
                currentKeys.push(e.key);
                updateShortcutDisplay();
            }
        }
    });

    document.addEventListener('keyup', function(e) {
        if (!isRecording) return;
        
        const index = currentKeys.indexOf(e.key);
        if (index !== -1) {
            currentKeys.splice(index, 1);
            if (currentKeys.length === 0) {
                shortcutInput.value = DEFAULT_SHORTCUT;
                updateShortcutPreview(DEFAULT_SHORTCUT);
            }
        }
    });

    function updateShortcutDisplay() {
        const keys = currentKeys.map(key => {
            if (key === 'Control') return 'Ctrl';
            if (key === 'Meta') return 'Cmd';
            if (key === 'Alt') return 'Alt';
            return key.toUpperCase();
        });
        const shortcut = keys.join('+');
        shortcutInput.value = shortcut;
        updateShortcutPreview(shortcut);
    }

    function updateShortcutPreview(shortcut) {
        previewKeys.textContent = shortcut;
    }

    clearShortcutButton.addEventListener('click', function() {
        currentKeys = [];
        shortcutInput.value = DEFAULT_SHORTCUT;
        updateShortcutPreview(DEFAULT_SHORTCUT);
    });

    resetShortcutButton.addEventListener('click', function() {
        currentKeys = [];
        shortcutInput.value = DEFAULT_SHORTCUT;
        updateShortcutPreview(DEFAULT_SHORTCUT);
    });

    saveButton.addEventListener('click', function() {
        const apiKey = apiKeyInput.value.trim();
        const voiceId = voiceIdSelect.value;
        const shortcut = shortcutInput.value;
        
        if (!apiKey) {
            showStatus('Please enter an API key', 'error');
            return;
        }

        if (shortcut && !hasModifierKey(currentKeys)) {
            showStatus('Shortcut must include at least one modifier key (Ctrl, Alt, Command, or Shift)', 'error');
            return;
        }

        browser.storage.local.set({ 
            apiKey: apiKey,
            voiceId: voiceId,
            shortcut: shortcut
        })
        .then(() => {
            // Update the command shortcut
            if (shortcut) {
                return browser.commands.update({
                    name: 'play-selected-text',
                    shortcut: shortcut
                });
            }
        })
        .then(() => {
            showStatus('Settings saved successfully!', 'success');
        })
        .catch(error => {
            showStatus('Error saving settings: ' + error.message, 'error');
        });
    });

    function hasModifierKey(keys) {
        return keys.some(key => ['Control', 'Shift', 'Meta', 'Alt'].includes(key));
    }

    function showStatus(message, type) {
        statusDiv.textContent = message;
        statusDiv.className = 'status ' + type;
        statusDiv.style.display = 'block';
        
        setTimeout(() => {
            statusDiv.style.display = 'none';
        }, 3000);
    }
}); 