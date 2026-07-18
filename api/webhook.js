const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;

export default async function handler(req, res) {
  // ===== VERIFICACIÓN DEL WEBHOOK (Meta manda un GET una sola vez) =====
  if (req.method === "GET") {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      console.log("Webhook verificado correctamente");
      return res.status(200).send(challenge);
    } else {
      return res.status(403).send("Verificación fallida");
    }
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
        const textoUsuario = message.text?.body?.toLowerCase() || "";

        console.log(`Mensaje de ${from}: ${textoUsuario}`);

        let respuesta = "Hola, bienvenido al parque. Escribe 'horarios', 'precios' o 'ubicación'.";

        if (textoUsuario.includes("horario")) {
          respuesta = "Nuestro horario es de 9:00 am a 6:00 pm, todos los días.";
        } else if (textoUsuario.includes("precio")) {
          respuesta = "La entrada general cuesta S/ 25. Niños y adultos mayores S/ 15.";
        } else if (textoUsuario.includes("ubicaci")) {
          respuesta = "Estamos ubicados en [tu dirección aquí]. Aquí el mapa: [link]";
        }

        await fetch(`https://graph.facebook.com/v20.0/${PHONE_NUMBER_ID}/messages`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${WHATSAPP_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            to: from,
            type: "text",
            text: { body: respuesta },
          }),
        });
      }

      return res.status(200).send("EVENT_RECEIVED");
    } catch (error) {
      console.error("Error procesando el mensaje:", error);
      return res.status(200).send("EVENT_RECEIVED");
    }
  }

  return res.status(405).send("Método no permitido");
}