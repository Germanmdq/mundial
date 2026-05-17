import { createClient } from '@supabase/supabase-js'
import { execFile } from 'node:child_process'
import { mkdir, readFile, unlink, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { promisify } from 'node:util'

export type CsvRow = Record<string, string>

const execFileAsync = promisify(execFile)

export async function loadEnvLocal() {
  try {
    const env = await readFile('.env.local', 'utf8')
    for (const line of env.split(/\r?\n/)) {
      const match = line.match(/^([A-Z0-9_]+)=(.*)$/)
      if (match && !process.env[match[1]]) process.env[match[1]] = match[2]
    }
  } catch {
    // Optional for CI/admin environments.
  }
}

export function parseCsvLine(line: string): string[] {
  const values: string[] = []
  let current = ''
  let quoted = false
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index]
    const next = line[index + 1]
    if (char === '"' && quoted && next === '"') {
      current += '"'
      index += 1
    } else if (char === '"') {
      quoted = !quoted
    } else if (char === ',' && !quoted) {
      values.push(current)
      current = ''
    } else {
      current += char
    }
  }
  values.push(current)
  return values
}

export async function readCsv(filePath: string): Promise<CsvRow[]> {
  try {
    const content = await readFile(filePath, 'utf8')
    const lines = content.split(/\r?\n/).filter((line) => line.trim().length > 0)
    if (lines.length === 0) return []
    const headers = parseCsvLine(lines[0])
    return lines.slice(1).map((line) => {
      const values = parseCsvLine(line)
      return Object.fromEntries(headers.map((header, index) => [header, values[index] ?? '']))
    })
  } catch {
    return []
  }
}

function csvEscape(value: string | number | null | undefined): string {
  const text = String(value ?? '')
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

export async function writeCsv(filePath: string, headers: string[], rows: CsvRow[]) {
  await mkdir(path.dirname(filePath), { recursive: true })
  const lines = [headers.join(','), ...rows.map((row) => headers.map((header) => csvEscape(row[header])).join(','))]
  await writeFile(filePath, `${lines.join('\n')}\n`)
}

export function slugify(value: string | null | undefined): string {
  return (value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export async function downloadToBuffer(url: string): Promise<Buffer> {
  const response = await fetch(url, { headers: { 'user-agent': 'mi-prediccion-admin-import/1.0' } })
  if (!response.ok) throw new Error(`HTTP ${response.status} descargando ${url}`)
  return Buffer.from(await response.arrayBuffer())
}

export async function convertImageToWebp(buffer: Buffer, localPath: string, publicPath: string, width: number, height: number) {
  await mkdir(path.dirname(localPath), { recursive: true })
  await mkdir(path.dirname(publicPath), { recursive: true })
  const tempPath = `${localPath}.source`
  await writeFile(tempPath, buffer)
  const code = `
from PIL import Image, ImageOps
import sys
src_path, local_path, public_path, width, height = sys.argv[1], sys.argv[2], sys.argv[3], int(sys.argv[4]), int(sys.argv[5])
image = Image.open(src_path).convert("RGBA")
background = Image.new("RGBA", image.size, (255, 255, 255, 0))
background.alpha_composite(image)
output = ImageOps.fit(background.convert("RGB"), (width, height), method=Image.Resampling.LANCZOS, centering=(0.5, 0.35))
output.save(local_path, "WEBP", quality=88, method=6)
output.save(public_path, "WEBP", quality=88, method=6)
`
  try {
    await execFileAsync('python3', ['-c', code, tempPath, localPath, publicPath, String(width), String(height)])
  } finally {
    await unlink(tempPath).catch(() => undefined)
  }
}

export function getAdminSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key, { auth: { persistSession: false } })
}

export async function getAnonSupabaseRows(table: string, select: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return []
  const client = createClient(url, key, { auth: { persistSession: false } })
  const { data, error } = await client.from(table).select(select)
  if (error) return []
  return data ?? []
}

export function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10)
}
