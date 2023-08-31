<script setup>
import { ref } from "vue";
let props = defineProps(["title", "struct", "changefun"]);

const isActive = ref(false);
const activeClass = ref("active");
const inActiveClass = ref("inactive");

function toggle() {
  isActive.value = !isActive.value;
}
</script>


<template>
  <div @click="toggle" class="title is-5 has-text-white-ter">{{ props.title }}</div>
  <!-- <div :class="[isActive ? activeClass : inActiveClass]"><slot></slot></div> -->
  <div :class="[isActive ? activeClass : inActiveClass, 'list']">
    <div v-for="item in props.struct" :key="item.id" class="list-item columns">
      <label :for="item.name" class="has-text-white column is-one-quarter is-offset-3">{{ item.name }}</label>
      <input
        class="text-field input column is-one-quarter"
        :name="item.name"
        v-if="item.text"
        type="text"
        :value="item.value"
        @input="
          (event) =>
            (props.struct[event.target.name].value = event.target.value)
        "
      />
      <input
        type="checkbox"
        :id="item.id"
        :name="item.name"
        v-if="item.check"
      />
    </div>
  </div>
</template>

<style scoped>
.list {
  transition: all 0.5s ease-in-out;
  overflow: hidden;
  display: block;
}


.inactive {
  max-height: 0;
}

.active {
  max-height: 1000px;
}
</style>