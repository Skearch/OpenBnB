document.addEventListener('DOMContentLoaded', async () => {
    const messageList = document.getElementById('message-list');
    const messageForm = document.getElementById('messageForm');

    if (messageList) {
        try {
            const response = await fetch('/api/messages');
            const messages = await response.json();
            messages.forEach(message => {
                const div = `
            <div class="card">
              <div class="card-content">
                <p><strong>From:</strong> User ${message.senderId}</p>
                <p>${message.content}</p>
                <p><small>${new Date(message.timestamp).toLocaleString()}</small></p>
              </div>
            </div>`;
                messageList.innerHTML += div;
            });
        } catch (error) {
            alert('Error loading messages');
        }
    }

    if (messageForm) {
        messageForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const receiverId = document.getElementById('receiverId').value;
            const content = document.getElementById('content').value;

            try {
                const response = await fetch('/api/messages', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ receiverId: Number(receiverId), content }),
                });
                const data = await response.json();
                if (response.ok) {
                    window.location.reload();
                } else {
                    alert(data.message);
                }
            } catch (error) {
                alert('Error sending message');
            }
        });
    }
});