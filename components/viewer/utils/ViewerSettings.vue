<template>
  <div>
    <h5 class="text-center">Viewer</h5>
    <ul class="list-group mb-5 shadow">
      <li
        class="list-group-item d-flex justify-content-between align-items-center"
      >
        <div class="form-check form-switch">
          <input
            id="hideDisabledAddons"
            class="form-check-input me-1"
            type="checkbox"
            role="switch"
            :checked="disabledAddons"
            @change="toggleHideDisabledAddons()"
          />
          <label class="form-check-label" for="hideDisabledAddons"
            >Hide Disabled Addons
            <small class="text-body-secondary ms-3"
              >When enabled hides addons whose conditions are unmet</small
            >
          </label>
        </div>
      </li>
      <li
        class="list-group-item d-flex justify-content-between align-items-center"
      >
        <select
          v-model="cyoaPreferences"
          class="form-select"
          aria-label="Default CYOA to load at Startup"
        >
          <option selected value="">No CYOA Loaded at Startup</option>
          <option
            v-for="projects in projectList.items"
            :key="projects.id"
            :value="projects.id"
          >
            {{ projects.title }}
          </option>
        </select>
      </li>
    </ul>
    <h5 class="text-center">Backpack</h5>
    <ul class="list-group mb-5 shadow">
      <li
        class="list-group-item d-flex justify-content-between align-items-center"
      >
        <div class="form-check form-switch">
          <input
            id="showDisabledAddons"
            class="form-check-input me-1"
            type="checkbox"
            role="switch"
            :checked="disabledAddonsInBackpack"
            @change="toggleDisabledAddonsInBackpack()"
          />
          <label class="form-check-label"
            >Show Disabled Addons
            <small class="text-body-secondary ms-3"
              >When disabled shows addons whose conditions are met</small
            ></label
          >
        </div>
      </li>
      <li
        class="list-group-item d-flex justify-content-between align-items-center"
      >
        <div class="form-check form-switch">
          <input
            id="lockBackpackObjects"
            class="form-check-input me-1"
            type="checkbox"
            role="switch"
            :checked="lockBackpackObjects"
            @change="toggleLockBackpackObjects()"
          />
          <label class="form-check-label" for="lockBackpackObjects"
            >Lock Objects in Backpack</label
          >
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { useSettingRefs, useSettingStore } from '~/composables/store/settings';
import { useViewerRefs } from '~/composables/store/viewer';

const { viewerProjectList } = useViewerRefs();
const { cyoaPreference } = useSettingRefs();

const cyoaPreferences = computed({
  get: () => cyoaPreference.value,
  set: (value) => (cyoaPreference.value = value),
});

const projectList = computed(() => viewerProjectList.value);

const { disabledAddons, disabledAddonsInBackpack, lockBackpackObjects } =
  useSettingRefs();
const {
  toggleHideDisabledAddons,
  toggleDisabledAddonsInBackpack,
  toggleLockBackpackObjects,
} = useSettingStore();
</script>
