# itihaas-api

## Contents

- [Introduction](#introduction)
- [Problem Statement](#problem-statement)
- [Current State of the Market](#current-state-of-the-market)
- [Competitors and Alternatives (unavailable)](#competitors-and-alternatives)
- [Research Studies on Competitors and Alternatives (unavailable)](#research-studies-on-competitors-and-alternatives)
- High-Level Technical Deliverables Summary
- Core Feature List
- Personas
  - Primary Target Audience and Users
  - User Stories with Acceptance Tests
  - Use Cases
- Comprehensive Feature List
- Product Engineering Workflows and Models
- Tech Stack Overview
  - Frontend Engineering:
    - Tech Stack Summary
    - Tech Stack and Architecture Reasoning
    - Potential Third Party APIs
  - Backend Engineering:
    - Tech Stack Summary
    - Tech Stack and Architecture Reasoning
    - Potential Third Party APIs
  - Database and Infrastructure:
    - Tech Stack Summary
    - Tech Stack and Architecture Reasoning
    - Potential External Party Usage
  - No-Code Tools:
    - Usage Summary
    - Usage Reasoning
- User Flow Diagrams
- Sketching Low-Fidelity Wireframe
- Crafting High-Fidelity Mockups and Prototypes
- Community and Individual Support
- API Documentation
- Developer Resources
- Growth and Donations
- Acknowledgements and Credits

## Introduction

**Itihaas** _(https://itihaas.dev)_ is a structured, community-driven Indian history platform designed to help students, researchers, and curious minds explore the vast history of the Indian subcontinent. Discover detailed profiles of dynasties, rulers, and wars - search specific entities, navigate the historical timeline chronologically, or contribute credible research to expand the growing catalog. Whether you're studying, researching, exploring out of curiosity, or building applications using historical data, Itihaas makes the history of the Indian subcontinent accessible, informative, and engaging.

Itihaas offers an extensively curated platform where users can study and cite information about the Indian subcontinent’s history. Itihaas will cover all relevant events within the geographical extent of the Indian subcontinent and in the timelines between 7000 BCE _(accounting the first civilization, Mehrgarh Civilization, Indus Valley Civilization, and more)_, and 1947 _(Indian independence)_.

## Problem Statement

Students, researchers, and independent developers seeking structured and interconnected information about the history of the Indian subcontinent face significant challenges accessing reliable, chronologically organized, and interlinked historical data. Existing resources are fragmented across textbooks, academic publications, language obstacles, and unstructured web content, making it difficult to trace direct and indirect relationships between dynasties, rulers, wars, regions, and timelines. As a result, research becomes inefficient, citations lack consistency, and historical data remains difficult to access for both educational purposes and technical applications.

While several platforms provide historical information, many do not offer comprehensive chronological coverage or structured, interconnected datasets spanning the full historical scope of the Indian subcontinent. Additionally, limited support for structured community contributions restricts collaborative expansion and continuous improvement of historical knowledge.

## Current State of the Market

Historical information of the Indian subcontinent is no doubt widely available across a diverse ecosystem of sources, primarily through texts and online content, including academic textbooks, peer-reviewed journals, research papers, encyclopedic platforms, archival repositories, independent but credible blogs, regional publications, educational websites, and government based open data. This abundance of material clearly reflects the depth and richness of the Indian subcontinent’s history, spanning early Neolithic settlements, Bronze Age civilizations such as the Indus Valley Civilizations, classical and important empires that shape the history for the better and worse, regional kingdoms, colonial transitions, and independence movements. However, despite the volume of the available data, the ecosystem still remains structurally fragmented in most cases.

- **Narrative-Driven Dominant Information Architecture:**

  An important and defining characteristic of the current historical landscape is that it is narrative based information architecture. Most resources present the history in a long-form textual prose intended primarily for reading under certain interpretations rather than a standalone or structured exploration. While these narrative formats are highly effective for certain cases such as contextual storytelling and academic discourse, they are less suited for structured querying, cross-entity navigation, or relational mapping. For instance, tracing the specific relations between a certain dynasty, its rulers, contemporaneous regional powers, and associated conflicts often requires consulting numerous disconnected articles or publications - which often completely miss or lack the prerequisite information, prompting the user to continue searching. The lack of systematically interlinked entities makes it difficult to move fluidly between related historical components within a unified framework.

- **Fragmentation Across Mediums and Regional Languages:**

  Due to India’s diverse nature and various regional languages, the historical information is dispersed across mediums and languages. Valuable scholarship may exist in printed texts, subscription-based research databases, university repositories, or regional-language publications that are not digitally centralized or published in a universal language. This dispersion creates practical access barriers, including institutional paywalls, limited digitization of regional scholarship, and linguistic obstacles for users who may not be proficient in multiple Indian languages. As a result, researchers and students frequently assemble information manually from scattered sources, rather than relying on a consolidated and structured digital repository.

- **Inconsistent or Inaccurate Chronological Integration:**

  With context to the history of the Indian subcontinent, the chronological integration across historical periods also remains inconsistent. While certain platforms provide comprehensive overviews of particular eras or dynasties, few offer seamless chronological navigation with timelines spanning thousands of years within a unified system. The historical information is often compartmentalized by era, region or theme without an integrated timeline that connects early civilizations, classical dynasties, regional kingdoms, and modern transformations and changes. This compartmentalization limits the user’s ability to understand the underlying long-term historical continuity, overlap between regions, or the broader evolution of sociopolitical structures across centuries.

- **Data Accessibility Infrastructure and Developer Experience:**

  From a more technical standpoint, current market lacks structured data infrastructure tailored specifically to Indian historical knowledge. Most historical not provided as normalized datasets, interlinked entity graphs, or machine-readable formats that allow efficient programmatic access and enable communication between the primary datasource and third-party applications wishing to incorporate the information. Developers who are interested and seeking to build applications such as educational tools, visualization platforms, or analytical system must almost always rely on the painstaking process of scraping unstructured web pages, manually cleaning inconsistent or missing information, resolving ambiguous entity names, and standardizing chronological formats. This significantly increases development overhead and experience, and consequently limits innovation built upon the historical data available.

- **Variable Source Transparency and Citation Consistency:**

  The notion of source transparency and citation availability and consistency also vary significantly and widely across platforms. While numerous reputable academic institutions and established encyclopedic sources maintain rigorous citation standards, many widely accessed web-based resources do provide any citation referencing or primary and secondary sources. When they do, the citation styles may differ, sourcing methodologies may be unclear, and the distinction between scholarly interpretation and general commentary may not always be explicitly stated. This variability complicates academic citation practices and can reduce confidence in the reliability of the information, most particularly for students and early-stage researchers.

- **Limited Mechanisms for Community Contributions:**

  When it comes to external individual contributions that result in growth of the platforms, the in-place community contribution mechanisms in the current ecosystem illustrate certain limitations. Although a few platforms permit user-generated content, contribution workflows are still often narrative-focused and not structured around standardized data models. Submissions may enhance the textual descriptions but do not necessarily integrate into normalized relational systems that maintain consistent entity relationships and chronological alignment. Furthermore, moderation process may be slow, or worse yet unattended or lack transparent editorial frameworks and acknowledgements, limiting scalable and supportive collaborate expansion while preserving integrity and information credibility.

- **Limitations on a Unified Historical Scope:**

  Another certain drawback that is visible with most platforms is the inconsistent context or scope of the information provided on their platforms; this touches on the issues with platforms primarily focusing on very specific periods or dynasties, or to summarize in a thematic manner. Although these are great in certain use cases, particularly with deeper research on a specific topic, they do not encompass the wider picture in place - this includes the prerequisite dynasties that led to the existing one and its eventual decline and whatnot. Additionally, while many platforms cover aspects of the Indian subcontinent’s history, the comprehensive scope across the full temporal range of the subcontinent, from the early prehistoric settlements to the Indian independency, within a single, structured framework remains limited or absent altogether. As existing resources often specialize in particular dynasties, the outcome is that users frequently navigate between multiple specialized platforms rather than accessing a centralized historical knowledge system that is capable of interlinking and comparing entities across different timelines and geographies.

As a conclusion, the current market for Indian historical information is rich in content but structurally dispersed. Information is widely available but rarely chronologically unified, relationally interlinked, machine-readable, or developer-accessible in a cohesive manner. Users compensate by manually aggregating fragmented materials, and technical innovation built upon historical data remains constrained by the absence of centralized, structured infrastructure.

## Competitors and Alternatives

**_Unfortunately, this section is unavailable for public view_**

## Research Studies on Competitors and Alternatives

**_Unfortunately, this section is unavailable for public view_**

<!--
Itihaas is a comprehensive application where users can view/read/learn and cite about Indian History. The application will cover all relevant events within the geographical extent of the Indian subcontinent and in the timeline between 7000 BCE (Mehrgarh Civilization, Indus Valley Civilization) and 1947 (Indian Independence). The entire process for the consequent fully functional application is divided into the following steps, in the written order.

## Information Categories

- Dynasties / Kingdoms
- Rulers / Kings
- Wars

## Features

- Access individual or list of dynasties with customized or full data collection.
- Access dynasties list with extended information via queries.
- Access individual or list of rulers with customized or full data collection.
- Access rulers list with extended information via queries.
- Access individual or list of wars with customized or full data collection.
- Access wars list with extended information via queries.
- Perform advanced filtering and sorting via the client app ([itihaas.dev](https://itihaas.dev)), or via HTTP requests with `itihaas-api` through dynasties, rulers, and wars to access information.
- Gain access to open-source articles, further reading sources, and additional data regarding an entity (dynasty/war/ruler).
- View chronological structure of Indian history.
- Search feature: Perform seamless search via the client app ([itihaas.dev](https://itihaas.dev)), or through HTTP requests with `itihaas-api`, while customizing requests for additional information within search.
- Platform Growth: Provides a platform to help Itihaas grow by user submissions for new entries, existing fixes and bugs and updating current info within the catalog database.

## Open API (Itihaas API)

[`itihaas-api`](https://github.com/sunillshastry/itihaas-api) provides free to use REST API for public usage. The REST API comes with pre-built rate-limiting, RESTful pattern, and requires user registration for API key. Please check the [documentation](https://github.com/sunillshastry/itihaas-api) to learn more about `itihaas-api`.

## Developer

The following information may be beneficial to developers wishing to consume the Itihaas API for personal use.

### Schemas

There are three database collections: a collection of all rulers, a collection of all the dynasties, and a collection of all the wars, each `Ruler`, `Dynasty`, and `War` will have the following structure.

- String (A typical text value)
- Object (Information embedded within `{ ... }`)
- Number (encoded as string values)

The Schema for Rulers, Dynasties, and Wars is extensive; not all values will be included for every Ruler/Dynastry/War, the amount of data/information depends on what is available from credible sources that I can find (mostly Wikipedia). Any missing or unavailable field will automatically have a `null` value by default.

### Dynasty.Schema

```typescript
{
	_id: string; // Unique identifier value
	slug: string; // Unique identifier value
	name: string;
	otherNames: string[];
	timeline: {
		begin: string,
		end: string,
	},
	capitals: string[];
	languages: string[];
	religions: string[];
	area: {
		lowest: number | string,
		highest: number | string,
	};
	population: number | string;
	currencies: string[];
	locations: string[];
	rulers: string[];
	wars: string[];
	description: {
		oneline: string,
		long: string[],
	};
	sources: string[];
	furtherReading: {
		publisher: string,
		link: string,
		_id: string; // Unique identifier (for readings)
	}[];
	articles: {
		title: string,
		authors: string[],
		publisher: string,
		link: string
		_id: string; // Unique identifier (for articles)
	}[];
}
```

### Ruler.Schema

```typescript
{
	_id: string; // Unique identifier value
	slug: string; // Unique identifier value
	name: string;
	otherNames: string[];
	born: string;
	died: string;
	dynasty: string;
	religion: string;
	predecessor: string;
	successor: string;
	family: {
		father: string;
		mother: string;
		children: string[];
		wives: string;
	} | null;
	wars: string[];
	timeline: {
		begin: string;
		end: string;
	} | null;
	description: {
		oneline: string;
		long: string[];
	};
	sources: string[];
	furtherReadings: {
		publisher: string;
		link: string;
		_id: string; // Unique identifier (for readings)
	}[];
	articles: {
		publisher: string;
		authors: string[];
		title: string;
		link: string;
		_id: string; // Unique identifier (for articles)
	}[];
}
```

### War.Schema

Not Available at the moment. Sorry for the inconvenience

## Timelines

The following contains the timeline information for dynasties that existed in the Indian Subcontinent (incl. North and South Indian empires) and the historical wars that were fought. These are just the templates: I have tried to do in-depth on every single topic listed below to hone the database with as much information as possible within the scope of the technical requirements.

#### Prehistoric and Early Civilizations

- Mehrgarh Civilization (7000 BCE to 2500 BCE)
- Indus Valley Civilization (3300 BCE to 1300 BCE)

#### Vedic and Early Kingdoms

- Vedic Age Civilization (1500 BCE to 600 BCE)
- Kuru Dynasty
- Panchala Dynasty
- Kosala Dynasty
- Magadha Dynasty
- Shaishunaga Dynasty
- Nanda Dynasty
- Maurya Dynasty
- Shunga Dynasty
- Kanva Dynasty
- Mitra Dynasty

...and more.

## Tech Stack

Below, you will find the full, transparent tech stack used for the backend application for Itihaas.

> To view the tech stack for the frontend, please visit [here](https://github.com/sunillshastry/itihaas-client).

- **Core**: Node.js, Express.js.
- **Databases**: MongoDB, MongoDB Atlas, Redis, Upstash, PostgreSQL, Neon.
- **Containerization/Infrastructure**: Docker, docker-compose.
- **Libraries**: Prisma, Mongoose, Express Rate Limiter, Resend.
- **Linting and Formatting**: ESLint, Prettier, Husky, Airbnb Style Guide.
- **Tests**: Jest, Supertest, Postman.

## Endpoints

Will be updated in due time.
-->
