"use server"

import { UploadResult } from "@/types";

export async function uploadToDiscord(formData: FormData): Promise<UploadResult> {
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL

    if (!webhookUrl) {
        return { success: false, error: "Discord webhook not configured" }
    }

    const author = formData.get("author") as string
    const caption = formData.get("caption") as string
    const imageFile = formData.get("image") as File

    if (!author || !imageFile) {
        return { success: false, error: "Missing required fields" }
    }

    try {
        // Get file extension from MIME type
        const fileExtension = imageFile.type.split("/")[1] || "webp"

        // Convert File to buffer for Discord
        const arrayBuffer = await imageFile.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

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

        const blob = new Blob([buffer], { type: imageFile.type })
        discordFormData.append("files[0]", blob, `graduation-memory-${Date.now()}.${fileExtension}`)

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
