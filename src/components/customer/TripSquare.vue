<script setup>

import {useRouter} from "vue-router";
import {computed, reactive, ref} from "vue";
import {get, post} from "@/vue/request.js";
import {ElNotification} from 'element-plus'
import {userInfoStore} from "@/vue/store.js";
import {Plus, Promotion, Search} from "@element-plus/icons-vue";

const router = useRouter()
const userInfo = userInfoStore()
const activeStatus = ref('REGISTERING')
const tableData = reactive({
  data: [],
  joined: {}
})
const searchKeyword = ref('')

function handleClick() {
  let keyword = searchKeyword.value
  get('view/trip/read', userInfo.token, {
    status: activeStatus.value,
    keyword: keyword
  }).then(res => {
    tableData.data = res.trips
    for (let i = 0; i < res.joinedTrips.length; ++i) {
      tableData.joined[res.joinedTrips[i]] = ''
    }
  }).catch(err => {
    ElNotification.error(err)
  })
}

function getPortBrief(item) {
  return item.name + ' / ' + item.state + ' / ' + item.country
}

handleClick()

const rowCount = computed(() => {
  return ~~(tableData.data.length / 2) + 1
})


</script>

<template>
  <div class="menu-tabs">
    <div style="margin-bottom: 4px">
      <el-input placeholder="Search keyword" v-model="searchKeyword"
                style="width: 240px; margin-right: 12px"></el-input>
      <el-button :icon="Search" type="primary" @click="handleClick">Search</el-button>
    </div>
    <el-tabs v-model="activeStatus" @tab-change="handleClick">
      <el-tab-pane label="Registering" name="REGISTERING">
      </el-tab-pane>
      <el-tab-pane label="Started" name="STARTED"></el-tab-pane>
      <el-tab-pane label="Finished" name="FINISHED"></el-tab-pane>
    </el-tabs>

    <div style="width: 100%; margin-bottom: 40px">
      <el-row :gutter="40" style="margin-bottom: 12px" v-for="r in rowCount">
        <el-col :span="12" v-if="(r - 1) * 2 < tableData.data.length">
          <el-card style="width: 100%">
            <el-descriptions border :title="tableData.data[r * 2 - 2].name" direction="vertical" :column="2">
              <template #extra>
                <el-tag type="danger" v-if="tableData.joined[tableData.data[r * 2 - 2].tripId] != null">Booked</el-tag>
              </template>
              <el-descriptions-item label="Start Port">
                {{ getPortBrief(tableData.data[r * 2 - 2].startPort) }}
              </el-descriptions-item>
              <el-descriptions-item label="End Port">
                {{ getPortBrief(tableData.data[r * 2 - 2].endPort) }}
              </el-descriptions-item>
              <el-descriptions-item label="Trip Nights">{{
                  tableData.data[r * 2 - 2].tripNights
                }}
              </el-descriptions-item>
              <el-descriptions-item label="Ports">{{
                  tableData.data[r * 2 - 2].tripPorts.length
                }}
              </el-descriptions-item>
              <el-descriptions-item label="Start Date">
                {{ new Date(tableData.data[r * 2 - 2].startDate).toLocaleString() }}
              </el-descriptions-item>
              <el-descriptions-item label="End Date">
                {{ new Date(tableData.data[r * 2 - 2].endDate).toLocaleString() }}
              </el-descriptions-item>
            </el-descriptions>

            <template #footer>
              <div style="display: flex; justify-content: end">
                <el-button type="primary" @click="router.push('/tripInfo/' + tableData.data[r * 2 - 2].tripId)">View</el-button>
              </div>
            </template>
          </el-card>
        </el-col>

        <el-col :span="12" v-if="r * 2 - 1 < tableData.data.length">
          <el-card style="width: 100%">
            <el-descriptions border :title="tableData.data[r * 2 - 1].name" direction="vertical" :column="2">
              <template #extra>
                <el-tag type="danger" v-if="tableData.joined[tableData.data[r * 2 - 1].tripId] != null">Booked</el-tag>
              </template>
              <el-descriptions-item label="Start Port">
                {{ getPortBrief(tableData.data[r * 2 - 1].startPort) }}
              </el-descriptions-item>
              <el-descriptions-item label="End Port">
                {{ getPortBrief(tableData.data[r * 2 - 1].endPort) }}
              </el-descriptions-item>
              <el-descriptions-item label="Trip Nights">{{
                  tableData.data[r * 2 - 1].tripNights
                }}
              </el-descriptions-item>
              <el-descriptions-item label="Ports">{{
                  tableData.data[r * 2 - 1].tripPorts.length
                }}
              </el-descriptions-item>
              <el-descriptions-item label="Start Date">
                {{ new Date(tableData.data[r * 2 - 1].startDate).toLocaleString() }}
              </el-descriptions-item>
              <el-descriptions-item label="End Date">
                {{ new Date(tableData.data[r * 2 - 1].endDate).toLocaleString() }}
              </el-descriptions-item>
            </el-descriptions>

            <template #footer>
              <div style="display: flex; justify-content: end">
                <el-button type="primary" @click="router.push('/tripInfo/' + tableData.data[r * 2 - 1].tripId)">View</el-button>
              </div>
            </template>
          </el-card>
        </el-col>
      </el-row>
    </div>

  </div>
</template>

<style scoped>
</style>
