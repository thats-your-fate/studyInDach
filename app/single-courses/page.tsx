
import Layout from "@/components/layout/Layout"
import { getProgramDetail, programDetailPath } from "@/lib/study-programs"
import Section1 from '@/components/sections/single-courses/Section1'
import Section2 from '@/components/sections/single-courses/Section2'
import { redirect } from "next/navigation"
export default async function SingleCourses({
	searchParams,
}: {
	searchParams?: { id?: string }
}) {
	const program = await getProgramDetail(searchParams?.id)

	if (program && searchParams?.id) {
		redirect(programDetailPath(program))
	}

	return (
		<>

			<Layout>
				<Section1 program={program} />
				<Section2 program={program} />
			</Layout>
		</>
	)
}
