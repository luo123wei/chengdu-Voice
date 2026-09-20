import { Resend } from 'resend';
import { db } from '@/lib/db';

const resendApiKey = process.env.RESEND_API_KEY || '';
const resend = resendApiKey ? new Resend(resendApiKey) : null;

const fromEmail = process.env.MAIL_FROM || 'onboarding@resend.dev';

export async function sendEmail(options: {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  from?: string;
}) {
  if (!resend) {
    throw new Error('RESEND_API_KEY is not configured. Please set it in your environment variables.');
  }

  const { to, subject, text, html, from } = options;

  console.log(`[Email] Sending email via Resend to: ${to}`);

  const payload: Record<string, unknown> = {
    from: from || fromEmail,
    to,
    subject,
  };
  if (html) payload.html = html;
  if (text) payload.text = text;

  const data = await resend.emails.send(payload as any);

  if (data.error) {
    throw new Error(`Resend error: ${data.error.message}`);
  }

  console.log(`[Email] Email sent successfully via Resend to: ${to}, id: ${data.data?.id}`);
  return data;
}

export async function sendVerificationEmail(email: string, code: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.voiceculture.world';

  return sendEmail({
    to: email,
    subject: 'Your Login Verification Code - Voice Culture',
    text: `Your verification code is: ${code}\n\nThis code expires in 10 minutes.\n\nVisit ${appUrl} to complete your login.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #8B4513 0%, #D4A574 100%); padding: 24px; border-radius: 12px; text-align: center;">
          <h2 style="color: white; margin: 0; font-size: 24px;">Voice Culture</h2>
        </div>
        <div style="padding: 24px; background: #f8f9fa; border-radius: 0 0 12px 12px;">
          <p style="color: #4a5568; margin: 0 0 16px;">Hello,</p>
          <p style="color: #4a5568; margin: 0 0 8px;">Your login verification code is:</p>
          <div style="font-size: 36px; font-weight: bold; color: #8B4513; margin: 20px 0; letter-spacing: 8px; text-align: center;">
            ${code}
          </div>
          <p style="color: #4a5568; margin: 0 0 8px;">This code expires in 10 minutes.</p>
          <p style="color: #4a5568; margin: 0;">Visit <a href="${appUrl}" style="color: #8B4513;">${appUrl}</a> to complete your login.</p>
          <p style="color: #718096; font-size: 12px; margin: 24px 0 0; text-align: center;">Voice Culture</p>
        </div>
      </div>
    `,
  });
}

