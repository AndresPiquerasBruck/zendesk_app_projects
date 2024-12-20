const axios = require('axios');

// Configuración de Zendesk
const ZENDESK_SUBDOMAIN = 'autnomo6392';
const ZENDESK_EMAIL = 'transatlanticointercontinental@gmail.com';
const ZENDESK_API_TOKEN = '6RKKhJttDqNn4LnxGREzdYy6uDUsdPLXU5G3rN4U';

// Configuración de Slack
const SLACK_BOT_TOKEN = 'xoxb-8176680254743-8194907626197-JmselKxF9sZfoQSYhMBnbMGV';
const SLACK_CHANNEL_ID = 'C085ZTHAVBK'; // Replace with your channel ID

// Almacén de tickets enviados
const notifiedTickets = new Set();

// Función para obtener tickets nuevos de Zendesk
async function fetchZendeskTickets() {
  const url = `https://${ZENDESK_SUBDOMAIN}.zendesk.com/api/v2/tickets.json`;
  const auth = Buffer.from(`${ZENDESK_EMAIL}/token:${ZENDESK_API_TOKEN}`).toString('base64');

  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `Basic ${auth}`,
      },
    });
    return response.data.tickets;
  } catch (error) {
    console.error('Error fetching tickets from Zendesk:', error.response?.data || error.message);
    return [];
  }
}

// Función para enviar un mensaje a Slack
async function sendToSlack(ticket) {
  const url = 'https://slack.com/api/chat.postMessage';

  const payload = {
    channel: SLACK_CHANNEL_ID,
    text: `Nuevo ticket creado: *${ticket.subject}*`,
    attachments: [
      {
        title: ticket.subject,
        text: ticket.description,
        title_link: `https://${ZENDESK_SUBDOMAIN}.zendesk.com/agent/tickets/${ticket.id}`,
        color: '#36a64f',
      },
    ],
  };

  try {
    const response = await axios.post(url, payload, {
      headers: {
        Authorization: `Bearer ${SLACK_BOT_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });
    console.log(`Mensaje enviado a Slack para el ticket ID: ${ticket.id}`);
  } catch (error) {
    console.error('Error sending message to Slack:', error.response?.data || error.message);
  }
}

// Función principal
async function main() {
  console.log('Iniciando integración Zendesk-Slack...');
  while (true) {
    try {
      const tickets = await fetchZendeskTickets();
      for (const ticket of tickets) {
        if (!notifiedTickets.has(ticket.id)) {
          await sendToSlack(ticket);
          notifiedTickets.add(ticket.id);
        }
      }
    } catch (error) {
      console.error('Error en el ciclo principal:', error.message);
    }
    await new Promise((resolve) => setTimeout(resolve, 60000)); // Esperar 1 minuto antes de volver a consultar
  }
}

// Ejecutar el script
main();
