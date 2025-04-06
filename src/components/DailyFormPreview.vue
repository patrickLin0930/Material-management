<template>
  <div ref="printArea" class="q-pa-md bg-white text-black" style="width: 794px; min-height: 1123px">
    <div class="text-h6 q-mb-md">每日貨物流動表單</div>
    <div class="q-mb-sm">日期：{{ date }}</div>

    <div v-for="(group, category) in groupedRows" :key="category" class="q-mb-md">
      <div class="text-subtitle2 q-mb-xs">分類：{{ category }}</div>
      <div class="row q-gutter-lg">
        <div v-for="(colGroup, colIndex) in splitToColumns(group, 3)" :key="colIndex" class="column q-gutter-xs">
          <div
            v-for="item in colGroup"
            :key="item.id"
            class="row items-center q-gutter-sm border-bottom q-py-xs"
          >
            <div class="col-4">{{ item.name }}</div>
            <div class="col-4">數量：{{ item.quantity }}</div>
            <div class="col-4">狀態：{{ item.action }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, watch, onMounted } from 'vue'
import { db } from 'src/db/database'

export default {
  name: 'DailyFormPreview',
  props: {
    date: String
  },
  setup(props, { expose }) {
    const rows = ref([])
    const printArea = ref(null)

    const groupedRows = ref({})

    const splitToColumns = (arr, columns = 3) => {
      const result = Array.from({ length: columns }, () => [])
      arr.forEach((item, i) => {
        result[i % columns].push(item)
      })
      return result
    }

    const loadData = async () => {
      const data = await db.dailyForms.get(props.date)
      if (!data) return
      rows.value = data.records
      const groups = {}
      for (const row of data.records) {
        const cat = row.category || '未分類'
        if (!groups[cat]) groups[cat] = []
        groups[cat].push(row)
      }
      groupedRows.value = groups
    }

    watch(() => props.date, loadData, { immediate: true })
    onMounted(loadData)

    expose({ printArea })

    return {
      rows,
      groupedRows,
      splitToColumns,
      printArea
    }
  }
}
</script>

<style scoped>
.border-bottom {
  border-bottom: 1px solid #ccc;
}
</style>
