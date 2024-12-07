import './assets/main.css'

import {createApp} from 'vue'
import {createPinia} from 'pinia'
import ElementPlus, {ElNotification} from 'element-plus'
import 'element-plus/dist/index.css'
import router from './vue/router.js'
import {userInfoStore} from "@/vue/store.js";

import App from './App.vue'
import {post} from "@/vue/request.js";


const app = createApp(App);
const pinia = createPinia()
app.use(pinia)
app.use(router)

async function loadUserInfo() {
    let token = localStorage.getItem('Authorization');
    if (token != null) {
        let userInfo = userInfoStore(pinia)
        await post('token/refreshToken', token, {}).then(async res => {
            // save this for the next time we open it
            userInfo.updateStore(res.username, res.role, res.token)
        }).catch(err => {
            console.log(err)
            userInfo.updateStore(null, null, null)
        });
    }
}

await loadUserInfo()

router.beforeEach(async (to, from, next) => {
    console.log(from.path, to.path, 'meta: ', from.meta, to.meta);
    let userInfo = userInfoStore(pinia)
    if (userInfo.username == '' || userInfo.username == null) {
        console.log('Load Meta')
        await loadUserInfo()
    }
    let checkRole = to.meta != null && to.meta.role != null && to.meta.role != ''
    if ((userInfo.role == null || userInfo.role === '') && checkRole) {
        ElNotification.error("Login Required")
        next('/signIn');
    } else if (checkRole) {
        if (to.meta != null && to.meta.role != userInfo.role) {
            console.log('invalid: ', to.meta.role, userInfo.role)
            ElNotification.error("Invalid Role")
            next('/signIn')
        } else {
            next();
        }
    } else {
        next();
    }
});

app.use(ElementPlus)
app.mount('#app')
