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
  entertainmentType: '',
  floor: 0,
})

const editForm = reactive({
  entertainmentId: null,
  name: '',
  description: '',
  entertainmentType: '',
  floor: 0,
})


const tableData = reactive({
  data: []
})
const searchKeyword = ref('')
const createFormVisible = ref(false);
const editFormVisible = ref(false);


const rules = reactive({
  name: [
    {required: true, message: 'Name is required', trigger: 'blur'},
  ],
  description: [
    {required: true, message: 'Description is required', trigger: 'blur'},
  ],
  entertainmentType: [
    {required: true, message: 'Type is required', trigger: 'blur'},
  ],
})

onMounted(() => {
  search()
})

const requestPath = 'employee/resource/entertainment'

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

function submitForm() {
  post(requestPath + '/create', userInfo.token, form).then(res => {
    ElNotification.success("Create entertainment Successfully")
    createFormVisible.value = false
    search()
  }).catch(err => {
    ElNotification.error(err)
  })
}

function submitModifyForm() {
  post(requestPath + '/update', userInfo.token, editForm).then(res => {
    ElNotification.success("Update entertainment Successfully")
    editFormVisible.value = false
    search()
  }).catch(err => {
    ElNotification.error(err)
  })
}


const handleEdit = (index, row) => {
  editForm.entertainmentId = row.entertainmentId
  editForm.name = row.name
  editForm.description = row.description
  editForm.entertainmentType = row.entertainmentType
  editForm.floor = row.floor
  editFormVisible.value = true
}
const handleDelete = (index, row) => {
  post(requestPath + '/delete', userInfo.token, {entertainmentId: row.entertainmentId}).then(res => {
    ElNotification.success("Delete entertainment Successfully")
    editFormVisible.value = false
    search()
  }).catch(err => {
    ElNotification.error(err)
  })
}

</script>

<template>
  <div>
    <el-descriptions title="Entertainments Management"></el-descriptions>

    <div>
      <el-input placeholder="Search keyword" v-model="searchKeyword"
                style="width: 240px; margin-right: 12px"></el-input>
      <el-button :icon="Search" type="primary" @click="search">Search</el-button>
      <el-button :icon="Promotion" type="success" @click="createFormVisible = true">New Entertainment</el-button>
    </div>
  </div>
  <div >
    <el-table :data="tableData.data" style="width: 100%;">
      <el-table-column prop="name" label="Name"/>
      <el-table-column prop="description" label="Description"/>
      <el-table-column prop="entertainmentType" label="Entertainment Type"/>
      <el-table-column prop="floor" label="Floor"/>

      <el-table-column align="right">
        <template #default="scope">
          <el-button size="small" @click="handleEdit(scope.$index, scope.row)" type="success">
            Edit
          </el-button>
          <el-popconfirm
              width="200"
              title="Are you sure to delete this? (This entertainment in the trip record will not be deleted)"
              @confirm="handleDelete(scope.$index, scope.row)">
            <template #reference>
              <el-button size="small">Delete</el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>
  </div>

  <el-dialog v-model="createFormVisible" title="Record a New Entertainment" width="600">
    <el-form :model="form" :rules="rules" label-width="auto">
      <el-form-item prop="name" label="Entertainment Name">
        <el-input v-model="form.name"/>
      </el-form-item>
      <el-form-item prop="description" label="Description">
        <el-input v-model="form.description"/>
      </el-form-item>
      <el-form-item prop="entertainmentType" label="Entertainment Type">
        <el-input v-model="form.entertainmentType"/>
      </el-form-item>
      <el-form-item prop="floor" label="Floor">
        <el-input-number v-model="form.floor" type="number" :min="1" :max="20"/>
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


  <el-dialog v-model="editFormVisible" title="Edit Entertainment Info" width="600">
    <el-form :model="editForm" :rules="rules" label-width="auto">
      <el-form-item label="Entertainment Id">
        <el-input v-model="editForm.entertainmentId" disabled/>
      </el-form-item>
      <el-form-item prop="name" label="Entertainment Name">
        <el-input v-model="editForm.name"/>
      </el-form-item>
      <el-form-item prop="description" label="Description">
        <el-input v-model="editForm.description"/>
      </el-form-item>
      <el-form-item prop="entertainmentType" label="Entertainment Type">
        <el-input v-model="editForm.entertainmentType"/>
      </el-form-item>
      <el-form-item prop="floor" label="Floor">
        <el-input-number v-model="editForm.floor" type="number" :min="1" :max="20"/>
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
