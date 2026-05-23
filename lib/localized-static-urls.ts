import type { PublicLocale } from "@/lib/i18n"

export const localizedStaticRoutes = {
	home: { en: "/", "pt-br": "/pt-br", es: "/es" },
	courses: { en: "/courses", "pt-br": "/pt-br/cursos", es: "/es/programas" },
	universities: { en: "/universities", "pt-br": "/pt-br/universidades", es: "/es/universidades" },
	studyGuide: { en: "/study-guide", "pt-br": "/pt-br/guia-de-estudos", es: "/es/guia-para-estudiar" },
	blog: { en: "/blog", "pt-br": "/pt-br/guias", es: "/es/guias" },
	about: { en: "/about", "pt-br": "/pt-br/sobre", es: "/es/sobre" },
	contact: { en: "/contact", "pt-br": "/pt-br/contato", es: "/es/contacto" },
	privacy: { en: "/privacy", "pt-br": "/pt-br/privacidade", es: "/es/privacidad" },
	studyGermany: { en: "/courses?country=Germany", "pt-br": "/pt-br/estudar-na-alemanha", es: "/es/estudiar-en-alemania" },
	studyAustria: { en: "/courses?country=Austria", "pt-br": "/pt-br/estudar-na-austria", es: "/es/estudiar-en-austria" },
	studySwitzerland: { en: "/courses?country=Switzerland", "pt-br": "/pt-br/estudar-na-suica", es: "/es/estudiar-en-suiza" },
	englishPrograms: { en: "/courses?languageOfInstruction=English", "pt-br": "/pt-br/programas-em-ingles", es: "/es/programas-en-ingles" },
	publicGermany: { en: "/courses?country=Germany&tuitionType=No%20Tuition%20%2F%20Semester%20Fee%20Only", "pt-br": "/pt-br/universidades-publicas-na-alemanha", es: "/es/universidades-publicas-en-alemania" },
	computerScienceGermany: { en: "/courses?country=Germany&studyField=Computer%20Science%20%26%20Data", "pt-br": "/pt-br/estudar-informatica-na-alemanha", es: "/es/estudiar-informatica-en-alemania" },
	engineeringGermany: { en: "/courses?country=Germany&studyField=Engineering%20%26%20Technology", "pt-br": "/pt-br/estudar-engenharia-na-alemanha", es: "/es/estudiar-ingenieria-en-alemania" },
	doctorateGermany: { en: "/courses?degreeLevel=Doctorate&country=Germany", "pt-br": "/pt-br/doutorado-na-alemanha", es: "/es/doctorado-en-alemania" },
	bachelorGermany: { en: "/courses?degreeLevel=Bachelor&country=Germany", "pt-br": "/pt-br/bacharelado-na-alemanha", es: "/es/licenciatura-en-alemania" },
	masterGermany: { en: "/courses?degreeLevel=Master&country=Germany", "pt-br": "/pt-br/mestrado-na-alemanha", es: "/es/programas?degreeLevel=Master&country=Germany" },
	masterGermanyEnglish: { en: "/courses?degreeLevel=Master&country=Germany&languageOfInstruction=English", "pt-br": "/pt-br/mestrado-na-alemanha-em-ingles", es: "/es/programas?degreeLevel=Master&country=Germany&languageOfInstruction=English" },
} satisfies Record<string, Record<PublicLocale, string>>

export type LocalizedStaticRouteKey = keyof typeof localizedStaticRoutes

export function getLocalizedStaticUrl(routeKey: LocalizedStaticRouteKey, locale: PublicLocale) {
	return localizedStaticRoutes[routeKey][locale]
}

export function localizedStaticAlternates(routeKey: LocalizedStaticRouteKey) {
	const en = getLocalizedStaticUrl(routeKey, "en")
	return {
		en,
		"pt-BR": getLocalizedStaticUrl(routeKey, "pt-br"),
		es: getLocalizedStaticUrl(routeKey, "es"),
		"x-default": en,
	}
}

export function staticRouteKeyFromPath(pathname: string): LocalizedStaticRouteKey | null {
	const path = pathname || "/"
	const match = Object.entries(localizedStaticRoutes).find(([, routes]) =>
		Object.values(routes).some((route) => route.split("?")[0] === path),
	)
	return match?.[0] as LocalizedStaticRouteKey | undefined || null
}
