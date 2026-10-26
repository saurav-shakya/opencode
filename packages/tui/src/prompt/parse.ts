export function parseFileLineRange(input: string) {
  const hash = input.lastIndexOf("#")
  if (hash === -1) return { base: input }

  const base = input.slice(0, hash)
  const match = input.slice(hash + 1).match(/^(\d+)(?:-(\d*))?$/)
  if (!match) return { base }

  return { base, lineRange: fileLineRange(Number(match[1]), match[2] ? Number(match[2]) : undefined) }
}

// An end equal to the start is a single line; only a missing or earlier end means "to the end of the file".
export function fileLineRange(startLine: number, endLine?: number) {
  return { startLine, endLine: endLine !== undefined && endLine >= startLine ? endLine : undefined }
}

export function stripFileLineRange(input: string) {
  return parseFileLineRange(input).base
}

export function parseSlashHead(text: string, separator = /[ \t\n]/) {
  if (!text.startsWith("/")) return

  const end = text.slice(1).search(separator)
  if (end === -1) return { name: text.slice(1), arguments: "", end: text.length }

  const split = end + 1
  return { name: text.slice(1, split), arguments: text.slice(split + 1), end: split }
}
