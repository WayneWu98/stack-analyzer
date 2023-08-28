<script setup lang="ts">
import { onMounted, ref, shallowRef, watch } from 'vue';
import StackTracey from 'stacktracey';
import { type AnalyzeResult, analyze } from './utils';

const projectFiles = shallowRef<File[]>([])
const stackString = ref('')
const stack = shallowRef<StackTracey>()
const results = ref<AnalyzeResult[]>([])

const onChange = (e: Event) => {
  projectFiles.value = Array.from((e.target as HTMLInputElement).files!)
}

watch(stackString, (stackString) => {
  if (stackString) stack.value = new StackTracey(stackString)
})

let latestAnalyzing = Number.MIN_SAFE_INTEGER;

watch(stack, async (stack) => {
  if (stack) {
    const currentAnalyzing = ++latestAnalyzing
    const _results = await analyze(stack, projectFiles.value)
    if (currentAnalyzing === latestAnalyzing) {
      results.value = _results
    }
  }
})

window.setProjectFiles = (files: File[]) => projectFiles.value = files

onMounted(() => window.ready());

const hideProjectPicker = new URL(location.href).searchParams.has('hideProjectPicker')
</script>

<template>
  <div class="w-100vw h-100vh overflow-hidden grid grid-rows-[auto_1fr_auto] p-12px box-border">
    <div v-if="!hideProjectPicker" class="mb-12px shrink-0 box-border"><label for="project"><input webkitdirectory directory id="project" type="file" class="fixed opacity-0 left-9999" @change="onChange" /> <div class="inline-block bg-gray-200 rounded-4px p-10px cursor-pointer hover:bg-gray-300">{{ projectFiles.length > 0 ? 'Change to the Other Project' : 'Choose Project Root' }}</div> </label></div>
    <div v-else></div>
    <div class="flex w-full h-full shrink-1 min-h-0 items-stretch justify-between box-border overflow-hidden">
      <textarea class="block flex-1 h-full border-1px border-solid border-gray-300 box-border outline-none p-1em font-mono font-semibold box-border mr-12px resize-none" v-model="stackString" :resize="false"></textarea>
      <div class="flex-1 border-1px border-solid border-gray-300 h-full ml-12px overflow-y-scroll p-1em font-mono font-semibold box-border">
        <div v-for="(result, idx) in results" :key="idx" class="mb-2em">
            <div>{{ `stack at ${result.fileShort} Line: ${result.source.line} Column: ${result.source.column} Name: ${result.source.name}` }}</div>
            <div class="bg-gray-200 border-solid border-3px border-gray-200 box-border">
              <div class="mb-0.2em p-0.4em">Source File: {{ result.source.filename }}</div>
              <div class="max-h-10em overflow-y-scroll bg-gray-100 p-0.4em whitespace-pre leading-1.3em relative pl-3em z-0">
                <div v-if="result.source.line" class="absolute left-0 right-0 h-1.3em bg-red-200 z-0" :style="{ top: (result.source.line - 1) * 1.3 + 0.4 + 'em' }"></div>
                <div class="absolute left-0 top-0 bottom-0 leading-1.3em w-2.5em text-right pt-0.4em font-normal text-red-400">
                  <p v-for="i in result.source.content?.split('\n').length" :key="i">{{ i }}</p>
                </div>
                <div class="z-1 relative">
                  {{ result.source.content }}
                </div>
              </div>
            </div>
        </div>
      </div>
    </div>
    <div class="mt-12px text-center font-mono text-12px font-semibold flex items-center justify-center left-0 w-full text-black/50">
      &copy;&nbsp;Power by&nbsp;<a href="https://wayne-wu.com/" class="text-black underline-transparent hover:text-black/50" target="_blank">Wayne Wu</a>&nbsp;-&nbsp;<a href="https://github.com/WayneWu98/stack-analyzer" class="text-black underline-transparent hover:text-black/50" target="_blank">Github Source</a>
    </div>
  </div>
  
</template>

<style scoped>
</style>
