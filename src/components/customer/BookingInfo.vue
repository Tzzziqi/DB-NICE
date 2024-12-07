<script setup>

import {useRoute, useRouter} from "vue-router";
import {computed, onMounted, reactive, ref} from "vue";
import {get, post} from "@/vue/request.js";
import {ElMessageBox, ElNotification} from 'element-plus'
import {userInfoStore} from "@/vue/store.js";
import {Edit, Plus} from "@element-plus/icons-vue";

const router = useRouter()
const route = useRoute()
const userInfo = userInfoStore()
const bookStep = ref(1)

const bookedRooms = ref({})
const addPassengerVisible = ref(false)
const addStateroomVisible = ref(false)
const addPackageVisible = ref(false)
const editPassengerVisible = ref(false)

const bookingId = ref(route.params.id)

const booking = reactive({
  data: {
    group: {}
  }
})
const trip = ref({})

const resPackages = reactive({
  data: []
})

function readTrip() {
  get('customer/booking/readSingle', userInfo.token, {
    bookingId: bookingId.value
  }).then(data => {
    booking.data = {...data.booking}
    trip.value = data.trip
    bookedRooms.value = {}
    for (let i = 0; i < data.bookedRooms.length; ++i) {
      bookedRooms.value[data.bookedRooms[i]] = ''
    }
    let tripRooms = data.trip.staterooms
    let mp = {}
    for (let i = 0; i < tripRooms.length; ++i) {
      mp[tripRooms[i].stateroom.stateroomId] = tripRooms[i]
    }
    booking.data.staterooms = []
    for (let i = 0; i < data.booking.staterooms.length; ++i) {
      booking.data.staterooms.push(
          mp[data.booking.staterooms[i].stateroomId]
      )
    }
  }).catch(err => {
    ElNotification.error(err)
  })
}

onMounted(() => {
  readTrip()
  readPackage()
})

function readPackage() {
  get('customer/resource/package/read', userInfo.token, {}).then(res => {
    resPackages.data = res
  }).catch(err => {
    ElNotification.error(err)
  })
}

function getPortBrief(item) {
  if (item == null) {
    return null
  }
  return item.name + ' / ' + item.state + ' / ' + item.country
}

function handleDeleteBooking() {
  post('customer/booking/delete?bookingId=' + booking.data.bookingId, userInfo.token, {
  }).then(res => {
    ElNotification.success("Delete booking successfully")
    router.push('/')
  }).catch(err => {
    ElNotification.error(err)
  })
}

function handleSubmitBookingForm() {
  ElMessageBox.confirm('Sure to update booking?')
      .then(() => {
        console.log(booking.data.staterooms, booking.data.group)
        post('customer/booking/update', userInfo.token, {
          bookingId: booking.data.bookingId,
          passengers: booking.data.group.passengers,
          staterooms: booking.data.staterooms.map(x => x.stateroom.stateroomId),
          packages: booking.data.packages.map(x => x.packageId)
        }).then(res => {
          ElNotification.success("Update booking successfully")
          readTrip()
        }).catch(err => {
          ElNotification.error(err)
        })
      })
      .catch(() => {
      })
}

const pickStaterooms = ref([])

const pickPackages = ref([])

function handleSelectStaterooms(val) {
  pickStaterooms.value = val
}

function handleSelectPackage(val) {
  pickPackages.value = val
}


function handleUpdateStaterooms(val) {
  let res = booking.data.staterooms
  for (let i = 0; i < pickStaterooms.value.length; ++i) {
    res.push(pickStaterooms.value[i])
  }
  res.sort((a, b) => a.stateroom.stateroomId - b.stateroom.stateroomId)
  addStateroomVisible.value = false
}

function handleUpdatePackages(val) {
  let res = booking.data.packages
  for (let i = 0; i < pickPackages.value.length; ++i) {
    res.push(pickPackages.value[i])
  }
  res.sort((a, b) => a.packageId - b.packageId)
  addPackageVisible.value = false
}

const stateroomsView = computed(() => {
  let data = []
  console.log('RoomView', trip.value)
  if (trip.value.staterooms == null) {
    return data
  }
  for (let i = 0; i < trip.value.staterooms.length; ++i) {
    let ele = trip.value.staterooms[i]
    if (bookedRooms.value[ele.stateroom.stateroomId] == null) {
      data.push(ele)
    }
  }
  return data
})

const packagesView = computed(() => {
  let data = []
  let already = {}
  for (let i = 0; i < booking.data.packages.length; ++i) {
    let pk = booking.data.packages[i]
    already[pk.packageId] = ''
  }
  console.log(booking.data.packages)
  for (let i = 0; i < resPackages.data.length; ++i) {
    let ele = resPackages.data[i]
    if (already[ele.packageId] == null) {
      data.push(ele)
    }
  }
  return data
})

