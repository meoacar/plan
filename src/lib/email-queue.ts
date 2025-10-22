import { prisma } from './prisma'
import { sendEmail } from './email'

// Email queue processor
// Requirements: 5.6
export async function processEmailQueue() {
  try {
    // Find next queued campaign
    const campaign = await prisma.emailCampaign.findFirst({
      where: { status: 'QUEUED' },
      orderBy: { createdAt: 'asc' },
    })

    if (!campaign) {
      console.log('No queued campaigns found')
      return { success: true, message: 'No campaigns to process' }
    }

    console.log(`Processing campaign: ${campaign.id} - ${campaign.subject}`)

    // Update status to SENDING
    await prisma.emailCampaign.update({
      where: { id: campaign.id },
      data: { status: 'SENDING' },
    })

    // Get recipients based on campaign.recipients
    const recipients = await getRecipients(campaign.recipients)

    if (recipients.length === 0) {
      await prisma.emailCampaign.update({
        where: { id: campaign.id },
        data: {
          status: 'FAILED',
          failedCount: 1,
        },
      })
      return { success: false, message: 'No recipients found' }
    }

    console.log(`Sending to ${recipients.length} recipients`)

    let sentCount = 0
    let failedCount = 0

    // Send emails in batches to avoid rate limits
    const batchSize = 10
    for (let i = 0; i < recipients.length; i += batchSize) {
      const batch = recipients.slice(i, i + batchSize)

      const results = await Promise.allSettled(
        batch.map(async (user: { id: string; email: string; name: string | null }) => {
          const result = await sendEmail({
            to: user.email,
            subject: campaign.subject,
            html: campaign.content,
          })

          if (result.success) {
            sentCount++
          } else {
            failedCount++
            console.error(`Failed to send to ${user.email}:`, result.error)
          }

          return result
        })
      )

      // Small delay between batches to respect rate limits
      if (i + batchSize < recipients.length) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }

    // Update campaign status
    await prisma.emailCampaign.update({
      where: { id: campaign.id },
      data: {
        status: failedCount === recipients.length ? 'FAILED' : 'SENT',
        sentCount,
        failedCount,
        sentAt: new Date(),
      },
    })

    console.log(`Campaign ${campaign.id} completed: ${sentCount} sent, ${failedCount} failed`)

    return {
      success: true,
      message: `Campaign processed: ${sentCount} sent, ${failedCount} failed`,
      campaignId: campaign.id,
      sentCount,
      failedCount,
    }
  } catch (error) {
    console.error('Error processing email queue:', error)
    return {
      success: false,
      message: 'Error processing email queue',
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

async function getRecipients(recipientType: string) {
  const where: { role?: 'ADMIN' | 'USER' } = {}

  if (recipientType === 'ADMIN') {
    where.role = 'ADMIN'
  } else if (recipientType === 'USER') {
    where.role = 'USER'
  }
  // If 'ALL', no filter needed

  const users = await prisma.user.findMany({
    where,
    select: {
      id: true,
      email: true,
      name: true,
    },
  })

  return users
}
