import { onRequestGet as __api_tickets_v2_admin_all_js_onRequestGet } from "C:\\Users\\conna\\CascadeProjects\\newwebsite123\\functions\\api\\tickets-v2\\admin\\all.js"
import { onRequestOptions as __api_tickets_v2_admin_all_js_onRequestOptions } from "C:\\Users\\conna\\CascadeProjects\\newwebsite123\\functions\\api\\tickets-v2\\admin\\all.js"
import { onRequestOptions as __api_tickets_v2_close_js_onRequestOptions } from "C:\\Users\\conna\\CascadeProjects\\newwebsite123\\functions\\api\\tickets-v2\\close.js"
import { onRequestPost as __api_tickets_v2_close_js_onRequestPost } from "C:\\Users\\conna\\CascadeProjects\\newwebsite123\\functions\\api\\tickets-v2\\close.js"
import { onRequestOptions as __api_tickets_v2_create_js_onRequestOptions } from "C:\\Users\\conna\\CascadeProjects\\newwebsite123\\functions\\api\\tickets-v2\\create.js"
import { onRequestPost as __api_tickets_v2_create_js_onRequestPost } from "C:\\Users\\conna\\CascadeProjects\\newwebsite123\\functions\\api\\tickets-v2\\create.js"
import { onRequestGet as __api_tickets_v2_list_js_onRequestGet } from "C:\\Users\\conna\\CascadeProjects\\newwebsite123\\functions\\api\\tickets-v2\\list.js"
import { onRequestOptions as __api_tickets_v2_list_js_onRequestOptions } from "C:\\Users\\conna\\CascadeProjects\\newwebsite123\\functions\\api\\tickets-v2\\list.js"
import { onRequestOptions as __api_tickets_v2_reopen_js_onRequestOptions } from "C:\\Users\\conna\\CascadeProjects\\newwebsite123\\functions\\api\\tickets-v2\\reopen.js"
import { onRequestPost as __api_tickets_v2_reopen_js_onRequestPost } from "C:\\Users\\conna\\CascadeProjects\\newwebsite123\\functions\\api\\tickets-v2\\reopen.js"
import { onRequestOptions as __api_tickets_v2_reply_js_onRequestOptions } from "C:\\Users\\conna\\CascadeProjects\\newwebsite123\\functions\\api\\tickets-v2\\reply.js"
import { onRequestPost as __api_tickets_v2_reply_js_onRequestPost } from "C:\\Users\\conna\\CascadeProjects\\newwebsite123\\functions\\api\\tickets-v2\\reply.js"
import { onRequestOptions as __api_tickets_close_js_onRequestOptions } from "C:\\Users\\conna\\CascadeProjects\\newwebsite123\\functions\\api\\tickets\\close.js"
import { onRequestPost as __api_tickets_close_js_onRequestPost } from "C:\\Users\\conna\\CascadeProjects\\newwebsite123\\functions\\api\\tickets\\close.js"
import { onRequestOptions as __api_tickets_create_js_onRequestOptions } from "C:\\Users\\conna\\CascadeProjects\\newwebsite123\\functions\\api\\tickets\\create.js"
import { onRequestPost as __api_tickets_create_js_onRequestPost } from "C:\\Users\\conna\\CascadeProjects\\newwebsite123\\functions\\api\\tickets\\create.js"
import { onRequestGet as __api_tickets_list_js_onRequestGet } from "C:\\Users\\conna\\CascadeProjects\\newwebsite123\\functions\\api\\tickets\\list.js"
import { onRequestOptions as __api_tickets_list_js_onRequestOptions } from "C:\\Users\\conna\\CascadeProjects\\newwebsite123\\functions\\api\\tickets\\list.js"
import { onRequestOptions as __api_tickets_reopen_js_onRequestOptions } from "C:\\Users\\conna\\CascadeProjects\\newwebsite123\\functions\\api\\tickets\\reopen.js"
import { onRequestPost as __api_tickets_reopen_js_onRequestPost } from "C:\\Users\\conna\\CascadeProjects\\newwebsite123\\functions\\api\\tickets\\reopen.js"
import { onRequestOptions as __api_tickets_reply_js_onRequestOptions } from "C:\\Users\\conna\\CascadeProjects\\newwebsite123\\functions\\api\\tickets\\reply.js"
import { onRequestPost as __api_tickets_reply_js_onRequestPost } from "C:\\Users\\conna\\CascadeProjects\\newwebsite123\\functions\\api\\tickets\\reply.js"
import { onRequestGet as __api_tickets_v2__id__js_onRequestGet } from "C:\\Users\\conna\\CascadeProjects\\newwebsite123\\functions\\api\\tickets-v2\\[id].js"
import { onRequestOptions as __api_tickets_v2__id__js_onRequestOptions } from "C:\\Users\\conna\\CascadeProjects\\newwebsite123\\functions\\api\\tickets-v2\\[id].js"
import { onRequestGet as __api_tickets__id__js_onRequestGet } from "C:\\Users\\conna\\CascadeProjects\\newwebsite123\\functions\\api\\tickets\\[id].js"
import { onRequestOptions as __api_tickets__id__js_onRequestOptions } from "C:\\Users\\conna\\CascadeProjects\\newwebsite123\\functions\\api\\tickets\\[id].js"
import { onRequest as __api_auth_js_onRequest } from "C:\\Users\\conna\\CascadeProjects\\newwebsite123\\functions\\api\\auth.js"
import { onRequest as __api_create_checkout_js_onRequest } from "C:\\Users\\conna\\CascadeProjects\\newwebsite123\\functions\\api\\create-checkout.js"
import { onRequest as __api_paylix_api_js_onRequest } from "C:\\Users\\conna\\CascadeProjects\\newwebsite123\\functions\\api\\paylix-api.js"
import { onRequest as __api_paylix_stats_js_onRequest } from "C:\\Users\\conna\\CascadeProjects\\newwebsite123\\functions\\api\\paylix-stats.js"
import { onRequest as __api_paylix_webhook_js_onRequest } from "C:\\Users\\conna\\CascadeProjects\\newwebsite123\\functions\\api\\paylix-webhook.js"
import { onRequest as __api_save_customer_js_onRequest } from "C:\\Users\\conna\\CascadeProjects\\newwebsite123\\functions\\api\\save-customer.js"

