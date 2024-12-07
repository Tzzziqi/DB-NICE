<script setup>

import {useRouter} from "vue-router";
import {reactive} from "vue";
import {post} from "@/vue/request.js";
import {ElNotification} from 'element-plus'

const router = useRouter()
const form = reactive({
  username: '',
  password: '',
  passwordAgain: ''
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
  passwordAgain: [
    {required: true, message: 'Password Again', trigger: 'blur'},
    {
      min: 4,
      max: 16,
      message: 'Password is 4-16 characters long, consisting of at least two combinations of a-z / A-Z / 0-9 and special characters +-*/|',
      trigger: 'blur'
    },
  ],
})

function submitForm() {
  if (form.password != form.passwordAgain) {
    ElNotification.error("Password Not Match")
    return
  }
  console.log(form.username, form.password)
  post('auth/signUp', null, form).then(data => {
    ElNotification.success("SignUp Successfully");
    router.push('/signIn')
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
            <span>SignUp for Trip Application</span>
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
            <el-form-item prop="passwordAgain" label="Password Again">
              <el-input
                  v-model="form.passwordAgain"
                  placeholder="Please input password again"
                  type="password" autocomplete="off"></el-input>
            </el-form-item>
            <div style=" display: flex; justify-content: center">
              <el-button style="width: 120px" type="primary" @click="submitForm">SignUp</el-button>
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
