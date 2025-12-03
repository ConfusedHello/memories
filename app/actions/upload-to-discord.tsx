"use server"

export async function uploadToDiscord(formData: FormData) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL

  if (!webhookUrl) {
    return { success: false, error: "Discord webhook not configured" }
  }

  const author = formData.get("author") as string
  const caption = formData.get("caption") as string
  const imageData = formData.get("image") as string

  if (!author || !imageData) {
    return { success: false, error: "Missing required fields" }
  }

  try {
    // Convert base64 to blob for Discord
    const base64Data = imageData.split(",")[1]
    const binaryData = Buffer.from(base64Data, "base64")

    // Create form data for Discord
    const discordFormData = new FormData()

    // Create the embed payload
    const payload = {
      embeds: [
        {
          title: "New Graduation Memory Submission",
          color: 0x5865f2,
          fields: [
            {
              name: "Submitted by",
              value: author,
              inline: true,
            },
            {
              name: "Caption",
              value: caption || "No caption provided",
              inline: true,
            },
          ],
          footer: {
            text: "Graduation Photo Bank | Pending Approval",
          },
          timestamp: new Date().toISOString(),
        },
      ],
    }

    discordFormData.append("payload_json", JSON.stringify(payload))

    // Append the image as a file
    const blob = new Blob([binaryData], { type: "image/png" })
    discordFormData.append("files[0]", blob, `graduation-memory-${Date.now()}.png`)

    const response = await fetch(webhookUrl, {
      method: "POST",
      body: discordFormData,
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Discord webhook error:", errorText)
      return { success: false, error: "Failed to submit to Discord" }
    }

    return { success: true }
  } catch (error) {
    console.error("Upload error:", error)
    return { success: false, error: "Failed to upload image" }
  }
}
