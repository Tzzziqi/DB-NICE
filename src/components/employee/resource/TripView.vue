<script setup>

import {useRoute, useRouter} from "vue-router";
import {computed, onMounted, reactive, ref} from "vue";
import {get, post} from "@/vue/request.js";
import {ElNotification} from 'element-plus'
import {userInfoStore} from "@/vue/store.js";
import {Edit, Plus} from "@element-plus/icons-vue";

const router = useRouter()
const route = useRoute()
const userInfo = userInfoStore()
const addPortVisible = ref(false)
const addRestaurantVisible = ref(false)
const addEntertainmentVisible = ref(false)
const addStateroomVisible = ref(false)
const addPackageVisible = ref(false)
const createTripStep = ref(1)


const tripId = ref(route.params.id)
const form = reactive({
  tripId: null,
  status: '',
  tripNights: 0,
  tripName: '',
  startDate: '',
  endDate: '',
  startPortId: null,
  endPortId: null,
  ports: [],
  restaurants: [],
  entertainments: [],
  staterooms: [],
})

const resBookings = reactive({
  data: [],
  bookedRoom: {}
})

const resPorts = reactive({
  data: []
})

const resRestaurants = reactive({
  data: []
})

const resEntertainments = reactive({
  data: []
})
//
// const resPackages = reactive({
//   data: []
// })

const resStaterooms = reactive({
  data: [],
  price: {}
})


const rvMapping = {
  rvPort: {},
  rvRestaurant: {},
  rvEntertainments: {},
  // rvPackages: {},
  resStaterooms: {},
}

function readTrip() {
  get('employee/trip/readSingle', userInfo.token, {
    tripId: tripId.value
  }).then(data => {
    console.log(data)
    form.tripId = tripId.value
    let trip = data.trip
    form.startDate = trip.startDate
    form.endDate = trip.endDate
    form.entertainments = trip.entertainments
    form.restaurants = trip.restaurants
    form.startPortId = trip.startPort.portId
    form.endPortId = trip.endPort.portId
    form.tripNights = trip.tripNights
    form.tripName = trip.name
    form.status = trip.status
    form.staterooms = []
    for (let i = 0; i < trip.staterooms.length; i++) {
      let rm = trip.staterooms[i]
      resStaterooms.price[rm.id.stateroomId] = rm.priceNight
      form.staterooms.push(rm.stateroom)
    }

    console.log(resStaterooms)
    form.ports = trip.tripPorts.map((x) => ({
      portId: x.id.portId,
      tripId: x.id.tripId,
      arrivalDate: x.arrivalDate,
      departureDate: x.departureDate
    }))
    resBookings.data = data.booking
    for (let i = 0; i < data.booking.length; ++i) {
      let rooms = data.booking[i].staterooms
      for (let j = 0; j < rooms.length; ++j) {
        resBookings.bookedRoom[rooms[j].stateroomId] = ''
      }
    }
  }).catch(err => {
    ElNotification.error(err)
  })
}

onMounted(() => {
  search('port', resPorts, () => {
    for (let i = 0; i < resPorts.data.length; ++i) {
      rvMapping.rvPort[resPorts.data[i].portId] = resPorts.data[i]
    }
  })
  search('restaurant', resRestaurants, () => {
    for (let i = 0; i < resRestaurants.data.length; ++i) {
      rvMapping.rvRestaurant[resRestaurants.data[i].restaurantId] = resRestaurants.data[i]
    }
  })
  search('entertainment', resEntertainments, () => {
    for (let i = 0; i < resEntertainments.data.length; ++i) {
      rvMapping.rvEntertainments[resEntertainments.data[i].entertainmentId] = resEntertainments.data[i]
    }
  })

  search('stateroom', resStaterooms, () => {
    for (let i = 0; i < resStaterooms.data.length; ++i) {
      rvMapping.resStaterooms[resStaterooms.data[i].stateroomId] = resStaterooms.data[i]
    }
  })

  readTrip()
})


