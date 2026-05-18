
import Layout from "@/components/layout/Layout"
import { getProgramDetail } from "@/lib/study-programs"
import Section1 from '@/components/sections/single-courses/Section1'
import Section2 from '@/components/sections/single-courses/Section2'
export default async function SingleCourses({
	searchParams,
}: {
	searchParams?: { id?: string }
}) {
	const program = await getProgramDetail(searchParams?.id)

	return (
		<>

			<Layout>
				<Section1 program={program} />
				<Section2 program={program} />
			</Layout>
		</>
	)
}
