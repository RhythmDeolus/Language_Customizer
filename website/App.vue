<script setup>
import { ref } from 'vue'
import {useRoute} from 'vue-router'
const route = useRoute();

</script>

<template>
  <!-- <router-link to="/playground" >Click</router-link> -->
  <router-view :key="route.fullPath" />
</template>

<style>

</style>