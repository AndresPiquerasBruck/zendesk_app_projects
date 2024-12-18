const axios = require("axios");

// Zendesk API credentials
const zendeskSubdomain = "autnomo6392";
const zendeskUsername = "transatlanticointercontinental@gmail.com";
const zendeskApiToken = "zljr4cOr2T6yQncAHVZDYQClP6yGTc49CGfGakX7";

const authString = Buffer.from(`${zendeskUsername}/token:${zendeskApiToken}`).toString("base64");
const zendeskUrl = `https://${zendeskSubdomain}.zendesk.com/api/v2/tickets`;

// Function to fetch users from the server
async function fetchUsersFromServer() {
  try {
    const response = await axios.get("http://localhost:3000/customers");
    console.log("Fetched user data:", response.data);
    return Object.values(response.data); // Ensure it's an array
  } catch (error) {
    console.error("Error fetching users from server:", error.message);
    return [];
  }
}

// Function to create a Zendesk ticket for a user
async function createTicketForUser(user) {
  const data = {
    ticket: {
      subject: `Ticket for ${user.Nombre}`, // Customize subject
      comment: {
        body: `This ticket was created for ${user.Nombre} (${user.Email}).`,
      },
      priority: "normal",
      requester: {
        name: user.Nombre,
        email: user.Email,
      },
      tags: ["api_created", "customer_ticket"],
    },
  };

  try {
    const response = await axios.post(zendeskUrl, data, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${authString}`,
      },
    });
    console.log(`Ticket created for ${user.Nombre}:`, response.data.ticket.id);
  } catch (error) {
    console.error(`Error creating ticket for ${user.Nombre}:`, error.response?.data || error.message);
  }
}

// Main function to fetch users and create tickets
async function createTicketsForAllUsers() {
  const users = await fetchUsersFromServer();

  if (users.length === 0) {
    console.error("No users found. Cannot create tickets.");
    return;
  }

  console.log(`Creating tickets for ${users.length} users...`);
  for (const user of users) {
    if (user.Nombre && user.Email) {
      await createTicketForUser(user); // Create a ticket for each user
    } else {
      console.warn(`Skipping user due to missing data:`, user);
    }
  }
}

// Run the main function
createTicketsForAllUsers();
