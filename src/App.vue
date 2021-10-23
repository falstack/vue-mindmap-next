<template>
  <v-mindmap :nodes="nodes" :connections="connections" :editable="true" />
</template>

<script setup lang="ts">
import VMindmap from './components/index.vue'
import map from './map'

const nodes = map.nodes
const connections = map.connections
</script>

<style lang="scss">
@import 'normalize.css';

#app {
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
