<template>
  <div class="test">Hello World</div>
</template>

<script setup>
import { ref } from 'vue'

const msg = ref('Hello')
</script>

<style scoped>
.test {
  color: red;
}
</style>
