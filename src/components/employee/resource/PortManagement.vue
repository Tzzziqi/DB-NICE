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
  country: '',
  state: '',
  address: '',
  nearestAirport: '',
  parkingSpots: 0,
})

const editForm = reactive({
  portId: null,
  name: '',
  country: '',
  state: '',
  address: '',
  nearestAirport: '',
  parkingSpots: 0,
})


const tableData = reactive({
  data: []
})
const searchKeyword = ref('')
const createFormVisible = ref(false);
const editFormVisible = ref(false);


const rules = reactive({
  name: [
    {required: true, message: 'Port name is required', trigger: 'blur'},
  ],
  country: [
    {required: true, message: 'Country is required', trigger: 'blur'},
  ],
  state: [
    {required: true, message: 'State is required', trigger: 'blur'},
  ],
  address: [
    {required: true, message: 'Address is required', trigger: 'blur'},
  ],
  nearestAirport: [
    {required: true, message: 'Nearest airport is required', trigger: 'blur'},
  ],
})

onMounted(() => {
  search()
})

const requestPath = 'employee/resource/port'

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

function handleClick() {
  search()
}


function submitForm() {
  post(requestPath + '/create', userInfo.token, form).then(res => {
    ElNotification.success("Create port Successfully")
    createFormVisible.value = false
    search()
  }).catch(err => {
    ElNotification.error(err)
  })
}

function submitModifyForm() {
  post(requestPath + '/update', userInfo.token, editForm).then(res => {
    ElNotification.success("Update port Successfully")
    editFormVisible.value = false
    search()
  }).catch(err => {
    ElNotification.error(err)
  })
}


const handleEdit = (index, row) => {
  editForm.portId = row.portId
  editForm.name = row.name
  editForm.country = row.country
  editForm.state = row.state
  editForm.address = row.address
  editForm.nearestAirport = row.nearestAirport
  editForm.parkingSpots = row.parkingSpots
  editFormVisible.value = true
}
const handleDelete = (index, row) => {
  post(requestPath + '/delete', userInfo.token, {portId: row.portId}).then(res => {
    ElNotification.success("Delete port Successfully")
    editFormVisible.value = false
    search()
  }).catch(err => {
    ElNotification.error(err)
  })
}

</script>

<template>
  <el-descriptions title="Ports Management"></el-descriptions>

  <div>
      <el-input placeholder="Search keyword" v-model="searchKeyword"
                style="width: 240px; margin-right: 12px"></el-input>
      <el-button :icon="Search" type="primary" @click="search">Search</el-button>
      <el-button :icon="Promotion" type="success" @click="createFormVisible = true">New Port</el-button>
    </div>
  <div >
    <el-table :data="tableData.data" style="width: 100%">
      <el-table-column prop="name" label="Name"/>
      <el-table-column prop="country" label="Country"/>
      <el-table-column prop="state" label="State"/>
      <el-table-column prop="address" label="Address"/>
      <el-table-column prop="nearestAirport" label="NearestAirport"/>
      <el-table-column prop="parkingSpots" label="Parking Spots"/>

      <el-table-column align="right">
        <template #default="scope">
          <el-button size="small" @click="handleEdit(scope.$index, scope.row)" type="success">
            Edit
          </el-button>
          <el-popconfirm
              width="200"
              title="Are you sure to delete this? (This port in the trip record will not be deleted)"
              @confirm="handleDelete(scope.$index, scope.row)">
            <template #reference>
              <el-button size="small">Delete</el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>
  </div>

  <el-dialog v-model="createFormVisible" title="Record a New Port" width="600">
    <el-form :model="form" :rules="rules" label-width="auto">
      <el-form-item label="Port Name">
        <el-input v-model="form.name"/>
      </el-form-item>
      <el-form-item label="State">
        <el-input v-model="form.state"/>
      </el-form-item>
      <el-form-item label="Country">
        <el-input v-model="form.country"/>
      </el-form-item>
      <el-form-item label="Address">
        <el-input v-model="form.address"/>
      </el-form-item>
      <el-form-item label="Nearest Airport">
        <el-input v-model="form.nearestAirport"/>
      </el-form-item>
      <el-form-item label="Parking Spots">
        <el-input-number v-model="form.parkingSpots" type="number" :min="0" :max="1000000"/>
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="createFormVisible = false">Cancel</el-button>
        <el-button type="primary" @click="submitForm">
          Submit
        </el-button>
      </div>
    </template>
  </el-dialog>


  <el-dialog v-model="editFormVisible" title="Edit Port Info" width="600">
    <el-form :model="editForm" :rules="rules" label-width="auto">
      <el-form-item label="Port Id">
        <el-input v-model="editForm.portId" disabled/>
      </el-form-item>
      <el-form-item label="Port Name">
        <el-input v-model="editForm.name"/>
      </el-form-item>
      <el-form-item label="State">
        <el-input v-model="editForm.state"/>
      </el-form-item>
      <el-form-item label="Country">
        <el-input v-model="editForm.country"/>
      </el-form-item>
      <el-form-item label="Address">
        <el-input v-model="editForm.address"/>
      </el-form-item>
      <el-form-item label="Nearest Airport">
        <el-input v-model="editForm.nearestAirport"/>
      </el-form-item>
      <el-form-item label="Parking Spots">
        <el-input-number v-model="editForm.parkingSpots" type="number" :min="0" :max="1000000"/>
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="editFormVisible = false">Cancel</el-button>
        <el-button type="primary" @click="submitModifyForm">
          Submit
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style scoped>
</style>
