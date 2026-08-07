import { Resend } from 'resend';

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

  const data = await resend.emails.send({
    from: from || fromEmail,
    to,
    subject,
    ...(html ? { html } : {}),
    ...(text ? { text } : {}),
  });

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
    subject: 'Your Login Verification Code - Chengdu Voice',
    text: `Your verification code is: ${code}\n\nThis code expires in 10 minutes.\n\nVisit ${appUrl} to complete your login.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #8B4513 0%, #D4A574 100%); padding: 24px; border-radius: 12px; text-align: center;">
          <h2 style="color: white; margin: 0; font-size: 24px;">Chengdu Voice | 成都之音</h2>
        </div>
        <div style="padding: 24px; background: #f8f9fa; border-radius: 0 0 12px 12px;">
          <p style="color: #4a5568; margin: 0 0 16px;">Hello,</p>
          <p style="color: #4a5568; margin: 0 0 8px;">Your login verification code is:</p>
          <div style="font-size: 36px; font-weight: bold; color: #8B4513; margin: 20px 0; letter-spacing: 8px; text-align: center;">
            ${code}
          </div>
          <p style="color: #4a5568; margin: 0 0 8px;">This code expires in 10 minutes.</p>
          <p style="color: #4a5568; margin: 0;">Visit <a href="${appUrl}" style="color: #8B4513;">${appUrl}</a> to complete your login.</p>
          <p style="color: #718096; font-size: 12px; margin: 24px 0 0; text-align: center;">Chengdu Voice | 成都之音</p>
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
  emailContent?: { subjectEn: string; bodyEn: string; subjectZh: string; bodyZh: string }
) {
  const itemsHtml = items.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">
        <p style="font-weight: bold; color: #2d3748; margin: 0;">${item.nameEn}</p>
        <p style="color: #718096; font-size: 14px; margin: 0;">${item.name}</p>
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: right;">
        <p style="color: #4a5568; margin: 0;">Qty: ${item.quantity}</p>
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: right;">
        <p style="font-weight: bold; color: #2d3748; margin: 0;">$${(item.price * item.quantity).toFixed(2)}</p>
      </td>
    </tr>
  `).join('');

  const defaultSubjectEn = 'Your Order Has Been Confirmed - Chengdu Voice';
  const defaultBodyEn = `Dear ${customerName},

Thank you for your order! We have received your order #${orderNumber} and will begin processing it within 24 hours.

**Order Summary:**
${items.map(item => `- ${item.nameEn} x ${item.quantity} - $${(item.price * item.quantity).toFixed(2)}`).join('\n')}

**Total:** $${total.toFixed(2)}
**Shipping Method:** ${shippingMethod === 'standard' ? 'Standard Shipping (5-7 business days)' : 'Express Shipping (2-3 business days)'}

Your package will be shipped via cross-border logistics and we will send you a tracking number once it's dispatched.

Thank you for choosing Chengdu Voice! If you have any questions, please contact us at hello@chengduvoice.com.

Best regards,
The Chengdu Voice Team`;

  const defaultSubjectZh = '您的订单已确认 - 成都之音';
  const defaultBodyZh = `尊敬的 ${customerName}，

感谢您的订单！我们已收到您的订单 #${orderNumber}，将在24小时内开始处理。

**订单摘要：**
${items.map(item => `- ${item.name} x ${item.quantity} - $${(item.price * item.quantity).toFixed(2)}`).join('\n')}

**订单总额：** $${total.toFixed(2)}
**配送方式：** ${shippingMethod === 'standard' ? '标准配送（5-7个工作日）' : '加急配送（2-3个工作日）'}

您的包裹将通过跨境物流发出，发货后我们会发送物流追踪号码给您。

感谢您选择成都之音！如有任何问题，请联系我们：hello@chengduvoice.com。

此致，
成都之音团队`;

  const subjectEn = emailContent?.subjectEn || defaultSubjectEn;
  const subjectZh = emailContent?.subjectZh || defaultSubjectZh;
  const bodyEn = emailContent?.bodyEn || defaultBodyEn;
  const bodyZh = emailContent?.bodyZh || defaultBodyZh;

  return sendEmail({
    to: email,
    subject: `${subjectEn} | ${subjectZh}`,
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: 'Segoe UI', 'PingFang SC', sans-serif;">
        <div style="background: linear-gradient(135deg, #8B4513 0%, #D4A574 100%); padding: 30px; border-radius: 12px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Chengdu Voice | 成都之音</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0;">Experience the authentic voice of Chengdu</p>
        </div>
        <div style="padding: 30px; background: #f8f9fa; border-radius: 0 0 12px 12px;">
          <h2 style="color: #2d3748; font-size: 20px; margin-bottom: 20px;">Order Confirmation / 订单确认</h2>
          <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; text-align: center;">
            <p style="color: #718096; font-size: 14px; margin-bottom: 10px;">Order Number / 订单号</p>
            <p style="font-size: 18px; font-weight: bold; color: #2d3748; margin: 0;">${orderNumber}</p>
          </div>
          <table style="width: 100%; margin-bottom: 20px; border-collapse: collapse;">
            <thead>
              <tr style="border-bottom: 2px solid #D4A574;">
                <th style="text-align: left; padding: 10px; color: #2d3748;">Product / 商品</th>
                <th style="text-align: right; padding: 10px; color: #2d3748;">Qty / 数量</th>
                <th style="text-align: right; padding: 10px; color: #2d3748;">Price / 价格</th>
              </tr>
            </thead>
            <tbody>${itemsHtml}</tbody>
            <tfoot>
              <tr>
                <td colspan="2" style="text-align: right; padding: 15px; font-weight: bold; color: #2d3748;">Total / 总额</td>
                <td style="text-align: right; padding: 15px; font-weight: bold; color: #D4A574; font-size: 18px;">$${total.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
          <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 20px;">
            <p style="color: #4a5568; line-height: 1.6; margin: 0;">
              ${bodyEn.split('\n').slice(-5).join('<br>')}
            </p>
          </div>
          <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 20px;">
            <p style="color: #4a5568; line-height: 1.6; margin: 0;">
              ${bodyZh.split('\n').slice(-5).join('<br>')}
            </p>
          </div>
          <p style="color: #718096; font-size: 12px; margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 20px; text-align: center;">
            此邮件由系统自动发送，请勿直接回复。<br>
            This email is automatically generated, please do not reply directly.<br>
            Chengdu Voice - 成都之音
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
    subject: 'Get Your Free Chengdu Sound Map - Chengdu Voice',
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: 'Segoe UI', sans-serif;">
        <div style="background: linear-gradient(135deg, #8B4513 0%, #D4A574 100%); padding: 30px; border-radius: 12px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Chengdu Voice | 成都之音</h1>
        </div>
        <div style="padding: 30px; background: #f8f9fa; border-radius: 0 0 12px 12px;">
          <h2 style="color: #2d3748; font-size: 20px; margin-bottom: 20px;">Welcome to Chengdu Voice!</h2>
          <p style="color: #4a5568; line-height: 1.6; margin-bottom: 20px;">
            Thank you for subscribing! Click the button below to download your free Chengdu Sound Map white noise album.
          </p>
          <a href="${downloadLink}" style="display: inline-block; background: #8B4513; color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: bold; margin: 20px 0;">
            Download Now
          </a>
          <p style="color: #718096; font-size: 12px; margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 20px; text-align: center;">
            This email is automatically generated. Please do not reply directly.<br>
            Chengdu Voice - 成都之音
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
    subject: 'Verify Your Review - Chengdu Voice',
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: 'Segoe UI', sans-serif;">
        <div style="background: linear-gradient(135deg, #8B4513 0%, #D4A574 100%); padding: 30px; border-radius: 12px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Chengdu Voice | 成都之音</h1>
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
            Chengdu Voice - 成都之音
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
  const reviewLink = `${process.env.NEXT_PUBLIC_APP_URL || 'https://www.voiceculture.world'}/shop/${productId}#reviews`;

  return sendEmail({
    to: email,
    subject: 'Share Your Review - Chengdu Voice',
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: 'Segoe UI', sans-serif;">
        <div style="background: linear-gradient(135deg, #8B4513 0%, #D4A574 100%); padding: 30px; border-radius: 12px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Chengdu Voice | 成都之音</h1>
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
            Chengdu Voice - 成都之音
          </p>
        </div>
      </div>
    `,
  });
}
