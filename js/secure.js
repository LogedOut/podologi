// Защищенный код для отправки сообщений
(function(){
    const _0x2f1d=['7875207475:AAHGhqBu8SWt-COfJA43WKH92cegu5HMuOU','-1002351032302'];
    const _0x3e4b=function(_0x2f1d){return atob(_0x2f1d);};
    
    window.sendTelegramMessage = async function(name, phone) {
        try {
            const message = `🔔 Новая заявка на обратный звонок!\n\n👤 Имя: ${name}\n📞 Телефон: ${phone}\n\n📅 Дата: ${new Date().toLocaleString()}`;
            const response = await fetch(`https://api.telegram.org/bot${_0x2f1d[0]}/sendMessage`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    chat_id: _0x2f1d[1],
                    text: message
                })
            });

            return response.ok;
        } catch (error) {
            console.error('Error sending message:', error);
            return false;
        }
    };
})();
