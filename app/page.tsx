import Layout from "@/components/layout/Layout"
import Section1 from '@/components/sections/home1/Section1'
import Section2 from '@/components/sections/home1/Section2'
import Section3 from '@/components/sections/home1/Section3'
export default function Home() {

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
