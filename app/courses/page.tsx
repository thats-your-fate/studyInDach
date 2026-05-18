// SSR False
import nextDynamic from 'next/dynamic'
import { getCoursesPageData } from '@/lib/study-programs'
const Section2 = nextDynamic(() => import('@/components/sections/courses/Section2'), {
	ssr: false,
})
import Layout from "@/components/layout/Layout"
import Section1 from '@/components/sections/courses/Section1'
// import Section2 from '@/components/sections/courses/Section2'
export const dynamic = "force-dynamic"

export default async function Courses() {
	const { programs, universities } = await getCoursesPageData()

	return (
		<>

			<Layout>
				<Section1 />
				<Section2 courses={programs} universities={universities} />
			</Layout>
		</>
	)
}
