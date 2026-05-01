import express from 'express';
import { createServer as createViteServer } from 'vite';
import nodemailer from 'nodemailer';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Aumentar el límite para recibir imágenes base64 grandes
  app.use(express.json({ limit: '50mb' }));

  // API para enviar el reporte
  app.post('/api/send-report', async (req, res) => {
    const { to, subject, message, attachments, images } = req.body;

    // Verificar configuración SMTP
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

    if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
      return res.status(500).json({ 
        error: 'Configuración SMTP incompleta en las variables de entorno.',
        details: 'Se requieren SMTP_HOST, SMTP_USER y SMTP_PASS.' 
      });
    }

    try {
      const transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: parseInt(SMTP_PORT || '587'),
        secure: SMTP_PORT === '465',
        auth: {
          user: SMTP_USER,
          pass: SMTP_PASS,
        },
      });

      // Construir el cuerpo HTML con las imágenes embebidas
      let htmlBody = `<div style="font-family: Arial, sans-serif; color: #333;">
        <h2>Reporte de Auditoría 5S</h2>
        <p>${message.replace(/\n/g, '<br>')}</p>
        <hr />
        <h3>Gráfico de Desempeño por Área</h3>
        <img src="cid:chart_image" style="max-width: 100%; border: 1px solid #ddd; border-radius: 8px;" />
        <br /><br />
        <h3>Análisis Consolidado</h3>
        <img src="cid:consolidated_image" style="max-width: 100%; border: 1px solid #ddd; border-radius: 8px;" />
        <br />
        <p style="font-size: 12px; color: #666;">Este es un correo automático generado por AuditCheck Pro.</p>
      </div>`;

      const mailOptions = {
        from: SMTP_USER,
        to,
        subject,
        html: htmlBody,
        attachments: [
          // Excel adjunto
          {
            filename: attachments[0].filename,
            content: Buffer.from(attachments[0].content, 'base64'),
          },
          // Imágenes incrustadas (CID)
          {
            filename: 'performance_chart.png',
            content: Buffer.from(images.chart.split(',')[1], 'base64'),
            cid: 'chart_image'
          },
          {
            filename: 'consolidated_analysis.png',
            content: Buffer.from(images.consolidated.split(',')[1], 'base64'),
            cid: 'consolidated_image'
          }
        ],
      };

      await transporter.sendMail(mailOptions);
      res.json({ success: true, message: 'Correo enviado correctamente' });
    } catch (error: any) {
      console.error('Error al enviar correo:', error);
      res.status(500).json({ error: 'Error al enviar el correo', details: error.message });
    }
  });

  // Integración con Vite
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
  });
}

startServer();
