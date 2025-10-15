<script setup lang="ts">
import { useCssModule } from 'vue'

const styles = useCssModule()

const props = defineProps<{ tab: 'list'|'graph' }>()
const emit = defineEmits<{ (e: 'update:tab', value: 'list'|'graph'): void }>()

function setTab(value: 'list'|'graph') {
	emit('update:tab', value)
}
</script>

<template>
	<header :class="styles.header">
		<h1>Glossary</h1>
		<nav :class="styles.tabs">
			<button :class="{ [styles.active]: props.tab==='list' }" @click="setTab('list')">Список</button>
			<button :class="{ [styles.active]: props.tab==='graph' }" @click="setTab('graph')">Граф</button>
		</nav>
	</header>
\t
</template>

<style module>
.header { display:flex; align-items:center; justify-content:space-between; padding: 12px 16px; border-bottom:1px solid #eee; }
.tabs button { margin-right:8px; padding:6px 10px; }
.tabs .active { background:#222; color:#fff; }
</style>


