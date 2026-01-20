import { NextRequest, NextResponse } from 'next/server'
import Mux from '@mux/mux-node'

// Initialize Mux client
const mux = new Mux({
  tokenId: process.env.MUX_TOKEN_ID!,
  tokenSecret: process.env.MUX_TOKEN_SECRET!,
})

export async function POST(request: NextRequest) {
  try {
    const { playbackId } = await request.json()

    if (!playbackId) {
      return NextResponse.json(
        { error: 'Playback ID is required' },
        { status: 400 }
      )
    }

    // Check if signing keys are configured
    const signingKeyId = process.env.MUX_SIGNING_KEY_ID
    const signingKeySecret = process.env.MUX_SIGNING_KEY_SECRET

    if (!signingKeyId || !signingKeySecret) {
      // Return without token if signing not configured (public playback)
      return NextResponse.json({ token: null })
    }

    // Generate signed JWT for secure playback
    // Decode the base64 signing key secret
    const decodedKeySecret = Buffer.from(signingKeySecret, 'base64').toString('utf-8')

    const token = await mux.jwt.signPlaybackId(playbackId, {
      keyId: signingKeyId,
      keySecret: decodedKeySecret,
      type: 'video',
      expiration: '4h', // Token valid for 4 hours
    })

    return NextResponse.json({ token })
  } catch (error) {
    console.error('Error generating Mux token:', error)
    return NextResponse.json(
      { error: 'Failed to generate playback token' },
      { status: 500 }
    )
  }
}
