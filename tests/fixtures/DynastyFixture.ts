export interface DynastyFixture {
  slug: string;
  name: string;
  otherNames: string[];
  capitals: string[];
  languages: string[];
  religions: string[];
  rulers: string[];
  wars: string[];
  locations: string[];
  currencies: string[];
  sources: string[];
  timeline: {
    begin: string | null;
    end: string | null;
  };
  area: {
    lowest: string | null;
    highest: string | null;
  };
  population: string | null;
  description: {
    oneline: string | null;
    long: string[];
  };
  furtherReading: unknown[];
  articles: unknown[];
}

export function dynastyFixture(
  overrides: Partial<DynastyFixture> = {},
): DynastyFixture {
  return {
    slug: 'test-dynasty',
    name: 'Test Dynasty',
    otherNames: [],
    capitals: [],
    languages: [],
    religions: [],
    rulers: [],
    wars: [],
    locations: [],
    currencies: [],
    sources: [],
    timeline: {
      begin: null,
      end: null,
    },
    area: {
      lowest: null,
      highest: null,
    },
    population: null,
    description: {
      oneline: null,
      long: [],
    },
    furtherReading: [],
    articles: [],
    ...overrides,
  };
}
