<script>
import {computed} from 'vue';

// let output = computed({() => {
//     return this.$store.state.output;
// }});
export default {
    computed: {
        output() {
            return this.$store.state.a.output;
        }
    }
}
</script>

<template>
    <p>{{ output }}</p>
</template>