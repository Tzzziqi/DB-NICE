<script setup>
import {useRouter} from "vue-router";
import {onMounted, reactive, ref} from "vue";
import {get, post} from "@/vue/request.js";
import {ElNotification} from 'element-plus'
import {userInfoStore} from "@/vue/store.js";
import {Promotion, Search} from "@element-plus/icons-vue";

const userInfo = userInfoStore()
const router = useRouter()
const form = reactive({
  name: '',
  description: '',
  bookingType: '',
  floor: 0,
})

const editForm = reactive({
  bookingId: null,
  name: '',
  description: '',
  bookingType: '',
  floor: 0,
})


const tableData = reactive({
  data: []
})
const searchKeyword = ref('')
const createFormVisible = ref(false);
const editFormVisible = ref(false);

onMounted(() => {
  search()
})

const requestPath = 'customer/booking'

function search() {
  let keyword = searchKeyword.value
  get(requestPath + '/read', userInfo.token, {
    keyword
  }).then(res => {
    tableData.data = res
  }).catch(err => {
    ElNotification.error(err)
  })
}

const handleDelete = (index, row) => {
  post(requestPath + '/delete', userInfo.token, {bookingId: row.bookingId}).then(res => {
    ElNotification.success("Delete booking Successfully")
    editFormVisible.value = false
    search()
  }).catch(err => {
    ElNotification.error(err)
  })
}

function getPortBrief(item) {
  if (item == null) {
    return null
  }
  return item.name + ' / ' + item.state + ' / ' + item.country
}

</script>

<template>
  <div>
    <el-descriptions title="Bookings"></el-descriptions>
    <div>
      <el-input placeholder="Search keyword" v-model="searchKeyword"
                style="width: 240px; margin-right: 12px"></el-input>
      <el-button :icon="Search" type="primary" @click="search">Search</el-button>
    </div>
  </div>
  <div>
    <el-card style="margin: 20px" v-for="bd in tableData.data">
      <template #header>
       <div style="display: flex; justify-content: space-between">
         <span>{{ bd.trip.name }}</span>
         <div>
           <el-button type="primary" @click="router.push('/tripInfo/' + bd.trip.tripId)">
             Trip Details
           </el-button>
           <el-button type="primary" @click="router.push('/booking/' + bd.booking.bookingId)">
             Booking Details
           </el-button>
         </div>
       </div>
      </template>
      <el-descriptions label-width="160" border :column="1">
        <el-descriptions-item label="Passengers">
          <el-tag v-for="item in bd.booking.group.passengers" style="margin-right: 8px">
            {{ item.firstName + ' ' + item.lastName }}
          </el-tag>
        </el-descriptions-item>

        <el-descriptions-item label="Staterooms">
          <el-tag v-for="item in bd.booking.staterooms" style="margin-right: 8px">
            {{ item.stateroomType + ' ' + item.location.location }}
          </el-tag>
        </el-descriptions-item>


        <el-descriptions-item label="Packages">
          <el-tag v-for="item in bd.booking.packages" style="margin-right: 8px">
            {{ item.name }}
          </el-tag>
        </el-descriptions-item>

      </el-descriptions>
      <el-descriptions label-width="160" border :column="3">
        <el-descriptions-item label="Start Date">{{
            new Date(bd.trip.startDate).toLocaleString()
          }}
        </el-descriptions-item>
        <el-descriptions-item label="End Date">{{ new Date(bd.trip.endDate).toLocaleString() }}</el-descriptions-item>
        <el-descriptions-item label="Trip Nights">{{ bd.trip.tripNights }}</el-descriptions-item>
      </el-descriptions>
      <el-descriptions label-width="160" border :column="2">
        <el-descriptions-item label="Start Port">{{
            getPortBrief(bd.trip.startPort)
          }}
        </el-descriptions-item>
        <el-descriptions-item min-width="400" label="End Port">{{
            getPortBrief(bd.trip.endPort)
          }}
        </el-descriptions-item>
      </el-descriptions>

    </el-card>

  </div>
</template>

<style scoped>
</style>
