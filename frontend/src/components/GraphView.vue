<script setup lang="ts">
import { onMounted, ref, useCssModule } from 'vue'
import cytoscape, { Core } from 'cytoscape'
import { getGraph } from '../api'

const styles = useCssModule()

const container = ref<HTMLDivElement | null>(null)
const nodesCount = ref(0)
const edgesCount = ref(0)
const cyEdgesCount = ref(0)
const loading = ref(false)
const error = ref<string | null>(null)
const currentLayout = ref<'cose'|'concentric'|'grid'>('cose')
let cy: Core | null = null

function applyStyles(cy: Core) {
	cy.style()
		.fromJson([
			{ selector: 'node', style: { 'label': 'data(label)', 'background-color': '#3b82f6', 'color': '#111', 'text-valign': 'center', 'text-halign': 'center', 'font-size': 10, 'width': 26, 'height': 26 } },
            { selector: 'edge', style: { 'curve-style': 'bezier', 'target-arrow-shape': 'triangle', 'target-arrow-color': '#9ca3af', 'line-color': '#9ca3af', 'width': 2, 'arrow-scale': 1.4, 'label': 'data(label)', 'font-size': 10, 'text-background-color': '#fff', 'text-background-opacity': 0.85, 'text-background-padding': 2, 'text-rotation': 'autorotate' } },
			{ selector: '.faded', style: { 'opacity': 0.12 } },
			{ selector: '.highlight', style: { 'background-color': '#f59e0b', 'line-color': '#f59e0b', 'target-arrow-color': '#f59e0b' } }
		])
		.update()
}

function ruType(t: string): string {
	switch (t) {
		case 'is-a': return 'является'
		case 'part-of': return 'часть'
		case 'related-to': return 'связан с'
		case 'synonym-of': return 'синоним'
		case 'derived-from': return 'происходит от'
		default: return t
	}
}

async function build() {
	loading.value = true
	error.value = null
	try {
        const data = await getGraph()
        nodesCount.value = data.nodes.length
        edgesCount.value = data.edges.length
		cy?.destroy()
		cy = cytoscape({
			container: container.value!,
				elements: [
				...data.nodes.map(n => ({ data: { id: String(n.id), label: n.term } })),
					...data.edges.map(e => ({ data: { id: `e-${String(e.id)}`, source: String(e.source_id), target: String(e.target_id), label: ruType(e.type) } }))
			],
			layout: { name: currentLayout.value, animate: false }
		})
			applyStyles(cy)
		wireInteractions()
		fit()
			cyEdgesCount.value = cy.edges().length
	} catch (e: any) {
		error.value = e?.response?.data?.detail || e?.message || 'Не удалось загрузить граф'
	} finally {
		loading.value = false
	}
}

function wireInteractions() {
	if (!cy) return
	cy.on('tap', 'node', (evt) => {
		if (!cy) return
		const node = evt.target
		const neighborhood = node.closedNeighborhood()
		cy.elements().addClass('faded').removeClass('highlight')
		neighborhood.removeClass('faded').addClass('highlight')
	})
	cy.on('tap', (evt) => {
		if (evt.target === cy) {
			cy.elements().removeClass('faded').removeClass('highlight')
		}
	})
}

function fit() {
	cy?.fit(undefined, 30)
}

function runLayout(name: 'cose'|'concentric'|'grid') {
	currentLayout.value = name
	if (!cy) return
	cy.layout({ name, animate: false }).run()
	fit()
}

onMounted(build)

defineExpose({ refresh: build })
</script>

<template>
	<div :class="styles.wrap">
		<div :class="styles.toolbar">
			<select :class="styles.select" v-model="currentLayout" @change="runLayout(currentLayout)">
				<option value="cose">COSE</option>
				<option value="concentric">Concentric</option>
				<option value="grid">Grid</option>
			</select>
			<div>
				<button :class="styles.btn" @click="fit" :disabled="loading">Fit</button>
				<button :class="styles.btn" @click="build" :disabled="loading">{{ loading ? 'Loading…' : 'Refresh' }}</button>
			</div>
		</div>
        <div v-if="error" style="color:#b91c1c; font-size:14px;">{{ error }}</div>
        <div :class="styles.meta">Узлов: {{ nodesCount }} · Связей: {{ edgesCount }}<span v-if="!edgesCount"> — связей нет</span></div>
		<div ref="container" :class="styles.canvas"></div>
	</div>
</template>

<style module>
.wrap { display:flex; flex-direction:column; gap:8px; }
.toolbar { display:flex; align-items:center; justify-content:space-between; gap:8px; }
.btn { padding:6px 10px; border:1px solid #ddd; border-radius:6px; background:#fff; cursor:pointer; }
.btn:disabled { opacity:.6; cursor:not-allowed; }
.select { padding:6px 10px; border:1px solid #ddd; border-radius:6px; background:#fff; }
.meta { font-size:12px; color:#555; }
.canvas { width:100%; height:70vh; border:1px solid #eee; border-radius:8px; }
</style>
