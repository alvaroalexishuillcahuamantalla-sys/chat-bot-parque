// api/webhook.js

const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;

// ===================================================================
// TEXTOS DE CADA RESPUESTA (basados en el formato que ya usas)
// ===================================================================

const TEXTOS = {
  horarios: `🕒 *HORARIOS E INGRESO*

📅 Lunes a domingo (incluyendo feriados)
⏰ 9:30 a.m. a 5:30 p.m.

🎟️ *Precios de ingreso:*
- Adultos: S/ 7.00
- Niños: S/ 4.00

✅ *El ingreso incluye:*
- Mano Gigante del Inca
- Bosque Encantado de los Duendes
- Mano de Choclo de Oro
- Trilogía Andina
- Diversos miradores turísticos

💬 Escribe *menu* para volver al inicio`,

  precios: `💰 *PRECIOS UNITARIOS DE JUEGOS*

🌊 *Juegos Acuáticos*
- Caminata en línea — S/ 5.00
- Puente acuático — S/ 5.00
- Tirolesa acuática — S/ 8.00
- Puente aéreo — S/ 8.00

⛰️ *Juegos de Altura*
- Columpio Extremo "Vuelo del Cóndor" — S/ 20.00
- Circuito de 21 obstáculos extremos — S/ 20.00

💬 Escribe *menu* para volver al inicio`,

  paquetes: `🎒 *PAQUETES PROMOCIONALES*

💦 *Paquete Acuático* — S/ 25.00
- Entrada al parque
- Puente acuático
- Caminata en línea
- Tirolesa acuática
- Puente aéreo

🧗 *Paquete Aventurero* — S/ 35.00
- Entrada al parque
- Columpio extremo
- Circuito de 21 obstáculos
- Puente acuático

🔥 *Paquete Full* — S/ 45.00
- Entrada al parque
- Columpio extremo
- Circuito de 21 obstáculos
- Tirolesa acuática
- Caminata en línea
- Puente aéreo
- Puente acuático

💬 Escribe *menu* para volver al inicio`,

  ubicacion: `📍 *CÓMO LLEGAR A SAQSAYKI*

🏃‍♂️ Nos encontramos aproximadamente a 30 minutos a pie desde la Chicana Grande.
🚕 En taxi podrás llegar en aproximadamente 15 minutos desde Chicana Grande.

🗺️ *Google Maps:*
https://maps.app.goo.gl/xrwjZyXT2iBeMiUr9

📞 *Taxis recomendados:*
926 050 769
991 972 382

🏍️ *Tours en cuatrimoto:*
942208931

💬 Escribe *menu* para volver al inicio`,

  restaurante: `🍽️ *CARTA DEL RESTAURANTE SAQSAYKI*

Aquí está nuestra carta completa con todos nuestros platillos.

📌 Nota: Solo realizamos reservas para días festivos y eventos especiales.

¿Tienes alguna consulta? Escríbenos sin problema, estamos para ayudarte.

💬 Escribe *menu* para volver al inicio`,
};

// ===================================================================
// FUNCIONES PARA ENVIAR MENSAJES
// ===================================================================

// Envía el menú principal como LISTA INTERACTIVA
async function enviarMenuPrincipal(to) {
  await fetch(`https://graph.facebook.com/v20.0/${PHONE_NUMBER_ID}/messages`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${WHATSAPP_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "interactive",
      interactive: {
        type: "list",
        header: {
          type: "text",
          text: "Parque Temático Saqsayki ✨",
        },
        body: {
          text: "¡Bienvenido(a)! Vive una experiencia única llena de aventura, diversión y naturaleza.\n\nSelecciona una opción:",
        },
        footer: {
          text: "Saqsayki - Tu mejor experiencia",
        },
        action: {
          button: "Ver opciones",
          sections: [
            {
              title: "Menú principal",
              rows: [
                { id: "opcion_1", title: "1. Horarios e ingreso", description: "Horarios y precio de entrada" },
                { id: "opcion_2", title: "2. Precios de juegos", description: "Precio unitario de cada juego" },
                { id: "opcion_3", title: "3. Paquetes promocionales", description: "Combos y promociones" },
                { id: "opcion_4", title: "4. Cómo llegar", description: "Ubicación y transporte" },
                { id: "opcion_5", title: "5. Restaurante 🍽️", description: "Ver carta completa" },
              ],
            },
          ],
        },
      },
    }),
  });
}

