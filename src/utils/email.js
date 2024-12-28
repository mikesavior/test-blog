const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const emailTemplates = {
  verification: (token) => ({
    subject: 'Verify Your Email',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            .button {
              background-color: #4CAF50;
              border: none;
              color: white;
              padding: 15px 32px;
              text-align: center;
              text-decoration: none;
              display: inline-block;
              font-size: 16px;
              margin: 4px 2px;
              cursor: pointer;
              border-radius: 4px;
            }
          </style>
        </head>
        <body>
          <h1>Welcome to ${process.env.APP_NAME || 'Our Platform'}!</h1>
          <p>Please verify your email by clicking the button below:</p>
          <a href="${process.env.APP_URL}/verify-email?token=${token}" class="button">
            Verify Email
          </a>
          <p>This link will expire in 24 hours.</p>
          <p>If you didn't create an account, you can safely ignore this email.</p>
        </body>
      </html>
    `
  }),
  
  passwordReset: (token) => ({
    subject: 'Reset Your Password',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            .button {
              background-color: #008CBA;
              border: none;
              color: white;
              padding: 15px 32px;
              text-align: center;
              text-decoration: none;
              display: inline-block;
              font-size: 16px;
              margin: 4px 2px;
              cursor: pointer;
              border-radius: 4px;
            }
          </style>
        </head>
        <body>
          <h1>Password Reset Request</h1>
          <p>A password reset was requested for your account. Click the button below to reset your password:</p>
          <a href="${process.env.APP_URL}/reset-password?token=${token}" class="button">
            Reset Password
          </a>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request this reset, please ignore this email and ensure your account is secure.</p>
        </body>
      </html>
    `
  })
};

const sendEmail = async (to, template, token) => {
  const { subject, html } = emailTemplates[template](token);
  
  const msg = {
    to,
    from: {
      email: process.env.EMAIL_FROM,
      name: process.env.EMAIL_FROM_NAME || 'No Reply'
    },
    subject,
    html,
    trackingSettings: {
      clickTracking: { enable: true },
      openTracking: { enable: true }
    }
  };

  try {
    await sgMail.send(msg);
    console.log(`${template} email sent to ${to}`);
  } catch (error) {
    console.error('SendGrid error:', error?.response?.body || error);
    throw new Error('Failed to send email');
  }
};

const sendVerificationEmail = (to, token) => sendEmail(to, 'verification', token);
const sendPasswordResetEmail = (to, token) => sendEmail(to, 'passwordReset', token);

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail
};