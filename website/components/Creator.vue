<script setup>
import { ref, computed } from "vue";
import Dropdown from "./Dropdown.vue";

let v = computed(() => {
  let t = {};
  for (let key in keyStruct.value) {
    t[key] = keyStruct.value[key].value;
  }
  return "/playground?json=" + JSON.stringify({ keys: t });
});

const keywords = HL.hl.getKeywords();

let r = {};
for (let key in keywords) {
  r[key] = {
    name: key,
    id: keywords[key],
    text: true,
    value: key,
  };
}

let props = defineProps(["dynamic"]);

const keyStruct = ref(r);

function setKeywords() {
  for (let key in keyStruct.value) {
    let c = keywords[key];
    delete keywords[key];
    keywords[keyStruct.value[key].value] = c;
  }
}
</script>

<template>
  <div class="container">
    <Dropdown title="Keywords" :struct="keyStruct" class=""></Dropdown>
    <button @click="setKeywords" v-if="props.dynamic" class="button is-success">Press me!</button>
    <a class="button is-success" :href="v" v-if="!props.dynamic">Go!</a>
  </div>
</template>


<style scoped>
</style>