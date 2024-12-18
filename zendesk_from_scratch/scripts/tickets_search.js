/* eslint-disable no-console */
const axios = require("axios");
const fs = require("fs");

// Zendesk API credentials
const ZENDESK_SUBDOMAIN = "autnomo6392";
const ZENDESK_USERNAME = "transatlanticointercontinental@gmail.com";
const ZENDESK_API_TOKEN = "zljr4cOr2T6yQncAHVZDYQClP6yGTc49CGfGakX7";

const AUTH_HEADER = {
  Authorization: `Basic ${Buffer.from(`${ZENDESK_USERNAME}/token:${ZENDESK_API_TOKEN}`).toString("base64")}`,
};

// Date range for "today" in UTC
const today = new Date();
const utcStart = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate(), 0, 0, 0)).toISOString();
const utcEnd = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate(), 23, 59, 59)).toISOString();

// API URLs
const ACTIVE_TICKETS_URL = `https://${ZENDESK_SUBDOMAIN}.zendesk.com/api/v2/search.json?query=type:ticket created>=${utcStart} created<=${utcEnd}`;
// Function to fetch tickets with pagination
async function fetchTickets(url, label) {
  let tickets = [];
  let nextPage = url;

  try {
    while (nextPage) {
      const response = await axios.get(nextPage, { headers: AUTH_HEADER });
      console.log(`Fetched ${response.data.results.length} ${label} tickets.`);
      tickets = tickets.concat(response.data.results);
      nextPage = response.data.next_page;
    }
  } catch (error) {
    console.error(`Error fetching ${label} tickets:`, error.response?.data || error.message);
  }

  return tickets;
}

// Function to save tickets to a JSON file
function saveTicketsToFile(tickets) {
  const filePath = "tickets_found.json";
  fs.writeFileSync(filePath, JSON.stringify(tickets, null, 2));
  console.log(`\nTickets successfully saved to ${filePath}`);
}

// Main function to combine active and deleted tickets
async function findTickets() {
  console.log("Fetching active tickets created today...");
  const activeTickets = await fetchTickets(ACTIVE_TICKETS_URL, "active");

  console.log(`\nTotal tickets found: ${activeTickets.length}`);
  saveTicketsToFile(activeTickets);
}

// Run the main function
findTickets();
