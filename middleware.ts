import { NextRequest, NextResponse } from "next/server"

const ADMIN_USERNAME = "yaro"
const ADMIN_PASSWORD = "JvLa3591J"
const LOCALE_COOKIE = "studyindach_locale"

export function middleware(request: NextRequest) {
	const preferredLocale = preferredLocaleFromRequest(request)
	const redirectTarget = localeRedirectTarget(request, preferredLocale)

	if (redirectTarget) {
		return NextResponse.redirect(redirectTarget)
	}

	const requestHeaders = new Headers(request.headers)
	requestHeaders.set("x-site-locale", request.nextUrl.pathname.startsWith("/pt-br") ? "pt-br" : "en")

	if (!request.nextUrl.pathname.startsWith("/admin")) {
		return NextResponse.next({
			request: {
				headers: requestHeaders,
			},
		})
	}

	const authHeader = request.headers.get("authorization")

	if (authHeader?.startsWith("Basic ")) {
		const encoded = authHeader.slice("Basic ".length)
		const [username, password] = atob(encoded).split(":")

		if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
			return NextResponse.next({
				request: {
					headers: requestHeaders,
				},
			})
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
	matcher: ["/((?!_next/static|_next/image|favicon.ico|assets).*)"],
}

function preferredLocaleFromRequest(request: NextRequest) {
	const chosenLocale = request.cookies.get(LOCALE_COOKIE)?.value
	if (chosenLocale === "en" || chosenLocale === "pt-br") {
		return chosenLocale
	}

	const acceptLanguage = request.headers.get("accept-language") || ""
	return acceptLanguage.toLowerCase().startsWith("pt") ? "pt-br" : "en"
}

function localeRedirectTarget(request: NextRequest, preferredLocale: "en" | "pt-br") {
	const { pathname, search } = request.nextUrl

	if (preferredLocale !== "pt-br" || request.cookies.has(LOCALE_COOKIE)) {
		return null
	}
	if (!pathname.startsWith("/courses")) {
		return null
	}

	const target = request.nextUrl.clone()
	target.pathname = pathname.replace(/^\/courses/, "/pt-br/cursos")
	target.search = search
	return target
}
