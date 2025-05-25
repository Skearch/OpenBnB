(async () => {
    const Chatbox = (await import('https://cdn.jsdelivr.net/npm/@chaindesk/embeds@latest/dist/chatbox/index.js')).default;

    const user = window.__USER__ || {};
    const agentId = window.__CHAINDESK_AGENT_ID__;

    await Chatbox.initBubble({
        agentId: agentId,
        contact: {
            firstName: user.name ? user.name.split(' ')[0] : '',
            lastName: user.name ? user.name.split(' ').slice(1).join(' ') : '',
            email: user.email || '',
            userId: user.id ? String(user.id) : '',
        },
        initialMessages: [
            user.name ? `Hello ${user.name}, how can I help you today?` : 'Hello, how can I help you today?',
        ],
        context: user.name ? `The user you are talking to is ${user.name}.` : undefined,
    });
})();