export async function sendOrderConfirmationEmail(
  email: string,
  customerName: string,
  orderNumber: string,
  items: { name: string; nameEn: string; price: number; quantity: number }[],
  total: number,
  shippingMethod: string,
  paid = false,
  emailContent?: { subjectEn: string; bodyEn: string; subjectZh: string; bodyZh: string }
) {
  const itemsHtml = items.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">
        <p style="font-weight: bold; color: #2d3748; margin: 0;">${item.nameEn}</p>
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: right;">
        <p style="color: #4a5568; margin: 0;">Qty: ${item.quantity}</p>
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: right;">
        <p style="font-weight: bold; color: #2d3748; margin: 0;">$${(item.price * item.quantity).toFixed(2)}</p>
      </td>
    </tr>
  `).join('');

  const shippingLabelEn = shippingMethod === 'digital'
    ? 'Digital Delivery (no physical shipping)'
    : shippingMethod === 'standard'
      ? 'Standard Shipping (5-7 business days)'
      : 'Express Shipping (2-3 business days)';
  const defaultSubjectEn = paid
    ? 'Payment Received & Order Confirmed - Voice Culture'
    : "We've Received Your Order - Voice Culture";
  const defaultBodyEn = paid
    ? `Dear ${customerName},

Thank you for your order #${orderNumber}! Your PayPal payment of $${total.toFixed(2)} has been received successfully.

**Order Summary:**
${items.map(item => `- ${item.nameEn} x ${item.quantity} - $${(item.price * item.quantity).toFixed(2)}`).join('\n')}

**Total Paid:** $${total.toFixed(2)}
**Delivery:** ${shippingLabelEn}

${shippingMethod === 'digital'
      ? 'Your digital order will be delivered to this email address shortly.'
      : 'We will prepare and ship your order within 24 hours. You will receive a shipping confirmation with tracking information once it is on the way.'}

If you have any questions, please contact us at hello@voiceculture.world.

Best regards,
The Voice Culture Team`
    : `Dear ${customerName},

Thank you for your order! We have received your order #${orderNumber}. Our customer service team will contact you via email within 24 hours to arrange payment details.

**Order Summary:**
${items.map(item => `- ${item.nameEn} x ${item.quantity} - $${(item.price * item.quantity).toFixed(2)}`).join('\n')}

**Total:** $${total.toFixed(2)}
**Shipping Method:** ${shippingLabelEn}

**Payment is still pending.** We support PayPal, Payoneer and international wire transfer. Please wait for our email with payment instructions.

If you have any questions, please contact us at hello@voiceculture.world.

Best regards,
The Voice Culture Team`;

  const subjectEn = emailContent?.subjectEn || defaultSubjectEn;
  const bodyEn = emailContent?.bodyEn || defaultBodyEn;

  return sendEmail({
    to: email,
    subject: subjectEn,
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: 'Segoe UI', 'PingFang SC', sans-serif;">
        <div style="background: linear-gradient(135deg, #8B4513 0%, #D4A574 100%); padding: 30px; border-radius: 12px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Voice Culture</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0;">Experience the authentic voice of Chengdu</p>
        </div>
        <div style="padding: 30px; background: #f8f9fa; border-radius: 0 0 12px 12px;">
          <h2 style="color: #2d3748; font-size: 20px; margin-bottom: 20px;">Order Confirmation</h2>
          <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; text-align: center;">
            <p style="color: #718096; font-size: 14px; margin-bottom: 10px;">Order Number</p>
            <p style="font-size: 18px; font-weight: bold; color: #2d3748; margin: 0;">${orderNumber}</p>
          </div>
          <table style="width: 100%; margin-bottom: 20px; border-collapse: collapse;">
            <thead>
              <tr style="border-bottom: 2px solid #D4A574;">
                <th style="text-align: left; padding: 10px; color: #2d3748;">Product</th>
                <th style="text-align: right; padding: 10px; color: #2d3748;">Qty</th>
                <th style="text-align: right; padding: 10px; color: #2d3748;">Price</th>
              </tr>
            </thead>
            <tbody>${itemsHtml}</tbody>
            <tfoot>
              <tr>
                <td colspan="2" style="text-align: right; padding: 15px; font-weight: bold; color: #2d3748;">Total</td>
                <td style="text-align: right; padding: 15px; font-weight: bold; color: #D4A574; font-size: 18px;">$${total.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
          <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 20px;">
            <p style="color: #4a5568; line-height: 1.6; margin: 0;">
              ${bodyEn.split('\n').slice(-5).join('<br>')}
            </p>
          </div>
          <p style="color: #718096; font-size: 12px; margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 20px; text-align: center;">
            This email is automatically generated, please do not reply directly.<br>
            Voice Culture
          </p>
        </div>
      </div>
    `,
  });
}

