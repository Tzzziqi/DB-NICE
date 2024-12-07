<script setup>

import {useRouter} from "vue-router";
import {computed, onMounted, reactive, ref} from "vue";
import {get, post} from "@/vue/request.js";
import {ElNotification} from 'element-plus'
import {userInfoStore} from "@/vue/store.js";
import {Edit, Plus} from "@element-plus/icons-vue";

const router = useRouter()
const userInfo = userInfoStore()
const addPortVisible = ref(false)
const addRestaurantVisible = ref(false)
const addEntertainmentVisible = ref(false)
const addPackageVisible = ref(false)
const createTripStep = ref(1)

const form = reactive({
  tripName: '',
  startDate: '',
  endDate: '',
  startPortId: null,
  endPortId: null,
  ports: [],
  restaurants: [],
  entertainments: [],
  // packages: [],
  staterooms: [],
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

  // search('package', resPackages, () => {
  //   for (let i = 0; i < resPackages.data.length; ++i) {
  //     rvMapping.rvPackages[resPackages.data[i].packageId] = resPackages.data[i]
  //   }
  // })

  search('stateroom', resStaterooms, () => {
    for (let i = 0; i < resStaterooms.data.length; ++i) {
      rvMapping.resStaterooms[resStaterooms.data[i].stateroomId] = resStaterooms.data[i]
    }
  })
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
    tripName: form.tripName,
    startDate: form.startDate,
    endDate: form.endDate,
    startPortId: form.startPortId,
    endPortId: form.endPortId,
    ports: form.ports,
    restaurants: form.restaurants.map((x) => x.restaurantId),
    entertainments: form.entertainments.map((x) => x.entertainmentId),
    rooms: rooms
  }
  console.log(postForm)
  post('employee/trip/create', userInfo.token, postForm).then(data => {
    ElNotification.success("Create Trip Successfully");
    router.push('/employee')
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

function handleSelectStaterooms(val) {
  form.staterooms = val
}

const pickRestaurant = ref([])
const pickEntertainments = ref([])
// const pickPackages = ref([])


function handleSelectRestaurants(val) {
  pickRestaurant.value = val
}

function handleSelectEntertainments(val) {
  pickEntertainments.value = val
}
//
// function handleSelectPackages(val) {
//   pickPackages.value = val
// }


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
//
// const packagesView = computed(() => {
//   let data = []
//   let mp = {}
//   for (let i = 0; i < form.packages.length; ++i) {
//     mp[form.packages[i].packageId] = ""
//   }
//   for (let i = 0; i < resPackages.data.length; ++i) {
//     let ele = resPackages.data[i]
//     if (mp[ele.packageId] == null) {
//       data.push(ele)
//     }
//   }
//   return data
// })

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

  <el-dialog v-model="addPackageVisible" title="Choose Available Packages" width="800">
    <div>
      <el-table :data="packagesView" style="width: 100%"
                @selection-change="handleSelectPackages">
        <el-table-column type="selection" width="55"/>
        <el-table-column prop="name" label="Name"/>
        <el-table-column prop="description" label="Description"/>
        <el-table-column label="Price">
          <template #default="scope">
            {{
              '$' + scope.row.price +
              (
                  scope.row.chargeType == 'TRIP' ?
                      ' / person for entire trip'
                      : ' / person for entire night'
              )
            }}
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

  <!--  <el-card>-->
  <!--    <template #header>-->
  <el-descriptions title="Create a new trip">
    <el-descriptions-item>
      <el-steps
          :active="createTripStep"
          finish-status="success"
          align-center
      >
        <el-step title="Step 1" description="Fill trip basic information"/>
        <el-step title="Step 2" description="Setting the price of staterooms"/>
        <el-step title="Step 3" description="Select open dining and entertainment facilities"/>
      </el-steps>
    </el-descriptions-item>
  </el-descriptions>
  <!--    </template>-->
  <div v-show="createTripStep == 1">
    <el-form :model="form" label-width="auto">
      <el-card style="margin-bottom: 20px">
        <el-form-item required prop="tripName" label="Trip Name">
          <el-input
              v-model="form.tripName"
              placeholder="Please input trip name"
              type="text" autocomplete="off"></el-input>
        </el-form-item>

        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item required label="Start Date">
              <el-date-picker
                  v-model="form.startDate"
                  type="datetime"
                  placeholder="Pick a Date"
                  format="YYYY/MM/DD HH:mm:ss"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item required label="End Date">
              <el-date-picker
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
              <el-select filterable v-model="form.startPortId" placeholder="Start Port">
                <el-option v-for="item in resPorts.data"
                           :key="'port_id_' + item.portId"
                           :label="item.name + ' / ' + item.state + ' / ' + item.country" :value="item.portId"/>
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :span="8">
            <el-form-item required label="End Port">
              <el-select filterable v-model="form.endPortId" placeholder="Start Port">
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
                  {{ scope.row.arrivalDate.toLocaleString() }}
                </template>
              </el-table-column>
              <el-table-column prop="departureDate" label="Departure Date">
                <template #default="scope">
                  {{ scope.row.departureDate.toLocaleString() }}
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
            <el-button style="margin-top: 20px" :icon="Plus" @click="addPortVisible = true"> Add Port</el-button>
          </div>
        </el-form-item>
      </el-card>
    </el-form>

    <div style=" display: flex; justify-content: center; margin-top: 48px">
      <el-button style="width: 120px" type="success" @click="createTripStep = 2">Next Step</el-button>
      <el-button style="width: 120px" @click="router.push('/employee')">Cancel</el-button>
    </div>
  </div>
  <div v-show="createTripStep == 2">
    <el-form :model="form" label-width="auto">
      <el-card style="margin-bottom: 20px">
        <template #header>
          <div>
            <span>Staterooms</span>
          </div>
        </template>
        <el-form-item>
          <div style="width: 100%">
            <el-table :data="resStaterooms.data" style="width: 100%"
                      @selection-change="handleSelectStaterooms">
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
        </el-form-item>
      </el-card>
      <div style=" display: flex; justify-content: center; margin-top: 48px">
        <el-button style="width: 120px" @click="createTripStep = 1" type="info">Prev Step</el-button>
        <el-button style="width: 120px" type="success" @click="createTripStep = 3">Next Step</el-button>
      </div>
    </el-form>
  </div>
  <div v-show="createTripStep == 3">
    <el-form :model="form" label-width="auto">
      <el-card style="margin-bottom: 20px">
        <template #header>
          <div style="display: flex; justify-content: space-between;">
            <span>Open Restaurants</span>
            <el-button @click="addRestaurantVisible = true" style="margin-top: 20px" :icon="Plus"> Add Restaurant
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
              <el-table-column align="right">
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
            <el-button @click="addEntertainmentVisible = true" :icon="Plus"> Add Entertainment
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

              <el-table-column align="right">
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

<!--      <el-card>-->
<!--        <template #header>-->
<!--          <div>-->
<!--            <span>Available Packages</span>-->
<!--          </div>-->
<!--        </template>-->
<!--        <el-form-item>-->
<!--          <div style="width: 100%">-->
<!--            <el-table :data="form.packages">-->
<!--              <el-table-column prop="name" label="Name"/>-->
<!--              <el-table-column prop="description" label="Description"/>-->
<!--              <el-table-column label="Price">-->
<!--                <template #default="scope">-->
<!--                  {{-->
<!--                    '$' + scope.row.price +-->
<!--                    (-->
<!--                        scope.row.chargeType == 'TRIP' ?-->
<!--                            ' / person for entire trip'-->
<!--                            : ' / person for entire night'-->
<!--                    )-->
<!--                  }}-->
<!--                </template>-->
<!--              </el-table-column>-->
<!--              <el-table-column align="right">-->
<!--                <template #default="scope">-->
<!--                  <el-button size="small"-->
<!--                             @click="form.packages.splice(scope.$index, 1)">Delete-->
<!--                  </el-button>-->
<!--                </template>-->
<!--              </el-table-column>-->
<!--            </el-table>-->
<!--            <el-button style="margin-top: 20px" :icon="Plus" @click="addPackageVisible  = true"> Add Package</el-button>-->
<!--          </div>-->
<!--        </el-form-item>-->
<!--      </el-card>-->


      <div style=" display: flex; justify-content: center; margin-top: 48px">
        <el-button style="width: 120px" @click="createTripStep = 2" type="info">Prev Step</el-button>
        <el-button style="width: 120px" type="success" @click="submitForm">Create Trip</el-button>
      </div>
    </el-form>
  </div>
  <!--  </el-card>-->

</template>

<style scoped>
</style>
