<template>
  <div class="q-pa-md bg-grey-1">
    <div class="text-h5 text-bold text-primary q-mb-lg">🎨 款式管理介面</div>

    <q-form @submit.prevent="addNewStyle">
      <div class="row q-col-gutter-md items-center q-mb-md">
        <q-input v-model="newStyleName" label="新增款號" outlined dense class="col-12 col-md-3" />
        <q-select v-model="selectedColors" :options="allColors" multiple label="選擇顏色" outlined dense class="col-12 col-md-6" />
        <q-btn label="新增款式" color="primary" class="col-12 col-md-3" type="submit" />
      </div>
    </q-form>

    <q-input v-model="search" label="搜尋款號" outlined dense class="q-mb-md" />

    <q-card class="bg-white shadow-1">
      <q-list bordered separator>
        <q-item v-for="style in filteredStyles" :key="style.name" class="q-pb-sm">
          <q-item-section>
            <div class="text-subtitle2 text-bold">款號：{{ style.name }}</div>
            <div class="row q-col-gutter-sm q-mt-sm">
              <q-chip
                v-for="(combo, idx) in style.combinations"
                :key="idx"
                class="q-mr-xs q-mb-xs bg-blue-grey-1 text-black"
                square
                dense
              >
                {{ combo.color }} / {{ combo.size }}
              </q-chip>
            </div>
          </q-item-section>
          <q-item-section side top>
            <q-btn icon="delete" color="negative" flat round dense @click="removeStyle(style.name)" />
          </q-item-section>
        </q-item>
      </q-list>
    </q-card>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { db } from 'src/db/database'

export default {
  name: 'StyleManager',
  setup() {
    const newStyleName = ref('')
    const selectedColors = ref([])
    const allColors = ['黑色', '白色', '紅色', '藍色', '灰色', '蕾絲']
    const sizes = ['34', '36', '38', '40', '42', '44', '46']

    const allStyles = ref([])
    const search = ref('')

    const loadStyles = async () => {
      const grouped = {}
      const all = await db.styles.toArray()
      all.forEach(style => {
        if (!grouped[style.name]) grouped[style.name] = []
        grouped[style.name].push({ size: style.size, color: style.color })
      })
      allStyles.value = Object.keys(grouped).map(name => ({
        name,
        combinations: grouped[name]
      }))
    }

    const addNewStyle = async () => {
      if (!newStyleName.value.trim() || selectedColors.value.length === 0) {
        alert('請填寫款號並選擇顏色')
        return
      }

      const bulk = []
      selectedColors.value.forEach(color => {
        sizes.forEach(size => {
          bulk.push({ name: newStyleName.value.trim(), color, size })
        })
      })

      try {
        await db.styles.bulkAdd(bulk)
        newStyleName.value = ''
        selectedColors.value = []
        await loadStyles()
        alert('✅ 已新增款式')
      } catch (err) {
        console.error('❌ 寫入失敗', err)
        alert('新增失敗，請檢查資料格式')
      }
    }

    const removeStyle = async (name) => {
      if (confirm(`確定要刪除款號 ${name}？`)) {
        await db.styles.where('name').equals(name).delete()
        await loadStyles()
      }
    }

    const filteredStyles = computed(() => {
      if (!search.value) return allStyles.value
      return allStyles.value.filter(style => style.name.includes(search.value))
    })

    onMounted(loadStyles)

    return {
      newStyleName,
      selectedColors,
      allColors,
      sizes,
      allStyles,
      search,
      filteredStyles,
      addNewStyle,
      removeStyle
    }
  }
}
</script>

<style scoped>
.text-h5 {
  font-size: 24px;
}
.text-subtitle2 {
  font-size: 18px;
}
.q-chip {
  font-size: 14px;
  border-radius: 4px;
}
.q-item-section {
  padding-right: 8px;
}
@media (max-width: 599px) {
  .text-h5 {
    font-size: 20px;
  }
  .text-subtitle2 {
    font-size: 16px;
  }
  .q-chip {
    font-size: 13px;
  }
  .q-btn {
    font-size: 14px;
  }
}
</style>
