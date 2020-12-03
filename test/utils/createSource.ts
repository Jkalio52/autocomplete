import { AutocompleteSource, BaseItem } from '@algolia/autocomplete-core';

export function createSource<TItem extends BaseItem>(
  source?: Partial<AutocompleteSource<TItem>>
) {
  return {
    getItemInputValue: ({ state }) => state.query,
    getItemUrl: () => undefined,
    onHighlight: () => {},
    onSelect: () => {},
    getItems: () => [],
    ...source,
  };
}
