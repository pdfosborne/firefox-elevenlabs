let selectedText = '';

document.addEventListener('mouseup', function() {
    const text = window.getSelection().toString().trim();
    if (text) {
        selectedText = text;
        browser.runtime.sendMessage({
            action: 'textSelected',
            text: text
        });
    }
});

// Listen for messages from the popup
browser.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === 'getSelectedText') {
        sendResponse({ text: selectedText });
    }
}); 