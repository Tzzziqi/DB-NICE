<script setup>
import {useRouter} from "vue-router";
import {reactive, ref} from "vue";
import {post} from "@/vue/request.js";
import {ElNotification} from 'element-plus'
import {userInfoStore} from "@/vue/store.js";

const userInfo = userInfoStore()
const router = useRouter()
const form = reactive({
  oldPassword: '',
  newPassword: '',
  newPasswordAgain: ''
})

const modifyPassword = ref(false);

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
  oldPassword: [
    {required: true, message: 'Previous Password', trigger: 'blur'},
    {
      min: 4,
      max: 16,
      message: 'Password is 4-16 characters long, consisting of at least two combinations of a-z / A-Z / 0-9 and special characters +-*/|',
      trigger: 'blur'
    },
  ],
  newPassword: [
    {required: true, message: 'New Password', trigger: 'blur'},
    {
      min: 4,
      max: 16,
      message: 'Password is 4-16 characters long, consisting of at least two combinations of a-z / A-Z / 0-9 and special characters +-*/|',
      trigger: 'blur'
    },
  ],
  newPasswordAgain: [
    {required: true, message: 'New Password Again', trigger: 'blur'},
    {
      min: 4,
      max: 16,
      message: 'Password is 4-16 characters long, consisting of at least two combinations of a-z / A-Z / 0-9 and special characters +-*/|',
      trigger: 'blur'
    },
  ],
})

function submitForm() {
  if (form.newPassword !== form.newPasswordAgain) {
    ElNotification.error("The new passwords you entered twice do not match")
    return
  }
  console.log(form)
  post('account/modifyPassword', userInfo.token, form).then(data => {
    ElNotification.success("Modify Password Successfully. Please Re-SignIn");
    userInfo.updateStore(null, null, null)
    router.push('/signIn')
  }).catch(err => {
    ElNotification.error(err)
  })
}

function submitSignOut() {
  userInfo.updateStore(null, null, null)
  router.push('/') // go to home page
}
</script>

<template>
  <el-card>
    <template #header>
      <span>Profile Settings</span>
    </template>
    <el-form v-if="!modifyPassword">
      <el-form-item prop="username" label="Username">
        <el-input
            disabled
            :model-value="userInfo.username"
            placeholder="Please input username"
            type="text" autocomplete="off"></el-input>
      </el-form-item>
      <el-form-item prop="password" label="Password">
        <el-input
            model-value="***********"
            disabled
            placeholder="Please input new password"
            type="password" autocomplete="off"></el-input>
      </el-form-item>
      <div style=" display: flex; justify-content: center">
        <el-button type="primary" @click="modifyPassword = true">Change Password</el-button>
        <el-button @click="submitSignOut">Sign Out</el-button>
      </div>
    </el-form>

    <el-form :model="form" :rules="rules" v-else>
      <el-form-item prop="username" label="Username">
        <el-input
            disabled
            :model-value="userInfo.username"
            placeholder="Please input username"
            type="text" autocomplete="off"></el-input>
      </el-form-item>

      <el-form-item prop="oldPassword" label="Old Password">
        <el-input
            v-model="form.oldPassword"
            placeholder="Please input previous password"
            type="password" autocomplete="off"></el-input>
      </el-form-item>
      <el-form-item prop="newPassword" label="New Password">
        <el-input
            v-model="form.newPassword"
            placeholder="Please input new password"
            type="password" autocomplete="off"></el-input>
      </el-form-item>
      <el-form-item prop="newPasswordAgain" label="New Password Again">
        <el-input
            v-model="form.newPasswordAgain"
            placeholder="Please input new password again"
            type="password" autocomplete="off"></el-input>
      </el-form-item>
      <div style=" display: flex; justify-content: center">
        <el-button type="primary" @click="submitForm">Submit Modification</el-button>
        <el-button @click="modifyPassword = false">Cancel</el-button>
      </div>
    </el-form>
  </el-card>

</template>

<style scoped>
</style>
