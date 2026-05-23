import { redirect } from "next/navigation"

export default function PtBlogPostAlias({ params }: { params: { slug: string } }) {
	redirect(`/pt-br/guias/${params.slug}`)
}
