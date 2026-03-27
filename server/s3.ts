import { S3Client, ListObjectsV2Command, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

export const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

export const BUCKET = process.env.S3_BUCKET_NAME!

export async function listAudioKeys(): Promise<string[]> {
  const command = new ListObjectsV2Command({ Bucket: BUCKET })
  const response = await s3.send(command)
  return (response.Contents ?? [])
    .map((obj) => obj.Key!)
    .filter((key) => /\.(mp3|flac|wav|ogg|aac|m4a)$/i.test(key))
}

export async function getPresignedUrl(key: string, expiresIn = 3600): Promise<string> {
  const command = new GetObjectCommand({ Bucket: BUCKET, Key: key })
  return getSignedUrl(s3, command, { expiresIn })
}
