
import Layout from "@/components/layout/Layout"
import Section1 from '@/components/sections/about/Section1'
import Section2 from '@/components/sections/about/Section2'
import Section3 from '@/components/sections/about/Section3'
import Section4 from '@/components/sections/about/Section4'
import Section5 from '@/components/sections/about/Section5'
export default function About() {

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