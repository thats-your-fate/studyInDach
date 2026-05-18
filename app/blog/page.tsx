
import Layout from "@/components/layout/Layout"
import Section1 from '@/components/sections/blog/Section1'
import Section2 from '@/components/sections/blog/Section2'
import Section3 from '@/components/sections/blog/Section3'
export default function Blog() {

	return (
		<>

			<Layout>
				<Section1 />
				<Section2 />
				<Section3 />
			</Layout>
		</>
	)
}