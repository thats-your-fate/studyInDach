import { getCoursesPageData } from '@/lib/study-programs'
import Section2 from '@/components/sections/courses/Section2'
import Layout from "@/components/layout/Layout"
import Section1 from '@/components/sections/courses/Section1'
export const dynamic = "force-dynamic"

export default async function Courses({
	searchParams,
}: {
	searchParams?: Record<string, string | string[] | undefined>
}) {
	const { programs, universities, totalPrograms, totalMatching, page, totalPages, pageSize, filters, search, filterOptions } = await getCoursesPageData(searchParams)

	return (
		<>

			<Layout>
				<Section1 />
				<Section2
					courses={programs}
					universities={universities}
					totalPrograms={totalPrograms}
					totalMatching={totalMatching}
					page={page}
					totalPages={totalPages}
					pageSize={pageSize}
					initialFilters={filters}
					initialSearch={search}
					filterOptions={filterOptions}
				/>
			</Layout>
		</>
	)
}
