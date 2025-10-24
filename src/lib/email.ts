import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY 
  ? new Resend(process.env.RESEND_API_KEY)
  : null

export interface EmailOptions {
  to: string | string[]
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: EmailOptions) {
  if (!resend) {
    console.warn('RESEND_API_KEY not configured, skipping email send')
    return { success: false, error: 'Email service not configured' }
  }

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'Zayıflama Planım <noreply@zayiflamaplanim.com>',
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
    })

    if (error) {
      console.error('Email send error:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Email send exception:', error)
    return { success: false, error: 'Failed to send email' }
  }
}

export interface EmailTemplate {
  id: string
  name: string
  subject: string
  content: string
}

export const emailTemplates: EmailTemplate[] = [
  {
    id: 'welcome',
    name: 'Hoş Geldin',
    subject: 'Zayıflama Planım\'a Hoş Geldin! 🎉',
    content: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #10b981; text-align: center;">Hoş Geldin!</h1>
        <p>Merhaba,</p>
        <p>Zayıflama Planım topluluğuna katıldığın için çok mutluyuz! 🎉</p>
        <p>Platformumuzda binlerce başarı hikayesini keşfedebilir, kendi zayıflama planını paylaşabilir ve diğer kullanıcılarla etkileşime geçebilirsin.</p>
        <h3>Neler Yapabilirsin?</h3>
        <ul>
          <li>✅ Başarılı zayıflama planlarını incele</li>
          <li>✅ Kendi planını oluştur ve paylaş</li>
          <li>✅ Diğer kullanıcılarla yorum yaparak etkileşime geç</li>
          <li>✅ Beğendiğin planları kaydet</li>
        </ul>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXTAUTH_URL}" style="background-color: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Hemen Başla</a>
        </div>
        <p style="color: #666; font-size: 14px; text-align: center; margin-top: 30px;">
          Başarılarının devamını diliyoruz! 💪
        </p>
      </div>
    `,
  },
  {
    id: 'plan-approved',
    name: 'Plan Onaylandı',
    subject: 'Planın Onaylandı! ✅',
    content: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #10b981; text-align: center;">Harika Haber! ✅</h1>
        <p>Merhaba,</p>
        <p>Paylaştığın zayıflama planı incelendi ve <strong>onaylandı</strong>!</p>
        <p>Planın artık platformda yayında ve diğer kullanıcılar tarafından görülebilir durumda. Başarı hikayeni paylaştığın için teşekkür ederiz! 🎉</p>
        <div style="background-color: #f0fdf4; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0;">
          <p style="margin: 0;"><strong>İpucu:</strong> Planına düzenli olarak yorum yapan kullanıcılara geri dönüş yaparak toplulukla etkileşimini artırabilirsin.</p>
        </div>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXTAUTH_URL}/profil" style="background-color: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Planımı Görüntüle</a>
        </div>
        <p style="color: #666; font-size: 14px; text-align: center; margin-top: 30px;">
          Başarılarının devamını diliyoruz! 💪
        </p>
      </div>
    `,
  },
  {
    id: 'weekly-summary',
    name: 'Haftalık Özet',
    subject: 'Bu Haftanın Özeti 📊',
    content: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #10b981; text-align: center;">Bu Haftanın Özeti 📊</h1>
        <p>Merhaba,</p>
        <p>Bu hafta platformumuzda neler oldu? İşte haftalık özetimiz:</p>
        <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <h3 style="margin-top: 0;">📈 İstatistikler</h3>
          <ul style="list-style: none; padding: 0;">
            <li style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
              <strong>Yeni Planlar:</strong> <span style="color: #10b981; font-weight: bold;">25</span>
            </li>
            <li style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
              <strong>Yeni Yorumlar:</strong> <span style="color: #10b981; font-weight: bold;">143</span>
            </li>
            <li style="padding: 8px 0;">
              <strong>Yeni Üyeler:</strong> <span style="color: #10b981; font-weight: bold;">87</span>
            </li>
          </ul>
        </div>
        <div style="background-color: #fef3c7; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <h3 style="margin-top: 0;">⭐ Haftanın En Popüler Planı</h3>
          <p style="margin: 0;">Bu hafta en çok beğenilen ve görüntülenen planları keşfet!</p>
        </div>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXTAUTH_URL}" style="background-color: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Planları Keşfet</a>
        </div>
        <p style="color: #666; font-size: 14px; text-align: center; margin-top: 30px;">
          Bu e-postaları almak istemiyorsan, <a href="${process.env.NEXTAUTH_URL}/ayarlar" style="color: #10b981;">ayarlarından</a> değiştirebilirsin.
        </p>
      </div>
    `,
  },
]

export function getEmailTemplate(templateId: string): EmailTemplate | undefined {
  return emailTemplates.find(t => t.id === templateId)
}

export async function sendPasswordResetEmail(email: string, resetUrl: string) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #2d7a4a; text-align: center;">🔐 Şifre Sıfırlama</h1>
      <p>Merhaba,</p>
      <p>Şifrenizi sıfırlamak için bir talepte bulundunuz. Aşağıdaki butona tıklayarak yeni şifrenizi belirleyebilirsiniz:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" style="background-color: #2d7a4a; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Şifremi Sıfırla</a>
      </div>
      <p style="color: #666; font-size: 14px;">
        Bu link 1 saat boyunca geçerlidir. Eğer şifre sıfırlama talebinde bulunmadıysanız, bu e-postayı görmezden gelebilirsiniz.
      </p>
      <p style="color: #666; font-size: 14px;">
        Buton çalışmıyorsa, aşağıdaki linki tarayıcınıza kopyalayabilirsiniz:<br/>
        <a href="${resetUrl}" style="color: #2d7a4a; word-break: break-all;">${resetUrl}</a>
      </p>
      <p style="color: #666; font-size: 14px; text-align: center; margin-top: 30px;">
        Zayıflama Planım Ekibi
      </p>
    </div>
  `

  return sendEmail({
    to: email,
    subject: '🔐 Şifre Sıfırlama - Zayıflama Planım',
    html,
  })
}