// Envía un mensaje de texto simple
async function enviarTexto(to, texto) {
  await fetch(`https://graph.facebook.com/v20.0/${PHONE_NUMBER_ID}/messages`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${WHATSAPP_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { body: texto },
    }),
  });
}

// ===================================================================
// INTERPRETAR QUÉ ESCRIBIÓ O TOCÓ EL USUARIO
// ===================================================================

function interpretarMensaje(message) {
  // Si el usuario TOCÓ una opción de la lista interactiva
  if (message.interactive?.type === "list_reply") {
    return message.interactive.list_reply.id; // ej: "opcion_1"
  }

  // Si el usuario escribió TEXTO LIBRE (respaldo)
  const texto = message.text?.body?.toLowerCase().trim() || "";

  // Saludos / palabra "menu" -> mostrar el menú principal
  const saludos = ["hola", "buenas", "buenos dias", "buenos días", "buenas tardes", "buenas noches", "menu", "menú", "inicio", "empezar"];
  if (saludos.some((s) => texto.includes(s))) {
    return "menu";
  }

  // Coincidencia por número exacto (1, 2, 3, 4, 5)
  if (texto === "1") return "opcion_1";
  if (texto === "2") return "opcion_2";
  if (texto === "3") return "opcion_3";
  if (texto === "4") return "opcion_4";
  if (texto === "5") return "opcion_5";

  // Coincidencia por palabras clave (respaldo adicional)
  if (texto.includes("horario") || texto.includes("ingreso")) return "opcion_1";
  if (texto.includes("precio") && texto.includes("juego")) return "opcion_2";
  if (texto.includes("paquete") || texto.includes("promo")) return "opcion_3";
  if (texto.includes("llegar") || texto.includes("ubicaci") || texto.includes("direcci")) return "opcion_4";
  if (texto.includes("restaurant") || texto.includes("carta") || texto.includes("comida")) return "opcion_5";

  // Si no coincide con nada conocido
  return "no_reconocido";
}

// ===================================================================
// HANDLER PRINCIPAL
// ===================================================================

export default async function handler(req, res) {
  // ===== VERIFICACIÓN DEL WEBHOOK (Meta manda un GET una sola vez) =====
  if (req.method === "GET") {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      console.log("Webhook verificado correctamente");
      return res.status(200).send(challenge);
    }
    return res.status(403).send("Verificación fallida");
  }

  // ===== RECEPCIÓN DE MENSAJES (Meta manda un POST por cada mensaje) =====
  if (req.method === "POST") {
    try {
      const body = req.body;
      const entry = body.entry?.[0];
      const change = entry?.changes?.[0];
      const message = change?.value?.messages?.[0];

      if (message) {
        const from = message.from;
        const opcion = interpretarMensaje(message);

        console.log(`Mensaje de ${from} -> interpretado como: ${opcion}`);

        switch (opcion) {
          case "menu":
            await enviarMenuPrincipal(from);
            break;
          case "opcion_1":
            await enviarTexto(from, TEXTOS.horarios);
            break;
          case "opcion_2":
            await enviarTexto(from, TEXTOS.precios);
            break;
          case "opcion_3":
            await enviarTexto(from, TEXTOS.paquetes);
            break;
          case "opcion_4":
            await enviarTexto(from, TEXTOS.ubicacion);
            break;
          case "opcion_5":
            await enviarTexto(from, TEXTOS.restaurante);
            break;
          default:
            // CUALQUIER otro mensaje que no se reconozca -> responde
            // con un mensaje amable y muestra el menú de nuevo
            await enviarTexto(
              from,
              "¡Hola! 👋 No entendí tu mensaje, pero aquí tienes nuestro menú de opciones:"
            );
            await enviarMenuPrincipal(from);
            break;
        }
      }

      return res.status(200).send("EVENT_RECEIVED");
    } catch (error) {
      console.error("Error procesando el mensaje:", error);
      return res.status(200).send("EVENT_RECEIVED");
    }
  }

  return res.status(405).send("Método no permitido");
}