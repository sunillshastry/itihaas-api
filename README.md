# itihaas-api

A comprehensive application where users can view/read/learn and cite about Indian History. The application will cover all relevant events within the geographical extent of the Indian subcontinent and in the timeline between 7000 BCE (Mehrgarh Civilization, Indus Valley Civilization) and 1947 (Indian Independence). The entire process for the consequent fully functional application is divided into the following steps, in the written order.

## Information Categories

- Dynasties / Kingdoms
- Rulers / Kings
- Wars

## Features

- GET a list of dynasties with basic information.
- GET individual dynasties with extended information.
- GET a list of all rulers with basic information.
- GET individual rulers with extended information.
- GET a list of all wars with basic information.
- GET individual wars with extended information.
- Filter through dynasties, rulers, and wars to access information.
- Retrieve articles, further reading sources, and additional data regarding an entity.
- Get the entire history catalog chronologically.
- Search feature: search for specifics (search feature lets you search about dynasties, rulers, and wars at the same time).

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
	slug: string,
	name: string,
	otherNames: string[],
	timeline: {
		begin: string,
		end: string
	},
	capitals: string[],
	languages: string[],
	religions: string[],
	area: {
		lowest: number,
		highest: number
	},
	population: number | string,
	currencies: string[],
	locations: string[],
	rulers: string[],
	wars: string[],
	description: {
		oneline: string,
		long: string[]
	},
	sources: string[],
	furtherReading: {
		publisherName: string // publisherName: link
	},
	articles: [
		{
			title: string,
			authors: string[],
			publisher: string,
			link: string
		}
	]
}
```

### Ruler.Schema

Not Available at the moment. Sorry for the inconvenience

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

## Endpoints

Will be updated in due time.
