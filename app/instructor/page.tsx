import dynamic from 'next/dynamic'
const Section3 = dynamic(() => import('@/components/sections/instructor/Section3'), {
	ssr: false,
})
import Layout from "@/components/layout/Layout"
import Section1 from '@/components/sections/instructor/Section1'
import Section2 from '@/components/sections/instructor/Section2'
import Section4 from '@/components/sections/instructor/Section4'
import Section5 from '@/components/sections/instructor/Section5'
export default function Instructor() {

	return (
		<>

			<Layout>
				<Section1 />
				<Section2 />
				<Section3 />
				<Section4 />
				<Section5 />
			</Layout>
		</>
	)
}