<script setup>

import {useRouter} from "vue-router";
import {reactive} from "vue";
import {post} from "@/vue/request.js";
import {ElNotification} from 'element-plus'
import {userInfoStore} from "@/vue/store.js";

const router = useRouter()
const userInfo = userInfoStore()
const form = reactive({
  username: '',
  password: ''
})

const rules = reactive({
  username: [
    {required: true, message: 'Username', trigger: 'blur'},
    {
      min: 4,
      max: 32,
      message: 'Username should consist of 4-32 characters in the range 0-9 / a-z / A-Z',
      trigger: 'blur'
    },
  ],
  password: [
    {required: true, message: 'Password', trigger: 'blur'},
    {
      min: 4,
      max: 16,
      message: 'Password is 4-16 characters long, consisting of at least two combinations of a-z / A-Z / 0-9 and special characters +-*/|',
      trigger: 'blur'
    },
  ],
})

function submitForm() {
  console.log(form.username, form.password)
  post('auth/signIn', userInfo.token, form).then(data => {
    userInfo.updateStore(data.username, data.role, data.token)
    ElNotification.success("SignIn Successfully");
    if (data.role == 'EMPLOYEE') {
      router.push('/employee')
    } else if (data.role == 'CUSTOMER') {
      router.push('/')
    }
  }).catch(err => {
    ElNotification.error(err)
  })
}

</script>

<template>
  <el-container style="height: 100%">
    <el-main style="display: flex; flex-direction: column; justify-content: center; align-items: center">
      <el-card style="width: 600px" title="SignIn for Trip Application">
        <template #header>
          <div class="card-header">
            <span>SignIn for Trip Application</span>
          </div>
        </template>
        <div>
          <el-form :model="form" :rules="rules">
            <el-form-item prop="username" label="Username">
              <el-input
                  v-model="form.username"
                  placeholder="Please input username"
                  type="text" autocomplete="off"></el-input>
            </el-form-item>
            <el-form-item prop="password" label="Password">
              <el-input
                  v-model="form.password"
                  placeholder="Please input password"
                  type="password" autocomplete="off"></el-input>
            </el-form-item>
            <div style=" display: flex; justify-content: center; margin-top: 48px">
              <el-button style="width: 120px" type="primary" @click="submitForm">SignIn</el-button>
              <el-button style="width: 120px" @click="router.push('/')">Home</el-button>
            </div>
          </el-form>
        </div>
      </el-card>
    </el-main>
  </el-container>

</template>

<style scoped>
</style>
