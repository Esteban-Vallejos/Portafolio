const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middlewares
app.use(express.json());
app.use(cors());
app.use(express.static('public'));

// Configuración del transportador de correo
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Ruta principal
// Configura la carpeta pública
app.use(express.static(path.join(__dirname, 'public')));

// Ruta principal
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Plantilla base para correos
const emailTemplate = (content) => `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
  </head>
  <body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
    <div style="max-width: 600px; margin: 40px auto; background: white; border-radius: 12px; padding: 40px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
      ${content}
      <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee;">
        <p style="color: #666; font-size: 12px; margin: 0;">
          © ${new Date().getFullYear()} ${process.env.COMPANY_NAME}
        </p>
      </div>
    </div>
  </body>
  </html>
`;

// Ruta para manejar el envío del formulario
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, affair, message } = req.body;

    // Correo para el administrador
    const adminMailOptions = {
      from: process.env.EMAIL,
      to: process.env.DESTINATION_EMAIL,
      subject: `✉️ Nuevo mensaje: ${affair}`,
      html: emailTemplate(`
        <div style="text-align: center; margin-bottom: 30px;">
          <h2 style="color: #333; font-weight: 500; margin: 0;">Nuevo Mensaje Recibido</h2>
          <div style="width: 40px; height: 2px; background-color: #333; margin: 15px auto;"></div>
        </div>
        
        <div style="background: #f8f9fa; padding: 25px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 10px 0;"><strong style="color: #333;">Nombre:</strong> <span style="color: #555;">${name}</span></p>
          <p style="margin: 10px 0;"><strong style="color: #333;">Email:</strong> <span style="color: #555;">${email}</span></p>
          <p style="margin: 10px 0;"><strong style="color: #333;">Asunto:</strong> <span style="color: #555;">${affair}</span></p>
        </div>

        <div style="margin-top: 20px;">
          <strong style="color: #333;">Mensaje:</strong>
          <p style="color: #555; line-height: 1.6; margin-top: 10px; padding: 20px; background: #f8f9fa; border-radius: 8px;">${message}</p>
        </div>
      `)
    };

    // Correo de confirmación para el remitente
    const userMailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: '✨ Hemos recibido tu mensaje',
      html: emailTemplate(`
        <div style="text-align: center; margin-bottom: 30px;">
          <h2 style="color: #333; font-weight: 500; margin: 0;">¡Gracias por contactarnos!</h2>
          <div style="width: 40px; height: 2px; background-color: #333; margin: 15px auto;"></div>
        </div>

        <p style="color: #555; line-height: 1.6; text-align: center;">
          Hola ${name}, hemos recibido tu mensaje correctamente.
        </p>

        <div style="background: #f8f9fa; padding: 25px; border-radius: 8px; margin: 30px 0; text-align: center;">
          <p style="color: #555; margin: 0;">Te responderemos lo antes posible.</p>
        </div>

        <div style="margin-top: 30px; padding: 20px; background: #f8f9fa; border-radius: 8px;">
          <p style="color: #666; margin: 0 0 10px 0; font-size: 14px;">Resumen de tu mensaje:</p>
          <p style="color: #333; margin: 5px 0;"><strong>Asunto:</strong> ${affair}</p>
          <p style="color: #555; margin: 10px 0; font-style: italic;">${message}</p>
        </div>

        <p style="color: #999; font-size: 12px; text-align: center; margin-top: 30px;">
          Este es un mensaje automático, por favor no respondas a este correo.
        </p>
      `)
    };

    // Enviar ambos correos
    await Promise.all([
      transporter.sendMail(adminMailOptions),
      transporter.sendMail(userMailOptions)
    ]);

    res.status(200).json({ message: 'Mensaje enviado con éxito' });
  } catch (error) {
    console.error('Error al enviar el mensaje:', error);
    res.status(500).json({ error: 'Error al enviar el mensaje' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
  console.log(`Accede desde otros dispositivos usando: http://192.168.0.2:${PORT}`);
});