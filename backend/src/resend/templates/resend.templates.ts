// src/resend/templates/email.templates.ts

export const EmailTemplates = {

  welcome(userName?: string) {
    return {
      subject: '¡Bienvenido a nuestra plataforma!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
          <h2>¡Bienvenido${userName ? `, ${userName}` : ''}! </h2>
          <p>Estamos muy felices de tenerte con nosotros. Tu cuenta ha sido creada exitosamente.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #888;">Si tienes dudas, responde a este correo.</p>
        </div>
      `,
    };
  },

  verification(code: string) {
    return {
      subject: `${code} es tu código de verificación`,
      html: `
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="background-color: #f4f6f8; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 20px;">
          <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 550px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05); margin: 30px auto;">
            
            <!-- Header -->
            <tr>
              <td style="background-color: #111827; padding: 30px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">
                  Verifica tu Cuenta
                </h1>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding: 40px 30px; text-align: center;">
                <p style="font-size: 16px; color: #4b5563; margin-bottom: 24px;">
                  Usa el siguiente código de seguridad para confirmar tu correo:
                </p>

                <!-- OTP Display -->
                <div style="background-color: #f3f4f6; border: 1px dashed #d1d5db; border-radius: 8px; padding: 18px 24px; display: inline-block; margin-bottom: 24px;">
                  <span style="font-family: monospace; font-size: 36px; font-weight: 800; color: #000; letter-spacing: 8px;">
                    ${code}
                  </span>
                </div>

                <p style="font-size: 14px; color: #6b7280; margin: 0;">
                  Este código expira en <strong>15 minutos</strong>.
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background-color: #f9fafb; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                <p style="font-size: 12px; color: #9ca3af; margin: 0;">
                  © ${new Date().getFullYear()} Tu Empresa. Todos los derechos reservados.
                </p>
              </td>
            </tr>

          </table>
        </body>
        </html>
      `,
    };
  },
};