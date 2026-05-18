import "/public/assets/css/vendors/bootstrap.min.css"
import "/public/assets/css/vendors/swiper-bundle.min.css"
import "/public/assets/css/vendors/aos.css"
import "/public/assets/css/vendors/carouselTicker.css"
import "/public/assets/css/vendors/odometer.css"
import "/public/assets/css/vendors/magnific-popup.css"
import "/public/assets/fonts/bootstrap-icons/bootstrap-icons.min.css"
import "/public/assets/fonts/boxicons/boxicons.min.css"
import "/public/assets/fonts/remixicon/remixicon.css"
import "/public/assets/fonts/fontawesome/fontawesome.min.css"
import "/public/assets/fonts/fontawesome/solid.min.css"
import "/public/assets/fonts/fontawesome/regular.min.css"
import "/public/assets/css/main.css"

import "/public/assets/css/style.css"


import type { Metadata } from "next"
import { organizationJsonLd, SITE_URL } from "@/lib/seo"
import { Space_Grotesk,Rubik } from "next/font/google"

const groteskHeading = Space_Grotesk({
	weight: '700', // Only bold for headings
	subsets: ['latin'],
	variable: '--tc-heading-font-family',
	display: 'swap',
  });
  
  const groteskBody = Space_Grotesk({
	weight: '400', // Regular for body text
	subsets: ['latin'],
	variable: '--tc-btn-font-family',
	display: 'swap',
  });
const rubik = Rubik({
	weight: ['300', '400', '500', '600', '700', '800', '900'],
	subsets: ['latin'],
	variable: "--tc-body-font-family",
	display: 'swap',
})


export const metadata: Metadata = {
    metadataBase: new URL(SITE_URL),
    title: "Study in DACH - Degree Programs in Germany, Austria, and Switzerland",
    description: "Discover degree programs across Germany, Austria, and Switzerland.",
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang="en">
            <body 
			className={`${groteskHeading.variable} ${groteskBody.variable} ${rubik.variable}`}
			>
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd()) }}
                />
                {children}
            </body>
        </html>
    )
}
