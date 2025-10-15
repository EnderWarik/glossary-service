<script setup lang="ts">
import { computed, useCssModule } from 'vue'

const styles = useCssModule()

const props = defineProps<{ q: string; loading: boolean; error: string | null }>()
const emit = defineEmits<{ (e: 'update:q', value: string): void; (e: 'search'): void }>()

const modelQ = computed({
	get: () => props.q,
	set: (val: string) => emit('update:q', val)
})

function onSearch() {
	emit('search')
}
</script>

<template>
	<div :class="styles.toolbar">
		<div :class="styles.search">
			<input :class="styles.input" v-model="modelQ" placeholder="Поиск по термину/определению/тегам" />
			<button :class="[styles.btn, styles.primary]" @click="onSearch" :disabled="loading">{{ loading ? 'Загрузка...' : 'Найти' }}</button>
		</div>
		<div v-if="error" :class="styles.error">{{ error }}</div>
	</div>
</template>

<style module>
.toolbar { display:flex; align-items:center; justify-content:space-between; gap:12px; margin-bottom:12px; }
.search { display:flex; gap:8px; }
.error { color:#b91c1c; font-size:14px; }
.btn { padding:8px 12px; border:1px solid #ddd; border-radius:8px; background:#fff; color:#111; cursor:pointer; }
.btn:disabled { opacity:.6; cursor:not-allowed; }
.primary { background:#111; color:#fff; border-color:#111; }
.input { background:#fff; border:1px solid #ddd; border-radius:8px; padding:8px 10px; width:100%; }
</style>