const requestPath = 'employee/resource/'


function search(res, store, cb) {
  get(requestPath + res + '/read', userInfo.token, {
    keyword: ''
  }).then(res => {
    store.data = res
    if (cb != null) {
      cb()
    }
  }).catch(err => {
    ElNotification.error(err)
  })
}

function submitForm() {
  console.log(form)
  let rooms = []
  for (let i = 0; i < form.staterooms.length; ++i) {
    let id = form.staterooms[i].stateroomId
    if (resStaterooms.price[id] == null) {
      ElNotification.error("Please specify price for all selected room")
      return
    }
    rooms.push({
      stateroomId: id,
      pricePerNight: resStaterooms.price[id]
    })
  }
  let postForm = {
    tripId: form.tripId,
    tripName: form.tripName,
    ports: form.ports,
    restaurants: form.restaurants.map((x) => x.restaurantId),
    entertainments: form.entertainments.map((x) => x.entertainmentId),
    rooms: rooms
  }
  console.log(postForm)
  post('employee/trip/update', userInfo.token, postForm).then(data => {
    ElNotification.success("Update Trip Successfully");
    readTrip()
  }).catch(err => {
    ElNotification.error(err)
  })
}


const addPortForm = reactive({
  portId: null,
  arrivalDate: null,
  departureDate: null
})
const addPortFormRule = reactive({
  portId: [
    {required: true, message: 'Port is required', trigger: 'blur'},
  ],
  arrivalDate: [
    {required: true, message: 'Arrival date is required', trigger: 'blur'},
  ],
  departureDate: [
    {required: true, message: 'Departure date is required', trigger: 'blur'},
  ],
})

function submitAddPort() {
  if (addPortForm.portId == null || addPortForm.arrivalDate == null || addPortForm.departureDate == null) {
    ElNotification.error("Please fill the information of port to visit")
    return
  }
  if (addPortForm.departureDate.getTime() <= addPortForm.arrivalDate.getTime()) {
    ElNotification.error("The departure time should be later than the arrival time")
    return
  }
  form.ports.push({
    ...addPortForm
  })
  addPortVisible.value = false
}

function getPortBrief(portId) {
  if (rvMapping.rvPort[portId] == null) {
    return null
  }
  let item = rvMapping.rvPort[portId]
  return item.name + ' / ' + item.state + ' / ' + item.country
}

function checkDepartureDate(next) {
  if (addPortForm.arrivalDate == null) {
    return true;
  }
  next = new Date(next.getTime());
  next.setHours(24, 0, 0, 0)
  return next.getTime() < addPortForm.arrivalDate.getTime()
}


const pickRestaurant = ref([])
const pickEntertainments = ref([])
const pickStaterooms = ref([])


function handleSelectRestaurants(val) {
  pickRestaurant.value = val
}

function handleSelectEntertainments(val) {
  pickEntertainments.value = val
}

function handleSelectStaterooms(val) {
  pickStaterooms.value = val
}


function handleUpdateRestaurant() {
  let res = form.restaurants
  for (let i = 0; i < pickRestaurant.value.length; ++i) {
    res.push(pickRestaurant.value[i])
  }
  res.sort((a, b) => a.restaurantId - b.restaurantId)
  addRestaurantVisible.value = false
}

function handleUpdateEntertainments() {
  let res = form.entertainments
  for (let i = 0; i < pickEntertainments.value.length; ++i) {
    res.push(pickEntertainments.value[i])
  }
  res.sort((a, b) => a.entertainmentId - b.entertainmentId)
  addEntertainmentVisible.value = false
}

function handleUpdateStaterooms(val) {
  for (let i = 0; i < pickStaterooms.value.length; ++i) {
    if (resStaterooms.price[pickStaterooms.value[i].stateroomId] == null) {
      ElNotification.error("Stateroom price should be specified")
      return
    }
  }
  let res = form.staterooms
  for (let i = 0; i < pickStaterooms.value.length; ++i) {
    res.push(pickStaterooms.value[i])
  }
  res.sort((a, b) => a.stateroomId - b.stateroomId)
  addStateroomVisible.value = false
}

