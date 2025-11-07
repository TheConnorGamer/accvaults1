var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// .wrangler/tmp/bundle-s2Uzsx/checked-fetch.js
var urls = /* @__PURE__ */ new Set();
function checkURL(request, init) {
  const url = request instanceof URL ? request : new URL(
    (typeof request === "string" ? new Request(request, init) : request).url
  );
  if (url.port && url.port !== "443" && url.protocol === "https:") {
    if (!urls.has(url.toString())) {
      urls.add(url.toString());
      console.warn(
        `WARNING: known issue with \`fetch()\` requests to custom HTTPS ports in published Workers:
 - ${url.toString()} - the custom port will be ignored when the Worker is published using the \`wrangler deploy\` command.
`
      );
    }
  }
}
__name(checkURL, "checkURL");
globalThis.fetch = new Proxy(globalThis.fetch, {
  apply(target, thisArg, argArray) {
    const [request, init] = argArray;
    checkURL(request, init);
    return Reflect.apply(target, thisArg, argArray);
  }
});

// .wrangler/tmp/pages-tEbDEm/functionsWorker-0.4012187031283998.mjs
var __defProp2 = Object.defineProperty;
var __name2 = /* @__PURE__ */ __name((target, value) => __defProp2(target, "name", { value, configurable: true }), "__name");
var urls2 = /* @__PURE__ */ new Set();
function checkURL2(request, init) {
  const url = request instanceof URL ? request : new URL(
    (typeof request === "string" ? new Request(request, init) : request).url
  );
  if (url.port && url.port !== "443" && url.protocol === "https:") {
    if (!urls2.has(url.toString())) {
      urls2.add(url.toString());
      console.warn(
        `WARNING: known issue with \`fetch()\` requests to custom HTTPS ports in published Workers:
 - ${url.toString()} - the custom port will be ignored when the Worker is published using the \`wrangler deploy\` command.
`
      );
    }
  }
}
__name(checkURL2, "checkURL");
__name2(checkURL2, "checkURL");
globalThis.fetch = new Proxy(globalThis.fetch, {
  apply(target, thisArg, argArray) {
    const [request, init] = argArray;
    checkURL2(request, init);
    return Reflect.apply(target, thisArg, argArray);
  }
});
async function onRequestOptions() {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    }
  });
}
__name(onRequestOptions, "onRequestOptions");
__name2(onRequestOptions, "onRequestOptions");
async function onRequestGet(context) {
  const { env } = context;
  try {
    const { results: tickets } = await env.DB.prepare(
      "SELECT * FROM tickets ORDER BY created_at DESC"
    ).all();
    const ticketsWithCounts = await Promise.all(tickets.map(async (ticket) => {
      const { results: messages } = await env.DB.prepare(
        "SELECT COUNT(*) as count FROM ticket_messages WHERE ticket_id = ?"
      ).bind(ticket.ticket_id).all();
      return {
        ...ticket,
        message_count: messages[0]?.count || 0
      };
    }));
    return new Response(JSON.stringify({
      success: true,
      data: ticketsWithCounts,
      count: ticketsWithCounts.length
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  } catch (error) {
    console.error("Error fetching all tickets:", error);
    return new Response(JSON.stringify({
      error: "Failed to fetch tickets",
      details: error.message
    }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  }
}
__name(onRequestGet, "onRequestGet");
__name2(onRequestGet, "onRequestGet");
function generateTicketId() {
  return "TKT-" + Date.now() + "-" + Math.random().toString(36).substr(2, 9).toUpperCase();
}
__name(generateTicketId, "generateTicketId");
__name2(generateTicketId, "generateTicketId");
async function onRequestOptions2() {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    }
  });
}
__name(onRequestOptions2, "onRequestOptions2");
__name2(onRequestOptions2, "onRequestOptions");
async function onRequestPost(context) {
  const { request, env } = context;
  try {
    const body = await request.json();
    const { email, subject, message } = body;
    if (!email || !subject || !message) {
      return new Response(JSON.stringify({
        error: "Missing required fields",
        required: ["email", "subject", "message"]
      }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(JSON.stringify({
        error: "Invalid email format"
      }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }
    const ticketId = generateTicketId();
    const timestamp = Math.floor(Date.now() / 1e3);
    await env.DB.prepare(
      "INSERT INTO tickets (ticket_id, customer_email, subject, status, priority, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)"
    ).bind(ticketId, email, subject, "open", "normal", timestamp, timestamp).run();
    await env.DB.prepare(
      "INSERT INTO ticket_messages (ticket_id, sender_type, sender_email, message, created_at) VALUES (?, ?, ?, ?, ?)"
    ).bind(ticketId, "customer", email, message, timestamp).run();
    console.log("\u2705 Ticket created:", ticketId);
    return new Response(JSON.stringify({
      success: true,
      message: "Ticket created successfully",
      data: {
        ticket_id: ticketId,
        customer_email: email,
        subject,
        status: "open",
        created_at: timestamp
      }
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  } catch (error) {
    console.error("Error creating ticket:", error);
    return new Response(JSON.stringify({
      error: "Failed to create ticket",
      details: error.message
    }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  }
}
__name(onRequestPost, "onRequestPost");
__name2(onRequestPost, "onRequestPost");
async function onRequestOptions3() {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    }
  });
}
__name(onRequestOptions3, "onRequestOptions3");
__name2(onRequestOptions3, "onRequestOptions");
async function onRequestGet2(context) {
  const { request, env } = context;
  try {
    const url = new URL(request.url);
    const email = url.searchParams.get("email");
    if (!email) {
      return new Response(JSON.stringify({
        error: "Email parameter required"
      }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }
    const { results } = await env.DB.prepare(
      "SELECT * FROM tickets WHERE customer_email = ? ORDER BY created_at DESC"
    ).bind(email).all();
    const ticketsWithCounts = await Promise.all(results.map(async (ticket) => {
      const { results: messages } = await env.DB.prepare(
        "SELECT COUNT(*) as count FROM ticket_messages WHERE ticket_id = ?"
      ).bind(ticket.ticket_id).all();
      return {
        ...ticket,
        message_count: messages[0]?.count || 0
      };
    }));
    return new Response(JSON.stringify({
      success: true,
      data: ticketsWithCounts,
      count: ticketsWithCounts.length
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  } catch (error) {
    console.error("Error fetching tickets:", error);
    return new Response(JSON.stringify({
      error: "Failed to fetch tickets",
      details: error.message
    }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  }
}
__name(onRequestGet2, "onRequestGet2");
__name2(onRequestGet2, "onRequestGet");
async function onRequestOptions4() {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    }
  });
}
__name(onRequestOptions4, "onRequestOptions4");
__name2(onRequestOptions4, "onRequestOptions");
async function onRequestPost2(context) {
  const { request, env } = context;
  try {
    const body = await request.json();
    const { ticketId, message, senderType = "customer", senderEmail } = body;
    if (!ticketId || !message) {
      return new Response(JSON.stringify({
        error: "Missing required fields",
        required: ["ticketId", "message"]
      }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }
    const { results: tickets } = await env.DB.prepare(
      "SELECT * FROM tickets WHERE ticket_id = ?"
    ).bind(ticketId).all();
    if (tickets.length === 0) {
      return new Response(JSON.stringify({
        error: "Ticket not found"
      }), {
        status: 404,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }
    const timestamp = Math.floor(Date.now() / 1e3);
    await env.DB.prepare(
      "INSERT INTO ticket_messages (ticket_id, sender_type, sender_email, message, created_at) VALUES (?, ?, ?, ?, ?)"
    ).bind(ticketId, senderType, senderEmail, message, timestamp).run();
    await env.DB.prepare(
      "UPDATE tickets SET updated_at = ? WHERE ticket_id = ?"
    ).bind(timestamp, ticketId).run();
    console.log("\u2705 Reply added to ticket:", ticketId);
    return new Response(JSON.stringify({
      success: true,
      message: "Reply added successfully",
      data: {
        ticket_id: ticketId,
        sender_type: senderType,
        created_at: timestamp
      }
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  } catch (error) {
    console.error("Error adding reply:", error);
    return new Response(JSON.stringify({
      error: "Failed to add reply",
      details: error.message
    }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  }
}
__name(onRequestPost2, "onRequestPost2");
__name2(onRequestPost2, "onRequestPost");
async function onRequestOptions5() {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    }
  });
}
__name(onRequestOptions5, "onRequestOptions5");
__name2(onRequestOptions5, "onRequestOptions");
async function onRequestPost3(context) {
  const { request, env } = context;
  try {
    console.log("Received ticket creation request");
    const body = await request.json();
    const { email, title, message } = body;
    console.log("Request data:", { email, title, message: message?.substring(0, 50) });
    if (!email || !title || !message) {
      console.error("Missing required fields");
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }
    const apiKey = env.PAYLIX_API_KEY;
    console.log("API key present:", !!apiKey);
    if (!apiKey) {
      console.error("API key not configured");
      return new Response(JSON.stringify({ error: "API key not configured" }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }
    console.log("Calling Paylix API...");
    const paylixResponse = await fetch("https://api.paylix.gg/v1/queries", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        customer_email: email,
        title,
        message
      })
    });
    console.log("Paylix response status:", paylixResponse.status);
    const responseText = await paylixResponse.text();
    console.log("Paylix raw response:", responseText);
    if (!paylixResponse.ok) {
      console.error("Paylix API error:", responseText);
      return new Response(JSON.stringify({
        error: "Failed to create ticket",
        details: responseText.substring(0, 200)
      }), {
        status: paylixResponse.status,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error("Failed to parse Paylix response:", e);
      return new Response(JSON.stringify({
        error: "Invalid response from ticket service",
        details: responseText.substring(0, 200)
      }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }
    console.log("Paylix response data:", data);
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  } catch (error) {
    console.error("Error creating ticket:", error);
    return new Response(JSON.stringify({
      error: error.message || "Internal server error",
      stack: error.stack?.substring(0, 200)
    }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  }
}
__name(onRequestPost3, "onRequestPost3");
__name2(onRequestPost3, "onRequestPost");
async function onRequestOptions6() {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    }
  });
}
__name(onRequestOptions6, "onRequestOptions6");
__name2(onRequestOptions6, "onRequestOptions");
async function onRequestGet3(context) {
  const { request } = context;
  try {
    const url = new URL(request.url);
    const email = url.searchParams.get("email");
    if (!email) {
      return new Response(JSON.stringify({ error: "Email parameter required" }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }
    const apiKey = context.env.PAYLIX_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "API key not configured" }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }
    const paylixResponse = await fetch(`https://api.paylix.gg/v1/queries?customer_email=${encodeURIComponent(email)}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${apiKey}`
      }
    });
    if (!paylixResponse.ok) {
      const errorText = await paylixResponse.text();
      console.error("Paylix API error:", errorText);
      return new Response(JSON.stringify({ error: "Failed to fetch tickets" }), {
        status: paylixResponse.status,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }
    const data = await paylixResponse.json();
    console.log("Paylix API Response:", JSON.stringify(data));
    console.log("Response keys:", Object.keys(data));
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  } catch (error) {
    console.error("Error fetching tickets:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  }
}
__name(onRequestGet3, "onRequestGet3");
__name2(onRequestGet3, "onRequestGet");
async function onRequestOptions7() {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    }
  });
}
__name(onRequestOptions7, "onRequestOptions7");
__name2(onRequestOptions7, "onRequestOptions");
async function onRequestPost4(context) {
  const { request } = context;
  try {
    const body = await request.json();
    const { ticketId, reply } = body;
    if (!ticketId || !reply) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }
    const apiKey = context.env.PAYLIX_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "API key not configured" }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }
    const paylixResponse = await fetch(`https://api.paylix.gg/v1/queries/reply/${ticketId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        reply
      })
    });
    if (!paylixResponse.ok) {
      const errorText = await paylixResponse.text();
      console.error("Paylix API error:", errorText);
      return new Response(JSON.stringify({ error: "Failed to reply to ticket" }), {
        status: paylixResponse.status,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }
    const data = await paylixResponse.json();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  } catch (error) {
    console.error("Error replying to ticket:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  }
}
__name(onRequestPost4, "onRequestPost4");
__name2(onRequestPost4, "onRequestPost");
async function onRequestOptions8() {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    }
  });
}
__name(onRequestOptions8, "onRequestOptions8");
__name2(onRequestOptions8, "onRequestOptions");
async function onRequestGet4(context) {
  const { params, env } = context;
  const ticketId = params.id;
  try {
    if (!ticketId) {
      return new Response(JSON.stringify({
        error: "Ticket ID required"
      }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }
    const { results: tickets } = await env.DB.prepare(
      "SELECT * FROM tickets WHERE ticket_id = ?"
    ).bind(ticketId).all();
    if (tickets.length === 0) {
      return new Response(JSON.stringify({
        error: "Ticket not found"
      }), {
        status: 404,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }
    const { results: messages } = await env.DB.prepare(
      "SELECT * FROM ticket_messages WHERE ticket_id = ? ORDER BY created_at ASC"
    ).bind(ticketId).all();
    const ticket = tickets[0];
    return new Response(JSON.stringify({
      success: true,
      data: {
        ...ticket,
        messages
      }
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  } catch (error) {
    console.error("Error fetching ticket:", error);
    return new Response(JSON.stringify({
      error: "Failed to fetch ticket",
      details: error.message
    }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  }
}
__name(onRequestGet4, "onRequestGet4");
__name2(onRequestGet4, "onRequestGet");
async function onRequestOptions9() {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    }
  });
}
__name(onRequestOptions9, "onRequestOptions9");
__name2(onRequestOptions9, "onRequestOptions");
async function onRequestGet5(context) {
  const { params } = context;
  const ticketId = params.id;
  try {
    if (!ticketId) {
      return new Response(JSON.stringify({ error: "Ticket ID required" }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }
    const apiKey = context.env.PAYLIX_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "API key not configured" }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }
    const paylixResponse = await fetch(`https://api.paylix.gg/v1/queries/${ticketId}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${apiKey}`
      }
    });
    if (!paylixResponse.ok) {
      const errorText = await paylixResponse.text();
      console.error("Paylix API error:", errorText);
      return new Response(JSON.stringify({ error: "Failed to fetch ticket" }), {
        status: paylixResponse.status,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }
    const data = await paylixResponse.json();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  } catch (error) {
    console.error("Error fetching ticket:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  }
}
__name(onRequestGet5, "onRequestGet5");
__name2(onRequestGet5, "onRequestGet");
var ADMIN_CREDENTIALS = {
  email: "connazlunn@gmail.com",
  password: "Admin123!",
  role: "admin",
  username: "Admin"
};
function hashPassword(password) {
  return btoa(password);
}
__name(hashPassword, "hashPassword");
__name2(hashPassword, "hashPassword");
function verifyPassword(password, hash) {
  return hashPassword(password) === hash;
}
__name(verifyPassword, "verifyPassword");
__name2(verifyPassword, "verifyPassword");
async function onRequest(context) {
  const { request, env } = context;
  const db = env.DB;
  if (request.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST, OPTIONS"
      }
    });
  }
  if (!db) {
    return new Response(JSON.stringify({
      success: false,
      error: "Database not configured"
    }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  }
  try {
    const { action, email, password, username } = await request.json();
    switch (action) {
      case "login":
        return await handleLogin(email, password, db);
      case "register":
        return await handleRegister(email, password, username, db);
      case "verify":
        return await verifySession(email, db);
      default:
        return new Response(JSON.stringify({
          success: false,
          error: "Invalid action"
        }), {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
    }
  } catch (error) {
    console.error("Auth error:", error);
    return new Response(JSON.stringify({
      success: false,
      error: "Authentication failed"
    }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  }
}
__name(onRequest, "onRequest");
__name2(onRequest, "onRequest");
async function handleLogin(email, password, db) {
  if (email.toLowerCase() === ADMIN_CREDENTIALS.email.toLowerCase() && password === ADMIN_CREDENTIALS.password) {
    return new Response(JSON.stringify({
      success: true,
      user: {
        email: ADMIN_CREDENTIALS.email,
        username: ADMIN_CREDENTIALS.username,
        role: "admin",
        isStaff: true
      }
    }), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  }
  try {
    const result = await db.prepare(
      "SELECT * FROM users WHERE email = ?"
    ).bind(email.toLowerCase()).first();
    if (!result) {
      return new Response(JSON.stringify({
        success: false,
        error: "No account found. Please register first."
      }), {
        status: 401,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }
    if (!verifyPassword(password, result.password_hash)) {
      return new Response(JSON.stringify({
        success: false,
        error: "Invalid email or password"
      }), {
        status: 401,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }
    return new Response(JSON.stringify({
      success: true,
      user: {
        email: result.email,
        username: result.username,
        role: result.role,
        isStaff: result.role === "admin",
        userId: result.id
      }
    }), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    return new Response(JSON.stringify({
      success: false,
      error: "Login failed. Please try again."
    }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  }
}
__name(handleLogin, "handleLogin");
__name2(handleLogin, "handleLogin");
async function handleRegister(email, password, username, db) {
  try {
    const existing = await db.prepare(
      "SELECT id FROM users WHERE email = ?"
    ).bind(email.toLowerCase()).first();
    if (existing) {
      return new Response(JSON.stringify({
        success: false,
        error: "An account with this email already exists"
      }), {
        status: 409,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }
    const passwordHash = hashPassword(password);
    const displayUsername = username || email.split("@")[0];
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const result = await db.prepare(
      "INSERT INTO users (email, username, password_hash, role, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)"
    ).bind(
      email.toLowerCase(),
      displayUsername,
      passwordHash,
      "customer",
      now,
      now
    ).run();
    if (!result.success) {
      throw new Error("Failed to create user");
    }
    const newUser = await db.prepare(
      "SELECT * FROM users WHERE email = ?"
    ).bind(email.toLowerCase()).first();
    return new Response(JSON.stringify({
      success: true,
      user: {
        email: newUser.email,
        username: newUser.username,
        role: newUser.role,
        isStaff: false,
        userId: newUser.id
      }
    }), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  } catch (error) {
    console.error("Registration error:", error);
    return new Response(JSON.stringify({
      success: false,
      error: "Registration failed. Please try again.",
      debug: error.message || String(error)
    }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  }
}
__name(handleRegister, "handleRegister");
__name2(handleRegister, "handleRegister");
async function verifySession(email, db) {
  if (email.toLowerCase() === ADMIN_CREDENTIALS.email.toLowerCase()) {
    return new Response(JSON.stringify({
      success: true,
      valid: true,
      user: {
        email: ADMIN_CREDENTIALS.email,
        role: "admin",
        isStaff: true
      }
    }), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  }
  try {
    const user = await db.prepare(
      "SELECT id FROM users WHERE email = ?"
    ).bind(email.toLowerCase()).first();
    return new Response(JSON.stringify({
      success: true,
      valid: !!user
    }), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: true,
      valid: false
    }), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  }
}
__name(verifySession, "verifySession");
__name2(verifySession, "verifySession");
async function onRequest2(context) {
  const { request, env } = context;
  if (request.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
      }
    });
  }
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  }
  try {
    const { cart, email, couponCode } = await request.json();
    if (!cart || cart.length === 0) {
      return new Response(JSON.stringify({ error: "Cart is empty" }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }
    if (!email) {
      return new Response(JSON.stringify({ error: "Email is required" }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }
    const cartProducts = cart.map((item) => ({
      uniqid: item.paylixGroupId,
      unit_quantity: 1
    }));
    const payload = {
      cart: {
        products: cartProducts
      },
      email,
      white_label: false,
      return_url: new URL(request.url).origin + "/"
    };
    if (couponCode) {
      payload.coupon_code = couponCode;
    }
    const response = await fetch("https://dev.paylix.gg/v1/payments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${env.PAYLIX_API_KEY}`
      },
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    if (!response.ok) {
      console.error("Paylix API Error:", data);
      return new Response(JSON.stringify({
        error: "Failed to create checkout",
        details: data
      }), {
        status: response.status,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }
    return new Response(JSON.stringify({
      success: true,
      checkoutUrl: data.data.url,
      paymentId: data.data.uniqid
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  } catch (error) {
    console.error("Function error:", error);
    return new Response(JSON.stringify({
      error: "Internal server error",
      message: error.message
    }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  }
}
__name(onRequest2, "onRequest2");
__name2(onRequest2, "onRequest");
var PAYLIX_BASE_URL = "https://dev.paylix.gg/v1";
async function callPaylixAPI(endpoint, method = "GET", body = null, apiKey) {
  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    }
  };
  if (body) {
    options.body = JSON.stringify(body);
  }
  const response = await fetch(`${PAYLIX_BASE_URL}${endpoint}`, options);
  const text = await response.text();
  const cleanText = text.trim().replace(/^\uFEFF/, "");
  let data;
  try {
    data = JSON.parse(cleanText);
  } catch (e) {
    console.error("Failed to parse JSON. Length:", text.length);
    console.error("First 200 chars:", text.substring(0, 200));
    console.error("Last 200 chars:", text.substring(text.length - 200));
    throw new Error("Invalid JSON response from Paylix API");
  }
  if (!response.ok) {
    throw new Error(data.message || "Paylix API error");
  }
  return data;
}
__name(callPaylixAPI, "callPaylixAPI");
__name2(callPaylixAPI, "callPaylixAPI");
async function onRequest3(context) {
  const { request, env } = context;
  const PAYLIX_API_KEY = env.PAYLIX_API_KEY;
  if (request.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS"
      }
    });
  }
  if (!PAYLIX_API_KEY) {
    console.error("PAYLIX_API_KEY environment variable is not set");
    return new Response(JSON.stringify({
      success: false,
      error: "API key not configured"
    }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  }
  try {
    const { action, ...params } = await request.json();
    console.log("Paylix API initialized with key:", PAYLIX_API_KEY ? "Present" : "MISSING");
    let result;
    switch (action) {
      // Get all products
      case "getProducts":
        result = await callPaylixAPI("/products", "GET", null, PAYLIX_API_KEY);
        break;
      // Get product by ID
      case "getProduct":
        result = await callPaylixAPI(`/products/${params.productId}`, "GET", null, PAYLIX_API_KEY);
        break;
      // Get all orders
      case "getOrders":
        result = await callPaylixAPI("/orders", "GET", null, PAYLIX_API_KEY);
        break;
      // Get order by ID
      case "getOrder":
        result = await callPaylixAPI(`/orders/${params.orderId}`, "GET", null, PAYLIX_API_KEY);
        break;
      // Get customer orders by email
      case "getCustomerOrders":
        result = await callPaylixAPI(`/orders?email=${params.email}`, "GET", null, PAYLIX_API_KEY);
        break;
      // Get all reviews/feedback
      case "getReviews":
        result = await callPaylixAPI("/feedback", "GET", null, PAYLIX_API_KEY);
        break;
      // Validate coupon
      case "validateCoupon":
        result = await callPaylixAPI(`/coupons/${params.code}`, "GET", null, PAYLIX_API_KEY);
        break;
      // Get analytics/stats
      case "getStats":
        const orders = await callPaylixAPI("/orders", "GET", null, PAYLIX_API_KEY);
        const products = await callPaylixAPI("/products", "GET", null, PAYLIX_API_KEY);
        result = {
          totalOrders: orders.data?.length || 0,
          totalProducts: products.data?.length || 0,
          totalRevenue: orders.data?.reduce((sum, order) => sum + (order.total || 0), 0) || 0
        };
        break;
      // Create payment
      case "createPayment":
        result = await callPaylixAPI("/payments", "POST", {
          cart: params.cart,
          email: params.email,
          coupon_code: params.couponCode,
          white_label: false,
          return_url: params.returnUrl
        }, PAYLIX_API_KEY);
        break;
      // Check blacklist
      case "checkBlacklist":
        result = await callPaylixAPI(`/blacklists?email=${params.email}`, "GET", null, PAYLIX_API_KEY);
        break;
      // Get all categories
      case "getCategories":
        result = await callPaylixAPI("/categories", "GET", null, PAYLIX_API_KEY);
        break;
      // Get category by ID
      case "getCategory":
        result = await callPaylixAPI(`/categories/${params.categoryId}`, "GET", null, PAYLIX_API_KEY);
        break;
      default:
        return new Response(JSON.stringify({ error: "Invalid action" }), {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
    }
    return new Response(JSON.stringify({ success: true, data: result }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  } catch (error) {
    console.error("Paylix API Error:", error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  }
}
__name(onRequest3, "onRequest3");
__name2(onRequest3, "onRequest");
function getTimeAgo(timestamp) {
  const now = Math.floor(Date.now() / 1e3);
  const diff = now - timestamp;
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;
  if (diff < 2592e3) return `${Math.floor(diff / 604800)} weeks ago`;
  return `${Math.floor(diff / 2592e3)} months ago`;
}
__name(getTimeAgo, "getTimeAgo");
__name2(getTimeAgo, "getTimeAgo");
async function onRequest4(context) {
  const { request, env } = context;
  const PAYLIX_API_KEY = env.PAYLIX_API_KEY;
  const MERCHANT_NAME = "accvaults";
  if (request.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "GET, OPTIONS"
      }
    });
  }
  if (!PAYLIX_API_KEY) {
    console.error("PAYLIX_API_KEY environment variable is not set");
    return new Response(JSON.stringify({
      error: "API key not configured",
      stats: {
        feedbackRating: 0,
        productsSold: 0,
        totalCustomers: 0,
        totalReviews: 0
      },
      reviews: []
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  }
  try {
    const ordersResponse = await fetch(`https://dev.paylix.gg/v1/orders`, {
      headers: {
        "Authorization": `Bearer ${PAYLIX_API_KEY}`,
        "Content-Type": "application/json"
      }
    });
    const feedbackResponse = await fetch(`https://dev.paylix.gg/v1/feedback`, {
      headers: {
        "Authorization": `Bearer ${PAYLIX_API_KEY}`,
        "Content-Type": "application/json"
      }
    });
    let totalOrders = 0;
    let totalCustomers = 0;
    let uniqueCustomers = /* @__PURE__ */ new Set();
    if (ordersResponse.ok) {
      const ordersText = await ordersResponse.text();
      const cleanOrdersText = ordersText.trim().replace(/^\uFEFF/, "");
      const ordersData = JSON.parse(cleanOrdersText);
      console.log("Paylix orders response:", JSON.stringify(ordersData, null, 2));
      const orders = ordersData.data?.orders || ordersData.data || [];
      const completedOrders = Array.isArray(orders) ? orders.filter((order) => order.status === "COMPLETED") : [];
      totalOrders = completedOrders.length;
      if (Array.isArray(completedOrders)) {
        completedOrders.forEach((order) => {
          if (order.customer_email) {
            uniqueCustomers.add(order.customer_email);
          }
        });
      }
      totalCustomers = uniqueCustomers.size;
      console.log("Processed orders:", {
        totalOrders: orders.length,
        completedOrders: totalOrders,
        totalCustomers
      });
    } else {
      console.error("Orders API failed:", ordersResponse.status, await ordersResponse.text());
    }
    let feedbacks = [];
    let averageRating = 0;
    if (feedbackResponse.ok) {
      const feedbackText = await feedbackResponse.text();
      const cleanFeedbackText = feedbackText.trim().replace(/^\uFEFF/, "");
      const feedbackData = JSON.parse(cleanFeedbackText);
      console.log("Paylix feedback response:", JSON.stringify(feedbackData, null, 2));
      feedbacks = feedbackData.data?.feedback || feedbackData.data || [];
      if (Array.isArray(feedbacks) && feedbacks.length > 0) {
        const totalRating = feedbacks.reduce((sum, f) => sum + (f.score || 5), 0);
        averageRating = totalRating / feedbacks.length;
      }
      console.log("Processed feedbacks:", { count: feedbacks.length, averageRating });
    } else {
      console.error("Feedback API failed:", feedbackResponse.status, await feedbackResponse.text());
    }
    return new Response(JSON.stringify({
      stats: {
        feedbackRating: averageRating,
        productsSold: totalOrders,
        totalCustomers,
        totalReviews: feedbacks.length
      },
      reviews: feedbacks.slice(0, 6).map((feedback) => {
        const customerName = "Customer";
        const timeAgo = feedback.created_at ? getTimeAgo(feedback.created_at) : "Recently";
        return {
          id: feedback.id,
          name: customerName,
          rating: feedback.score || 5,
          text: feedback.message || "",
          date: timeAgo,
          avatar: customerName.substring(0, 2).toUpperCase()
        };
      })
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  } catch (error) {
    console.error("Error fetching Paylix data:", error);
    return new Response(JSON.stringify({
      stats: {
        feedbackRating: 0,
        productsSold: 0,
        totalCustomers: 0,
        totalReviews: 0
      },
      reviews: []
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  }
}
__name(onRequest4, "onRequest4");
__name2(onRequest4, "onRequest");
async function onRequest5(context) {
  const { request } = context;
  if (request.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
      }
    });
  }
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  }
  try {
    const webhookData = await request.json();
    console.log("\u{1F4E6} Paylix Webhook Received:", webhookData);
    switch (webhookData.event) {
      case "order.completed":
        console.log("\u2705 Order completed:", webhookData.data.order_id);
        break;
      case "order.refunded":
        console.log("\u{1F4B0} Order refunded:", webhookData.data.order_id);
        break;
      case "subscription.created":
        console.log("\u{1F504} Subscription created:", webhookData.data.subscription_id);
        break;
      case "subscription.cancelled":
        console.log("\u274C Subscription cancelled:", webhookData.data.subscription_id);
        break;
      default:
        console.log("\u2139\uFE0F Unknown event:", webhookData.event);
    }
    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(JSON.stringify({ error: "Webhook processing failed" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  }
}
__name(onRequest5, "onRequest5");
__name2(onRequest5, "onRequest");
async function onRequest6(context) {
  const { request, env } = context;
  if (request.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST, GET, OPTIONS"
      }
    });
  }
  try {
    const { action, customerData } = await request.json();
    if (action === "save") {
      console.log("Customer registered:", {
        email: customerData.email,
        username: customerData.username,
        customerId: customerData.customerId,
        registeredAt: customerData.registeredAt
      });
      return new Response(JSON.stringify({
        success: true,
        message: "Customer data logged",
        note: "Customer data is stored in Paylix Customers API"
      }), {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }
    if (action === "list") {
      return new Response(JSON.stringify({
        success: true,
        message: "Customer data is stored in Paylix Customers API",
        note: "Use /api/auth with action: listCustomers to get all customers"
      }), {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }
    return new Response(JSON.stringify({
      success: false,
      error: "Invalid action"
    }), {
      status: 400,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  } catch (error) {
    console.error("Save customer error:", error);
    return new Response(JSON.stringify({
      success: false,
      error: "Failed to save customer data"
    }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  }
}
__name(onRequest6, "onRequest6");
__name2(onRequest6, "onRequest");
var routes = [
  {
    routePath: "/api/tickets-v2/admin/all",
    mountPath: "/api/tickets-v2/admin",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet]
  },
  {
    routePath: "/api/tickets-v2/admin/all",
    mountPath: "/api/tickets-v2/admin",
    method: "OPTIONS",
    middlewares: [],
    modules: [onRequestOptions]
  },
  {
    routePath: "/api/tickets-v2/create",
    mountPath: "/api/tickets-v2",
    method: "OPTIONS",
    middlewares: [],
    modules: [onRequestOptions2]
  },
  {
    routePath: "/api/tickets-v2/create",
    mountPath: "/api/tickets-v2",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost]
  },
  {
    routePath: "/api/tickets-v2/list",
    mountPath: "/api/tickets-v2",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet2]
  },
  {
    routePath: "/api/tickets-v2/list",
    mountPath: "/api/tickets-v2",
    method: "OPTIONS",
    middlewares: [],
    modules: [onRequestOptions3]
  },
  {
    routePath: "/api/tickets-v2/reply",
    mountPath: "/api/tickets-v2",
    method: "OPTIONS",
    middlewares: [],
    modules: [onRequestOptions4]
  },
  {
    routePath: "/api/tickets-v2/reply",
    mountPath: "/api/tickets-v2",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost2]
  },
  {
    routePath: "/api/tickets/create",
    mountPath: "/api/tickets",
    method: "OPTIONS",
    middlewares: [],
    modules: [onRequestOptions5]
  },
  {
    routePath: "/api/tickets/create",
    mountPath: "/api/tickets",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost3]
  },
  {
    routePath: "/api/tickets/list",
    mountPath: "/api/tickets",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet3]
  },
  {
    routePath: "/api/tickets/list",
    mountPath: "/api/tickets",
    method: "OPTIONS",
    middlewares: [],
    modules: [onRequestOptions6]
  },
  {
    routePath: "/api/tickets/reply",
    mountPath: "/api/tickets",
    method: "OPTIONS",
    middlewares: [],
    modules: [onRequestOptions7]
  },
  {
    routePath: "/api/tickets/reply",
    mountPath: "/api/tickets",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost4]
  },
  {
    routePath: "/api/tickets-v2/:id",
    mountPath: "/api/tickets-v2",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet4]
  },
  {
    routePath: "/api/tickets-v2/:id",
    mountPath: "/api/tickets-v2",
    method: "OPTIONS",
    middlewares: [],
    modules: [onRequestOptions8]
  },
  {
    routePath: "/api/tickets/:id",
    mountPath: "/api/tickets",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet5]
  },
  {
    routePath: "/api/tickets/:id",
    mountPath: "/api/tickets",
    method: "OPTIONS",
    middlewares: [],
    modules: [onRequestOptions9]
  },
  {
    routePath: "/api/auth",
    mountPath: "/api",
    method: "",
    middlewares: [],
    modules: [onRequest]
  },
  {
    routePath: "/api/create-checkout",
    mountPath: "/api",
    method: "",
    middlewares: [],
    modules: [onRequest2]
  },
  {
    routePath: "/api/paylix-api",
    mountPath: "/api",
    method: "",
    middlewares: [],
    modules: [onRequest3]
  },
  {
    routePath: "/api/paylix-stats",
    mountPath: "/api",
    method: "",
    middlewares: [],
    modules: [onRequest4]
  },
  {
    routePath: "/api/paylix-webhook",
    mountPath: "/api",
    method: "",
    middlewares: [],
    modules: [onRequest5]
  },
  {
    routePath: "/api/save-customer",
    mountPath: "/api",
    method: "",
    middlewares: [],
    modules: [onRequest6]
  }
];
function lexer(str) {
  var tokens = [];
  var i = 0;
  while (i < str.length) {
    var char = str[i];
    if (char === "*" || char === "+" || char === "?") {
      tokens.push({ type: "MODIFIER", index: i, value: str[i++] });
      continue;
    }
    if (char === "\\") {
      tokens.push({ type: "ESCAPED_CHAR", index: i++, value: str[i++] });
      continue;
    }
    if (char === "{") {
      tokens.push({ type: "OPEN", index: i, value: str[i++] });
      continue;
    }
    if (char === "}") {
      tokens.push({ type: "CLOSE", index: i, value: str[i++] });
      continue;
    }
    if (char === ":") {
      var name = "";
      var j = i + 1;
      while (j < str.length) {
        var code = str.charCodeAt(j);
        if (
          // `0-9`
          code >= 48 && code <= 57 || // `A-Z`
          code >= 65 && code <= 90 || // `a-z`
          code >= 97 && code <= 122 || // `_`
          code === 95
        ) {
          name += str[j++];
          continue;
        }
        break;
      }
      if (!name)
        throw new TypeError("Missing parameter name at ".concat(i));
      tokens.push({ type: "NAME", index: i, value: name });
      i = j;
      continue;
    }
    if (char === "(") {
      var count = 1;
      var pattern = "";
      var j = i + 1;
      if (str[j] === "?") {
        throw new TypeError('Pattern cannot start with "?" at '.concat(j));
      }
      while (j < str.length) {
        if (str[j] === "\\") {
          pattern += str[j++] + str[j++];
          continue;
        }
        if (str[j] === ")") {
          count--;
          if (count === 0) {
            j++;
            break;
          }
        } else if (str[j] === "(") {
          count++;
          if (str[j + 1] !== "?") {
            throw new TypeError("Capturing groups are not allowed at ".concat(j));
          }
        }
        pattern += str[j++];
      }
      if (count)
        throw new TypeError("Unbalanced pattern at ".concat(i));
      if (!pattern)
        throw new TypeError("Missing pattern at ".concat(i));
      tokens.push({ type: "PATTERN", index: i, value: pattern });
      i = j;
      continue;
    }
    tokens.push({ type: "CHAR", index: i, value: str[i++] });
  }
  tokens.push({ type: "END", index: i, value: "" });
  return tokens;
}
__name(lexer, "lexer");
__name2(lexer, "lexer");
function parse(str, options) {
  if (options === void 0) {
    options = {};
  }
  var tokens = lexer(str);
  var _a = options.prefixes, prefixes = _a === void 0 ? "./" : _a, _b = options.delimiter, delimiter = _b === void 0 ? "/#?" : _b;
  var result = [];
  var key = 0;
  var i = 0;
  var path = "";
  var tryConsume = /* @__PURE__ */ __name2(function(type) {
    if (i < tokens.length && tokens[i].type === type)
      return tokens[i++].value;
  }, "tryConsume");
  var mustConsume = /* @__PURE__ */ __name2(function(type) {
    var value2 = tryConsume(type);
    if (value2 !== void 0)
      return value2;
    var _a2 = tokens[i], nextType = _a2.type, index = _a2.index;
    throw new TypeError("Unexpected ".concat(nextType, " at ").concat(index, ", expected ").concat(type));
  }, "mustConsume");
  var consumeText = /* @__PURE__ */ __name2(function() {
    var result2 = "";
    var value2;
    while (value2 = tryConsume("CHAR") || tryConsume("ESCAPED_CHAR")) {
      result2 += value2;
    }
    return result2;
  }, "consumeText");
  var isSafe = /* @__PURE__ */ __name2(function(value2) {
    for (var _i = 0, delimiter_1 = delimiter; _i < delimiter_1.length; _i++) {
      var char2 = delimiter_1[_i];
      if (value2.indexOf(char2) > -1)
        return true;
    }
    return false;
  }, "isSafe");
  var safePattern = /* @__PURE__ */ __name2(function(prefix2) {
    var prev = result[result.length - 1];
    var prevText = prefix2 || (prev && typeof prev === "string" ? prev : "");
    if (prev && !prevText) {
      throw new TypeError('Must have text between two parameters, missing text after "'.concat(prev.name, '"'));
    }
    if (!prevText || isSafe(prevText))
      return "[^".concat(escapeString(delimiter), "]+?");
    return "(?:(?!".concat(escapeString(prevText), ")[^").concat(escapeString(delimiter), "])+?");
  }, "safePattern");
  while (i < tokens.length) {
    var char = tryConsume("CHAR");
    var name = tryConsume("NAME");
    var pattern = tryConsume("PATTERN");
    if (name || pattern) {
      var prefix = char || "";
      if (prefixes.indexOf(prefix) === -1) {
        path += prefix;
        prefix = "";
      }
      if (path) {
        result.push(path);
        path = "";
      }
      result.push({
        name: name || key++,
        prefix,
        suffix: "",
        pattern: pattern || safePattern(prefix),
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    var value = char || tryConsume("ESCAPED_CHAR");
    if (value) {
      path += value;
      continue;
    }
    if (path) {
      result.push(path);
      path = "";
    }
    var open = tryConsume("OPEN");
    if (open) {
      var prefix = consumeText();
      var name_1 = tryConsume("NAME") || "";
      var pattern_1 = tryConsume("PATTERN") || "";
      var suffix = consumeText();
      mustConsume("CLOSE");
      result.push({
        name: name_1 || (pattern_1 ? key++ : ""),
        pattern: name_1 && !pattern_1 ? safePattern(prefix) : pattern_1,
        prefix,
        suffix,
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    mustConsume("END");
  }
  return result;
}
__name(parse, "parse");
__name2(parse, "parse");
function match(str, options) {
  var keys = [];
  var re = pathToRegexp(str, keys, options);
  return regexpToFunction(re, keys, options);
}
__name(match, "match");
__name2(match, "match");
function regexpToFunction(re, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.decode, decode = _a === void 0 ? function(x) {
    return x;
  } : _a;
  return function(pathname) {
    var m = re.exec(pathname);
    if (!m)
      return false;
    var path = m[0], index = m.index;
    var params = /* @__PURE__ */ Object.create(null);
    var _loop_1 = /* @__PURE__ */ __name2(function(i2) {
      if (m[i2] === void 0)
        return "continue";
      var key = keys[i2 - 1];
      if (key.modifier === "*" || key.modifier === "+") {
        params[key.name] = m[i2].split(key.prefix + key.suffix).map(function(value) {
          return decode(value, key);
        });
      } else {
        params[key.name] = decode(m[i2], key);
      }
    }, "_loop_1");
    for (var i = 1; i < m.length; i++) {
      _loop_1(i);
    }
    return { path, index, params };
  };
}
__name(regexpToFunction, "regexpToFunction");
__name2(regexpToFunction, "regexpToFunction");
function escapeString(str) {
  return str.replace(/([.+*?=^!:${}()[\]|/\\])/g, "\\$1");
}
__name(escapeString, "escapeString");
__name2(escapeString, "escapeString");
function flags(options) {
  return options && options.sensitive ? "" : "i";
}
__name(flags, "flags");
__name2(flags, "flags");
function regexpToRegexp(path, keys) {
  if (!keys)
    return path;
  var groupsRegex = /\((?:\?<(.*?)>)?(?!\?)/g;
  var index = 0;
  var execResult = groupsRegex.exec(path.source);
  while (execResult) {
    keys.push({
      // Use parenthesized substring match if available, index otherwise
      name: execResult[1] || index++,
      prefix: "",
      suffix: "",
      modifier: "",
      pattern: ""
    });
    execResult = groupsRegex.exec(path.source);
  }
  return path;
}
__name(regexpToRegexp, "regexpToRegexp");
__name2(regexpToRegexp, "regexpToRegexp");
function arrayToRegexp(paths, keys, options) {
  var parts = paths.map(function(path) {
    return pathToRegexp(path, keys, options).source;
  });
  return new RegExp("(?:".concat(parts.join("|"), ")"), flags(options));
}
__name(arrayToRegexp, "arrayToRegexp");
__name2(arrayToRegexp, "arrayToRegexp");
function stringToRegexp(path, keys, options) {
  return tokensToRegexp(parse(path, options), keys, options);
}
__name(stringToRegexp, "stringToRegexp");
__name2(stringToRegexp, "stringToRegexp");
function tokensToRegexp(tokens, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.strict, strict = _a === void 0 ? false : _a, _b = options.start, start = _b === void 0 ? true : _b, _c = options.end, end = _c === void 0 ? true : _c, _d = options.encode, encode = _d === void 0 ? function(x) {
    return x;
  } : _d, _e = options.delimiter, delimiter = _e === void 0 ? "/#?" : _e, _f = options.endsWith, endsWith = _f === void 0 ? "" : _f;
  var endsWithRe = "[".concat(escapeString(endsWith), "]|$");
  var delimiterRe = "[".concat(escapeString(delimiter), "]");
  var route = start ? "^" : "";
  for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
    var token = tokens_1[_i];
    if (typeof token === "string") {
      route += escapeString(encode(token));
    } else {
      var prefix = escapeString(encode(token.prefix));
      var suffix = escapeString(encode(token.suffix));
      if (token.pattern) {
        if (keys)
          keys.push(token);
        if (prefix || suffix) {
          if (token.modifier === "+" || token.modifier === "*") {
            var mod = token.modifier === "*" ? "?" : "";
            route += "(?:".concat(prefix, "((?:").concat(token.pattern, ")(?:").concat(suffix).concat(prefix, "(?:").concat(token.pattern, "))*)").concat(suffix, ")").concat(mod);
          } else {
            route += "(?:".concat(prefix, "(").concat(token.pattern, ")").concat(suffix, ")").concat(token.modifier);
          }
        } else {
          if (token.modifier === "+" || token.modifier === "*") {
            throw new TypeError('Can not repeat "'.concat(token.name, '" without a prefix and suffix'));
          }
          route += "(".concat(token.pattern, ")").concat(token.modifier);
        }
      } else {
        route += "(?:".concat(prefix).concat(suffix, ")").concat(token.modifier);
      }
    }
  }
  if (end) {
    if (!strict)
      route += "".concat(delimiterRe, "?");
    route += !options.endsWith ? "$" : "(?=".concat(endsWithRe, ")");
  } else {
    var endToken = tokens[tokens.length - 1];
    var isEndDelimited = typeof endToken === "string" ? delimiterRe.indexOf(endToken[endToken.length - 1]) > -1 : endToken === void 0;
    if (!strict) {
      route += "(?:".concat(delimiterRe, "(?=").concat(endsWithRe, "))?");
    }
    if (!isEndDelimited) {
      route += "(?=".concat(delimiterRe, "|").concat(endsWithRe, ")");
    }
  }
  return new RegExp(route, flags(options));
}
__name(tokensToRegexp, "tokensToRegexp");
__name2(tokensToRegexp, "tokensToRegexp");
function pathToRegexp(path, keys, options) {
  if (path instanceof RegExp)
    return regexpToRegexp(path, keys);
  if (Array.isArray(path))
    return arrayToRegexp(path, keys, options);
  return stringToRegexp(path, keys, options);
}
__name(pathToRegexp, "pathToRegexp");
__name2(pathToRegexp, "pathToRegexp");
var escapeRegex = /[.+?^${}()|[\]\\]/g;
function* executeRequest(request) {
  const requestPath = new URL(request.url).pathname;
  for (const route of [...routes].reverse()) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult) {
      for (const handler of route.middlewares.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: mountMatchResult.path
        };
      }
    }
  }
  for (const route of routes) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: true
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult && route.modules.length) {
      for (const handler of route.modules.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: matchResult.path
        };
      }
      break;
    }
  }
}
__name(executeRequest, "executeRequest");
__name2(executeRequest, "executeRequest");
var pages_template_worker_default = {
  async fetch(originalRequest, env, workerContext) {
    let request = originalRequest;
    const handlerIterator = executeRequest(request);
    let data = {};
    let isFailOpen = false;
    const next = /* @__PURE__ */ __name2(async (input, init) => {
      if (input !== void 0) {
        let url = input;
        if (typeof input === "string") {
          url = new URL(input, request.url).toString();
        }
        request = new Request(url, init);
      }
      const result = handlerIterator.next();
      if (result.done === false) {
        const { handler, params, path } = result.value;
        const context = {
          request: new Request(request.clone()),
          functionPath: path,
          next,
          params,
          get data() {
            return data;
          },
          set data(value) {
            if (typeof value !== "object" || value === null) {
              throw new Error("context.data must be an object");
            }
            data = value;
          },
          env,
          waitUntil: workerContext.waitUntil.bind(workerContext),
          passThroughOnException: /* @__PURE__ */ __name2(() => {
            isFailOpen = true;
          }, "passThroughOnException")
        };
        const response = await handler(context);
        if (!(response instanceof Response)) {
          throw new Error("Your Pages function should return a Response");
        }
        return cloneResponse(response);
      } else if ("ASSETS") {
        const response = await env["ASSETS"].fetch(request);
        return cloneResponse(response);
      } else {
        const response = await fetch(request);
        return cloneResponse(response);
      }
    }, "next");
    try {
      return await next();
    } catch (error) {
      if (isFailOpen) {
        const response = await env["ASSETS"].fetch(request);
        return cloneResponse(response);
      }
      throw error;
    }
  }
};
var cloneResponse = /* @__PURE__ */ __name2((response) => (
  // https://fetch.spec.whatwg.org/#null-body-status
  new Response(
    [101, 204, 205, 304].includes(response.status) ? null : response.body,
    response
  )
), "cloneResponse");
var drainBody = /* @__PURE__ */ __name2(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
__name2(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name2(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = pages_template_worker_default;
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
__name2(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
__name2(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");
__name2(__facade_invoke__, "__facade_invoke__");
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  static {
    __name(this, "___Facade_ScheduledController__");
  }
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name2(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name2(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name2(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
__name2(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name2((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name2((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
__name2(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;

// ../../AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/wrangler/templates/pages-dev-util.ts
function isRoutingRuleMatch(pathname, routingRule) {
  if (!pathname) {
    throw new Error("Pathname is undefined.");
  }
  if (!routingRule) {
    throw new Error("Routing rule is undefined.");
  }
  const ruleRegExp = transformRoutingRuleToRegExp(routingRule);
  return pathname.match(ruleRegExp) !== null;
}
__name(isRoutingRuleMatch, "isRoutingRuleMatch");
function transformRoutingRuleToRegExp(rule) {
  let transformedRule;
  if (rule === "/" || rule === "/*") {
    transformedRule = rule;
  } else if (rule.endsWith("/*")) {
    transformedRule = `${rule.substring(0, rule.length - 2)}(/*)?`;
  } else if (rule.endsWith("/")) {
    transformedRule = `${rule.substring(0, rule.length - 1)}(/)?`;
  } else if (rule.endsWith("*")) {
    transformedRule = rule;
  } else {
    transformedRule = `${rule}(/)?`;
  }
  transformedRule = `^${transformedRule.replaceAll(/\./g, "\\.").replaceAll(/\*/g, ".*")}$`;
  return new RegExp(transformedRule);
}
__name(transformRoutingRuleToRegExp, "transformRoutingRuleToRegExp");

// .wrangler/tmp/pages-tEbDEm/sws7bdfu8e.js
var define_ROUTES_default = {
  version: 1,
  include: [
    "/api/*"
  ],
  exclude: []
};
var routes2 = define_ROUTES_default;
var pages_dev_pipeline_default = {
  fetch(request, env, context) {
    const { pathname } = new URL(request.url);
    for (const exclude of routes2.exclude) {
      if (isRoutingRuleMatch(pathname, exclude)) {
        return env.ASSETS.fetch(request);
      }
    }
    for (const include of routes2.include) {
      if (isRoutingRuleMatch(pathname, include)) {
        const workerAsHandler = middleware_loader_entry_default;
        if (workerAsHandler.fetch === void 0) {
          throw new TypeError("Entry point missing `fetch` handler");
        }
        return workerAsHandler.fetch(request, env, context);
      }
    }
    return env.ASSETS.fetch(request);
  }
};

// ../../AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody2 = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default2 = drainBody2;

// ../../AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError2(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError2(e.cause)
  };
}
__name(reduceError2, "reduceError");
var jsonError2 = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError2(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default2 = jsonError2;

// .wrangler/tmp/bundle-s2Uzsx/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__2 = [
  middleware_ensure_req_body_drained_default2,
  middleware_miniflare3_json_error_default2
];
var middleware_insertion_facade_default2 = pages_dev_pipeline_default;

// ../../AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__2 = [];
function __facade_register__2(...args) {
  __facade_middleware__2.push(...args.flat());
}
__name(__facade_register__2, "__facade_register__");
function __facade_invokeChain__2(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__2(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__2, "__facade_invokeChain__");
function __facade_invoke__2(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__2(request, env, ctx, dispatch, [
    ...__facade_middleware__2,
    finalMiddleware
  ]);
}
__name(__facade_invoke__2, "__facade_invoke__");

// .wrangler/tmp/bundle-s2Uzsx/middleware-loader.entry.ts
var __Facade_ScheduledController__2 = class ___Facade_ScheduledController__2 {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__2)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler2(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__2 === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__2.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__2) {
    __facade_register__2(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__2(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__2(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler2, "wrapExportedHandler");
function wrapWorkerEntrypoint2(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__2 === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__2.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__2) {
    __facade_register__2(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__2(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__2(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint2, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY2;
if (typeof middleware_insertion_facade_default2 === "object") {
  WRAPPED_ENTRY2 = wrapExportedHandler2(middleware_insertion_facade_default2);
} else if (typeof middleware_insertion_facade_default2 === "function") {
  WRAPPED_ENTRY2 = wrapWorkerEntrypoint2(middleware_insertion_facade_default2);
}
var middleware_loader_entry_default2 = WRAPPED_ENTRY2;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__2 as __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default2 as default
};
//# sourceMappingURL=sws7bdfu8e.js.map