export const routes = [
    {
      routePath: "/api/tickets-v2/admin/all",
      mountPath: "/api/tickets-v2/admin",
      method: "GET",
      middlewares: [],
      modules: [__api_tickets_v2_admin_all_js_onRequestGet],
    },
  {
      routePath: "/api/tickets-v2/admin/all",
      mountPath: "/api/tickets-v2/admin",
      method: "OPTIONS",
      middlewares: [],
      modules: [__api_tickets_v2_admin_all_js_onRequestOptions],
    },
  {
      routePath: "/api/tickets-v2/close",
      mountPath: "/api/tickets-v2",
      method: "OPTIONS",
      middlewares: [],
      modules: [__api_tickets_v2_close_js_onRequestOptions],
    },
  {
      routePath: "/api/tickets-v2/close",
      mountPath: "/api/tickets-v2",
      method: "POST",
      middlewares: [],
      modules: [__api_tickets_v2_close_js_onRequestPost],
    },
  {
      routePath: "/api/tickets-v2/create",
      mountPath: "/api/tickets-v2",
      method: "OPTIONS",
      middlewares: [],
      modules: [__api_tickets_v2_create_js_onRequestOptions],
    },
  {
      routePath: "/api/tickets-v2/create",
      mountPath: "/api/tickets-v2",
      method: "POST",
      middlewares: [],
      modules: [__api_tickets_v2_create_js_onRequestPost],
    },
  {
      routePath: "/api/tickets-v2/list",
      mountPath: "/api/tickets-v2",
      method: "GET",
      middlewares: [],
      modules: [__api_tickets_v2_list_js_onRequestGet],
    },
  {
      routePath: "/api/tickets-v2/list",
      mountPath: "/api/tickets-v2",
      method: "OPTIONS",
      middlewares: [],
      modules: [__api_tickets_v2_list_js_onRequestOptions],
    },
  {
      routePath: "/api/tickets-v2/reopen",
      mountPath: "/api/tickets-v2",
      method: "OPTIONS",
      middlewares: [],
      modules: [__api_tickets_v2_reopen_js_onRequestOptions],
    },
  {
      routePath: "/api/tickets-v2/reopen",
      mountPath: "/api/tickets-v2",
      method: "POST",
      middlewares: [],
      modules: [__api_tickets_v2_reopen_js_onRequestPost],
    },
  {
      routePath: "/api/tickets-v2/reply",
      mountPath: "/api/tickets-v2",
      method: "OPTIONS",
      middlewares: [],
      modules: [__api_tickets_v2_reply_js_onRequestOptions],
    },
  {
      routePath: "/api/tickets-v2/reply",
      mountPath: "/api/tickets-v2",
      method: "POST",
      middlewares: [],
      modules: [__api_tickets_v2_reply_js_onRequestPost],
    },
  {
      routePath: "/api/tickets/close",
      mountPath: "/api/tickets",
      method: "OPTIONS",
      middlewares: [],
      modules: [__api_tickets_close_js_onRequestOptions],
    },
  {
      routePath: "/api/tickets/close",
      mountPath: "/api/tickets",
      method: "POST",
      middlewares: [],
      modules: [__api_tickets_close_js_onRequestPost],
    },
  {
      routePath: "/api/tickets/create",
      mountPath: "/api/tickets",
      method: "OPTIONS",
      middlewares: [],
      modules: [__api_tickets_create_js_onRequestOptions],
    },
  {
      routePath: "/api/tickets/create",
      mountPath: "/api/tickets",
      method: "POST",
      middlewares: [],
      modules: [__api_tickets_create_js_onRequestPost],
    },
  {
      routePath: "/api/tickets/list",
      mountPath: "/api/tickets",
      method: "GET",
      middlewares: [],
      modules: [__api_tickets_list_js_onRequestGet],
    },
  {
      routePath: "/api/tickets/list",
      mountPath: "/api/tickets",
      method: "OPTIONS",
      middlewares: [],
      modules: [__api_tickets_list_js_onRequestOptions],
    },
  {
      routePath: "/api/tickets/reopen",
      mountPath: "/api/tickets",
      method: "OPTIONS",
      middlewares: [],
      modules: [__api_tickets_reopen_js_onRequestOptions],
    },
  {
      routePath: "/api/tickets/reopen",
      mountPath: "/api/tickets",
      method: "POST",
      middlewares: [],
      modules: [__api_tickets_reopen_js_onRequestPost],
    },
  {
      routePath: "/api/tickets/reply",
      mountPath: "/api/tickets",
      method: "OPTIONS",
      middlewares: [],
      modules: [__api_tickets_reply_js_onRequestOptions],
    },
  {
      routePath: "/api/tickets/reply",
      mountPath: "/api/tickets",
      method: "POST",
      middlewares: [],
      modules: [__api_tickets_reply_js_onRequestPost],
    },
  {
      routePath: "/api/tickets-v2/:id",
      mountPath: "/api/tickets-v2",
      method: "GET",
      middlewares: [],
      modules: [__api_tickets_v2__id__js_onRequestGet],
    },
  {
      routePath: "/api/tickets-v2/:id",
      mountPath: "/api/tickets-v2",
      method: "OPTIONS",
      middlewares: [],
      modules: [__api_tickets_v2__id__js_onRequestOptions],
    },
  {
      routePath: "/api/tickets/:id",
      mountPath: "/api/tickets",
      method: "GET",
      middlewares: [],
      modules: [__api_tickets__id__js_onRequestGet],
    },
  {
      routePath: "/api/tickets/:id",
      mountPath: "/api/tickets",
      method: "OPTIONS",
      middlewares: [],
      modules: [__api_tickets__id__js_onRequestOptions],
    },
  {
      routePath: "/api/auth",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_auth_js_onRequest],
    },
  {
      routePath: "/api/create-checkout",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_create_checkout_js_onRequest],
    },
  {
      routePath: "/api/paylix-api",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_paylix_api_js_onRequest],
    },
  {
      routePath: "/api/paylix-stats",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_paylix_stats_js_onRequest],
    },
  {
      routePath: "/api/paylix-webhook",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_paylix_webhook_js_onRequest],
    },
  {
      routePath: "/api/save-customer",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_save_customer_js_onRequest],
    },
  ]