import request from '@/utils/request'
export default {
  index: (query) => {
    return request({
      url: '/healths',
      method: 'get',
      params: query
    })
  },
  show: (id) => {
    return request({
      url: `healths/${id}`,
      method: 'get'
    })
  },
  update: (data) => {
    return request({
      url: `healths/${data.id}`,
      method: 'put',
      data
    })
  },
  destroy: (data) => {
    return request({
      url: `healths/${data.id}`,
      method: 'delete'
    })
  },
  store(data) {
    return request({
      url: '/healths',
      method: 'post',
      data
    })
  }
}

