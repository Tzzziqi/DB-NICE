import {createRouter, createWebHashHistory} from 'vue-router'
import UserHome from "@/components/customer/CustomerHome.vue";
import SignIn from "@/components/SignIn.vue";
import SignUp from "@/components/SignUp.vue";
import WorkerHome from "@/components/employee/EmployeeHome.vue";
import TripManagement from "@/components/employee/TripManagement.vue";
import Profile from "@/components/Profile.vue";
import NewTrip from "@/components/employee/NewTrip.vue";
import PortManagement from "@/components/employee/resource/PortManagement.vue";
import RestaurantManagement from "@/components/employee/resource/RestaurantManagement.vue";
import EntertainmentManagement from "@/components/employee/resource/EntertainmentManagement.vue";
import TripView from "@/components/employee/resource/TripView.vue";
import TripSquare from "@/components/customer/TripSquare.vue";
import TripInfo from "@/components/customer/TripInfo.vue";
import Bookings from "@/components/customer/Bookings.vue";
import BookingInfo from "@/components/customer/BookingInfo.vue";
import Invoice from "@/components/customer/Invoice.vue";

const router = createRouter({
    history: createWebHashHistory(),
    routes: [
        {
            path: '/',
            component: UserHome,
            children: [
                {
                    path: '',
                    component: TripSquare
                },
                {
                    path: 'bookings',
                    meta: {
                        role: 'CUSTOMER'
                    },
                    component: Bookings
                },
                {
                    path: 'invoices',
                    meta: {
                        role: 'CUSTOMER'
                    },
                    component: Invoice
                },
                {
                    path: 'booking/:id',
                    meta: {
                        role: 'CUSTOMER'
                    },
                    component: BookingInfo
                },
                {
                    path: 'profile',
                    meta: {
                        role: 'CUSTOMER'
                    },
                    component: Profile
                },
                {
                    path: 'tripInfo/:id',
                    component: TripInfo
                },
            ]
        },

        {
            path: '/employee',
            component: WorkerHome,
            children: [
                {
                    path: '',
                    meta: {
                        role: 'EMPLOYEE'
                    },
                    component: TripManagement
                },
                {
                    path: 'port',
                    meta: {
                        role: 'EMPLOYEE'
                    },
                    component: PortManagement
                },
                {
                    path: 'restaurant',
                    meta: {
                        role: 'EMPLOYEE'
                    },
                    component: RestaurantManagement
                },
                {
                    path: 'entertainment',
                    meta: {
                        role: 'EMPLOYEE'
                    },
                    component: EntertainmentManagement
                },
                {
                    path: 'profile',
                    meta: {
                        role: 'EMPLOYEE'
                    },
                    component: Profile
                },
                {
                    path: 'newTrip',
                    meta: {
                        role: 'EMPLOYEE'
                    },
                    component: NewTrip
                },
                {
                    path: 'tripInfo/:id',
                    meta: {
                        role: 'EMPLOYEE'
                    },
                    component: TripView
                },
            ]
        },
        // {
        //     path: '/admin',
        //     name: 'admin',
        //     component: AdminView,
        //     meta: {
        //         permission: ['ADMIN']
        //     },
        //     children: [
        //     ]
        // },
        {
            path: '/signIn',
            component: SignIn
        },
        {
            path: '/signUp',
            component: SignUp
        },
    ]
})

export default router
