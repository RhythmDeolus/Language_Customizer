<script setup>
import Editor from "./Editor.vue";
import Output from "./Output.vue";
import Creator from "./Creator.vue";
import {useRoute} from "vue-router";
import { computed, onBeforeMount } from "vue";

const route = useRoute();

// console.log(route.query);

let config = JSON.parse(route.query.json);

// onBeforeMount(() => {
  
  let keywords = HL.hl.getKeywords();

  for (let key in config.keys) {
    let c = keywords[key];
    delete keywords[key];
    keywords[config.keys[key]] = c;
  }

// })




// let val = computed(() => {
//   return route.params.val;
// })

</script>

<template>
  <Editor />
  <Output />
  <Creator :dynamic="true" />
</template>
