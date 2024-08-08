<template>
  <ModalDialog :show="isSearchVisible" @close="toggleSearch(false)">
    <template #header>
      <h5 class="m-0">Search</h5>
    </template>
    <template #default>
      <div class="search-modal" :class="{ 'show-view': !!searchView }">
        <div class="search-header">
          <input
            ref="searchInput"
            v-model="searchText"
            class="form-control"
            placeholder="Search CYOA"
            @input="search"
          />
        </div>
        <div class="search-result-list text-light">
          <div
            v-for="result in searchResults"
            :key="result.row.id"
            class="result-group"
          >
            <div class="group-title">{{ result.row.title }}</div>
            <div
              v-for="obj in result.items"
              :key="obj.id"
              class="result-item"
              :class="{ selected: searchView?.obj.id === obj.id }"
              @click="preview(obj, result.row)"
            >
              {{ obj.title }}
            </div>
          </div>
        </div>
        <div v-if="!!searchView" class="search-result-view text-light">
          <ViewProjectObj
            :key="searchView.obj.id"
            :obj="searchView.obj"
            :row="searchView.row"
            preview
          />
        </div>
      </div>
    </template>
  </ModalDialog>
</template>

<script setup lang="ts">
import Fuse from 'fuse.js';
import { debounce } from 'perfect-debounce';
import { isEmpty } from 'ramda';

import { Project, ProjectObj, ProjectRow } from '~/composables/project';
import { useProjectRefs } from '~/composables/store/project';
import { useViewerRefs, useViewerStore } from '~/composables/store/viewer';

const { toggleSearch } = useViewerStore();
const { isSearchVisible } = useViewerRefs();
const { project } = useProjectRefs();

type ResultGroup = {
  row: ProjectRow;
  items: ProjectObj[];
};
type ResultView = {
  row: ProjectRow;
  obj: ProjectObj;
};

const searchText = ref<string>('');
const searchResults = ref<ResultGroup[]>([]);
const searchView = ref<ResultView | null>(null);

const searchInput = ref<HTMLInputElement>();
watch(isSearchVisible, (newValue) => {
  if (newValue === false) {
    searchText.value = '';
    searchResults.value = [];
    searchView.value = null;
  } else {
    nextTick(() => {
      if (searchInput.value !== undefined) {
        searchInput.value.focus();
      }
    });
  }
});

watch(searchText, (newValue) => {
  if (newValue === '') {
    searchView.value = null;
  }
});

const search = debounce(() => {
  if (!project.value) return;

  const results: ResultGroup[] = [];

  if (isEmpty(searchText.value)) {
    searchResults.value = [];
    return;
  }

  const data: Project = project.value.data;
  for (const row of data.rows) {
    const _results: ProjectObj[] = [];
    const options = {
      ignoreDistance: true,
      ignoreFieldNorm: true,
      keys: [
        { name: 'title', weight: 1 },
        { name: 'text', weight: 0.25 },
        { name: 'addons.title', weight: 0.5 },
        { name: 'addons.text', weight: 0.25 },
      ],
    };

    for (const obj of row.objects) {
      _results.push(obj);
    }

    if (!isEmpty(_results)) {
      const fuse = new Fuse(_results, options);
      results.push({
        row,
        items: fuse
          .search(searchText.value, { limit: 7 })
          .map((result) => result.item),
      });
    }
  }

  const options = {
    ignoreDistance: true,
    ignoreFieldNorm: true,
    keys: [
      { name: 'items.title', weight: 1 },
      { name: 'items.text', weight: 0.125 },
      { name: 'items.addons.title', weight: 0.5 },
      { name: 'items.addons.text', weight: 0.125 },
      { name: 'row.title', weight: 0.25 },
      { name: 'row.titleText', weight: 0.125 },
    ],
  };
  const fuse = new Fuse(results, options);
  const searchRes = fuse.search(searchText.value, { limit: 5 });
  console.log(searchRes);

  searchResults.value = searchRes.map((result) => result.item);
}, 200);

const preview = (obj: ProjectObj, row: ProjectRow) => {
  if (!!searchView.value && searchView.value.obj.id === obj.id) {
    searchView.value = null;
  } else {
    searchView.value = { obj, row };
  }
};
</script>

<style scoped lang="scss">
@import '~/assets/css/bootstrap/config';

.search-modal {
  flex: 1 1 auto;
  display: grid;
  gap: 0.5em;

  grid-template:
    'header header' auto
    'list list' 1fr
    / 1fr 1fr;

  &.show-view {
    grid-template:
      'header header' auto
      'list view' 1fr
      / 2fr 1fr;
  }

  .search-header {
    grid-area: header;
  }

  .search-result-list {
    grid-area: list;
    overflow: auto;
  }

  .search-result-view {
    grid-area: view;
    display: flex;
    align-items: stretch;
    justify-content: stretch;
    overflow: auto;
    .project-obj {
      overflow-y: scroll;
    }
    .project-obj-content {
      overflow: unset;
    }
  }

  .result-group {
    .group-title {
      font-weight: bold;
      border-bottom: var(--bs-border-width) solid var(--bs-border-color);
      padding: 0.2rem 0.5rem;
    }
    .result-item {
      padding: 0.2rem 0.5rem;

      &.selected {
        background: var(--bs-primary);
      }
    }
  }
}
</style>
