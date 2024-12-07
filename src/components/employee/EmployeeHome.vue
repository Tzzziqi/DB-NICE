<script setup>
import {Food, HomeFilled, House, Notebook, Pointer, Promotion, Ship, Sugar, User} from '@element-plus/icons-vue'
import {userInfoStore} from "@/vue/store.js";
import {useRouter} from "vue-router";
import {computed} from "vue";

const userInfo = userInfoStore()
const router = useRouter()

function onSignIn() {
  router.push('/signIn')
}

function onSignUp() {
  router.push('/signUp')
}

const loginState = computed(() => {
  console.log(userInfo.isLogin)
  return userInfo.isLogin
})
</script>

<template>
  <el-container style="height: 100%">
    <el-header>
      <h3 style="align-content: center; height: 100%;"> Welcome to Trip Management Application </h3>
    </el-header>
    <el-container style="height: 100%; border-top: 1px solid var(--el-menu-border-color);">
      <el-aside width="auto-width">
        <el-menu style="height: 100%" :router="true" :ellipsis="false">
          <el-menu-item index="/employee">
            <template #title>
              <el-icon>
                <Promotion/>
              </el-icon>
              <span>Trip Management</span>
            </template>
          </el-menu-item>

          <el-menu-item index="/employee/port">
            <el-icon>
              <Ship/>
            </el-icon>
            <span>Port Management</span>
          </el-menu-item>


          <el-menu-item index="/employee/entertainment">
            <el-icon>
              <HomeFilled/>
            </el-icon>
            <span>Entertainment Management</span>
          </el-menu-item>


          <el-menu-item index="/employee/restaurant">
            <el-icon>
              <Food/>
            </el-icon>
            <span>Restaurants Management</span>
          </el-menu-item>


          <el-menu-item index="/employee/profile">
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