import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_BASE ||
  process.env.BACKEND_URL ||
  'http://localhost:8023'

export async function GET(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params
  return handleRequest(request, path, 'GET')
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params
  return handleRequest(request, path, 'POST')
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params
  return handleRequest(request, path, 'PUT')
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params
  return handleRequest(request, path, 'DELETE')
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params
  return handleRequest(request, path, 'PATCH')
}

async function handleRequest(request: NextRequest, pathSegments: string[], method: string) {
  try {
    const path = pathSegments.join('/').replace(/^\/+|\/+$/g, '')
    const backendUrl = BACKEND_URL.replace(/\/+$/, '')
    const url = new URL(`${backendUrl}/${path}`)
    request.nextUrl.searchParams.forEach((value, key) => url.searchParams.append(key, value))

    let body: string | undefined
    if (['POST', 'PUT', 'PATCH'].includes(method)) {
      body = await request.text()
    }

    const headers: Record<string, string> = {}
    request.headers.forEach((value, key) => {
      const lowerKey = key.toLowerCase()
      if (!['host', 'connection', 'content-length'].includes(lowerKey)) {
        headers[key] = value
      }
    })
    if (body && !headers['content-type']) {
      headers['Content-Type'] = 'application/json'
    }

    const response = await fetch(url.toString(), { method, headers, body })
    const contentType = response.headers.get('content-type') || ''
    const data = contentType.includes('application/json') ? await response.json() : await response.text()
    const nextResponse = contentType.includes('application/json')
      ? NextResponse.json(data, { status: response.status })
      : new NextResponse(data, { status: response.status })
    response.headers.forEach((value, key) => {
      if (!['content-length', 'transfer-encoding'].includes(key.toLowerCase())) {
        nextResponse.headers.set(key, value)
      }
    })
    return nextResponse
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Proxy error' }, { status: 500 })
  }
}