//
// function handleUpdatePackages() {
//   let res = form.packages
//   for (let i = 0; i < pickPackages.value.length; ++i) {
//     res.push(pickPackages.value[i])
//   }
//   res.sort((a, b) => a.packageId - b.packageId)
//   addPackageVisible.value = false
// }
//

const restaurantView = computed(() => {
  let data = []
  let mp = {}
  for (let i = 0; i < form.restaurants.length; ++i) {
    mp[form.restaurants[i].restaurantId] = ""
  }
  for (let i = 0; i < resRestaurants.data.length; ++i) {
    let ele = resRestaurants.data[i]
    if (mp[ele.restaurantId] == null) {
      data.push(ele)
    }
  }
  return data
})

const entertainmentsView = computed(() => {
  let data = []
  let mp = {}
  for (let i = 0; i < form.entertainments.length; ++i) {
    mp[form.entertainments[i].entertainmentId] = ""
  }
  for (let i = 0; i < resEntertainments.data.length; ++i) {
    let ele = resEntertainments.data[i]
    if (mp[ele.entertainmentId] == null) {
      data.push(ele)
    }
  }
  return data
})

const stateroomsView = computed(() => {
  let data = []
  let mp = {}
  for (let i = 0; i < form.staterooms.length; ++i) {
    mp[form.staterooms[i].stateroomId] = ""
  }
  for (let i = 0; i < resStaterooms.data.length; ++i) {
    let ele = resStaterooms.data[i]
    if (mp[ele.stateroomId] == null) {
      data.push(ele)
    }
  }
  return data
})


function onSubmitStatusChange(status) {
  post('employee/trip/updateStatus', userInfo.token, {
    tripId: tripId.value,
    status: status,
  }).then(res => {
    ElNotification.success("Change trip status to " + status + " successfully")
    readTrip()
  }).catch(err => {
    ElNotification.error(err)
  })
}

function onSubmitDelete() {
  post('employee/trip/delete?tripId=' + tripId, userInfo.token, {
    tripId: tripId.value,
  }).then(res => {
    ElNotification.success("Delete trip status successfully")
    router.push('/employee')
  }).catch(err => {
    ElNotification.error(err)
  })
}

const disableEd = computed(() => form.status !== 'REGISTERING')

</script>

