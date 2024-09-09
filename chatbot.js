const qrcode = require('qrcode-terminal');
const { Client, Buttons } = require('whatsapp-web.js');

const client = new Client({
    puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('Tudo certo! WhatsApp conectado.');
});

client.initialize();

const delay = ms => new Promise(res => setTimeout(res, ms));

const userStates = {};

client.on('message', async msg => {
    const chat = await msg.getChat();
    const contact = await msg.getContact();
    const name = contact.pushname.split(" ")[0];

    if (!userStates[msg.from]) {
        const buttons = new Buttons('Olá ' + name + ', sou o assistente virtual. Escolha uma das opções abaixo:', [
            { id: 'btn1', body: 'Falar com atendente' },
            { id: 'btn2', body: 'Ver opções de serviço' }
        ], 'Bem-vindo!', 'Escolha uma opção');
        
        await client.sendMessage(msg.from, buttons);
        userStates[msg.from] = 'inicial'; 
    } 
    else if (userStates[msg.from] === 'inicial') {
        if (msg.body === 'Falar com atendente' || msg.body === '1') {
            await client.sendMessage(msg.from, 'Encaminhando você para um atendente. Por favor, aguarde...');
            userStates[msg.from] = 'atendente';
        } 
        else if (msg.body === 'Ver opções de serviço' || msg.body === '2') {
            await client.sendMessage(msg.from, 'Aqui estão as opções de serviço:');
            userStates[msg.from] = 'menu'; 
        }
    } 
    else if (userStates[msg.from] === 'menu') {
        if (msg.body === '1') {
            await delay(3000);
            await chat.sendStateTyping(); 
            await client.sendMessage(msg.from, 'Nosso serviço oferece consultas médicas 24 horas...');
        } 
        else if (msg.body === '2') {
            await delay(3000);
            await chat.sendStateTyping();
            await client.sendMessage(msg.from, 'Planos disponíveis: ...');
        }
    }

    // Se o usuário escolheu falar com o atendente, parar a automação para ele
    if (userStates[msg.from] === 'atendente') {
        console.log(`Usuário ${msg.from} está com o atendente. Nenhuma resposta automática será enviada.`);
        return; 
    }
});