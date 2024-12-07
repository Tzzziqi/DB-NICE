<script setup>
import {House, Notebook, Promotion, User} from '@element-plus/icons-vue'
import {userInfoStore} from "@/vue/store.js";
import {useRouter} from "vue-router";
import {computed, onMounted} from "vue";

const userInfo = userInfoStore()
const router = useRouter()

onMounted(() => {
  if (userInfo.role == 'EMPLOYEE') {
      router.push('/employee')
  }
})

function onSignIn() {
  router.push('/signIn')
}

function onSignUp() {
  router.push('/signUp')
}

const loginState = computed(() => {
  return userInfo.isLogin
})
</script>

<template>
  <el-container style="height: 100%">
    <el-header>
      <h3 style="align-content: center; height: 100%;"> Welcome to Trip Application </h3>
    </el-header>
    <el-container style="height: 100%; border-top: 1px solid var(--el-menu-border-color);">
      <el-aside width="200px">
        <el-menu style="height: 100%" :router="true" :ellipsis="false">
          <el-menu-item index="/">
            <template #title>
              <el-icon>
                <Promotion/>
              </el-icon>
              <span>Trip Square</span>
            </template>
          </el-menu-item>
          <el-menu-item index="/bookings">
            <template #title>
              <el-icon>
                <Notebook/>
              </el-icon>
              <span>My Bookings</span>
            </template>
          </el-menu-item>
          <el-menu-item index="/invoices">
            <template #title>
              <el-icon>
                <Notebook/>
              </el-icon>
              <span>My Invoices</span>
            </template>
          </el-menu-item>
          <el-menu-item index="/profile">
            <el-icon>
              <User/>
            </el-icon>
            <span>Profile</span>
          </el-menu-item>

          <el-menu-item v-if="loginState === false">
            <template #title>
              <el-button style="vertical-align: middle" @click="onSignIn">
                SignIn
              </el-button>
              <el-button style="vertical-align: middle" @click="onSignUp" type="primary">
                SignUp
              </el-button>
            </template>
          </el-menu-item>
          <el-menu-item v-else>
            <template #title>
              <div style="vertical-align: middle">
                User: {{ userInfo.username }}
              </div>
            </template>
          </el-menu-item>
        </el-menu>
      </el-aside>
      <el-main>
        <div style="margin-bottom: 120px">
        <router-view></router-view>
        </div>
      </el-main>
    </el-container>
  </el-container>

</template>

<style scoped>

</style>