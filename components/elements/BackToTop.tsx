'use client'
import { useEffect, useState } from "react"

export default function BackToTop({ target }: any) {
	const [hasScrolled, setHasScrolled] = useState(false)

	useEffect(() => {
		const onScroll = () => {
			setHasScrolled(window.scrollY > 100)
		}

		window.addEventListener("scroll", onScroll)
		return () => window.removeEventListener("scroll", onScroll)
	}, [])

	const handleClick = () => {
		window.scrollTo({
			top: document.querySelector(target).offsetTop,
			behavior: 'smooth'
		})
	}

	return (
		<>
			{hasScrolled && (
				<div className="btn-scroll-top" onClick={handleClick}>
					<svg className="progress-square svg-content" width="100%" height="100%" viewBox="0 0 40 40">
						<path d="M8 1H32C35.866 1 39 4.13401 39 8V32C39 35.866 35.866 39 32 39H8C4.13401 39 1 35.866 1 32V8C1 4.13401 4.13401 1 8 1Z" />
					</svg>
				</div>
			)}
		</>
	)
}