export async function sendPaymentReceivedEmail(
  email: string,
  customerName: string,
  orderNumber: string,
  total: number
) {
  return sendEmail({
    to: email,
    subject: 'Payment Received - Your Order is Being Processed',
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: 'Segoe UI', 'PingFang SC', sans-serif;">
        <div style="background: linear-gradient(135deg, #8B4513 0%, #D4A574 100%); padding: 30px; border-radius: 12px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Voice Culture</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0;">Payment Received</p>
        </div>
        <div style="padding: 30px; background: #f8f9fa; border-radius: 0 0 12px 12px;">
          <div style="background: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 8px; margin-bottom: 20px; text-align: center;">
            <p style="color: #155724; font-weight: bold; margin: 0;">✅ Payment Received</p>
          </div>
          <p style="color: #4a5568; line-height: 1.6; margin: 0 0 16px;">
            Dear ${customerName},<br><br>
            We have received your payment for order <strong>#${orderNumber}</strong>. Your order is now being processed and will be shipped within 24 hours.
          </p>
          <div style="background: white; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center;">
            <p style="color: #718096; font-size: 14px; margin-bottom: 8px;">Order Number</p>
            <p style="font-size: 18px; font-weight: bold; color: #2d3748; margin: 0;">${orderNumber}</p>
            <p style="color: #D4A574; font-weight: bold; margin-top: 12px;">Total: $${total.toFixed(2)}</p>
          </div>
          <p style="color: #718096; font-size: 12px; margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 20px; text-align: center;">
            This email is automatically generated, please do not reply directly.<br>
            Questions? Contact us at hello@voiceculture.world<br>
            Voice Culture
          </p>
        </div>
      </div>
    `,
  });
}

export async function sendCustomEmailToBuyer(
  email: string,
  customerName: string,
  orderNumber: string,
  subject: string,
  message: string,
  paymentLink?: string
) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.voiceculture.world';

  const paymentSection = paymentLink
    ? `
      <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
        <p style="color: #856404; font-weight: bold; margin: 0 0 12px;">💳 Payment Link</p>
        <a href="${paymentLink}" style="display: inline-block; background: #8B4513; color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: bold; margin: 8px 0; word-break: break-all;">
          Click to Pay
        </a>
        <p style="color: #856404; font-size: 12px; margin-top: 8px; word-break: break-all;">${paymentLink}</p>
      </div>
    `
    : '';

  const messageHtml = message.split('\n').map(line => `<p style="color: #4a5568; line-height: 1.6; margin: 0 0 12px;">${line || '&nbsp;'}</p>`).join('');

  return sendEmail({
    to: email,
    subject: `${subject} - Order ${orderNumber}`,
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: 'Segoe UI', 'PingFang SC', sans-serif;">
        <div style="background: linear-gradient(135deg, #8B4513 0%, #D4A574 100%); padding: 30px; border-radius: 12px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Voice Culture</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0;">Customer Service Message</p>
        </div>
        <div style="padding: 30px; background: #f8f9fa; border-radius: 0 0 12px 12px;">
          <p style="color: #4a5568; margin: 0 0 16px;">Dear ${customerName},</p>
          <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            ${messageHtml}
          </div>
          ${paymentSection}
          <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 20px;">
            <p style="color: #4a5568; line-height: 1.6; margin: 0;">
              This message is regarding your order <strong>#${orderNumber}</strong>.
            </p>
            <p style="color: #718096; font-size: 12px; margin-top: 20px;">
              📧 Reply to this email or contact us at <a href="mailto:hello@voiceculture.world" style="color: #8B4513;">hello@voiceculture.world</a><br>
              Visit <a href="${appUrl}" style="color: #8B4513;">${appUrl}</a>
            </p>
          </div>
          <p style="color: #718096; font-size: 12px; margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 20px; text-align: center;">
            Voice Culture
          </p>
        </div>
      </div>
    `,
  });
}

export async function sendDownloadLinkEmail(email: string) {
  const downloadLink = process.env.DOWNLOAD_LINK || 'https://example.com/download';

  return sendEmail({
    to: email,
    subject: 'Get Your Free Chengdu Sound Map - Voice Culture',
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: 'Segoe UI', sans-serif;">
        <div style="background: linear-gradient(135deg, #8B4513 0%, #D4A574 100%); padding: 30px; border-radius: 12px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Voice Culture</h1>
        </div>
        <div style="padding: 30px; background: #f8f9fa; border-radius: 0 0 12px 12px;">
          <h2 style="color: #2d3748; font-size: 20px; margin-bottom: 20px;">Welcome to Voice Culture!</h2>
          <p style="color: #4a5568; line-height: 1.6; margin-bottom: 20px;">
            Thank you for subscribing! Click the button below to download your free Chengdu Sound Map white noise album.
          </p>
          <a href="${downloadLink}" style="display: inline-block; background: #8B4513; color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: bold; margin: 20px 0;">
            Download Now
          </a>
          <p style="color: #718096; font-size: 12px; margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 20px; text-align: center;">
            This email is automatically generated. Please do not reply directly.<br>
            Voice Culture
          </p>
        </div>
      </div>
    `,
  });
}

export async function sendWelcomeDiscountEmail(email: string) {
  const shopLink = `${process.env.NEXT_PUBLIC_APP_URL || 'https://www.voiceculture.world'}/shop`;

  return sendEmail({
    to: email,
    subject: 'Your 10% Welcome Code - Voice Culture',
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: 'Segoe UI', sans-serif;">
        <div style="background: #000; padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: #D4A574; margin: 0; font-size: 24px; letter-spacing: 1px;">VOICE CULTURE</h1>
        </div>
        <div style="padding: 30px; background: #f8f9fa; border-radius: 0 0 12px 12px;">
          <h2 style="color: #2d3748; font-size: 20px; margin-bottom: 20px;">Welcome to the studio.</h2>
          <p style="color: #4a5568; line-height: 1.6; margin-bottom: 12px;">
            Thanks for subscribing. Here is your welcome gift:
          </p>
          <div style="text-align: center; margin: 24px 0;">
            <div style="display: inline-block; border: 2px dashed #D4A574; border-radius: 8px; padding: 16px 36px;">
              <span style="font-size: 26px; font-weight: bold; letter-spacing: 3px; color: #000;">WELCOME10</span>
            </div>
            <p style="color: #718096; font-size: 13px; margin: 10px 0 0;">10% off your first order &middot; one use per customer</p>
          </div>
          <p style="color: #4a5568; line-height: 1.6; margin-bottom: 20px;">
            Enter the code at checkout. You will also be first to vote on new designs and get access to limited pre-orders.
          </p>
          <a href="${shopLink}" style="display: inline-block; background: #000; color: #fff; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: bold; margin: 0 0 20px;">
            Browse the Shop
          </a>
          <p style="color: #718096; font-size: 12px; margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 20px; text-align: center;">
            This email is automatically generated. Please do not reply directly.<br>
            Voice Culture &middot; Chengdu, China
          </p>
        </div>
      </div>
    `,
  });
}

