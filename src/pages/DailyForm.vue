<template>
  <div class="q-pa-md bg-grey-2">
    <div class="row items-center justify-between q-mb-md">
      <div class="text-h5 text-weight-bold">每日貨物流動表單（{{ displayDate }}）</div>
      <q-btn label="儲存今天表單" color="primary" class="text-subtitle2 q-px-md q-py-sm" @click="saveForm" />
    </div>

    <q-input v-model="search" label="搜尋款號" dense filled class="q-mb-md" debounce="300" :style="{ fontSize: '16px' }" />

    <div class="column q-gutter-md">
      <div
        v-for="style in filteredStyles"
        :key="style.name"
        class="full-width"
      >
        <q-card flat bordered class="q-mb-md cursor-pointer" @click="openDialog(style)">
          <q-card-section class="bg-primary text-white text-subtitle1 text-weight-bold">款號：{{ style.name }}</q-card-section>
          <q-separator />
          <q-card-section class="q-pa-sm bg-grey-1">
            <div
              v-for="(records, color) in style.records"
              :key="color"
              class="q-mb-sm q-pa-sm bordered bg-white shadow-1"
              style="border-radius: 6px"
            >
              <div class="text-subtitle2 text-weight-bold q-mb-xs">顏色：{{ color }}</div>
              <div class="row q-gutter-xs">
                <div
                  v-for="item in records"
                  :key="item.size"
                  class="text-center bg-grey-2 bordered"
                  style="min-width: 70px; padding: 6px; border-radius: 4px; font-size: 16px"
                >
                  <div class="text-bold">{{ item.size }}</div>
                  <div>{{ item.quantity }}</div>
                  <div class="text-blue text-caption">{{ item.action || '-' }}</div>
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <q-dialog v-model="dialogOpen">
      <q-card style="min-width: 95vw; max-width: 700px">
        <q-card-section class="text-h6">編輯款號：{{ selectedStyle?.name }}</q-card-section>
        <q-separator />
        <q-card-section class="bg-grey-1">
          <div
            v-for="(records, color) in selectedStyle?.records"
            :key="color"
            class="q-mb-md bordered rounded bg-white q-pa-sm shadow-1"
          >
            <div class="text-subtitle2 q-mb-sm text-primary">顏色：{{ color }}</div>
            <div class="column q-gutter-sm">
              <div
                v-for="item in records"
                :key="item.size"
                class="row items-center justify-between q-gutter-md bg-grey-2 bordered q-pa-sm"
                style="border-radius: 6px; font-size: 16px"
              >
                <div class="text-bold" style="min-width: 60px">{{ item.size }}</div>
                <div class="row items-center q-gutter-sm">
                  <q-btn round dense icon="remove" color="grey" size="sm" @click="item.quantity = Math.max(0, item.quantity - 1)" />
                  <div style="min-width: 36px; text-align: center">{{ item.quantity }}</div>
                  <q-btn round dense icon="add" color="primary" size="sm" @click="item.quantity++" />
                </div>
                <q-select
                  dense
                  :options="actions"
                  v-model="item.action"
                  emit-value
                  map-options
                  style="min-width: 130px"
                  class="text-subtitle2"
                />
              </div>
            </div>
          </div>
        </q-card-section>
        <q-separator />
        <q-card-actions align="right">
          <q-btn flat label="儲存" color="primary" class="text-subtitle2" @click="saveDialogData" />
          <q-btn flat label="關閉" color="grey" class="text-subtitle2" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { db } from 'src/db/database'
import { useRoute } from 'vue-router'

export default {
  name: 'DailyForm',
  setup() {
    const route = useRoute()
    const today = new Date()
    const todayStr = today.toISOString().split('T')[0]
    const targetDate = ref(route.query.date || todayStr)
    const displayDate = ref(targetDate.value)
    const groupedRecords = ref([])
    const selectedStyle = ref(null)
    const dialogOpen = ref(false)
    const search = ref('')
    const actions = ['進貨', '家中移至車中', '車中移至家中', '已賣出']

    const filteredStyles = computed(() => {
      if (!search.value) return groupedRecords.value
      return groupedRecords.value.filter(s => s.name.includes(search.value))
    })

    const buildFormFromStyles = async () => {
      const all = await db.styles.toArray()
      const existing = await db.dailyForms.get(targetDate.value)

      const groupMap = {}
      all.forEach(({ name, size, color }) => {
        if (!groupMap[name]) groupMap[name] = {}
        if (!groupMap[name][color]) groupMap[name][color] = {}
        groupMap[name][color][size] = {
          name,
          size,
          color,
          quantity: 0,
          action: ''
        }
      })

      if (existing && Array.isArray(existing.records)) {
        existing.records.forEach(r => {
          if (
            groupMap[r.name] &&
            groupMap[r.name][r.color] &&
            groupMap[r.name][r.color][r.size]
          ) {
            groupMap[r.name][r.color][r.size].quantity = r.quantity
            groupMap[r.name][r.color][r.size].action = r.action
          }
        })
      }

      groupedRecords.value = Object.entries(groupMap).map(([name, colors]) => ({
        name,
        records: Object.fromEntries(
          Object.entries(colors).map(([color, sizes]) => [
            color,
            Object.values(sizes)
          ])
        )
      }))
    }

    const saveForm = async () => {
      const flat = []
      groupedRecords.value.forEach(style => {
        for (const color in style.records) {
          for (const entry of style.records[color]) {
            if (entry.quantity > 0 && entry.action) {
              flat.push({
                name: entry.name,
                size: entry.size,
                color: entry.color,
                quantity: entry.quantity,
                action: entry.action
              })
            }
          }
        }
      })
      await db.dailyForms.put({ date: targetDate.value, records: flat })
      alert('✅ 表單已儲存')
    }

    const openDialog = (style) => {
      selectedStyle.value = JSON.parse(JSON.stringify(style))
      dialogOpen.value = true
    }

    const saveDialogData = () => {
      const updated = selectedStyle.value
      const index = groupedRecords.value.findIndex(s => s.name === updated.name)
      if (index !== -1) {
        groupedRecords.value[index] = updated
        dialogOpen.value = false
      }
    }

    onMounted(() => {
      buildFormFromStyles()
    })

    return {
      groupedRecords,
      actions,
      saveForm,
      selectedStyle,
      dialogOpen,
      openDialog,
      saveDialogData,
      displayDate,
      search,
      filteredStyles
    }
  }
}
</script>

<style scoped>
.rounded {
  border-radius: 8px;
}
.bordered {
  border: 1px solid #ccc;
}
</style>
