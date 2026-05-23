const fs = require("node:fs")
const path = require("node:path")

const DEFAULT_ENV_FILE = "/home/yaro/project-env/studyInDach.env"

function parseEnvLine(line) {
	const trimmed = line.trim()
	if (!trimmed || trimmed.startsWith("#")) return null
	const equalsIndex = trimmed.indexOf("=")
	if (equalsIndex === -1) return null
	const key = trimmed.slice(0, equalsIndex).trim()
	let value = trimmed.slice(equalsIndex + 1).trim()
	if (!key) return null
	if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
		value = value.slice(1, -1)
	}
	return [key, value]
}

function loadExternalEnv(filePath = process.env.EXTERNAL_ENV_FILE || DEFAULT_ENV_FILE) {
	const resolved = path.resolve(filePath)
	if (!fs.existsSync(resolved)) return false
	const content = fs.readFileSync(resolved, "utf8")
	for (const line of content.split(/\r?\n/)) {
		const parsed = parseEnvLine(line)
		if (!parsed) continue
		const [key, value] = parsed
		if (!(key in process.env)) process.env[key] = value
	}
	return true
}

module.exports = { loadExternalEnv }
