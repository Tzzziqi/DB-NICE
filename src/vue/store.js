import {defineStore} from 'pinia'

export const userInfoStore = defineStore('userInfo', {
        state: () => ({username: "", role: "", token: null}),
        getters: {
            isLogin(state) {
                return state.username != '' && state.username != null
            }
        },
        actions: {
            updateStore(username, role, token) {
                if (token == null) {
                    localStorage.removeItem('Authorization')
                } else {
                    localStorage.setItem('Authorization', token);
                }
                this.username = username
                this.role = role
                this.token = token
            }
        },
    }
)