const passengerForm = reactive({
  firstName: '',
  lastName: '',
  dob: null,
  country: '',
  state: '',
  city: '',
  street: '',
  gender: '',
  email: '',
  phone: ''
})

const editPassengerForm = reactive({
  firstName: '',
  lastName: '',
  dob: null,
  country: '',
  state: '',
  city: '',
  street: '',
  gender: '',
  email: '',
  phone: ''
})

const editPassengerIndex = ref(null)

function submitAddPassenger() {
  if (
      passengerForm.firstName == ''
      || passengerForm.lastName == ''
      || passengerForm.dob == null
      || passengerForm.country == ''
      || passengerForm.gender == ''
      || passengerForm.email == ''
      || passengerForm.phone == ''
  ) {
    ElNotification.error("Please fill the required information")
    return
  }

  booking.data.group.passengers.push({...passengerForm})
  addPassengerVisible.value = false
  console.log(booking.data.group.passengers)
}

function submitEditPassenger() {
  if (
      editPassengerForm.firstName == ''
      || editPassengerForm.lastName == ''
      || editPassengerForm.dob == null
      || editPassengerForm.country == ''
      || editPassengerForm.gender == ''
      || editPassengerForm.email == ''
      || editPassengerForm.phone == ''
  ) {
    ElNotification.error("Please fill the required information")
    return
  }
  booking.data.group.passengers[editPassengerIndex.value] = {...editPassengerForm}
  editPassengerVisible.value = false
  console.log(booking.data.group.passengers)
}

function handleEditPassenger(index) {
  let edit = booking.data.group.passengers[index]
  editPassengerIndex.value = index
  editPassengerForm.firstName = edit.firstName
  editPassengerForm.lastName = edit.lastName
  editPassengerForm.dob = edit.dob
  editPassengerForm.country = edit.country
  editPassengerForm.state = edit.state
  editPassengerForm.city = edit.city
  editPassengerForm.street = edit.street
  editPassengerForm.gender = edit.gender
  editPassengerForm.email = edit.email
  editPassengerForm.phone = edit.phone
  editPassengerVisible.value = true
}

</script>

