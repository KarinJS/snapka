import fs from 'node:fs'
import { renderVueComponentToHtml } from './plugin-vue3'

fs.writeFileSync(
  './example-vue3.html',
  await renderVueComponentToHtml(
    './Test.vue',
    {
      title: 'Hello SSR Vue Component',
      count: 7,
    }
  )
)