<template>
  <el-dialog v-model="addPortVisible" title="Record a New Port" width="600">
    <el-form :model="addPortForm" :rules="addPortFormRule" label-width="auto">
      <el-form-item prop="portId" label="Visit Port">
        <el-select filterable v-model="addPortForm.portId" placeholder="Visit Port">
          <el-option v-for="item in resPorts.data"
                     :key="'port_id_' + item.portId"
                     :label="item.name + ' / ' + item.state + ' / ' + item.country" :value="item.portId"/>
        </el-select>
      </el-form-item>
      <el-form-item prop="arrivalDate" label="Arrival Date">
        <el-date-picker
            v-model="addPortForm.arrivalDate"
            type="datetime"
            placeholder="Pick a Date"
            format="YYYY/MM/DD HH:mm:ss"
        />
      </el-form-item>
      <el-form-item prop="departureDate" label="Departure Date">
        <el-date-picker
            v-model="addPortForm.departureDate"
            type="datetime"
            :disabled-date="checkDepartureDate"
            placeholder="Pick a Date"
            format="YYYY/MM/DD HH:mm:ss"
        />
      </el-form-item>

    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="addPortVisible = false">Cancel</el-button>
        <el-button type="primary" @click="submitAddPort">
          Add
        </el-button>
      </div>
    </template>
  </el-dialog>
  <el-dialog v-model="addRestaurantVisible" title="Choose Opened Restaurants" width="800">
    <div>
      <el-table :data="restaurantView" style="width: 100%" @selection-change="handleSelectRestaurants">
        <el-table-column type="selection" width="55"/>
        <el-table-column sortable prop="name" label="Name"/>
        <el-table-column prop="description" label="Description"/>
        <el-table-column sortable prop="restaurantType" label="Restaurant Type"/>
        <el-table-column prop="servingTime" label="Serving Time"/>
        <el-table-column sortable prop="floor" label="Floor"/>
      </el-table>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="addRestaurantVisible = false">Cancel</el-button>
        <el-button type="primary" @click="handleUpdateRestaurant">
          Confirm
        </el-button>
      </div>
    </template>
  </el-dialog>

  <el-dialog v-model="addStateroomVisible" title="Add staterooms" width="1400">
    <div>
      <el-table :data="stateroomsView" style="width: 100%" @selection-change="handleSelectStaterooms">
        <el-table-column type="selection" width="55"/>
        <el-table-column sortable prop="stateroomType" label="Type"/>
        <el-table-column sortable prop="location.location" label="Location"/>
        <el-table-column sortable prop="roomSize" label="Size in SQFT" width="150"/>
        <el-table-column sortable prop="numberBeds" label="Beds" width="150"/>
        <el-table-column sortable prop="numberBath" label="Bathrooms" width="150"/>
        <el-table-column sortable prop="balconyCount" label="Balcony" width="150"/>
        <el-table-column label="Price Per Night">
          <template #default="scope">
            <el-input-number v-model="resStaterooms.price[scope.row.stateroomId]"
                             :min="1" :max="100000"/>
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

  <el-dialog v-model="addEntertainmentVisible" title="Choose Opened Restaurants" width="800">
    <div>
      <el-table :data="entertainmentsView" style="width: 100%"
                @selection-change="handleSelectEntertainments">
        <el-table-column type="selection" width="55"/>
        <el-table-column sortable prop="name" label="Name"/>
        <el-table-column prop="description" label="Description"/>
        <el-table-column sortable prop="entertainmentType" label="Entertainment Type"/>
        <el-table-column sortable prop="floor" label="Floor"/>
      </el-table>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="addEntertainmentVisible = false">Cancel</el-button>
        <el-button type="primary" @click="handleUpdateEntertainments">
          Confirm
        </el-button>
      </div>
    </template>
  </el-dialog>

  <el-descriptions>
    <template #title>
      <span style="margin-right: 8px">Trip Information</span>
      <el-tag effect="dark" type="danger" v-if="form.status == 'REGISTERING'">{{ form.status }}</el-tag>
      <el-tag effect="dark" type="success" v-if="form.status == 'STARTED'">{{ form.status }}</el-tag>
      <el-tag effect="dark" type="info" v-if="form.status == 'FINISHED'">{{ form.status }}</el-tag>
    </template>
    <template #extra>
      <el-button v-if="form.status == 'REGISTERING'" style="width: 120px" type="primary" @click="submitForm">
        Update Trip
      </el-button>
      <el-button v-if="form.status == 'REGISTERING'" style="width: 120px" type="success"
                 @click="onSubmitStatusChange('STARTED')">
        Start Trip
      </el-button>
      <el-button v-if="form.status == 'STARTED'" style="width: 120px" type="success"
                 @click="onSubmitStatusChange('FINISHED')">
        Finish Trip
      </el-button>
      <el-popconfirm
          v-if="form.status == 'REGISTERING'"
          width="200"
          title="Are you sure to delete this trip? all invoices will be deprecated and money will return"
          @confirm="onSubmitDelete">
        <template #reference>
          <el-button type="info" style="width: 120px"
          >Delete Trip
          </el-button>
        </template>
      </el-popconfirm>

    </template>
    <el-descriptions-item>
      <el-tabs v-model="createTripStep">
        <el-tab-pane label="Basic Information" :name="1"></el-tab-pane>
        <el-tab-pane label="Staterooms" :name="2"></el-tab-pane>
        <el-tab-pane label="Restaurants & Entertainments" :name="3"></el-tab-pane>
        <el-tab-pane label="Bookings" :name="4"></el-tab-pane>
      </el-tabs>
    </el-descriptions-item>
  </el-descriptions>
  <!--    </template>-->
  <div v-show="createTripStep == 1">
    <el-form :model="form" label-width="auto">
      <el-card style="margin-bottom: 20px">
        <el-form-item required prop="tripName" label="Trip Name">
          <el-input
              :disabled="disableEd"
              v-model="form.tripName"
              placeholder="Please input trip name"
              type="text" autocomplete="off"></el-input>
        </el-form-item>

        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item required label="Start Date" disabled>
              <el-date-picker
                  disabled
                  v-model="form.startDate"
                  type="datetime"
                  placeholder="Pick a Date"
                  format="YYYY/MM/DD HH:mm:ss"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item disabled required label="End Date">
              <el-date-picker
                  disabled
                  v-model="form.endDate"
                  type="datetime"
                  placeholder="Pick a Date"
                  format="YYYY/MM/DD HH:mm:ss"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item required label="Start Port">
              <el-select disabled filterable v-model="form.startPortId" placeholder="Start Port">
                <el-option v-for="item in resPorts.data"
                           :key="'port_id_' + item.portId"
                           :label="item.name + ' / ' + item.state + ' / ' + item.country" :value="item.portId"/>
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :span="8">
            <el-form-item required label="End Port">
              <el-select disabled filterable v-model="form.endPortId" placeholder="Start Port">
                <el-option v-for="item in resPorts.data"
                           :key="'end_port_id_' + item.portId"
                           :label="item.name + ' / ' + item.state + ' / ' + item.country" :value="item.portId"/>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </el-card>
      <el-card style="margin-bottom: 20px">
        <template #header>
          <div>
            <span>Visit Ports</span>
          </div>
        </template>
        <el-form-item required>
          <div style="width: 100%">
            <el-table :data="form.ports" style="width: 100%">
              <el-table-column label="Port Name">
                <template #default="scope">
                  {{ getPortBrief(scope.row.portId) }}
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
              <el-table-column align="right">
                <template #default="scope">
                  <el-button size="small"
                             @click="form.ports.splice(scope.$index, 1)">Delete
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
            <el-button v-if="!disableEd" style="margin-top: 20px" :icon="Plus" @click="addPortVisible = true"> Add
              Port
            </el-button>
          </div>
        </el-form-item>
      </el-card>
    </el-form>
  </div>
  <div v-show="createTripStep == 2">
    <el-form :model="form" label-width="auto">
      <el-card style="margin-bottom: 20px">
        <template #header>
          <div style="display: flex; justify-content: space-between;">
            <span>Staterooms</span>
            <el-button v-if="!disableEd" :icon="Plus" @click="addStateroomVisible = true"> Add Stateroom
            </el-button>
          </div>
        </template>
        <el-form-item>
          <div style="width: 100%">
            <el-table :data="form.staterooms" style="width: 100%">
              <el-table-column sortable prop="stateroomType" label="Type"/>
              <el-table-column label="Status" v-if="!disableEd">
                <template #default="scope">
                  <el-tag v-if="resBookings.bookedRoom[scope.row.stateroomId] != null" type="danger"> Booked</el-tag>
                  <el-tag v-else>Available</el-tag>
                </template>
              </el-table-column>
              <el-table-column sortable prop="location.location" label="Location"/>
              <el-table-column sortable prop="roomSize" label="Size in SQFT" width="150"/>
              <el-table-column sortable prop="numberBeds" label="Beds" width="150"/>
              <el-table-column sortable prop="numberBath" label="Bathrooms" width="150"/>
              <el-table-column sortable prop="balconyCount" label="Balcony" width="150"/>
              <el-table-column label="Price Per Night">
                <template #default="scope">
                  <el-input-number disabled v-model="resStaterooms.price[scope.row.stateroomId]"
                                   :min="1" :max="100000"/>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-form-item>
      </el-card>
    </el-form>
  </div>
  <div v-show="createTripStep == 3">
    <el-form :model="form" label-width="auto">
      <el-card style="margin-bottom: 20px">
        <template #header>
          <div style="display: flex; justify-content: space-between;">
            <span>Open Restaurants</span>
            <el-button v-if="!disableEd" @click="addRestaurantVisible = true" :icon="Plus"> Add Restaurant
            </el-button>
          </div>
        </template>
        <el-form-item>
          <div style="width: 100%">
            <el-table :data="form.restaurants" style="width: 100%" @selection-change="handleSelectRestaurants">
              <el-table-column prop="name" label="Name"/>
              <el-table-column prop="description" label="Description"/>
              <el-table-column prop="restaurantType" label="Restaurant Type"/>
              <el-table-column prop="servingTime" label="Serving Time"/>
              <el-table-column prop="floor" label="Floor"/>
              <el-table-column align="right" v-if="!disableEd">
                <template #default="scope">
                  <el-button size="small"
                             @click="form.restaurants.splice(scope.$index, 1)">
                    Delete
                  </el-button>
                </template>
              </el-table-column>
            </el-table>

          </div>
        </el-form-item>
      </el-card>

      <el-card style="margin-bottom: 20px">
        <template #header>
          <div style="display: flex; justify-content: space-between;">
            <span>Open Entertainments</span>
            <el-button v-if="!disableEd" :icon="Plus" @click="addEntertainmentVisible = true"> Add Entertainment
            </el-button>
          </div>
        </template>
        <el-form-item>
          <div style="width: 100%">
            <el-table :data="form.entertainments" style="width: 100%;">
              <el-table-column prop="name" label="Name"/>
              <el-table-column prop="description" label="Description"/>
              <el-table-column prop="entertainmentType" label="Entertainment Type"/>
              <el-table-column prop="floor" label="Floor"/>

              <el-table-column align="right" v-if="!disableEd">
                <template #default="scope">
                  <el-button size="small"
                             @click="form.entertainments.splice(scope.$index, 1)">Delete
                  </el-button>
                </template>
              </el-table-column>
            </el-table>

          </div>
        </el-form-item>
      </el-card>
    </el-form>
  </div>
  <!--  </el-card>-->
  <div v-show="createTripStep == 4">
    <el-card style="margin: 20px" v-for="bd in resBookings.data">
      <!--      <el-button type="primary" @click="router.push('/booking/' + bd.booking.bookingId)">-->
      <!--        Booking Details-->
      <!--      </el-button>-->
      <div style="display: flex; justify-content: space-between; margin-bottom: 8px">
        <span> # {{ bd.bookingId }}</span>
<!--        <div>-->
<!--          <el-button type="primary" @click="router.push('/booking/' + bd.bookingId)">-->
<!--            Booking Details-->
<!--          </el-button>-->
<!--        </div>-->
      </div>
      <el-descriptions label-width="160" border :column="1">
        <el-descriptions-item label="Passengers">
          <el-tag v-for="item in bd.group.passengers" style="margin-right: 8px">
            {{ item.firstName + ' ' + item.lastName }}
          </el-tag>
        </el-descriptions-item>

        <el-descriptions-item label="Staterooms">
          <el-tag v-for="item in bd.staterooms" style="margin-right: 8px">
            {{ item.stateroomType + ' ' + item.location.location }}
          </el-tag>
        </el-descriptions-item>

        <el-descriptions-item label="Packages">
          <el-tag v-for="item in bd.packages" style="margin-right: 8px">
            {{ item.name }}
          </el-tag>
        </el-descriptions-item>

      </el-descriptions>

    </el-card>
  </div>
</template>

<style scoped>
</style>
