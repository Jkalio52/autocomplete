import {
  AutocompleteApi as AutocompleteCoreApi,
  AutocompleteScopeApi,
  BaseItem,
} from '@algolia/autocomplete-core';

import { createDomElement } from './createDomElement';
import { ClearIcon, Input, LoadingIcon, SearchIcon } from './elements';
import {
  AutocompleteClassNames,
  AutocompleteDom,
  AutocompletePropGetters,
  AutocompleteState,
} from './types';
import { setProperties } from './utils';

type CreateDomProps<TItem extends BaseItem> = {
  autocomplete: AutocompleteCoreApi<TItem>;
  autocompleteScopeApi: AutocompleteScopeApi<TItem>;
  classNames: AutocompleteClassNames;
  isDetached: boolean;
  placeholder?: string;
  propGetters: AutocompletePropGetters<TItem>;
  setIsModalOpen(value: boolean): void;
  state: AutocompleteState<TItem>;
};

export function createAutocompleteDom<TItem extends BaseItem>({
  autocomplete,
  autocompleteScopeApi,
  classNames,
  isDetached,
  placeholder = 'Search',
  propGetters,
  setIsModalOpen,
  state,
}: CreateDomProps<TItem>): AutocompleteDom {
  const rootProps = propGetters.getRootProps({
    state,
    props: autocomplete.getRootProps({}),
    ...autocompleteScopeApi,
  });
  const root = createDomElement('div', {
    class: classNames.root,
    ...rootProps,
  });
  const detachedContainer = createDomElement('div', {
    class: classNames.detachedContainer,
    onMouseDown(event: MouseEvent) {
      event.stopPropagation();
    },
  });
  const detachedOverlay = createDomElement('div', {
    class: classNames.detachedOverlay,
    children: [detachedContainer],
    onMouseDown() {
      setIsModalOpen(false);
      autocomplete.setIsOpen(false);
    },
  });

  const labelProps = propGetters.getLabelProps({
    state,
    props: autocomplete.getLabelProps({}),
    ...autocompleteScopeApi,
  });
  const submitButton = createDomElement('button', {
    class: classNames.submitButton,
    type: 'submit',
    title: 'Submit',
    children: [SearchIcon({})],
  });
  const label = createDomElement('label', {
    class: classNames.label,
    children: [submitButton],
    ...labelProps,
  });
  const clearButton = createDomElement('button', {
    class: classNames.clearButton,
    type: 'reset',
    title: 'Clear',
    children: [ClearIcon({})],
  });
  const loadingIndicator = createDomElement('div', {
    class: classNames.loadingIndicator,
    children: [LoadingIcon({})],
  });

  const input = Input({
    class: classNames.input,
    state,
    getInputProps: propGetters.getInputProps,
    getInputPropsCore: autocomplete.getInputProps,
    autocompleteScopeApi,
    onDetachedEscape: isDetached
      ? () => {
          autocomplete.setIsOpen(false);
          setIsModalOpen(false);
        }
      : undefined,
  });

  const inputWrapperPrefix = createDomElement('div', {
    class: classNames.inputWrapperPrefix,
    children: [label, loadingIndicator],
  });
  const inputWrapperSuffix = createDomElement('div', {
    class: classNames.inputWrapperSuffix,
    children: [clearButton],
  });
  const inputWrapper = createDomElement('div', {
    class: classNames.inputWrapper,
    children: [input],
  });

  const formProps = propGetters.getFormProps({
    state,
    props: autocomplete.getFormProps({ inputElement: input }),
    ...autocompleteScopeApi,
  });
  const form = createDomElement('form', {
    class: classNames.form,
    children: [inputWrapperPrefix, inputWrapper, inputWrapperSuffix],
    ...formProps,
  });
  const panelProps = propGetters.getPanelProps({
    state,
    props: autocomplete.getPanelProps({}),
    ...autocompleteScopeApi,
  });
  const panel = createDomElement('div', {
    class: classNames.panel,
    ...panelProps,
  });

  if (__TEST__) {
    setProperties(panel, {
      'data-testid': 'panel',
    });
  }

  if (isDetached) {
    const detachedSearchButtonIcon = createDomElement('div', {
      class: classNames.detachedSearchButtonIcon,
      children: [SearchIcon({})],
    });
    const detachedSearchButtonPlaceholder = createDomElement('div', {
      class: classNames.detachedSearchButtonPlaceholder,
      textContent: placeholder,
    });
    const detachedSearchButton = createDomElement('button', {
      class: classNames.detachedSearchButton,
      onClick(event: MouseEvent) {
        event.preventDefault();
        setIsModalOpen(true);
      },
      children: [detachedSearchButtonIcon, detachedSearchButtonPlaceholder],
    });
    const detachedCancelButton = createDomElement('button', {
      class: classNames.detachedCancelButton,
      textContent: 'Cancel',
      onClick() {
        autocomplete.setIsOpen(false);
        setIsModalOpen(false);
      },
    });
    const detachedFormContainer = createDomElement('div', {
      class: classNames.detachedFormContainer,
      children: [form, detachedCancelButton],
    });

    detachedContainer.appendChild(detachedFormContainer);
    root.appendChild(detachedSearchButton);
  } else {
    root.appendChild(form);
  }

  return {
    detachedContainer,
    detachedOverlay,
    inputWrapper,
    input,
    root,
    form,
    label,
    submitButton,
    clearButton,
    loadingIndicator,
    panel,
  };
}
