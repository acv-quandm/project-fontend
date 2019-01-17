<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input :placeholder="$t('table.query')" v-model="listQuery.query" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter"/>
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">{{ $t('table.search') }}</el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">{{ $t('table.add') }}</el-button>
      <el-button v-waves :loading="uploadLoading" class="filter-item" type="primary" icon="el-icon-upload" @click="handleUpload">{{ $t('table.upload') }}</el-button>
      <el-checkbox v-model="showReviewer" class="filter-item" style="margin-left:15px;" @change="tableKey=tableKey+1">{{ $t('table.reviewer') }}</el-checkbox>
    </div>
    <el-table
      v-loading="listLoading"
      :key="tableKey"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%;"
      @sort-change="sortChange">
      <el-table-column :label="$t('table.id')" prop="id" sortable="custom" align="center" width="65">
        <template slot-scope="scope">
          <span>{{ scope.row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.lecturerName')" min-width="150px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.lecturerAddress')" min-width="150px">
        <template slot-scope="scope">
          <span class="link-type" @click="handleUpdate(scope.row)">{{ scope.row.title }}</span>
          <el-tag>{{ scope.row.address }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.department')" min-width="100px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.department | filterDepartmentName }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.lecturerEmail')" class-name="status-col" min-width="150px">
        <template slot-scope="scope">
          <span>{{ scope.row.email }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.actions')" align="center" class-name="small-padding fixed-width" min-width="200px">
        <template slot-scope="scope">
          <el-button type="primary" size="mini" @click="handleUpdate(scope.row)">{{ $t('table.edit') }}</el-button>
          <el-button type="info" size="mini" @click="handleAddHealths(scope.row)">{{ $t('table.add_health_profile') }}</el-button>
          <el-button type="info" size="mini" @click="handleShowHealths(scope.row)">{{ $t('table.health_history') }}</el-button>
          <el-button size="mini" type="danger" @click="handleShowModalDelete(scope.row) ">{{ $t('table.delete') }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" top="12vh" width="1200px">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="200px" style="width: 100%;" @submit.prevent="dialogStatus==='create'?createData():updateData()">
        <el-form-item :label="$t('table.lecturerName')" prop="title">
          <el-input v-model="temp.name"/>
        </el-form-item>
        <el-form-item :label="$t('table.lecturerAddress')" prop="title">
          <el-input v-model="temp.address"/>
        </el-form-item>
        <el-form-item :label="$t('table.email')" prop="type">
          <el-input v-model="temp.email"/>
        </el-form-item>
        <el-form-item :label="$t('table.lecturerPhoneNumber')" prop="title">
          <el-input v-model="temp.phone_number"/>
        </el-form-item>
        <el-form-item :label="$t('table.departments')" prop="type">
          <el-select v-model="temp.department_id" class="filter-item" placeholder="Please select">
            <el-option v-for="department in departments" :key="department.id" :label="department.name" :value="department.id"/>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('table.birthday')" prop="timestamp">
          <el-date-picker v-model="temp.birthday" type="date" placeholder="Please pick a date"/>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">{{ $t('table.cancel') }}</el-button>
        <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">{{ $t('table.confirm') }}</el-button>
      </div>
    </el-dialog>
    <el-dialog :visible.sync="dialogDeleteVisible" title="Xóa giảng viên này">
      <p>Bạn đồng ý xóa chứ?</p>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="dialogDeleteVisible = false;handleDelete()">{{ $t('table.confirm') }}</el-button>
      </span>
    </el-dialog>
    <el-dialog :visible.sync="dialogHealthHistoryVisible" width="70%" title="Lịch sử khám chữa bệnh">
      <template v-if="healthsTemp.length > 0">
        <div ref="history-healths" class="page-healths" @scroll="handleScrollEvent">

          <div class="timeline">
            <template v-for="(healthTemp,index) in healthsTemp">
              <div :key="index" class="timeline__group">
                <span class="timeline__year">{{ healthTemp.year }}</span>
                <template v-if="healthTemp.data != undefined">
                  <div v-for="(health,indexHealth) in healthTemp.data" :key="indexHealth" class="timeline__box">
                    <div class="timeline__date">
                      <span class="timeline__day">{{ health.updated_at | filterGetDay }}</span>
                      <span class="timeline__month">{{ health.updated_at | filterGetMonth }}</span>
                    </div>
                    <div class="timeline__post">
                      <div class="timeline__content">
                        <b>Triệu chứng</b>
                        <p>{{ health.symptom }}.</p>
                        <b>Chẩn đoán</b>
                        <p>{{ health.diagnose }}.</p>
                        <b>Kết quả</b>
                        <p>{{ health.diagnose }}.</p>
                        <b>Đơn thuốc</b>
                        <p v-for="(drug,indexDrug) in health.drugs" :key="indexDrug">{{ drug.name }} <span>{{ drug.uses }}</span></p>
                      </div>
                    </div>
                  </div>
                </template>
              </div>
            </template>
          </div>
          <Loader :loading="tempHealths.loading" />
        </div>
      </template>
      <template v-else>
        <span>Không có dữ liệu để hiển thị</span>
      </template>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary">{{ $t('table.confirm') }}</el-button>
      </span>
    </el-dialog>

    <el-dialog :visible.sync="dialogUpload" width="70%" title="Tải file lên">
      <div class="editor-container">
        <dropzone
          id="myVueDropzone"
          default-msg="Vui lòng chọn file excel"
          url="http://localhost:8000"
          @dropzone-removedFile="dropzoneR"
          @dropzone-success="dropzoneS"/>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary">{{ $t('table.confirm') }}</el-button>
      </span>
    </el-dialog>
    <el-dialog :visible.sync="dialogShowAddHealth" width="70%" title="Thêm hồ sơ bệnh án">
      <el-form ref="dataFormAddHealth" :rules="rulesAddHealth" :model="tempHealthAdd" label-position="left" label-width="200px" style="width: 100%;" @submit.prevent="createHealth()">
        <el-form-item :label="$t('table.symptom')" prop="symptom">
          <textarea v-model="tempHealthAdd.symptom" style="width: 100%" rows="5"/>
        </el-form-item>
        <el-form-item :label="$t('table.diagnose')" prop="diagnose">
          <textarea v-model="tempHealthAdd.diagnose" style="width: 100%" rows="5"/>
        </el-form-item>
        <el-form-item :label="$t('table.result')" prop="title">
          <textarea v-model="tempHealthAdd.result" style="width: 100%" rows="5"/>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogShowAddHealth = false">{{ $t('table.cancel') }}</el-button>
        <el-button type="primary">{{ $t('table.confirm') }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import Lecturers from '@/api/lecturers'
import Departments from '@/api/departments'
import Healths from '@/api/healths'
import waves from '@/directive/waves' // Waves directive
import { parseTime } from '@/utils'
import Loader from '@/components/Loader'
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination
import moment from 'moment'
import Dropzone from '@/components/Dropzone'
export default {
  name: 'ComplexTable',
  components: { Dropzone, Pagination, Loader },
  directives: { waves },
  filters: {
    statusFilter(status) {
      const statusMap = {
        published: 'success',
        draft: 'info',
        deleted: 'danger'
      }
      return statusMap[status]
    },
    filterDepartmentName(department) {
      if (department != null) {
        return department.name
      }
      return null
    },
    filterUser(user) {
      if (user != null) {
        return user.email
      }
      return null
    },
    filterGetYear(dateTime) {
      return moment(dateTime).format('YYYY')
    },
    filterGetMonth(dateTime) {
      return moment(dateTime).format('MMM')
    },
    filterGetDay(dateTime) {
      return moment(dateTime).format('DD')
    }
  },
  data() {
    return {
      dialogUpload: false,
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20,
        query: undefined,
        sort: '+id'
      },
      importanceOptions: [1, 2, 3],
      departments: [],
      sortOptions: [{ label: 'ID Ascending', key: '+id' }, { label: 'ID Descending', key: '-id' }],
      statusOptions: ['published', 'draft', 'deleted'],
      showReviewer: false,
      temp: {
        id: undefined,
        name: null,
        email: null,
        address: null,
        phone_number: null,
        department_id: null,
        birthday: null,
        department: null
      },
      tempHealths: {
        data: [],
        page: 1,
        loading: false,
        block: false
      },
      tempHealthAdd: {
        lecturer_id: null,
        symptom: null,
        diagnose: null,
        result: null
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: 'Cập nhật thông tin giảng viên',
        create: 'Thêm mới một giảng viên'
      },
      dialogDeleteVisible: false,
      dialogHealthHistoryVisible: false,
      pvData: [],
      rules: {
        name: [{ required: true, message: 'Tên  không được để trống', trigger: 'change', type: 'email' }],
        address: [{ required: true, message: 'Địa chỉ không được để trống', trigger: 'change' }],
        phone_number: [{ required: true, message: 'Số điện thoại  không được để trống', trigger: 'change' }],
        department_id: [{ required: true, message: 'Bộ môn không được để trống', trigger: 'change' }],
        birthday: [{ required: true, message: 'Ngày sinh không được để trống', trigger: 'change' }]
      },
      uploadLoading: false,
      dialogShowAddHealth: false
    }
  },
  computed: {
    healthsTemp() {
      const vm = this
      const years = []
      const results = []
      if (this.tempHealths.data !== undefined) {
        this.tempHealths.data.forEach(item => {
          if (!years.includes(moment(item.updated_at).format('YYYY'))) {
            years.push(moment(item.updated_at).format('YYYY'))
          }
        })
        years.forEach(year => {
          results.push({
            year: year,
            data: vm.tempHealths.data.filter(item => {
              return year === moment(item.updated_at).format('YYYY')
            })
          })
        })
      }
      return results
    }
  },
  created() {
    this.getList()
    this.getDepartments()
  },
  methods: {
    createHealth() {

    },
    handleAddHealths(row) {
      this.dialogShowAddHealth = true
      this.tempHealthAdd.lecturer_id = row.id
    },
    dropzoneR() {

    },
    dropzoneS() {

    },
    getList() {
      this.listLoading = true
      Lecturers.index(this.listQuery).then(response => {
        this.list = response.data.data
        this.total = response.data.total
        this.listLoading = false
      })
    },
    getDepartments() {
      Departments.index({
        limit: 5000000
      }).then(response => {
        this.departments = response.data.data
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    sortChange(data) {
      const { prop, order } = data
      if (prop === 'id') {
        this.sortByID(order)
      }
    },
    sortByID(order) {
      if (order === 'ascending') {
        this.listQuery.sort = '+id'
      } else {
        this.listQuery.sort = '-id'
      }
      this.handleFilter()
    },
    resetTemp() {
      this.temp = {
        id: undefined,
        name: null,
        address: null,
        phone_number: null,
        department_id: null,
        user_id: null,
        birthday: null
      }
    },
    resetTempHealth() {
      this.tempHealths = {
        data: [],
        page: 1,
        loading: false,
        block: false
      }
    },
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const insert = JSON.parse(JSON.stringify(this.temp))
          insert.birthday = moment(insert.birthday).format('YYYY-MM-DD')
          Lecturers.store(insert).then(() => {
            insert.department = this.departments.find(item => {
              return item.id === insert.department_id
            })
            this.list.unshift(insert)
            this.dialogFormVisible = false
            this.$notify({
              title: 'Thành công',
              message: 'Thêm mới thành công',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    handleUpdate(row) {
      this.temp = Object.assign({}, row) // copy obj
      this.temp.timestamp = new Date(this.temp.timestamp)
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    handleShowHealths(row) {
      const vm = this
      vm.temp = JSON.parse(JSON.stringify(row))
      vm.resetTempHealth()
      Healths.index({
        lecturer_id: row.id
      }).then(response => {
        vm.tempHealths.data = response.data.data
        vm.dialogHealthHistoryVisible = true
      }).catch(err => {
        console.log(err)
      })
    },
    handleShowModalDelete(row) {
      this.temp = row
      this.dialogDeleteVisible = true
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          tempData.birthday = moment(tempData.birthday).format('YYYY-MM-DD')
          Lecturers.update(tempData).then(() => {
            for (const v of this.list) {
              if (v.id === this.temp.id) {
                const index = this.list.indexOf(v)
                this.list.splice(index, 1, this.temp)
                break
              }
            }
            this.dialogFormVisible = false
            this.$notify({
              title: 'Thành công',
              message: 'Cập nhật thông tin giảng viên thành công',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    handleDelete() {
      const row = this.temp
      Lecturers.destroy(row).then(response => {
        const index = this.list.indexOf(row)
        this.list.splice(index, 1)
        this.$notify({
          title: 'Thành công',
          message: 'Xóa thành công',
          type: 'success',
          duration: 2000
        })
        this.resetTemp()
      })
    },
    handleFetchPv(pv) {
      Lecturers.index(pv).then(response => {
        this.pvData = response.data.pvData
        this.dialogDeleteVisible = true
      })
    },
    handleUpload() {
      this.dialogUpload = true
      // this.uploadLoading = true
      // import('@/vendor/Export2Excel').then(excel => {
      //   const tHeader = ['timestamp', 'title', 'type', 'importance', 'status']
      //   const filterVal = ['timestamp', 'title', 'type', 'importance', 'status']
      //   const data = this.formatJson(filterVal, this.list)
      //   excel.export_json_to_excel({
      //     header: tHeader,
      //     data,
      //     filename: 'table-list'
      //   })
      //   this.uploadLoading = false
      // })
    },
    handleScrollEvent(e) {
      const container = this.$refs['history-healths']
      const vm = this
      if (container.scrollTop + container.clientHeight >= container.scrollHeight - 10 && vm.tempHealths.block === false) {
        vm.tempHealths.page++
        vm.tempHealths.loading = true
        Healths.index({
          lecturer_id: vm.temp.id,
          page: vm.tempHealths.page
        }).then(response => {
          if (response.data.data !== undefined) {
            vm.tempHealths.loading = false
            container.scrollTop = container.scrollHeight - 100
            if (response.data.data.length > 0) {
              vm.tempHealths.data.push(response.data.data)
            } else {
              vm.tempHealths.block = true
              setTimeout(function() {
                vm.tempHealths.block = false
              }, 300000)
            }
          }
        }).catch(err => {
          console.log(err)
          vm.tempHealths.loading = false
          container.scrollTop = container.scrollHeight - 100
        })
      }
    },
    formatJson(filterVal, jsonData) {
      return jsonData.map(v => filterVal.map(j => {
        if (j === 'timestamp') {
          return parseTime(v[j])
        } else {
          return v[j]
        }
      }))
    }
  }
}
</script>
<style>
  /*
Hi! If my code is useful for you can you donate me some money?
https://www.paypal.me/melnik909
*/

  .timeline{
    --uiTimelineMainColor: var(--timelineMainColor, #222);
    --uiTimelineSecondaryColor: var(--timelineSecondaryColor, #fff);

    position: relative;
    padding-top: 3rem;
    padding-bottom: 3rem;
  }

  .timeline:before{
    content: "";
    width: 4px;
    height: 100%;
    background-color: var(--uiTimelineMainColor);

    position: absolute;
    top: 0;
  }

  .timeline__group{
    position: relative;
  }

  .timeline__group:not(:first-of-type){
    margin-top: 4rem;
  }

  .timeline__year{
    padding: .5rem 1.5rem;
    color: var(--uiTimelineSecondaryColor);
    background-color: var(--uiTimelineMainColor);

    position: absolute;
    left: 0;
    top: 0;
  }

  .timeline__box{
    position: relative;
  }

  .timeline__box:not(:last-of-type){
    margin-bottom: 30px;
  }

  .timeline__box:before{
    content: "";
    width: 100%;
    height: 2px;
    background-color: var(--uiTimelineMainColor);

    position: absolute;
    left: 0;
    z-index: -1;
  }

  .timeline__date{
    min-width: 65px;
    position: absolute;
    left: 0;

    box-sizing: border-box;
    padding: .5rem 1.5rem;
    text-align: center;

    background-color: var(--uiTimelineMainColor);
    color: var(--uiTimelineSecondaryColor);
  }

  .timeline__day{
    font-size: 2rem;
    font-weight: 700;
    display: block;
  }

  .timeline__month{
    display: block;
    font-size: .8em;
    text-transform: uppercase;
  }

  .timeline__post{
    padding: 1.5rem 2rem;
    border-radius: 2px;
    border-left: 3px solid var(--uiTimelineMainColor);
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, .12), 0 1px 2px 0 rgba(0, 0, 0, .24);
    background-color: var(--uiTimelineSecondaryColor);
  }

  @media screen and (min-width: 641px){

    .timeline:before{
      left: 30px;
    }

    .timeline__group{
      padding-top: 55px;
    }

    .timeline__box{
      padding-left: 80px;
    }

    .timeline__box:before{
      top: 50%;
      transform: translateY(-50%);
    }

    .timeline__date{
      top: 50%;
      margin-top: -27px;
    }
  }

  @media screen and (max-width: 640px){

    .timeline:before{
      left: 0;
    }

    .timeline__group{
      padding-top: 40px;
    }

    .timeline__box{
      padding-left: 20px;
      padding-top: 70px;
    }

    .timeline__box:before{
      top: 90px;
    }

    .timeline__date{
      top: 0;
    }
  }

  .timeline{
    --timelineMainColor: #4557bb;
    font-size: 16px;
  }

  @media screen and (min-width: 768px){

    html{
      font-size: 62.5%;
    }
  }

  @media screen and (max-width: 767px){

    html{
      font-size: 55%;
    }
  }

  /*
  * demo page
  */
    /*
    page-health
    */
.page-healths{
    height: 500px;
    overflow-y: scroll;
    padding-right: 10px;
    margin-right: -20px;
}
  .page-healths::-webkit-scrollbar-track
  {
      -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.1);
      background-color: #F5F5F5;
      border-radius: 3px;
  }

  .page-healths::-webkit-scrollbar
  {
      width: 3px;
      background-color: #F5F5F5;
  }

  .page-healths::-webkit-scrollbar-thumb
  {
      border-radius: 3px;
      background-color: #FFF;
      background-image: -webkit-gradient(linear,
      40% 0%,
      75% 84%,
      from(#ddd),
      to(#ddd),
      color-stop(.6,#54DE5D))
  }
</style>
