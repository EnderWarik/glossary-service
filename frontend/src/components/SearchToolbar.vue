<script setup lang="ts">
defineProps<{ loading: boolean; error: string | null }>()
const emit = defineEmits<{ search: [] }>()
const model = defineModel<string>({ required: true })
</script>

<template>
	<div class="toolbar">
		<div class="search">
			<input 
				class="input" 
				v-model="model" 
				placeholder="Поиск..." 
				@keyup.enter="emit('search')"
			/>
			<button class="btn btn--primary" @click="emit('search')" :disabled="loading">
				{{ loading ? 'Загрузка' : 'Найти' }}
			</button>
		</div>
		<div v-if="error" class="error-text">{{ error }}</div>
	</div>
</template>

<style scoped>
.toolbar {
	display: flex;
	flex-direction: column;
	gap: 12px;
	margin-bottom: 20px;
}

.search {
	display: flex;
	gap: 8px;
}

.search .input {
	max-width: 320px;
}
</style>
