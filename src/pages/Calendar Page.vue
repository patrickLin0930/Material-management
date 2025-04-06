<template>
  <div class="calendar-wrapper">
    <div class="calendar-header q-pa-sm bg-dark text-white row items-center justify-between">
      <div class="row items-center q-gutter-sm">
        <q-btn icon="chevron_left" flat round @click="prevMonth" color="white" />
        <div class="text-h6 text-bold">{{ displayMonth }}</div>
        <q-btn icon="chevron_right" flat round @click="nextMonth" color="white" />
      </div>
      <q-btn label="前往編輯選取日" color="primary" @click="goToSelectedDate" :disable="!selectedDate" />
    </div>

    <div class="calendar-body">
      <div class="calendar-grid">
        <div class="day-header" v-for="day in weekDays" :key="day">{{ day }}</div>
        <div
          v-for="cell in calendarCells"
          :key="cell.key"
          class="day-cell"
          :class="{
            'has-record': cell.recorded,
            'empty': cell.isEmpty,
            'selected': selectedDate === cell.date
          }"
          @click="selectDate(cell.date)"
        >
          <div class="cell-content">
            <div class="day-number">{{ cell.day }}</div>
            <q-icon
              v-if="cell.date"
              name="cloud_upload"
              size="16px"
              class="upload-icon"
              @click.stop="backupToDiscordAsImage(cell.date)"
            />
          </div>
        </div>
      </div>
    </div>

    <div ref="printContainer" class="hidden-print-content">
      <div v-for="(group, name) in groupedData" :key="name" class="print-style">
        <div class="title">款號：{{ name }}</div>
        <div v-for="item in group" :key="item.size + item.color" class="entry">
          尺寸：{{ item.size }}，顏色：{{ item.color }}，數量：{{ item.quantity }}，狀態：{{ item.action }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { db } from 'src/db/database'
import html2canvas from 'html2canvas'

export default {
  name: 'CalendarPage',
  setup() {
    const router = useRouter()
    const today = new Date()
    const currentYear = ref(today.getFullYear())
    const currentMonth = ref(today.getMonth())
    const recordedDates = ref([])
    const selectedDate = ref('')
    const groupedData = ref({})
    const printContainer = ref(null)

    const webhookURL = 'https://discord.com/api/webhooks/1357667858687070329/cIEwRxL7V2PvbdWkHyy-eWLvhrL4W-4VrlOeshXvEkec-ixvrOzdjTojg6-MnzRLCJ2w'

    const displayMonth = computed(() => `${currentYear.value} 年 ${currentMonth.value + 1} 月`)
    const weekDays = ['日', '一', '二', '三', '四', '五', '六']

    const daysInMonth = computed(() => new Date(currentYear.value, currentMonth.value + 1, 0).getDate())
    const firstDayOfMonth = computed(() => new Date(currentYear.value, currentMonth.value, 1).getDay())

    const calendarCells = computed(() => {
      const cells = []
      const year = currentYear.value
      const month = currentMonth.value + 1
      for (let i = 0; i < firstDayOfMonth.value; i++) {
        cells.push({ key: `e-${i}`, isEmpty: true })
      }
      for (let d = 1; d <= daysInMonth.value; d++) {
        const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`
        cells.push({
          key: `d-${d}`,
          day: d,
          date: dateStr,
          recorded: recordedDates.value.includes(dateStr),
          isEmpty: false
        })
      }
      return cells
    })

    const loadRecordedDates = async () => {
      const all = await db.dailyForms.toArray()
      recordedDates.value = all.map(f => f.date)
    }

    const prevMonth = () => {
      if (currentMonth.value === 0) {
        currentMonth.value = 11
        currentYear.value--
      } else {
        currentMonth.value--
      }
    }

    const nextMonth = () => {
      if (currentMonth.value === 11) {
        currentMonth.value = 0
        currentYear.value++
      } else {
        currentMonth.value++
      }
    }

    const selectDate = (date) => {
      selectedDate.value = date
    }

    const goToSelectedDate = () => {
      if (selectedDate.value) {
        router.push(`/form?date=${selectedDate.value}`)
      }
    }

    const backupToDiscordAsImage = async (dateStr) => {
      const data = await db.dailyForms.get(dateStr)
      if (!data || !data.records || data.records.length === 0) {
        alert(`❌ ${dateStr} 尚無資料可備份`)
        return
      }

      const grouped = {}
      for (const r of data.records) {
        if (!grouped[r.name]) grouped[r.name] = []
        grouped[r.name].push(r)
      }
      groupedData.value = grouped

      await nextTick()

      const canvas = await html2canvas(printContainer.value, { scale: 2 })
      const blob = await new Promise(resolve => canvas.toBlob(resolve))

      const formData = new FormData()
      formData.append('file', blob, `${dateStr}.png`)

      try {
        await fetch(webhookURL, {
          method: 'POST',
          body: formData
        })
        alert(`✅ 已備份 ${dateStr} 至 Discord`)
      } catch (err) {
        alert(`❌ 備份失敗：${err.message}`)
      }
    }

    onMounted(loadRecordedDates)

    return {
      currentYear,
      currentMonth,
      displayMonth,
      prevMonth,
      nextMonth,
      weekDays,
      calendarCells,
      selectedDate,
      selectDate,
      goToSelectedDate,
      groupedData,
      printContainer,
      backupToDiscordAsImage
    }
  }
}
</script>
<style scoped>
.calendar-wrapper {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.calendar-header {
  flex-shrink: 0;
}

.calendar-body {
  flex: 1;
  overflow-y: auto;
  background-color: #1e1e1e;
  padding: 8px;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 6px;
}

.day-header {
  text-align: center;
  font-weight: bold;
  padding: 8px 0;
  color: white;
  font-size: 14px;
}

.day-cell {
  aspect-ratio: 1 / 1;
  border-radius: 8px;
  text-align: center;
  background-color: #2a2a2a;
  font-weight: bold;
  font-size: 15px;
  color: white;
  padding: 4px;
  position: relative;
}

.cell-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  height: 100%;
}

.upload-icon {
  position: absolute;
  top: 2px;
  right: 2px;
  cursor: pointer;
  color: #ccc;
}

.day-cell.has-record {
  background-color: #027be3;
  color: white;
}

.day-cell.empty {
  background-color: transparent;
  cursor: default;
}

.day-cell.selected {
  border: 2px solid #ffcc00;
}

.hidden-print-content {
  position: absolute;
  left: -9999px;
  top: 0;
  background: white;
  color: black;
  padding: 16px;
  width: 800px;
}
.print-style {
  margin-bottom: 16px;
  padding: 12px;
  border: 1px solid #999;
  border-radius: 6px;
  font-size: 14px;
}
.print-style .title {
  font-weight: bold;
  margin-bottom: 6px;
  font-size: 15px;
  color: #333;
}
.entry {
  margin-left: 12px;
  margin-bottom: 4px;
}
</style>
