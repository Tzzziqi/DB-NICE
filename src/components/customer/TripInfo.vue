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
const createTripStep = ref(1)
const bookStep = ref(1)

const createBookingVisible = ref(false)
const bookedRooms = ref({})
const addPassengerVisible = ref(false)
const editPassengerVisible = ref(false)

const tripId = ref(route.params.id)
const trip = ref({
  tripId: null,
  status: '',
  tripNights: 0,
  name: '',
  startDate: '',
  endDate: '',
  startPort: {},
  endPort: {},
  ports: [],
  restaurants: [],
  entertainments: [],
  staterooms: [],
})

const resBookings = reactive({
  data: []
})

const resPackages = reactive({
  data: []
})


function readTrip() {
  get('view/trip/readSingle', userInfo.token, {
    tripId: tripId.value
  }).then(data => {
    console.log(data)
    trip.value = data.trip
    bookedRooms.value = {}
    for (let i = 0; i < data.bookedRooms.length; ++i) {
      bookedRooms.value[data.bookedRooms[i]] = ''
    }
    resBookings.data = data.booking
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

const bookForm = reactive({
  tripId: route.params.id,
  staterooms: [],
  packages: [],
  passengers: []
})


function handleSubmitBookingForm() {
  ElMessageBox.confirm('Sure to submit book?')
      .then(() => {
        post('customer/booking/create', userInfo.token, {
          tripId: bookForm.tripId,
          passengers: bookForm.passengers,
          staterooms: bookForm.staterooms.map(x => x.stateroom.stateroomId),
          packages: bookForm.packages.map(x => x.packageId)
        }).then(res => {
          ElNotification.success("Booking successfully")
          readTrip()
        }).catch(err => {
          ElNotification.error(err)
        })
      })
      .catch(() => {
      })
}

function handleSelectStaterooms(val) {
  bookForm.staterooms = val
}

function handleSelectPackage(val) {
  bookForm.packages = val
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

  bookForm.passengers.push({...passengerForm})
  addPassengerVisible.value = false
  console.log(bookForm.passengers)
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
  bookForm.passengers[editPassengerIndex.value] = {...editPassengerForm}
  editPassengerVisible.value = false
  console.log(bookForm.passengers)
}

function handleEditPassenger(index) {
  let edit = bookForm.passengers[index]
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
      <span style="margin-right: 8px"> {{ createBookingVisible ? 'New Booking: ' : '' }} {{ trip.name }}</span>
      <el-tag effect="dark" type="danger" v-if="trip.status == 'REGISTERING'">{{ trip.status }}</el-tag>
      <el-tag effect="dark" type="success" v-if="trip.status == 'STARTED'">{{ trip.status }}</el-tag>
      <el-tag effect="dark" type="info" v-if="trip.status == 'FINISHED'">{{ trip.status }}</el-tag>
    </template>
    <template #extra>
      <el-button v-if="trip.status == 'REGISTERING' && !createBookingVisible" style="width: 120px" type="success"
                 @click="createBookingVisible = true">
        New Booking
      </el-button>

      <el-button v-if="trip.status == 'REGISTERING' && createBookingVisible" style="width: 120px" type="danger"
                 @click="handleSubmitBookingForm">
        Submit Bookings
      </el-button>

      <el-button v-if="trip.status == 'REGISTERING' && createBookingVisible" type="info" style="width: 120px"
                 @click="createBookingVisible = false">
        View Trip Info
      </el-button>

    </template>

  </el-descriptions>

  <div v-show="createBookingVisible">
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
            trip.startPort.nearestAirport
          }}
        </el-descriptions-item>
        <el-descriptions-item width="100" label="Parking Spots">{{
            trip.startPort.parkingSpots
          }}
        </el-descriptions-item>
      </el-descriptions>
      <el-descriptions label-width="160" border :column="3">
        <el-descriptions-item min-width="400" label="End Port">{{ getPortBrief(trip.endPort) }}</el-descriptions-item>
        <el-descriptions-item width="350" label="Nearest Airport">{{
            trip.endPort.nearestAirport
          }}
        </el-descriptions-item>
        <el-descriptions-item width="100" label="Parking Spots">{{ trip.endPort.parkingSpots }}</el-descriptions-item>
      </el-descriptions>
    </el-card>
    <el-tabs v-model="bookStep">
      <el-tab-pane label="Pick Stateroom" :name="1"></el-tab-pane>
      <el-tab-pane label="Passengers Information" :name="2"></el-tab-pane>
      <el-tab-pane label="Pick Packages" :name="3"></el-tab-pane>
    </el-tabs>
    <el-card v-show="bookStep == 1">
      <el-table :data="stateroomsView"
                @selection-change="handleSelectStaterooms">
        <el-table-column type="selection" width="55"/>
        <el-table-column sortable prop="stateroom.stateroomType" label="Type">
          <template #default="scope">
            {{ scope.row.stateroom.stateroomType }}
            <el-tag v-if="bookedRooms[scope.row.stateroom.stateroomId] != null" type="danger"> Booked</el-tag>
            <el-tag v-else>Available</el-tag>
          </template>
        </el-table-column>
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
      <el-button type="primary" style="margin-bottom: 8px" @click="addPassengerVisible = true">Add New Passenger
      </el-button>
      <el-card v-for="(passenger, index) in bookForm.passengers" style="margin-bottom: 8px">
        <el-descriptions :title="passenger.firstName + ' ' + passenger.lastName" border :column="4">
          <template #extra>
            <el-button size="small" @click="handleEditPassenger(index)" type="success">
              Edit
            </el-button>
            <el-button size="small" @click="bookForm.passengers.splice(index, 1)">Delete</el-button>
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
      <el-table :data="resPackages.data"
                @selection-change="handleSelectPackage">
        <el-table-column type="selection" width="55"/>
        <el-table-column sortable prop="name" label="PackageName"/>
        <el-table-column sortable prop="description" label="Description"/>
        <el-table-column sortable prop="price" label="Price" width="250">
          <template #default="scope">
            <el-text tag="b">{{ '$ ' + scope.row.price }} /
              {{ scope.row.chargeType == 'NIGHT' ? 'Person / Night' : 'Person / Trip' }}
            </el-text>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

  </div>

  <div v-show="!createBookingVisible">
    <el-tabs v-model="createTripStep">
      <el-tab-pane label="Basic Information" :name="1"></el-tab-pane>
      <el-tab-pane label="Staterooms" :name="2"></el-tab-pane>
      <el-tab-pane label="Restaurants" :name="3"></el-tab-pane>
      <el-tab-pane label="Entertainments" :name="4"></el-tab-pane>
      <el-tab-pane label="My Bookings" :name="5" v-if="userInfo.token != null && userInfo.token != ''"></el-tab-pane>
    </el-tabs>
    <div v-show="createTripStep == 1">
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
              trip.startPort.nearestAirport
            }}
          </el-descriptions-item>
          <el-descriptions-item width="100" label="Parking Spots">{{
              trip.startPort.parkingSpots
            }}
          </el-descriptions-item>
        </el-descriptions>
        <el-descriptions label-width="160" border :column="3">
          <el-descriptions-item min-width="400" label="End Port">{{ getPortBrief(trip.endPort) }}</el-descriptions-item>
          <el-descriptions-item width="350" label="Nearest Airport">{{
              trip.endPort.nearestAirport
            }}
          </el-descriptions-item>
          <el-descriptions-item width="100" label="Parking Spots">{{ trip.endPort.parkingSpots }}</el-descriptions-item>
        </el-descriptions>
      </el-card>
      <el-card style="margin-bottom: 20px">
        <div style="width: 100%">
          <el-descriptions title="Visit Ports"></el-descriptions>
          <el-table :data="trip.tripPorts" style="width: 100%">
            <el-table-column label="Port Name">
              <template #default="scope">
                {{ getPortBrief(scope.row.port) }}
              </template>
            </el-table-column>
            <el-table-column label="Arrival Date">
              <template #default="scope">
                {{ new Date(scope.row.arrivalDate).toLocaleString() }}
              </template>
            </el-table-column>
            <el-table-column prop="departureDate" label="Departure Date">
              <template #default="scope">
                {{ new Date(scope.row.departureDate).toLocaleString() }}
              </template>
            </el-table-column>

            <el-table-column prop="port.nearestAirport" label="Nearest Airport">
            </el-table-column>
            <el-table-column prop="port.parkingSpots" label="Parking Spots">
            </el-table-column>

          </el-table>
        </div>
      </el-card>
    </div>
    <div v-if="createTripStep == 2">
      <el-table :data="trip.staterooms" style="width: 100%">
        <el-table-column sortable prop="stateroom.stateroomType" label="Type"/>
        <el-table-column sortable label="Status">
          <template #default="scope">
            <el-tag v-if="bookedRooms[scope.row.stateroom.stateroomId] != null" type="danger"> Booked</el-tag>
            <el-tag v-else>Available</el-tag>
          </template>
        </el-table-column>
        <el-table-column sortable prop="stateroom.location.location" label="Location"/>
        <el-table-column sortable prop="stateroom.roomSize" label="Size in SQFT" width="150"/>
        <el-table-column sortable prop="stateroom.numberBeds" label="Beds" width="150"/>
        <el-table-column sortable prop="stateroom.numberBath" label="Bathrooms" width="150"/>
        <el-table-column sortable prop="stateroom.balconyCount" label="Balcony" width="150"/>
        <el-table-column label="Price Per Night" width="150">
          <template #default="scope">
            <el-text tag="b">{{ '$ ' + scope.row.priceNight }}</el-text>
          </template>
        </el-table-column>
      </el-table>

    </div>
    <div v-if="createTripStep == 3">
      <el-table :data="trip.restaurants" style="width: 100%">
        <el-table-column prop="name" label="Name"/>
        <el-table-column prop="description" label="Description"/>
        <el-table-column prop="restaurantType" label="Restaurant Type"/>
        <el-table-column prop="servingTime" label="Serving Time"/>
        <el-table-column prop="floor" label="Floor"/>
      </el-table>
    </div>
    <div v-if="createTripStep == 4">
      <el-table :data="trip.entertainments" style="width: 100%;">
        <el-table-column prop="name" label="Name"/>
        <el-table-column prop="description" label="Description"/>
        <el-table-column prop="entertainmentType" label="Entertainment Type"/>
        <el-table-column prop="floor" label="Floor"/>
      </el-table>
    </div>
    <div v-if="createTripStep == 5">
      <el-card v-for="booking in resBookings.data" style="width: 100%; margin-bottom: 8px">
        <el-descriptions :column="1">
          <el-descriptions-item label="Passengers">
            <el-tag v-for="item in booking.group.passengers" style="margin-right: 8px">
              {{ item.firstName + ' ' + item.lastName }}
            </el-tag>
          </el-descriptions-item>

          <el-descriptions-item label="Staterooms">
            <el-tag v-for="item in booking.staterooms" style="margin-right: 8px">
              {{ item.stateroomType + ' ' + item.location.location }}
            </el-tag>
          </el-descriptions-item>

          <el-descriptions-item label="Packages">
            <el-tag v-for="item in booking.packages" style="margin-right: 8px">
              {{ item.name }}
            </el-tag>
          </el-descriptions-item>
        </el-descriptions>
        <template #footer>
          <div >
            <el-button type="primary" @click="router.push('/booking/' + booking.bookingId)">
              View Details
            </el-button>
          </div>
        </template>
      </el-card>
    </div>
  </div>
  <!--  </el-card>-->

</template>

<style scoped>
</style>
