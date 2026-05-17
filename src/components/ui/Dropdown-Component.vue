<template>
  <div class="vd-wrap" ref="wrapRef" @keydown="handleKeydown">
    <!-- Trigger -->
    <button
      type="button"
      class="vd-trigger"
      :class="{ 'vd-trigger--open': open, 'vd-trigger--filled': modelValue }"
      @click="toggle"
      :aria-expanded="open"
    >
      <div class="vd-trigger__body">
        <span class="vd-trigger__label">
          <i :class="icon" class="vd-label-icon" />
          {{ label }}
        </span>
        <span class="vd-trigger__value">
          {{ displayValue }}
        </span>
      </div>
      <span class="vd-trigger__chevron" :class="{ 'vd-trigger__chevron--up': open }">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M2 4l4 4 4-4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </span>
    </button>

    <!-- Dropdown Panel -->
    <Transition name="vd-panel">
      <div v-if="open" class="vd-panel" role="listbox">
        <!-- Search inside dropdown if many options -->
        <div v-if="searchable" class="vd-search-wrap">
          <i class="pi pi-search vd-search-icon" />
          <input
            ref="searchRef"
            v-model="searchQuery"
            class="vd-search"
            :placeholder="`Search ${label.toLowerCase()}...`"
            @click.stop
          />
        </div>

        <!-- All option -->
        <button
          class="vd-option"
          :class="{ 'vd-option--active': !modelValue }"
          role="option"
          @click="select('')"
        >
          <span class="vd-option__icon vd-option__icon--all">
            <i class="pi pi-globe" />
          </span>
          <span class="vd-option__text">All {{ label }}s</span>
          <span v-if="!modelValue" class="vd-option__check">
            <i class="pi pi-check" />
          </span>
        </button>

        <div class="vd-divider" />

        <!-- Options list -->
        <div class="vd-options-list">
          <button
            v-for="(opt, i) in filteredOptions"
            :key="opt.value ?? opt"
            class="vd-option"
            :class="{ 'vd-option--active': modelValue === (opt.value ?? opt) }"
            :style="{ animationDelay: `${i * 18}ms` }"
            role="option"
            @click="select(opt.value ?? opt)"
          >
            <span class="vd-option__icon" v-if="opt.emoji">{{ opt.emoji }}</span>
            <span class="vd-option__icon vd-option__icon--dot" v-else>
              <span class="dot" />
            </span>
            <span class="vd-option__text">{{ opt.label ?? opt }}</span>
            <span v-if="modelValue === (opt.value ?? opt)" class="vd-option__check">
              <i class="pi pi-check" />
            </span>
          </button>
          <div v-if="filteredOptions.length === 0" class="vd-empty">
            No results found
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  modelValue: { type: String, default: '' },
  options: { type: Array, default: () => [] }, // strings or { value, label, emoji }
  label: { type: String, default: 'Option' },
  icon: { type: String, default: 'pi pi-chevron-down' },
  placeholder: { type: String, default: '' },
  searchable: { type: Boolean, default: false },
});

const emit = defineEmits(['update:modelValue']);

const open = ref(false);
const wrapRef = ref(null);
const searchRef = ref(null);
const searchQuery = ref('');

const displayValue = computed(() => {
  if (!props.modelValue) return props.placeholder || `Any ${props.label}`;
  const found = props.options.find(o => (o.value ?? o) === props.modelValue);
  return found ? (found.label ?? found) : props.modelValue;
});

const filteredOptions = computed(() => {
  if (!searchQuery.value) return props.options;
  const q = searchQuery.value.toLowerCase();
  return props.options.filter(o => (o.label ?? o).toLowerCase().includes(q));
});

const toggle = () => {
  open.value = !open.value;
  if (open.value && props.searchable) {
    nextTick(() => searchRef.value?.focus());
  }
};

const select = (val) => {
  emit('update:modelValue', val);
  open.value = false;
  searchQuery.value = '';
};

const handleKeydown = (e) => {
  if (e.key === 'Escape') { open.value = false; }
};

const handleOutside = (e) => {
  if (!wrapRef.value?.contains(e.target)) {
    open.value = false;
    searchQuery.value = '';
  }
};

onMounted(() => document.addEventListener('click', handleOutside));
onUnmounted(() => document.removeEventListener('click', handleOutside));
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap');

.vd-wrap {
  position: relative;
  flex: 1;
  min-width: 0;
  font-family: 'DM Sans', sans-serif;
}

/* ── Trigger ── */
.vd-trigger {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 10px 18px;
  background: transparent;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  text-align: left;
  transition: background 0.2s ease;
}

.vd-trigger:hover,
.vd-trigger--open {
  background: rgba(232, 101, 10, 0.05);
}

