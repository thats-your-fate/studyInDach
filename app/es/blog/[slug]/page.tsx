import { redirect } from "next/navigation"

export default function EsBlogPostAlias({ params }: { params: { slug: string } }) {
	redirect(`/es/guias/${params.slug}`)
}
