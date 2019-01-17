import request from '@/utils/request'
export default {
  index: (query) => {
    return request({
      url: '/lecturers',
      method: 'get',
      params: query
    })
  },
  show: (id) => {
    return request({
      url: `lecturers/${id}`,
      method: 'get'
    })
  },
  update: (data) => {
    return request({
      url: `lecturers/${data.id}`,
      method: 'put',
      data
    })
  },
  destroy: (data) => {
    return request({
      url: `lecturers/${data.id}`,
      method: 'delete'
    })
  },
  store(data) {
    return request({
      url: '/lecturers',
      method: 'post',
      data
    })
  }
}

