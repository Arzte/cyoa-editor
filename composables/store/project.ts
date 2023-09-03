import { defineStore, storeToRefs } from 'pinia';
import * as R from 'ramda';
import { ComputedRef, computed } from 'vue';

import { buildConditions } from '~/composables/conditions';
import {
  PointType,
  Project,
  ProjectFile,
  ProjectObj,
  ProjectRow,
  Score,
} from '~/composables/project';

export const useProjectStore = defineStore('project', () => {
  const project = ref<ProjectFile | null>(null);
  const selected = ref<string[]>([]);

  const backpack: ComputedRef<ProjectRow[]> = computed(
    () => project.value?.data.backpack ?? [],
  );

  const pointTypes: ComputedRef<PointType[]> = computed(
    () => project.value?.data.pointTypes ?? [],
  );

  const projectRows: ComputedRef<ProjectRow[]> = computed(
    () => project.value?.data.rows ?? [],
  );

  const getRow = computed(() => {
    const rows: Record<string, ProjectRow> = R.fromPairs(
      R.map(
        (row: ProjectRow): [string, ProjectRow] => [row.id, row],
        project.value?.data.rows ?? [],
      ),
    );

    return (id: string) => rows[id];
  });

  const getObject = computed(() => {
    const objects: Record<string, ProjectObj> = R.fromPairs(
      R.chain(
        (row: ProjectRow) =>
          R.map(
            (obj: ProjectObj): [string, ProjectObj] => [obj.id, obj],
            row.objects,
          ),
        project.value?.data.rows ?? [],
      ),
    );

    return (id: string) => objects[id];
  });

  const getObjectRow = computed(() => {
    const mapping: Record<string, string> = R.fromPairs(
      R.chain(
        (row: ProjectRow) =>
          R.map(
            (obj: ProjectObj): [string, string] => [obj.id, row.id],
            row.objects,
          ),
        project.value?.data.rows ?? [],
      ),
    );

    return (id: string) => mapping[id];
  });

  const isLoaded = computed(() => !!project.value);
  const loadProject = (data: Project, file: string) => {
    project.value = { data, file };
  };
  const unloadProject = () => {
    project.value = null;
  };

  const setSelected = (id: string, isSelected: boolean) => {
    if (isSelected) {
      const rowId = getObjectRow.value(id);
      const row = getRow.value(rowId);
      if (row.allowedChoices > 0) {
        const selectedRowObjects = R.intersection(
          selected.value,
          R.map(R.prop('id'), row.objects),
        );

        if (selectedRowObjects.length >= row.allowedChoices) {
          const toDeselect = selectedRowObjects[0];
          selected.value = R.pipe(
            R.without([toDeselect]),
            R.append(id),
          )(selected.value);
        } else {
          selected.value = R.append(id, selected.value);
        }
      } else {
        selected.value = R.append(id, selected.value);
      }
    } else {
      selected.value = R.without([id], selected.value);
    }
  };

  const points = computed<Record<string, number>>(() => {
    const _selected = selected.value;

    const startingSums: Record<string, number> = R.pipe(
      R.map(({ id, startingSum }: PointType): [string, number] => [
        id,
        startingSum,
      ]),
      R.fromPairs,
    )(pointTypes.value);

    return R.pipe(
      R.map((id: string) => getObject.value(id)),
      R.chain(({ scores }: ProjectObj) => {
        return R.pipe(
          R.filter((score: Score) => {
            const cond = buildConditions(score);
            return cond(_selected);
          }),
          R.map(({ id, value }: Score): [string, number] => [
            id,
            Number.parseInt(value),
          ]),
        )(scores);
      }),
      R.reduceBy(
        (acc, [_, value]) => acc + value,
        0,
        ([id, _]) => id,
      ),
      R.mergeWith(R.add, startingSums),
    )(_selected);
  });

  return {
    project,
    projectRows,
    backpack,
    pointTypes,
    selected,
    points,
    isLoaded,
    loadProject,
    unloadProject,
    getRow,
    getObject,
    getObjectRow,
    setSelected,
  };
});

export const useProjectRefs = () => storeToRefs(useProjectStore());
