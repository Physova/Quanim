import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY 
  ? new Resend(process.env.RESEND_API_KEY) 
  : null;

export async function sendWelcomeEmail(email: string, username: string) {
  const subject = "Welcome to Physova - The Physics Learning Lab";
  const html = `
    <div style="font-family: sans-serif; background-color: #000; color: #fff; padding: 40px; border: 1px solid #333;">
      <h1 style="font-family: serif; letter-spacing: -0.05em; text-transform: uppercase;">Physova</h1>
      <p style="color: #888; font-size: 14px; text-transform: uppercase; letter-spacing: 0.1em;">New Account Verified</p>
      <hr style="border: none; border-top: 1px solid #333; margin: 20px 0;" />
      <p>Hello <strong>${username}</strong>,</p>
      <p>Welcome to the community. You now have full access to our interactive physics simulations, discussions, and progress tracking.</p>
      <div style="margin: 30px 0; padding: 20px; background-color: #111; border-left: 2px solid #fff;">
        <p style="margin: 0; font-size: 13px; color: #aaa;">"The important thing is not to stop questioning. Curiosity has its own reason for existing."</p>
        <p style="margin: 5px 0 0 0; font-size: 11px; color: #555;">— Albert Einstein</p>
      </div>
      <p>Start exploring the laws of motion or the quantum realm today.</p>
      <a href="https://physova.vercel.app/topics" style="display: inline-block; background-color: #fff; color: #000; padding: 12px 24px; text-decoration: none; font-weight: bold; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em;">Go to Topics</a>
      <hr style="border: none; border-top: 1px solid #333; margin: 40px 0 20px 0;" />
      <p style="color: #444; font-size: 10px;">This is an automated transmission from the Physova platform.</p>
    </div>
  `;

  if (!resend) {
    console.log("------------------------------------------");
    console.log("📧 SIMULATED EMAIL (No API Key found)");
    console.log("To:", email);
    console.log("Subject:", subject);
    console.log("Body:", html);
    console.log("------------------------------------------");
    return { success: true, simulated: true };
  }

  try {
    const result = await resend.emails.send({
      from: 'Physova <onboarding@resend.dev>',
      to: email,
      subject,
      html,
    });
    
    if (result.error) {
      console.warn("📧 Email not sent (Resend Sandbox/Limit):", result.error.message);
    } else {
      console.log("📧 Welcome email sent to:", email);
    }
  } catch (err) {
    console.error("❌ Email Exception:", err);
    return { success: false, error: err };
  }
}
