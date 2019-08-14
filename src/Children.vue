<template>
    <div>
      <p> 意大利炮还有{{$store.state.commander.num}}发炮弹 </p>
      <p> 意大利炮炸死了{{$store.getters.fireCount}}个鬼子 和手榴弹一起是{{$store.getters.totalCount}} </p>
      <button @click="fire">开炮</button>
      <button @click="fireAsync">一会再开炮</button>
    </div>
</template>

<script>
export default {
  name: 'pageA',
  mounted(){
  },
  methods:{
    fire(){      
      this.$store.commit('fire')
    },
    fireAsync(){
      this.$store.dispatch('fireAsync')
    }
  }
}
</script>
