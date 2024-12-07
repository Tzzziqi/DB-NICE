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
  data: []
})

const searchKeyword = ref('')


function handleClick() {
  let keyword = searchKeyword.value

  get('employee/trip/read', userInfo.token, {
    status: activeStatus.value,
    keyword: keyword
  }).then(res => {
    tableData.data = res
  }).catch(err => {
    ElNotification.error(err)
  })
}

function onSubmitDelete(tripId) {
  post('employee/trip/delete?tripId=' + tripId, userInfo.token, {
    tripId: tripId,
  }).then(res => {
    ElNotification.success("Delete trip status successfully")
    handleClick()
  }).catch(err => {
    ElNotification.error(err)
  })
}

function onSubmitStatusChange(tripId, status) {
  post('employee/trip/updateStatus', userInfo.token, {
    tripId: tripId,
    status: status,
  }).then(res => {
    ElNotification.success("Change trip status to " + status + " successfully")
    handleClick()
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
      <el-button :icon="Promotion" type="success" @click="router.push('/employee/newTrip')">
        New Trip
      </el-button>

    </div>
    <el-tabs v-model="activeStatus" @tab-change="handleClick">
      <el-tab-pane label="Registering" name="REGISTERING">
      </el-tab-pane>
      <el-tab-pane label="Started" name="STARTED"></el-tab-pane>
      <el-tab-pane label="Finished" name="FINISHED"></el-tab-pane>
    </el-tabs>

    <div style="width: 100%; margin-bottom: 40px">
      <el-row :gutter="40" v-for="r in rowCount" style="margin-bottom: 12px">
        <el-col :span="12" v-if="(r - 1) * 2 < tableData.data.length">
          <el-card style="width: 100%">
            <el-descriptions border :title="tableData.data[r * 2 - 2].name" direction="vertical" :column="2">
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
                <el-button type="primary" @click="router.push('/employee/tripInfo/' + tableData.data[r * 2 - 2].tripId)">View</el-button>
                <el-button type="success" @click="onSubmitStatusChange(tableData.data[r * 2 - 2].tripId, 'STARTED')"
                           v-if="tableData.data[r * 2 - 2].status == 'REGISTERING'">Start Trip
                </el-button>
                <el-button type="success" @click="onSubmitStatusChange(tableData.data[r * 2 - 2].tripId, 'FINISHED')"
                           v-if="tableData.data[r * 2 - 2].status == 'STARTED'">Finish Trip
                </el-button>


                <el-popconfirm
                    v-if="tableData.data[r * 2 - 2].status == 'REGISTERING'"
                    width="200"
                    title="Are you sure to delete this trip? all invoices will be deprecated and money will return"
                    @confirm="onSubmitDelete(tableData.data[r * 2 - 2].tripId)">
                  <template #reference>
                    <el-button type="info"
                    >Delete
                    </el-button>
                  </template>
                </el-popconfirm>
              </div>
            </template>
          </el-card>
        </el-col>

        <el-col :span="12" v-if="r * 2 - 1 < tableData.data.length">
          <el-card style="width: 100%">
            <el-descriptions border :title="tableData.data[r * 2 - 1].name" direction="vertical" :column="2">
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
                <el-button type="primary" @click="router.push('/employee/tripInfo/' + tableData.data[r * 2 - 1].tripId)">View</el-button>
                <el-button type="success" @click="onSubmitStatusChange(tableData.data[r * 2 - 1].tripId, 'STARTED')"
                           v-if="tableData.data[r * 2 - 1].status == 'REGISTERING'">Start Trip
                </el-button>
                <el-button type="success" @click="onSubmitStatusChange(tableData.data[r * 2 - 1].tripId, 'FINISHED')"
                           v-if="tableData.data[r * 2 - 1].status == 'STARTED'">Finish Trip
                </el-button>


                <el-popconfirm
                    v-if="tableData.data[r * 2 - 1].status == 'REGISTERING'"
                    width="200"
                    title="Are you sure to delete this trip? all invoices will be deprecated and money will return"
                    @confirm="onSubmitDelete(tableData.data[r * 2 - 1].tripId)">
                  <template #reference>
                    <el-button type="info"
                    >Delete
                    </el-button>
                  </template>
                </el-popconfirm>
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
