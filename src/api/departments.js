import request from '@/utils/request'
export default {
  index: (query) => {
    return request({
      url: '/departments',
      method: 'get',
      params: query
    })
  },
  show: (id) => {
    return request({
      url: `departments/${id}`,
      method: 'get'
    })
  },
  update: (data) => {
    return request({
      url: `departments/${data.id}`,
      method: 'put',
      data
    })
  },
  destroy: (data) => {
    return request({
      url: `departments/${data.id}`,
      method: 'delete'
    })
  },
  store(data) {
    return request({
      url: '/departments',
      method: 'post',
      data
    })
  }
}

