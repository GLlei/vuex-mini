import Vue from 'vue'
import Vuex from './vux-mini'

Vue.use(Vuex)

const commander = {
  state: {
      num: 17
  },
  mutations: {
      fire(state, val) {        
        state.num -= 1
      }
  },
  getters:{
    fireCount(state){
      return (17-state.num) *100 
    },
    totalCount(state,getters,rootState){
      return getters.fireCount + rootState.count*2
    }
  },
  actions: {
      fireAsync(content,val) {        
        setTimeout(()=>{
          content.commit('fire', val);
        },2000)
      }
  }
}

export default new Vuex.Store({
  modules:{
    commander    
  },
  state: {
    count: 0
  },
  getters: {
    killCount(state){
      return state.count * 2
    }
  },
  mutations: {
    increment(state, n=1) {        
      state.count += n;      
    }
  },
  actions: {
    incrementAsync(content, n=1){
      setTimeout(()=>{
        content.commit('increment', n)
      },1000)
    }
  }
})