<script setup lang="ts">
import TotpAuthenticator from '../shared/TotpAuthenticator.vue';
</script>

<template>
  <div class="w-80 rounded-xl overflow-hidden">
    <TotpAuthenticator />
  </div>
</template>

<style>
/* Popup-specific styles */
body {
  margin: 0;
  padding: 0;
}
</style>