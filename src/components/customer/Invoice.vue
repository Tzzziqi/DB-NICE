<script setup>
import {useRouter} from "vue-router";
import {onMounted, reactive, ref} from "vue";
import {get, post} from "@/vue/request.js";
import {ElNotification} from 'element-plus'
import {userInfoStore} from "@/vue/store.js";
import {Promotion, Search} from "@element-plus/icons-vue";

const userInfo = userInfoStore()
const router = useRouter()
const tableData = reactive({
  data: []
})
const payVisible = ref(false);
const editFormVisible = ref(false);
const invoiceStatus = ref(0)

onMounted(() => {
  search()
})

const requestPath = 'customer/invoice'

function search() {
  get(requestPath + '/read', userInfo.token, {
    status: invoiceStatus.value == 1
  }).then(res => {
    tableData.data = res
  }).catch(err => {
    ElNotification.error(err)
  })
}

const form = reactive({
  payMethod: '',
  invoiceId: null,
  money: 0
})

function onShowPay(invoice) {
  form.invoiceId = invoice.invoiceId
  payVisible.value = true
  form.money = invoice.money
}

function onSubmitPay() {
  post(requestPath + '/update', userInfo.token, form).then(res => {
    ElNotification.success("Pay successfully");
    search()
    payVisible.value = false
  }).catch(err => {
    ElNotification.error(err)
  })
}

</script>

<template>
  <el-dialog v-model="payVisible" title="Pay for Invoice" width="500">
    <el-form :model="form">
      <el-form-item label="Payment Method">
        <el-input v-model="form.payMethod" autocomplete="off" />
      </el-form-item>
      <el-form-item label="Money">
        <el-input disabled v-model="form.money" autocomplete="off" />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="payVisible = false">Cancel</el-button>
        <el-button type="primary" @click="onSubmitPay">
          Pay
        </el-button>
      </div>
    </template>
  </el-dialog>
  <div>
    <el-descriptions title="Invoice"></el-descriptions>
  </div>
  <div>
    <el-tabs v-model="invoiceStatus" @tab-change="search">
      <el-tab-pane label="UnPaid" :name="0"></el-tab-pane>
      <el-tab-pane label="Paid" :name="1"></el-tab-pane>
    </el-tabs>
    <el-card style="margin: 20px" v-for="bd in tableData.data">
      <template #header>
        <div style="display: flex; justify-content: space-between">
          <span>Bill for {{ bd.tripName }}</span>
          <div>
            <el-button type="primary" @click="onShowPay(bd.invoice)" v-if="bd.invoice.payment == null">
              Pay
            </el-button>
            <el-button type="primary" @click="router.push('/tripInfo/' + bd.tripId)">
              Trip Details
            </el-button>
            <el-button type="primary" @click="router.push('/booking/' + bd.bookingId)">
              Booking Details
            </el-button>
          </div>
        </div>
      </template>
      <el-descriptions label-width="160" border :column="2">
        <el-descriptions-item label="Invoice Name">
          {{ bd.invoice.name }}
        </el-descriptions-item>
        <el-descriptions-item label="Money">
          $ {{ bd.invoice.money }}
        </el-descriptions-item>

      </el-descriptions>
      <el-descriptions label-width="160" border :column="2" v-if="bd.invoice.payment != null">
        <el-descriptions-item label="Payment Method">
          {{ bd.invoice.payment.paymentMethod }}
        </el-descriptions-item>
        <el-descriptions-item label="Payment Date">
          {{ new Date(bd.invoice.payment.paymentDate).toLocaleString() }}
        </el-descriptions-item>

      </el-descriptions>
      <el-descriptions label-width="160" border :column="3">
        <el-descriptions-item label="Description">
          {{ bd.invoice.description }}
        </el-descriptions-item>
      </el-descriptions>

    </el-card>

  </div>
</template>

<style scoped>
</style>
