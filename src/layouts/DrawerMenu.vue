<template>
  <q-layout view="lHh Lpr lFf">
    <!-- Top Toolbar -->
    <q-header elevated class="bg-dark text-white">
      <q-toolbar>
        <q-btn dense flat round icon="menu" @click="toggleDrawer" />
        <q-toolbar-title class="text-h6">貨物管理系統</q-toolbar-title>
      </q-toolbar>
    </q-header>

    <!-- Bottom Navigation for Mobile -->
    <q-footer class="bg-grey-9 text-white" height-hint="56">
      <q-bottom-navigation v-model="bottomTab" class="text-white" active-color="primary" glossy>
        <q-btn flat label="月曆" icon="event" @click="goTo('/calendar')" />
        <q-btn flat label="表單" icon="edit" @click="goTo('/form')" />
        <q-btn flat label="統計" icon="bar_chart" @click="goTo('/summary')" />
        <q-btn flat label="庫存" icon="inventory" @click="goTo('/inventory')" />
        <q-btn flat label="款號" icon="settings" @click="goTo('/style')" />
      </q-bottom-navigation>
    </q-footer>

    <!-- Side Drawer for Desktop -->
    <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
      <q-list>
        <q-item clickable v-ripple to="/calendar">
          <q-item-section avatar><q-icon name="event" /></q-item-section>
          <q-item-section>月曆檢視</q-item-section>
        </q-item>
        <q-item clickable v-ripple to="/form">
          <q-item-section avatar><q-icon name="edit" /></q-item-section>
          <q-item-section>每日表單</q-item-section>
        </q-item>
        <q-item clickable v-ripple to="/summary">
          <q-item-section avatar><q-icon name="bar_chart" /></q-item-section>
          <q-item-section>統計分析</q-item-section>
        </q-item>
        <q-item clickable v-ripple to="/inventory">
          <q-item-section avatar><q-icon name="inventory" /></q-item-section>
          <q-item-section>家中／車中貨物</q-item-section>
        </q-item>
        <q-item clickable v-ripple to="/style">
          <q-item-section avatar><q-icon name="settings" /></q-item-section>
          <q-item-section>款號管理</q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <!-- Main Page Content -->
    <q-page-container class="bg-grey-2">
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import { ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'

export default {
  name: 'DrawerMenu',
  setup() {
    const leftDrawerOpen = ref(false)
    const bottomTab = ref('')
    const router = useRouter()
    const route = useRoute()

    const toggleDrawer = () => {
      leftDrawerOpen.value = !leftDrawerOpen.value
    }

    const goTo = (path) => {
      router.push(path)
    }

    watch(route, () => {
      bottomTab.value = route.path
    }, { immediate: true })

    return {
      leftDrawerOpen,
      toggleDrawer,
      bottomTab,
      goTo
    }
  }
}
</script>

<style scoped>
.q-toolbar-title {
  font-weight: bold;
}
</style>
