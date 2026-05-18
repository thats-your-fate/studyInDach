import { NextRequest, NextResponse } from "next/server"

const ADMIN_USERNAME = "yaro"
const ADMIN_PASSWORD = "JvLa3591J"

export function middleware(request: NextRequest) {
	const authHeader = request.headers.get("authorization")

	if (authHeader?.startsWith("Basic ")) {
		const encoded = authHeader.slice("Basic ".length)
		const [username, password] = atob(encoded).split(":")

		if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
			return NextResponse.next()
		}
	}

	return new NextResponse("Authentication required", {
		status: 401,
		headers: {
			"WWW-Authenticate": 'Basic realm="StudyInDach Admin"',
		},
	})
}

export const config = {
	matcher: ["/admin/:path*"],
}
