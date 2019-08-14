<template>
  <div id="app">   
    <img src="./assets/logo.png">
    <div>冲啊，手榴弹扔了{{$store.state.count}}个</div>
    <div>炸死了{{$store.getters.killCount}}个柜子</div>
    <button style="cursor: pointer;" @click="add">来一下</button>
    <button style="cursor: pointer;" @click="addAsync">蓄力扔俩</button>
    <hr>
    <h2>Children Component</h2>
    <Children></Children>    
  </div>
</template>

<script>
import Children from './Children'
export default {
  name: 'app',
  components: {
    Children
  },
  data () {
    return {
      msg: 'Welcome to Your Vue.js App'
    }
  },
  methods: {
    add() {        
      this.$store.commit('increment',1)      
    },
    addAsync() {
      this.$store.dispatch('incrementAsync',2)
    }
  },
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 30px;
}
.t-a-l {
  text-align: left;
}
h1, h2 {
  font-weight: normal;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  display: inline-block;
  margin: 0 10px;
}

a {
  color: #42b983;
}
</style>
