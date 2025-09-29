import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendVerificationEmail(email: string, token: string) {
  const verifyUrl = `${process.env.NEXTAUTH_URL}/api/auth/verify?token=${token}`;

  const html = `
    <div style="max-width: 600px; margin: 0 auto; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <div style="background: linear-gradient(135deg, #f59e0b, #d97706); padding: 40px; text-align: center; border-radius: 12px 12px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">🚀 Easy Cron Jobs</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0;">Vérifiez votre adresse email</p>
      </div>
      
      <div style="background: white; padding: 40px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
        <h2 style="color: #171717; margin: 0 0 16px 0;">Presque prêt à déployer vos cron jobs !</h2>
        
        <p style="color: #525252; line-height: 1.6; margin-bottom: 24px;">
          Cliquez sur le bouton ci-dessous pour confirmer votre adresse email et activer votre compte Easy Cron Jobs.
        </p>
        
        <div style="text-align: center; margin: 32px 0;">
          <a href="${verifyUrl}" 
             style="display: inline-block; background: #f59e0b; color: white; padding: 16px 32px; text-decoration: none; border-radius: 24px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);">
            ✅ Vérifier mon email
          </a>
        </div>
        
        <p style="color: #737373; font-size: 14px; margin-top: 32px;">
          Ce lien expire dans 15 minutes. Si vous n'avez pas créé de compte, ignorez cet email.
        </p>
        
        <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 24px 0;">
        
        <p style="color: #a3a3a3; font-size: 12px; text-align: center; margin: 0;">
          Easy Cron Jobs - Vos cron jobs dans le cloud, sans prise de tête
        </p>
      </div>
    </div>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "noreply@easycronjobs.com",
      to: email,
      subject: "🚀 Vérifiez votre email - Easy Cron Jobs",
      html,
    });

    if (error) {
      console.error("Resend error:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Email send error:", error);
    return { success: false, error };
  }
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;

  const html = `
    <div style="max-width: 600px; margin: 0 auto; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <div style="background: linear-gradient(135deg, #f59e0b, #d97706); padding: 40px; text-align: center; border-radius: 12px 12px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">🔐 Easy Cron Jobs</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0;">Réinitialisation de mot de passe</p>
      </div>
      
      <div style="background: white; padding: 40px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
        <h2 style="color: #171717; margin: 0 0 16px 0;">Réinitialisez votre mot de passe</h2>
        
        <p style="color: #525252; line-height: 1.6; margin-bottom: 24px;">
          Une demande de réinitialisation de mot de passe a été effectuée pour votre compte. Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe.
        </p>
        
        <div style="text-align: center; margin: 32px 0;">
          <a href="${resetUrl}" 
             style="display: inline-block; background: #f59e0b; color: white; padding: 16px 32px; text-decoration: none; border-radius: 24px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);">
            🔑 Nouveau mot de passe
          </a>
        </div>
        
        <p style="color: #737373; font-size: 14px; margin-top: 32px;">
          Ce lien expire dans 15 minutes. Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.
        </p>
        
        <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 24px 0;">
        
        <p style="color: #a3a3a3; font-size: 12px; text-align: center; margin: 0;">
          Easy Cron Jobs - Vos cron jobs dans le cloud, sans prise de tête
        </p>
      </div>
    </div>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "noreply@easycronjobs.com",
      to: email,
      subject: "🔐 Réinitialisation de mot de passe - Easy Cron Jobs",
      html,
    });

    if (error) {
      console.error("Resend error:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Email send error:", error);
    return { success: false, error };
  }
}