export async function sendReviewVerificationEmail(
  email: string,
  nickname: string,
  reviewId: string,
  productId: string
) {
  const verificationLink = `${process.env.NEXT_PUBLIC_APP_URL || 'https://www.voiceculture.world'}/verify-review?token=${reviewId}`;

  return sendEmail({
    to: email,
    subject: 'Verify Your Review - Voice Culture',
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: 'Segoe UI', sans-serif;">
        <div style="background: linear-gradient(135deg, #8B4513 0%, #D4A574 100%); padding: 30px; border-radius: 12px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Voice Culture</h1>
        </div>
        <div style="padding: 30px; background: #f8f9fa; border-radius: 0 0 12px 12px;">
          <h2 style="color: #2d3748; font-size: 20px; margin-bottom: 20px;">Hello ${nickname},</h2>
          <p style="color: #4a5568; line-height: 1.6; margin-bottom: 20px;">
            Thank you for reviewing our product! Please click the button below to verify your review before it appears on our site.
          </p>
          <a href="${verificationLink}" style="display: inline-block; background: #8B4513; color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: bold; margin: 20px 0;">
            Verify My Review
          </a>
          <p style="color: #718096; font-size: 12px; margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 20px; text-align: center;">
            This email is automatically generated. Please do not reply directly.<br>
            Voice Culture
          </p>
        </div>
      </div>
    `,
  });
}

export async function sendReviewInvitationEmail(
  email: string,
  customerName: string,
  productName: string,
  productId: string
) {
  // 通过 productId 查询 slug，生成 SEO 友好的评价链接
  let slug = productId;
  try {
    const product = await db.products.getById(productId);
    if (product?.slug) slug = product.slug;
  } catch (e) {
    // 查询失败时回退到 productId，保证邮件可发送
  }
  const reviewLink = `${process.env.NEXT_PUBLIC_APP_URL || 'https://www.voiceculture.world'}/shop/${slug}#reviews`;

  return sendEmail({
    to: email,
    subject: 'Share Your Review - Voice Culture',
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: 'Segoe UI', sans-serif;">
        <div style="background: linear-gradient(135deg, #8B4513 0%, #D4A574 100%); padding: 30px; border-radius: 12px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Voice Culture</h1>
        </div>
        <div style="padding: 30px; background: #f8f9fa; border-radius: 0 0 12px 12px;">
          <h2 style="color: #2d3748; font-size: 20px; margin-bottom: 20px;">Hello ${customerName},</h2>
          <p style="color: #4a5568; line-height: 1.6; margin-bottom: 20px;">
            Thank you for purchasing <strong>${productName}</strong>! We'd love to hear your experience. Share your review to help other buyers.
          </p>
          <a href="${reviewLink}" style="display: inline-block; background: #8B4513; color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: bold; margin: 20px 0;">
            Write a Review
          </a>
          <p style="color: #718096; font-size: 12px; margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 20px; text-align: center;">
            This email is automatically generated. Please do not reply directly.<br>
            Voice Culture
          </p>
        </div>
      </div>
    `,
  });
}