.vd-trigger__body {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.vd-trigger__label {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 10.5px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: #e8650a;
}

.vd-label-icon {
  font-size: 10px;
}

.vd-trigger__value {
  font-size: 15px;
  font-weight: 500;
  color: #1a1008;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 160px;
  transition: color 0.2s;
}

.vd-trigger:not(.vd-trigger--filled) .vd-trigger__value {
  color: #9a8a7a;
}

.vd-trigger__chevron {
  color: #c0a090;
  flex-shrink: 0;
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), color 0.2s;
}

.vd-trigger__chevron--up {
  transform: rotate(180deg);
  color: #e8650a;
}

/* ── Panel ── */
.vd-panel {
  position: absolute;
  top: calc(100% + 8px);
  left: -8px;
  min-width: 220px;
  width: max-content;
  max-width: 280px;
  background: #fff;
  border-radius: 18px;
  border: 1px solid rgba(232, 101, 10, 0.12);
  box-shadow:
    0 20px 60px rgba(26, 16, 8, 0.16),
    0 4px 16px rgba(232, 101, 10, 0.10),
    0 0 0 1px rgba(232,101,10,0.04);
  overflow: hidden;
  z-index: 200;
}

/* Search inside */
.vd-search-wrap {
  position: relative;
  padding: 10px 12px 6px;
}

.vd-search-icon {
  position: absolute;
  left: 22px;
  top: 50%;
  transform: translateY(-20%);
  font-size: 12px;
  color: #c0a090;
}

.vd-search {
  width: 100%;
  padding: 8px 12px 8px 32px;
  border-radius: 10px;
  border: 1.5px solid rgba(232, 101, 10, 0.15);
  background: rgba(232, 101, 10, 0.04);
  font-size: 13px;
  font-family: 'DM Sans', sans-serif;
  color: #1a1008;
  outline: none;
  transition: border-color 0.2s;
}

.vd-search:focus {
  border-color: rgba(232, 101, 10, 0.4);
}

.vd-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(232,101,10,0.12), transparent);
  margin: 4px 0;
}

/* Options list */
.vd-options-list {
  max-height: 220px;
  overflow-y: auto;
  padding: 4px 6px 8px;
  scrollbar-width: thin;
  scrollbar-color: rgba(232,101,10,0.2) transparent;
}

.vd-options-list::-webkit-scrollbar {
  width: 4px;
}
.vd-options-list::-webkit-scrollbar-track { background: transparent; }
.vd-options-list::-webkit-scrollbar-thumb {
  background: rgba(232,101,10,0.2);
  border-radius: 99px;
}

/* Option */
.vd-option {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 10px;
  border: none;
  background: transparent;
  border-radius: 12px;
  cursor: pointer;
  text-align: left;
  font-family: 'DM Sans', sans-serif;
  animation: optionIn 0.25s ease both;
  transition: background 0.15s ease;
}

@keyframes optionIn {
  from { opacity: 0; transform: translateX(-6px); }
  to   { opacity: 1; transform: translateX(0); }
}

.vd-option:hover {
  background: rgba(232, 101, 10, 0.07);
}

.vd-option--active {
  background: linear-gradient(135deg, rgba(232,101,10,0.12), rgba(192,57,43,0.06));
}

.vd-option__icon {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: rgba(232,101,10,0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  flex-shrink: 0;
}

.vd-option__icon--all {
  background: linear-gradient(135deg, rgba(232,101,10,0.15), rgba(192,57,43,0.08));
  color: #e8650a;
  font-size: 12px;
}

.vd-option__icon--dot {
  background: transparent;
}

.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #d0b090;
}

.vd-option--active .dot {
  background: #e8650a;
}

.vd-option__text {
  flex: 1;
  font-size: 13.5px;
  font-weight: 500;
  color: #3a2a1a;
}

.vd-option--active .vd-option__text {
  color: #e8650a;
  font-weight: 600;
}

.vd-option__check {
  font-size: 11px;
  color: #e8650a;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: rgba(232,101,10,0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.vd-empty {
  text-align: center;
  padding: 16px;
  font-size: 13px;
  color: #b0a090;
}

/* All option row (outside scroll) */
.vd-option:first-of-type {
  margin: 4px 6px 0;
  width: calc(100% - 12px);
}

/* ── Transition ── */
.vd-panel-enter-active {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.vd-panel-leave-active {
  transition: all 0.18s cubic-bezier(0.4, 0, 1, 1);
}
.vd-panel-enter-from {
  opacity: 0;
  transform: translateY(-10px) scale(0.96);
}
.vd-panel-leave-to {
  opacity: 0;
  transform: translateY(-6px) scale(0.98);
}
</style>