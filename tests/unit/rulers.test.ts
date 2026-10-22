import { describe, expect, it } from 'vitest';
import Rulers from '@/models/Rulers';

describe('Ruler model', () => {
  it('requires slug and name', () => {
    expect(new Rulers({}).validateSync()?.errors?.['slug']).toBeDefined();
    expect(new Rulers({}).validateSync()?.errors?.['name']).toBeDefined();
  });

  it('accepts a valid ruler with nested fields', () => {
    const ruler = new Rulers({
      slug: 'unit-test-ruler',
      name: 'Unit Test Ruler',
      otherNames: ['The Example'],
      family: {
        father: 'Father',
        mother: 'Mother',
        wives: ['Wife'],
        children: ['Child'],
      },
      wars: ['example-war'],
      timeline: { begin: '100 BCE', end: '50 BCE' },
      description: {
        oneline: 'A test ruler',
        long: ['First paragraph', 'Second paragraph'],
      },
      furtherReading: [
        { publisher: 'Example Press', link: 'https://example.com/reading' },
      ],
      articles: [
        {
          title: 'Example article',
          authors: ['A. Author'],
          publisher: 'Journal',
          link: 'https://example.com/article',
        },
      ],
    });
    expect(ruler.validateSync()).toBeUndefined();
  });

  it('applies array and nullable defaults', () => {
    const ruler = new Rulers({
      slug: 'defaults-ruler',
      name: 'Defaults Ruler',
    });
    expect(ruler.otherNames).toEqual([]);
    expect(ruler.wars).toEqual([]);
    expect(ruler.sources).toEqual([]);
    expect(ruler?.family?.wives).toEqual([]);
    expect(ruler?.family?.children).toEqual([]);
    expect(ruler?.description?.long).toEqual([]);
    expect(ruler.furtherReading).toEqual([]);
    expect(ruler.articles).toEqual([]);
    expect(ruler.born).toBeNull();
    expect(ruler.died).toBeNull();
    expect(ruler.dynasty).toBeNull();
  });

  it('declares slug as unique', () => {
    expect(Rulers.schema.path('slug')?.options?.['unique']).toBe(true);
  });

  it('allows optional timeline and family values to be omitted', () => {
    const ruler = new Rulers({ slug: 'minimal-ruler', name: 'Minimal Ruler' });
    expect(ruler.validateSync()).toBeUndefined();
  });
});
