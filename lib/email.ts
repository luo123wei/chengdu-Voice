import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST || 'smtp.example.com',
  port: parseInt(process.env.MAIL_PORT || '587'),
  secure: process.env.MAIL_SECURE === 'true',
  auth: {
    user: process.env.MAIL_USER || '',
    pass: process.env.MAIL_PASS || '',
  },
});

export async function sendEmail(options: {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}) {
  const mailOptions = {
    from: `Chengdu Voice <${process.env.MAIL_USER || 'hello@chengduvoice.com'}>`,
    ...options,
  };

  await transporter.sendMail(mailOptions);
}

export async function sendReviewVerificationEmail(
  email: string,
  nickname: string,
  reviewId: string,
  productId: string
) {
  const verificationLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/verify-review?token=${reviewId}`;

  const mailOptions = {
    from: `Chengdu Voice <${process.env.MAIL_USER || 'hello@chengduvoice.com'}>`,
    to: email,
    subject: '请验证您的评价 - Chengdu Voice',
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: 'Segoe UI', sans-serif;">
        <div style="background: linear-gradient(135deg, #d4a373 0%, #bc6c25 100%); padding: 30px; border-radius: 12px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Chengdu Voice | 成都之音</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0;">Experience the authentic voice of Chengdu</p>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa; border-radius: 0 0 12px 12px;">
          <h2 style="color: #2d3748; font-size: 20px; margin-bottom: 20px;">您好 ${nickname}，</h2>
          
          <p style="color: #4a5568; line-height: 1.6; margin-bottom: 20px;">
            感谢您对我们产品的评价！请点击下方链接完成验证，您的评价才会正式显示在产品页面上。
          </p>
          
          <a href="${verificationLink}" style="display: inline-block; background: #d4a373; color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: bold; margin: 20px 0;">
            验证我的评价
          </a>
          
          <p style="color: #718096; font-size: 14px; margin-top: 20px;">
            如果链接无效，请复制以下地址到浏览器打开：<br>
            ${verificationLink}
          </p>
          
          <p style="color: #718096; font-size: 12px; margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 20px;">
            此邮件由系统自动发送，请勿直接回复。<br>
            Chengdu Voice - 成都之音
          </p>
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}

export async function sendDownloadLinkEmail(email: string) {
  const downloadLink = process.env.DOWNLOAD_LINK || 'https://example.com/download';

  const mailOptions = {
    from: `Chengdu Voice <${process.env.MAIL_USER || 'hello@chengduvoice.com'}>`,
    to: email,
    subject: '免费获取《成都声音地图》白噪音专辑 - Chengdu Voice',
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: 'Segoe UI', sans-serif;">
        <div style="background: linear-gradient(135deg, #d4a373 0%, #bc6c25 100%); padding: 30px; border-radius: 12px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Chengdu Voice | 成都之音</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0;">Experience the authentic voice of Chengdu</p>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa; border-radius: 0 0 12px 12px;">
          <h2 style="color: #2d3748; font-size: 20px; margin-bottom: 20px;">欢迎加入 Chengdu Voice！</h2>
          
          <p style="color: #4a5568; line-height: 1.6; margin-bottom: 20px;">
            感谢您的订阅！点击下方链接免费下载《成都声音地图》白噪音专辑（价值 $9.99）：
          </p>
          
          <a href="${downloadLink}" style="display: inline-block; background: #d4a373; color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: bold; margin: 20px 0;">
            立即下载
          </a>
          
          <p style="color: #4a5568; line-height: 1.6; margin-top: 20px;">
            专辑包含：<br>
            • 10个成都场景白噪音<br>
            • 每段30分钟<br>
            • 高清音质 MP3格式<br>
            • 永久使用权限
          </p>
          
          <p style="color: #718096; font-size: 12px; margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 20px;">
            此邮件由系统自动发送，请勿直接回复。<br>
            Chengdu Voice - 成都之音
          </p>
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}

export async function sendReviewInvitationEmail(
  email: string,
  customerName: string,
  productName: string,
  productId: string
) {
  const reviewLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/shop/${productId}#reviews`;

  const mailOptions = {
    from: `Chengdu Voice <${process.env.MAIL_USER || 'hello@chengduvoice.com'}>`,
    to: email,
    subject: '邀请您评价购买的商品 - Chengdu Voice',
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: 'Segoe UI', sans-serif;">
        <div style="background: linear-gradient(135deg, #d4a373 0%, #bc6c25 100%); padding: 30px; border-radius: 12px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Chengdu Voice | 成都之音</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0;">Experience the authentic voice of Chengdu</p>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa; border-radius: 0 0 12px 12px;">
          <h2 style="color: #2d3748; font-size: 20px; margin-bottom: 20px;">您好 ${customerName}，</h2>
          
          <p style="color: #4a5568; line-height: 1.6; margin-bottom: 20px;">
            感谢您购买《${productName}》！我们希望了解您的使用体验，邀请您分享评价。
          </p>
          
          <a href="${reviewLink}" style="display: inline-block; background: #d4a373; color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: bold; margin: 20px 0;">
            写评价
          </a>
          
          <p style="color: #718096; font-size: 14px; margin-top: 20px;">
            您的评价对其他买家非常有帮助，感谢您的支持！
          </p>
          
          <p style="color: #718096; font-size: 12px; margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 20px;">
            此邮件由系统自动发送，请勿直接回复。<br>
            Chengdu Voice - 成都之音
          </p>
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
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
        <p style="font-weight: bold; color: #2d3748;">${item.nameEn}</p>
        <p style="color: #718096; font-size: 14px;">${item.name}</p>
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: right;">
        <p style="color: #4a5568;">Qty: ${item.quantity}</p>
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: right;">
        <p style="font-weight: bold; color: #2d3748;">$${(item.price * item.quantity).toFixed(2)}</p>
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

**Estimated delivery time:** ${shippingMethod === 'standard' ? '5-7 business days' : '2-3 business days'}

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

**预计送达时间：** ${shippingMethod === 'standard' ? '5-7个工作日' : '2-3个工作日'}

感谢您选择成都之音！如有任何问题，请联系我们：hello@chengduvoice.com。

此致，
成都之音团队`;

  const subjectEn = emailContent?.subjectEn || defaultSubjectEn;
  const subjectZh = emailContent?.subjectZh || defaultSubjectZh;
  const bodyEn = emailContent?.bodyEn || defaultBodyEn;
  const bodyZh = emailContent?.bodyZh || defaultBodyZh;

  const mailOptions = {
    from: `Chengdu Voice <${process.env.MAIL_USER || 'hello@chengduvoice.com'}>`,
    to: email,
    subject: `${subjectEn} | ${subjectZh}`,
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: 'Segoe UI', 'PingFang SC', sans-serif;">
        <div style="background: linear-gradient(135deg, #d4a373 0%, #bc6c25 100%); padding: 30px; border-radius: 12px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Chengdu Voice | 成都之音</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0;">Experience the authentic voice of Chengdu</p>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa; border-radius: 0 0 12px 12px;">
          <h2 style="color: #2d3748; font-size: 20px; margin-bottom: 20px;">${bodyEn.split('\n')[0]}</h2>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <p style="color: #718096; font-size: 14px; margin-bottom: 10px;">Order Number / 订单号</p>
            <p style="font-size: 18px; font-weight: bold; color: #2d3748;">${orderNumber}</p>
          </div>
          
          <table style="width: 100%; margin-bottom: 20px;">
            <thead>
              <tr style="border-bottom: 2px solid #d4a373;">
                <th style="text-align: left; padding: 10px; color: #2d3748;">Product / 商品</th>
                <th style="text-align: right; padding: 10px; color: #2d3748;">Quantity / 数量</th>
                <th style="text-align: right; padding: 10px; color: #2d3748;">Price / 价格</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="2" style="text-align: right; padding: 15px; font-weight: bold; color: #2d3748;">Total / 总额</td>
                <td style="text-align: right; padding: 15px; font-weight: bold; color: #d4a373; font-size: 18px;">$${total.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
          
          <div style="background: #e8f5e9; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <p style="color: #2e7d32; font-weight: bold; margin-bottom: 5px;">📦 Shipping Information / 配送信息</p>
            <p style="color: #388e3c; font-size: 14px;">Shipping Method: ${shippingMethod === 'standard' ? 'Standard' : 'Express'}</p>
            <p style="color: #388e3c; font-size: 14px;">Estimated Delivery: ${shippingMethod === 'standard' ? '5-7 business days' : '2-3 business days'}</p>
          </div>
          
          <div style="border-top: 1px solid #e2e8f0; padding-top: 20px;">
            <p style="color: #4a5568; line-height: 1.6;">
              ${bodyEn.split('\n').slice(-5).join('<br>')}
            </p>
          </div>
          
          <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 20px;">
            <p style="color: #4a5568; line-height: 1.6;">
              ${bodyZh.split('\n').slice(-5).join('<br>')}
            </p>
          </div>
          
          <p style="color: #718096; font-size: 12px; margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 20px;">
            此邮件由系统自动发送，请勿直接回复。<br>
            This email is automatically generated, please do not reply directly.<br>
            Chengdu Voice - 成都之音
          </p>
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}
