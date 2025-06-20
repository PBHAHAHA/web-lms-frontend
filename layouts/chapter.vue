<template>
    <div class="flex relative">
        <div 
            class="z-20 transform transition-all duration-300 ease-in-out"
            :class="visible ? 'w-72' : 'w-0'"
            :style="{ overflow: visible ? 'visible' : 'hidden' }"
        >
            <ChapterNav :visible="visible" />
        </div>

        <div 
            class="relative flex-1 transition-all duration-300 ease-in-out"
            :style="{ marginLeft: visible ? '0px' : '0px' }"
        >
            <button 
                class="absolute top-4 left-4 z-30 p-2 rounded-md hover:bg-gray-100 transition-colors duration-200"
                @click="showNav"
            >
                <LucideMenu class="size-5" />
            </button>
            <slot />
        </div>
    </div>
</template>

<script setup>
import ChapterNav from '~/components/common/ChapterNav.vue';
import { LucideMenu } from 'lucide-vue-next';

const route = useRoute();
const visible = ref(false);

const showNav = () => {
    visible.value = !visible.value;
};
</script>