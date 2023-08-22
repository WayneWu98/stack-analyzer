<script setup lang="ts">
import { ref, shallowRef, watch } from 'vue';
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

</script>

<template>
  
  <div class="w-100vw h-100vh flex flex flex-col p-12px box-border">
    <label class="mb-12px shrink-0 box-border" for="project"><input webkitdirectory directory id="project" type="file" class="fixed opacity-0 left-9999" @change="onChange" /> <div class="inline-block bg-gray-200 rounded-4px p-10px cursor-pointer hover:bg-gray-300">{{ projectFiles.length > 0 ? 'Change to the Other Project' : 'Choose Project Root' }}</div> </label>
    <div class="flex w-full h-[calc(100%-50px)] shrink-1 items-stretch justify-between box-border">
      <textarea class="block flex-1 h-full border-1px border-solid border-gray-200 box-border outline-none p-1em font-mono font-semibold box-border mr-12px" v-model="stackString" :resize="false"></textarea>
      <div class="flex-1 border-1px border-solid border-gray-200 h-full ml-12px overflow-y-scroll p-1em font-mono font-semibold box-border">
        <div v-for="(result, idx) in results" :key="idx" class="mb-2em">
            <div>{{ `stack at ${result.fileShort} Line: ${result.source.line} Column: ${result.source.column} Name: ${result.source.name}` }}</div>
            <div class="bg-gray-200 border-solid border-3px border-gray-200 box-border">
              <div class="mb-0.2em p-0.4em">Source File: {{ result.source.filename }}</div>
              <div class="max-h-10em overflow-y-scroll bg-gray-100 p-0.4em whitespace-pre leading-1.3em relative pl-3em">
                <div class="absolute left-0 top-0 bottom-0 leading-1.3em w-2.5em text-right pt-0.4em font-normal text-red-400">
                  <p v-for="i in result.source.content?.split('\n').length" :key="i">{{ i }}</p>
                </div>
                {{ result.source.content }}
              </div>
            </div>
        </div>
      </div>
    </div>
  </div>
  
</template>

<style scoped>
</style>
