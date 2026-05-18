'use client'
import "@/node_modules/react-modal-video/css/modal-video.css"
import Link from 'next/link'
import { useState } from 'react'
import ModalVideo from 'react-modal-video'

export default function Section4() {
	const [isOpen, setOpen] = useState(false)
	return (
		<>

			<section className="elearning-intructor-section-2 position-relative pb-120 rounded-bottom-4 overflow-hidden">
				<div className="container position-relative z-1 text-center bg-primary rounded-4 py-120">
					<div className="position-relative z-1">
						<svg xmlns="http://www.w3.org/2000/svg" width={60} height={60} viewBox="0 0 60 60" fill="none">
							<path d="M24.7266 31.7578H35.2734V35.2734H24.7266V31.7578Z" fill="#D5D52B" />
							<path d="M48.6772 35.2722H38.7891V37.0301C38.7891 38.0014 38.0026 38.7879 37.0312 38.7879H22.9688C21.9974 38.7879 21.2109 38.0014 21.2109 37.0301V35.2722H11.3228C9.04999 35.2722 7.03995 33.8234 6.32034 31.6674L0 12.7031V51.0926C0 54.0003 2.36572 56.366 5.27344 56.366H54.7266C57.6343 56.366 60 54.0003 60 51.0926V12.7045L53.6792 31.6674C52.9601 33.8234 50.95 35.2722 48.6772 35.2722Z" fill="#D5D52B" />
							<path opacity="0.4" d="M37.0302 3.63281H22.9677C20.06 3.63281 17.6943 5.99854 17.6943 8.90625V10.6641H3.02344L9.65323 30.5562C9.89355 31.2753 10.5646 31.7578 11.3218 31.7578H21.2099V30C21.2099 29.0286 21.9964 28.2422 22.9677 28.2422H37.0302C38.0016 28.2422 38.7881 29.0286 38.7881 30V31.7578H48.6762C49.4333 31.7578 50.1044 31.2753 50.3448 30.5562L56.975 10.6641H42.3037V8.90625C42.3037 5.99854 39.938 3.63281 37.0302 3.63281ZM21.2099 10.6641V8.90625C21.2099 7.93625 21.9977 7.14844 22.9677 7.14844H37.0302C38.0002 7.14844 38.7881 7.93625 38.7881 8.90625V10.6641H21.2099Z" fill="white" />
						</svg>
						<h2 className="text-white pt-4 text-anime-style-3">
							Astrax on a journey of <br />
							learning and skill-building today
						</h2>
						<p className="text-white py-3">Build your next landing page fast &amp; easy</p>
						<div className="d-flex align-items-center flex-wrap gap-4 justify-content-center">
							<a onClick={() => setOpen(true)} className="btn btn-white popup-video hover-up"><span className="text-dark">Watch free tutorial</span></a>
							<Link href="/contact" className="btn btn-white bg-green-3 text-primary hover-up">
								<span className="text-primary">get started now</span>
							</Link>
						</div>
					</div>
					<div className="position-absolute bottom-0 end-0 me-lg-10 z-0">
						<svg xmlns="http://www.w3.org/2000/svg" width={679} height={525} viewBox="0 0 679 525" fill="none">
							<path d="M64.6699 618.947V231.51L339.471 74.4863L614.34 231.51V544.461L339.471 701.514L194 618.375V306.559L339.471 223.43L485 306.559V469.402L339.471 552.541L323.34 543.326V381.627L404.645 335.145L339.471 297.916L258.67 344.117V580.836L339.471 627.027L549.67 506.912V269.049L339.471 148.973L129.34 269.049V655.885L339.471 776L679 582V194L339.471 0L0 194V582L64.6699 618.947Z" fill="#08584C" />
						</svg>
					</div>
				</div>
			</section>
			<ModalVideo channel='youtube' isOpen={isOpen} videoId="JXMWOmuR1hU" onClose={() => setOpen(false)} />
		</>
	)
}
