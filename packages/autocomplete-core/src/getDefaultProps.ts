import {
  AutocompleteOptions,
  BaseItem,
  InternalAutocompleteOptions,
  AutocompleteSubscribers,
} from './types';
import {
  generateAutocompleteId,
  getItemsCount,
  getNormalizedSources,
  flatten,
} from './utils';

export function getDefaultProps<TItem extends BaseItem>(
  props: AutocompleteOptions<TItem>,
  pluginSubscribers: AutocompleteSubscribers<TItem>
): InternalAutocompleteOptions<TItem> {
  const environment: InternalAutocompleteOptions<TItem>['environment'] = (typeof window !==
  'undefined'
    ? window
    : {}) as typeof window;
  const plugins = props.plugins || [];

  return {
    debug: false,
    openOnFocus: false,
    placeholder: '',
    autoFocus: false,
    defaultActiveItemId: null,
    stallThreshold: 300,
    environment,
    shouldPanelShow: ({ state }) => getItemsCount(state) > 0,
    ...props,
    // Since `generateAutocompleteId` triggers a side effect (it increments
    // and internal counter), we don't want to execute it if unnecessary.
    id: props.id ?? generateAutocompleteId(),
    plugins,
    // The following props need to be deeply defaulted.
    initialState: {
      activeItemId: null,
      query: '',
      completion: null,
      collections: [],
      isOpen: false,
      status: 'idle',
      context: {},
      ...props.initialState,
    },
    onStateChange(params) {
      props.onStateChange?.(params);
      plugins.forEach((x) => x.onStateChange?.(params));
    },
    onSubmit(params) {
      props.onSubmit?.(params);
      plugins.forEach((x) => x.onSubmit?.(params));
    },
    onReset(params) {
      props.onReset?.(params);
      plugins.forEach((x) => x.onReset?.(params));
    },
    getSources(params) {
      return Promise.all(
        [...plugins.map((plugin) => plugin.getSources), props.getSources]
          .filter(Boolean)
          .map((getSources) => getNormalizedSources(getSources!, params))
      )
        .then((nested) => flatten(nested))
        .then((sources) =>
          sources.map((source) => ({
            ...source,
            onSelect(params) {
              source.onSelect(params);
              pluginSubscribers.forEach((x) => x.onSelect?.(params));
            },
            onActive(params) {
              source.onActive(params);
              pluginSubscribers.forEach((x) => x.onActive?.(params));
            },
          }))
        );
    },
    navigator: {
      navigate({ itemUrl }) {
        environment.location.assign(itemUrl);
      },
      navigateNewTab({ itemUrl }) {
        const windowReference = environment.open(itemUrl, '_blank', 'noopener');
        windowReference?.focus();
      },
      navigateNewWindow({ itemUrl }) {
        environment.open(itemUrl, '_blank', 'noopener');
      },
      ...props.navigator,
    },
  };
}
