<template>
  <q-page class="q-pa-md bg-grey-2">
    <div class="text-h5 q-mb-md text-center">目前庫存狀況</div>
    <q-input v-model="search" label="搜尋款號" dense debounce="300" class="q-mb-md" />

    <div class="column q-gutter-md">
      <!-- 家中庫存 -->
      <q-card flat bordered>
        <q-card-section class="bg-primary text-white text-subtitle1 text-center">
          家中庫存
        </q-card-section>
        <q-separator />
        <q-card-section>
          <div v-for="style in filteredHome" :key="style.name" class="q-mb-md">
            <q-expansion-item expand-separator dense>
              <template #header>
                <div class="text-subtitle1">款號：{{ style.name }}</div>
              </template>
              <div
                class="q-pa-sm q-mb-sm q-gutter-sm"
                v-for="colorGroup in groupByColor(style.items)"
                :key="colorGroup.color"
                style="border: 1px solid #ccc; border-radius: 6px; background: #f0f0f0"
              >
                <div class="text-subtitle2 q-mb-xs">顏色：{{ colorGroup.color }}</div>
                <q-item v-for="item in colorGroup.items" :key="item.color + item.size" dense>
                  <q-item-section>{{ item.size }}</q-item-section>
                  <q-item-section side>{{ item.quantity }}</q-item-section>
                </q-item>
              </div>
            </q-expansion-item>
          </div>
        </q-card-section>
      </q-card>

      <!-- 車中庫存 -->
      <q-card flat bordered>
        <q-card-section class="bg-teal text-white text-subtitle1 text-center">
          車中庫存
        </q-card-section>
        <q-separator />
        <q-card-section>
          <div v-for="style in filteredCar" :key="style.name" class="q-mb-md">
            <q-expansion-item expand-separator dense>
              <template #header>
                <div class="text-subtitle1">款號：{{ style.name }}</div>
              </template>
              <div
                class="q-pa-sm q-mb-sm q-gutter-sm"
                v-for="colorGroup in groupByColor(style.items)"
                :key="colorGroup.color"
                style="border: 1px solid #ccc; border-radius: 6px; background: #f0f0f0"
              >
                <div class="text-subtitle2 q-mb-xs">顏色：{{ colorGroup.color }}</div>
                <q-item v-for="item in colorGroup.items" :key="item.color + item.size" dense>
                  <q-item-section>{{ item.size }}</q-item-section>
                  <q-item-section side>{{ item.quantity }}</q-item-section>
                </q-item>
              </div>
            </q-expansion-item>
          </div>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { db } from 'src/db/database'

export default {
  name: 'InventorySummary',
  setup() {
    const allData = ref({ home: [], car: [] })
    const search = ref('')

    const fetchInventory = async () => {
      const forms = await db.dailyForms.toArray()
      const styles = await db.styles.toArray()

      const inventoryMap = {}
      styles.forEach(({ name, color, size }) => {
        if (!inventoryMap[name]) inventoryMap[name] = {}
        if (!inventoryMap[name][color]) inventoryMap[name][color] = {}
        inventoryMap[name][color][size] = { home: 0, car: 0 }
      })

      forms.forEach(form => {
        form.records.forEach(record => {
          const { name, size, color, quantity, action } = record
          const placeKey =
            action === '進貨' || action === '車中移至家中' ? 'home'
              : action === '家中移至車中' ? 'car'
              : null

          if (!placeKey || !name || !size || !color || !quantity) return

          if (!inventoryMap[name]) inventoryMap[name] = {}
          if (!inventoryMap[name][color]) inventoryMap[name][color] = {}
          if (!inventoryMap[name][color][size]) inventoryMap[name][color][size] = { home: 0, car: 0 }

          const delta = (action === '進貨' || action === '車中移至家中') ? quantity : -quantity
          inventoryMap[name][color][size][placeKey] += delta
        })
      })

      const grouped = { home: [], car: [] }

      for (const name in inventoryMap) {
        const homeItems = []
        const carItems = []
        for (const color in inventoryMap[name]) {
          for (const size in inventoryMap[name][color]) {
            const { home, car } = inventoryMap[name][color][size]
            homeItems.push({ color, size, quantity: home })
            carItems.push({ color, size, quantity: car })
          }
        }
        grouped.home.push({ name, items: homeItems })
        grouped.car.push({ name, items: carItems })
      }

      allData.value = grouped
    }

    const filteredHome = computed(() => {
      return (allData.value.home || []).filter(style =>
        style.name.includes(search.value)
      )
    })

    const filteredCar = computed(() => {
      return (allData.value.car || []).filter(style =>
        style.name.includes(search.value)
      )
    })

    const groupByColor = (items) => {
      const groups = {}
      items.forEach(item => {
        if (!groups[item.color]) groups[item.color] = []
        groups[item.color].push(item)
      })
      return Object.entries(groups).map(([color, items]) => ({ color, items }))
    }

    onMounted(fetchInventory)

    return {
      search,
      filteredHome,
      filteredCar,
      groupByColor
    }
  }
}
</script>

<style scoped>
.q-item {
  background: #f5f5f5;
  border: 1px solid #dcdcdc;
  border-radius: 6px;
  margin-bottom: 4px;
  padding: 4px 8px;
  font-size: 16px;
}
.q-expansion-item {
  border-bottom: 1px solid #e0e0e0;
}
.text-subtitle1 {
  font-size: 18px;
  font-weight: bold;
}
</style>