<template>
  <el-descriptions>
    <template #title>
      <span style="margin-right: 8px"> Booking for {{ trip.name }}</span>
      <el-tag effect="dark" type="danger" v-if="trip.status == 'REGISTERING'">{{ trip.status }}</el-tag>
      <el-tag effect="dark" type="success" v-if="trip.status == 'STARTED'">{{ trip.status }}</el-tag>
      <el-tag effect="dark" type="info" v-if="trip.status == 'FINISHED'">{{ trip.status }}</el-tag>
    </template>
    <template #extra>
      <el-button v-if="trip.status == 'REGISTERING' || trip.status == 'STARTED'" style="width: 120px" type="danger"
                 @click="handleSubmitBookingForm">
        Submit Update
      </el-button>

      <el-button type="info" style="width: 120px"
                 @click="router.push('/tripInfo/' + trip.tripId)">
        View Trip Info
      </el-button>
      <el-popconfirm
          v-if="trip.status == 'REGISTERING'"
          width="200"
          title="Are you sure to delete this? (This port in the trip record will not be deleted)"
          @confirm="handleDeleteBooking">
        <template #reference>
          <el-button style="width: 120px" type="danger">
            Delete Booking
          </el-button>
        </template>
      </el-popconfirm>


    </template>

  </el-descriptions>

  <div>
    <el-card style="margin-bottom: 20px">
      <el-descriptions style="margin-bottom: 12px" title="Basic Information" direction="vertical" border :column="3">
        <el-descriptions-item label="Start Date">{{
            new Date(trip.startDate).toLocaleString()
          }}
        </el-descriptions-item>
        <el-descriptions-item label="End Date">{{ new Date(trip.endDate).toLocaleString() }}</el-descriptions-item>
        <el-descriptions-item label="Trip Nights">{{ trip.tripNights }}</el-descriptions-item>
      </el-descriptions>
      <el-descriptions label-width="160" border :column="3">
        <el-descriptions-item min-width="400" label="Start Port">{{
            getPortBrief(trip.startPort)
          }}
        </el-descriptions-item>
        <el-descriptions-item width="350" label="Nearest Airport">{{
            trip.startPort == null ? null : trip.startPort.nearestAirport
          }}
        </el-descriptions-item>
        <el-descriptions-item width="100" label="Parking Spots">{{
            trip.startPort == null ? null : trip.startPort.parkingSpots
          }}
        </el-descriptions-item>
      </el-descriptions>
      <el-descriptions label-width="160" border :column="3">
        <el-descriptions-item min-width="400" label="End Port">{{ getPortBrief(trip.endPort) }}</el-descriptions-item>
        <el-descriptions-item width="350" label="Nearest Airport">{{
            trip.endPort == null ? null : trip.endPort.nearestAirport
          }}
        </el-descriptions-item>
        <el-descriptions-item width="100" label="Parking Spots">{{
            trip.endPort == null ? null : trip.endPort.parkingSpots
          }}
        </el-descriptions-item>
      </el-descriptions>
    </el-card>
    <el-tabs v-model="bookStep">
      <el-tab-pane label="Pick Stateroom" :name="1"></el-tab-pane>
      <el-tab-pane label="Passengers Information" :name="2"></el-tab-pane>
      <el-tab-pane label="Pick Packages" :name="3"></el-tab-pane>
    </el-tabs>

    <el-dialog v-model="addStateroomVisible" title="Add staterooms" width="1400">
      <div>
        <el-table :data="stateroomsView" style="width: 100%" @selection-change="handleSelectStaterooms">
          <el-table-column type="selection" width="55"/>
          <el-table-column sortable prop="stateroom.stateroomType" label="Type"/>
          <el-table-column sortable prop="stateroom.location.location" label="Location"/>
          <el-table-column sortable prop="stateroom.roomSize" label="Size in SQFT" width="150"/>
          <el-table-column sortable prop="stateroom.numberBeds" label="Beds" width="150"/>
          <el-table-column sortable prop="stateroom.numberBath" label="Bathrooms" width="150"/>
          <el-table-column sortable prop="stateroom.balconyCount" label="Balcony" width="150"/>
          <el-table-column sortable prop="priceNight" label="Price Per Night" width="150">
            <template #default="scope">
              <el-text tag="b">{{ '$ ' + scope.row.priceNight }}</el-text>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="addStateroomVisible = false">Cancel</el-button>
          <el-button type="primary" @click="handleUpdateStaterooms">
            Confirm
          </el-button>
        </div>
      </template>
    </el-dialog>

    <el-dialog v-model="addPackageVisible" title="Add packages" width="1400">
      <div>
        <el-table :data="packagesView" style="width: 100%" @selection-change="handleSelectPackage">
          <el-table-column type="selection" width="55"/>
          <el-table-column sortable prop="name" label="PackageName"/>
          <el-table-column sortable prop="chargeType" label="Charge Type"/>
          <el-table-column sortable prop="description" label="Description"/>
          <el-table-column sortable prop="price" label="Price" width="250">
            <template #default="scope">
              <el-text tag="b">{{ '$ ' + scope.row.price }} /
                {{ scope.row.chargeType == 'NIGHT' ? 'Person / Night' : 'Person / Trip' }}
              </el-text>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="addPackageVisible = false">Cancel</el-button>
          <el-button type="primary" @click="handleUpdatePackages">
            Confirm
          </el-button>
        </div>
      </template>
    </el-dialog>


    <el-card v-show="bookStep == 1">
      <el-button v-if="trip.status == 'REGISTERING'" type="primary" style="margin-bottom: 8px"
                 @click="addStateroomVisible = true">Add New Stateroom
      </el-button>
      <el-table :data="booking.data.staterooms">
        <el-table-column sortable prop="stateroom.stateroomType" label="Type"/>
        <el-table-column sortable prop="stateroom.location.location" label="Location"/>
        <el-table-column sortable prop="stateroom.roomSize" label="Size in SQFT" width="150"/>
        <el-table-column sortable prop="stateroom.numberBeds" label="Beds" width="150"/>
        <el-table-column sortable prop="stateroom.numberBath" label="Bathrooms" width="150"/>
        <el-table-column sortable prop="stateroom.balconyCount" label="Balcony" width="150"/>
        <el-table-column sortable prop="priceNight" label="Price Per Night" width="150">
          <template #default="scope">
            <el-text tag="b">{{ '$ ' + scope.row.priceNight }}</el-text>
          </template>
        </el-table-column>
        <el-table-column align="right" v-if="trip.status == 'REGISTERING'">
          <template #default="scope">
            <el-button size="small" @click="booking.data.staterooms.splice(scope.$index, 1)">Delete</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="addPassengerVisible" title="Add Passenger" width="600">
      <el-form :model="passengerForm" label-width="auto">
        <el-form-item required label="First Name">
          <el-input v-model="passengerForm.firstName"/>
        </el-form-item>
        <el-form-item required label="Last Name">
          <el-input v-model="passengerForm.lastName"/>
        </el-form-item>
        <el-form-item required label="Birthday">
          <el-date-picker
              v-model="passengerForm.dob"
              type="date"
              placeholder="Pick birthday"
          />
        </el-form-item>
        <el-form-item required label="Gender">
          <el-radio-group v-model="passengerForm.gender">
            <el-radio value="Male" size="large">Male</el-radio>
            <el-radio value="Female" size="large">Female</el-radio>
            <el-radio value="Other" size="large">Other</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item required label="Email">
          <el-input v-model="passengerForm.email"/>
        </el-form-item>
        <el-form-item required label="Phone">
          <el-input v-model="passengerForm.phone"/>
        </el-form-item>
        <el-form-item required label="Country">
          <el-input v-model="passengerForm.country"/>
        </el-form-item>
        <el-form-item label="State">
          <el-input v-model="passengerForm.state"/>
        </el-form-item>
        <el-form-item label="Street">
          <el-input v-model="passengerForm.street"/>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="addPassengerVisible = false">Cancel</el-button>
          <el-button type="primary" @click="submitAddPassenger">
            Submit
          </el-button>
        </div>
      </template>
    </el-dialog>


    <el-dialog v-model="editPassengerVisible" title="Update Passenger" width="600">
      <el-form :model="editPassengerForm" label-width="auto">
        <el-form-item required label="First Name">
          <el-input v-model="editPassengerForm.firstName"/>
        </el-form-item>
        <el-form-item required label="Last Name">
          <el-input v-model="editPassengerForm.lastName"/>
        </el-form-item>
        <el-form-item required label="Birthday">
          <el-date-picker
              v-model="editPassengerForm.dob"
              type="date"
              placeholder="Pick birthday"
          />
        </el-form-item>
        <el-form-item required label="Gender">
          <el-radio-group v-model="editPassengerForm.gender">
            <el-radio value="Male" size="large">Male</el-radio>
            <el-radio value="Female" size="large">Female</el-radio>
            <el-radio value="Other" size="large">Other</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item required label="Email">
          <el-input v-model="editPassengerForm.email"/>
        </el-form-item>
        <el-form-item required label="Phone">
          <el-input v-model="editPassengerForm.phone"/>
        </el-form-item>
        <el-form-item required label="Country">
          <el-input v-model="editPassengerForm.country"/>
        </el-form-item>
        <el-form-item label="State">
          <el-input v-model="editPassengerForm.state"/>
        </el-form-item>
        <el-form-item label="Street">
          <el-input v-model="editPassengerForm.street"/>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="editPassengerVisible = false">Cancel</el-button>
          <el-button type="primary" @click="submitEditPassenger">
            Submit
          </el-button>
        </div>
      </template>
    </el-dialog>


    <div v-show="bookStep == 2">
      <el-button type="primary" v-if="trip.status == 'REGISTERING'" style="margin-bottom: 8px"
                 @click="addPassengerVisible = true">Add New Passenger
      </el-button>
      <el-card v-for="(passenger, index) in booking.data.group.passengers" style="margin-bottom: 8px">
        <el-descriptions :title="passenger.firstName + ' ' + passenger.lastName" border :column="4">
          <template #extra>
            <div v-if="trip.status == 'REGISTERING'">
              <el-button size="small" @click="handleEditPassenger(index)" type="success">
                Edit
              </el-button>
              <el-button size="small" @click="booking.data.group.passengers.splice(index, 1)">Delete</el-button>
            </div>
          </template>
          <el-descriptions-item label="Date of Birth">{{
              new Date(passenger.dob).toLocaleDateString()
            }}
          </el-descriptions-item>
          <el-descriptions-item label="Gender">{{ passenger.gender }}</el-descriptions-item>
          <el-descriptions-item label="Email">{{ passenger.email }}</el-descriptions-item>
          <el-descriptions-item label="Phone">{{ passenger.phone }}</el-descriptions-item>
          <el-descriptions-item label="Country">{{ passenger.country }}</el-descriptions-item>
          <el-descriptions-item label="State">{{ passenger.state }}</el-descriptions-item>
          <el-descriptions-item label="City">{{ passenger.city }}</el-descriptions-item>
          <el-descriptions-item label="Street">{{ passenger.street }}</el-descriptions-item>
        </el-descriptions>
      </el-card>
    </div>


    <el-card v-show="bookStep == 3">
      <el-button v-if="trip.status == 'REGISTERING' || trip.status == 'STARTED'" type="primary"
                 style="margin-bottom: 8px" @click="addPackageVisible = true">Add New Package
      </el-button>
      <el-table :data="booking.data.packages">
        <el-table-column sortable prop="name" label="PackageName"/>
        <el-table-column sortable prop="description" label="Description"/>
        <el-table-column sortable prop="price" label="Price" width="250">
          <template #default="scope">
            <el-text tag="b">{{ '$ ' + scope.row.price }} /
              {{ scope.row.chargeType == 'NIGHT' ? 'Person / Night' : 'Person / Trip' }}
            </el-text>
          </template>
        </el-table-column>
        <el-table-column align="right" v-if="trip.status == 'REGISTERING'">
          <template #default="scope">
            <el-button size="small" @click="booking.data.packages.splice(scope.$index, 1)">Delete</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>

</template>

<style scoped>
</style>
