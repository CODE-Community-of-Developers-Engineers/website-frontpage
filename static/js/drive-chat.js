const widget = document.getElementById('drive-chat-widget');
const toggle = document.getElementById('drive-chat-toggle');
const form = document.getElementById('drive-chat-form');
const input = document.getElementById('drive-chat-question');
const messages = document.getElementById('drive-chat-messages');
const endpoint = 'https://run.blaxel.ai/coffee-code-philly/agents/ccp-drive-chat';
const storageKey = 'ccpDriveChatMessages';
const openKey = 'ccpDriveChatOpen';

function savedMessages() {
    return JSON.parse(localStorage.getItem(storageKey) || '[]');
}

function saveMessage(message) {
    const items = savedMessages().concat(message).slice(-20);
    localStorage.setItem(storageKey, JSON.stringify(items));
}

function addMessage(text, kind, citations, save = true) {
    const item = document.createElement('div');
    item.className = `drive-chat-message drive-chat-message-${kind}`;

    const body = document.createElement('p');
    body.textContent = text;
    item.appendChild(body);

    if (citations && citations.length) {
        const links = document.createElement('div');
        links.className = 'drive-chat-citations';
        citations.forEach((url, index) => {
            const link = document.createElement('a');
            link.href = url;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            link.textContent = `Source ${index + 1}`;
            links.appendChild(link);
        });
        item.appendChild(links);
    }

    messages.appendChild(item);
    messages.scrollTop = messages.scrollHeight;
    if (save) saveMessage({ text, kind, citations: citations || [] });
    return item;
}

function setOpen(isOpen) {
    widget.classList.toggle('is-collapsed', !isOpen);
    toggle.setAttribute('aria-expanded', String(isOpen));
    localStorage.setItem(openKey, isOpen ? '1' : '0');
}

savedMessages().forEach((message) => addMessage(message.text, message.kind, message.citations, false));
if (!messages.children.length) addMessage('What would you like to know?', 'agent');
setOpen(localStorage.getItem(openKey) !== '0');

toggle.addEventListener('click', () => {
    setOpen(widget.classList.contains('is-collapsed'));
});

form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const question = input.value.trim();
    if (!question) return;

    addMessage(question, 'user');
    input.value = '';
    input.disabled = true;
    form.querySelector('button').disabled = true;
    const pending = addMessage('Checking the docs...', 'agent', [], false);

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ inputs: { question } }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Chat request failed');
        pending.remove();
        addMessage(data.answer || 'No answer returned.', 'agent', data.citations || []);
    } catch (error) {
        pending.remove();
        addMessage('The docs chat is unavailable right now. Try again in a minute.', 'agent');
    } finally {
        input.disabled = false;
        form.querySelector('button').disabled = false;
        input.focus();
    }
});
