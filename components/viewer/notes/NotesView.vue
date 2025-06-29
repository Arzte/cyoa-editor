<template>
  <div class="notes-table-wrapper">
    <div class="notes-table">
      <template
        v-for="({ packRow, choices, scores }, idx) in visiblePackRows"
        :key="packRow.id"
      >
        <div v-if="idx > 0" class="notes-ruler"></div>
        <div class="notes-row">
          <span class="row-title">{{ packRow.title }}</span>
          <RowScores :scores="scores" vertical />
        </div>
        <div class="notes-object-list">
          <ObjectNote
            v-for="{ obj } in choices"
            :key="obj.id"
            :obj="obj"
            :editable="editable"
          />
          <RowNote
            :pack-row="packRow"
            :editable="editable"
            :compact="compact"
          />
        </div>
      </template>
      <div v-if="isNotEmpty(visiblePackRows)" class="notes-ruler"></div>
      <GlobalNotes :editable="editable" :compact="compact" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { assoc, chain, filter, has, isEmpty, isNotEmpty } from 'ramda';

import RowNote from '~/components/viewer/notes/RowNote.vue';
import RowScores from '~/components/viewer/utils/RowScores.vue';
import { type PackRow, useBackpack } from '~/composables/viewer/useBackpack';
import { useBuildNotes } from '~/composables/viewer/useBuildNotes';

const { buildNotes } = useBuildNotes();
const { packRows } = useBackpack();

const $props = defineProps<{
  compact: boolean;
  editable: boolean;
}>();

const visiblePackRows = computed((): PackRow[] => {
  if ($props.compact) {
    const _buildNotes = buildNotes.value;
    return chain((item): PackRow[] => {
      const hasNote = has(`row:${item.packRow.id}`, _buildNotes);
      const choices = filter(({ obj }) => {
        return has(`obj:${obj.id}`, _buildNotes);
      }, item.choices);

      if (isEmpty(choices) && !hasNote) {
        return [];
      } else {
        return [assoc('choices', choices, item)];
      }
    }, packRows.value);
  } else {
    return packRows.value;
  }
});
</script>

<style scoped lang="scss">
.notes-table-wrapper {
  overflow: auto;
}

.notes-table {
  display: grid;
  grid-template-columns: auto 1fr;
  grid-auto-rows: auto;
  gap: 0.5rem;

  .notes-row {
    display: flex;
    flex-direction: column;
    flex-wrap: wrap;
    justify-content: start;
    align-items: start;
    gap: 0.5rem;

    .row-title {
      font-weight: bolder;
    }
  }

  .notes-object-list {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 0.2rem;
  }

  :deep(.notes-ruler) {
    grid-column: 1/-1;
    border-top: 1px solid gray;
  }

  :deep(.note-title) {
    font-style: italic;
  }

  :deep(.note-text) {
    font-family: monospace;
  }
}
</style>
