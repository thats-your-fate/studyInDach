# Data And Architecture Disclaimer

This project is a local development prototype for discovering DACH university degree programs. Data is collected from public university pages, sitemap-derived URLs, and manually supplied program URLs, then normalized into CSV files and seeded into a Prisma SQLite database.

## Architecture

- **Next.js app** renders course lists, filters, and degree-program detail pages.
- **Prisma + SQLite** stores normalized universities, degree programs, and localized program translations.
- **Python scripts** prepare manual URLs, extract structured program attributes, localize rows, merge CSV datasets, and support seeding.
- **Seed workflow** imports a base CSV plus matching localized files such as `.en.csv`, `.es.csv`, and `.pt.csv`.

## University Attributes

University records are intentionally compact:

- `id`
- `name`
- `location`
- `state`
- `websiteUrl`

The university table mainly provides ownership and location context for degree programs.

## Degree Program Attributes

Degree programs contain canonical source fields:

- `programUrl`
- `programName`
- `degreeLevel`
- `academicDegree`
- `subjectArea`
- `languageOfInstruction`
- `campusLocation`
- `duration`
- `ects`
- `startTerms`
- `applicationDeadlines`
- `admissionRequirements`
- `tuitionOrFees`
- `studyMode`
- `restrictedAdmission`
- `applicationUrl`
- `contactEmail`
- `summary`
- `heroImageUrl`

They also include normalized discovery/filter fields:

- `studyField`
- `secondaryStudyField`
- `internationalStudentFit`
- `onlineOrOnCampus`
- `fullTimeOrPartTime`
- `applicationDifficulty`
- `tuitionType`
- `workExperienceRequired`
- `metadataConfidence`

Localized translation rows add public-facing content per locale:

- `localizedProgramName`
- translated display fields
- `seoTitle`
- `seoDescription`
- `seoKeywords`
- `searchIntentTags`
- `careerOutcomes`
- `skillsYouWillLearn`
- `programHighlights`
- `targetAudience`
- `bestFor`
- `metadataNotes`

## Data Quality Notes

The data is normalized from heterogeneous university pages, so some attributes may be incomplete, outdated, inferred, or unavailable on the source page. AI-assisted extraction and localization are used to improve structure and readability, but official university pages remain the source of truth for admissions, tuition, deadlines, and legal requirements.

Use this dataset for discovery and development. Users should verify critical application details directly with the university before applying.
