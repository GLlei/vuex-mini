# vuex-mini

> A Vue.js project

## Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build
```

For detailed explanation on how things work, consult the [docs for vue-loader](http://vuejs.github.io/vue-loader).


* 本文全部源码（可运行，有帮助请给start）
[https://github.com/GLlei/vuex-mini](https://github.com/GLlei/vuex-mini)

* 参考链接
[http://shengxinjing.cn/vue/vuex.html](http://shengxinjing.cn/vue/vuex.html)

* vuex源码
[https://github.com/vuejs/vuex](https://github.com/vuejs/vuex)
* 官方文档
[https://vuex.vuejs.org/](https://vuex.vuejs.org/)

#1. Vuex实战
---
上次文章介绍了Vue组件化之间通信的各种姿势，其中vuex基本算是终极解决方案了，这个没啥说的，直接贴代码把

所谓各大框架的数据管理框架，原则上来说，就是独立团大了，所有事都团长处理太累了，所以老李只管军事，枪弹烟酒面这些数据，交给赵政委，赵政委就是咱们的Vuex，从此以后 全团共享的数据，都必须得经过赵政委统一进行调配

我的风格就是用过的东西，都喜欢造个轮子，实战使用 只是基础而已，话不多说看代码
```
// store.js
import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)
export default new Vuex.Store({
  state: {
    count: 0
  },
  mutations: {
    increment (state,n=1) {
      state.count += n
    }
  },
  actions:{
    incrementAsync({commit}){
      setTimeout(()=>{
        commit('increment',2)
      },1000)
    }
  }
})
```
```
// main.js
import Vue from 'vue'
import App from './App.vue'
import store from './store'
Vue.config.productionTip = false

new Vue({
  store,
  render: h => h(App),
}).$mount('#app')
```
```
<template>
  <div id="app">
    <div>冲啊，手榴弹扔了{{$store.state.count}}个</div>
    <button @click="add">扔一个</button>
    <button @click="addAsync">蓄力扔俩</button>
  </div>
</template>
<script>

export default {
  name: 'app',

  methods:{
    add(){
      this.$store.commit('increment')
    },
    addAsync(){
      this.$store.dispatch('incrementAsync')
    }
  }
}
</script>
```
#2. 实现自己Vuex
---
要实现Vue，首先要实现的 就是Vue.use(Vuex)，这是vue安装插件的机制，需要Vuex对外暴露一个install方法，会把Vue传递给install这个函数，咱们来小小的测试一下下
#3. 实现插件机制
---
新建zhao(赵政委).js 对外暴露install 方法，内部在Vue的组件上挂载一个$store变量
```
class Store {
  constructor() {
    this.name = '赵政委'
  }
}


function install(Vue) {
  Vue.prototype.$store = new Store()
}
export default { Store, install }
```
```
// app.vue
<template>
  <div id="app">
  </div>
</template>
<script>

export default {
  name: 'app',
  created(){
    console.log(this.$store)
  }
}
</script>
// output Store {name: "赵政委"}
```
#4. 传递store
---
真正使用的时候，store是通过new Vue传递进来的，我们需要使用mixin在beforeCreated来挂载，这样才能通过this.$option获取传递进来的store
```

// zhao.js
class Store {
  constructor() {
    this.name = '赵政委'
  }
}

function install(Vue) {
  Vue.mixin({
    beforeCreate(){
      // 这样才能获取到传递进来的store
      // 只有root元素才有store，所以判断一下
      if(this.$options.store){
        Vue.prototype.$store = store

      }
    }
  })
  // console.log(this)
}
export default { Store, install }
```
```
// store.js
import Vue from 'vue'
import Vuex from './zhao'

Vue.use(Vuex)
export default new Vuex.Store()
```
#5. state
---
单纯的数据渲染比较easy
```
// zhao.js
class Store {
  constructor(options={}) {
    // this.name = '赵政委'
    this.state = options.state
  }
}
```
6.mutation
---
修改数据，并且需要通知到组件，这个需要数据是响应式的，我们需要Vue的响应式支持，所以这里也可以看到Vuex是和Vue强绑定的，不能脱离vue单独使用

由于install的时候会传递一个Vue，我们维护一个全局变量，就不用再import vue了，如果zhao.js单独发布，减小包体积

mutation实现也比较简单，记录一下mutation的函数，commit的时候更新数据即可
```
// zhao.js

let Vue
class Store {
  constructor(options={}) {
    // this.name = '赵政委'
    this.state = options.state || {}
    this.mutations = options.mutations || {}
  }
  commit(type,arg){
    if(!this.mutations[type]){
      console.log('不合法的mutation')
      return 
    }
    this.mutations[type](this.state,arg)
  }
}

function install(_Vue) {
  // 这样store执行的时候，就有了Vue，不用import
  // 这也是为啥 Vue.use必须在新建store之前
  Vue = _Vue
  _Vue.mixin({
    beforeCreate(){
      // 这样才能获取到传递进来的store
      // 只有root元素才有store，所以判断一下
      if(this.$options.store){
        _Vue.prototype.$store = this.$options.store

      }
    }
  })
}
export default { Store, install }
```
```
// store.js
import Vue from 'vue'
import Vuex from './zhao'

Vue.use(Vuex)
export default new Vuex.Store({
  state:{
    count:0
  },
  mutations:{
    increment (state,n=1) {
      state.count += n
    }
  }
})
```
#7. 响应式state
>每次点击 count都变了，页面并没有相应
>想响应式通知到页面，最方面的莫过于使用Vue的响应式机制，让state编程相应式
```
 this.state = new Vue({
      data:options.state
    })
```
#8. action
---
异步actions，mutation 必须同步执行这个限制么？Action 就不受约束！由于有异步任务，commit单独执行，所以需要用箭头函数，确保内部的this指向
```
let Vue
class Store {
  constructor(options={}) {
    // this.name = '赵政委'
    this.state = new Vue({
      data:options.state
    })
    this.mutations = options.mutations || {}
    this.actions = options.actions
  }
  commit = (type,arg)=>{
    this.mutations[type](this.state,arg)
  }
  dispatch(type, arg){
    this.actions[type]({
      commit:this.commit,
      state:this.state
    }, arg)
  }
}

```
#9. getter
---
类似computed，实现也不难 ,使用Object.defineProperty代理一个getter即可，获取getter内部的值，直接执行函数计算。挂载在store.getters之上
```
 handleGetters(getters){
    this.getters = {}
    Object.keys(getters).forEach(key=>{
      Object.defineProperty(this.getters,key,{
        get:()=>{
          return getters[key](this.state)
        }
      })

    })
  }
```
```
//store.js
  state:{
    count:0
  },
  getters:{
    killCount(state){
      return state.count * 2
    }
  },
```
```
<!-- html -->
<div>炸死了{{$store.getters.killCount}}个柜子</div>
```
#10. modules
vuex支持拆包，每个module有自己的state，getter，mutations，和actions，所以需要专门引入喝安装modules，并且递归支持深层嵌套，之前的handleGetters之类的东东，每个module都得执行一下

深层次嵌套，state需要getter代理一下
#11. 注册modules
---
挂载到root上
```
register(path, module){
    const newModule = {
      children: {},
      module: module,
      state: module.state
    }
    if(path.length){
      // path有值，子模块
      const parent = path.slice(0, -1).reduce((module, key) => {
        return module.children(key);
      }, this.root);
      parent.children[path[path.length - 1]] = newModule;
    }else{
      // 空 就是根目录
      this.root = newModule
    }
    if(module.modules){
      this.forEachObj(module.modules,(name,mod)=>{
        // console.log(123,name,mod)
        this.register([...path,name],mod)
      })
    }
  }
```
#12. 启动modules
---
```
installModules(state,path,module){
    // 安装所有的module的mutation，actions，
    if(path.length>0){
      const moduleName = this.last(path);
    // 默认名字都注册在一个命名空间里
      Vue.set(state, moduleName,module.state)
    }
    
    this.forEachObj(module.children, (key,child)=>{
      this.installModules(state, [...path,key],child)
    })
  }
```

```
constructor(options={}) {
    // this.name = '赵政委'
    this._vm = new Vue({
      data:{
        state:options.state
      }
    })
    // 根模块
    this.root = null
    this.mutations = options.mutations || {}
    this.actions = options.actions
    this.handleGetters(options.getters)
    // 注册一下module，递归，变成一个大的对象 挂载到root
    this.register([], options)
    this.installModules(options.state, [], this.root)
    // this.installModules(options.modules)

    
  }
  get state(){
    return this._vm._data.state
  }
```

```
installModules(state,path,module){
    // 安装所有的module的mutation，actions，
    if(path.length>0){
      const moduleName = this.last(path);
    // 默认名字都注册在一个命名空间里
      Vue.set(state, moduleName,module.state)
    }
    // 设置上下文，获取state要遍历 path
    const context = {
      dispatch: this.dispatch,
      commit: this.commit,
    }
    Object.defineProperties(context, {
      getters: {
        get: () => this.getters
      },
      state: {
        get: () => {
          let state = this.state;
          return path.length ? path.reduce((state, key) => state[key], state) : state
        }
      }
    })
    // 注册mutations 传递正确的state
    this.registerMutations(module.module.mutations,context)
    // 注册action
    this.registerActions(module.module.actions,context)

    // 注册getters
    this.registerGetters(module.module.getters,context)

    // 递归
    this.forEachObj(module.children, (key,child)=>{
      this.installModules(state, [...path,key],child)
    })
  }
```
#13. mapState
---
其实很简单，直接返回对应的值就可以了，computed内部可以通过this.$store拿到，代码就呼之欲出了
```
function mapState(obj){
  const ret = {}
  Object.keys(obj).forEach((key)=>{
    // 支持函数
    let val = obj[key]
    ret[key] = function(){
      const state = this.$store.state
      return typeof val === 'function'
                          ? val.call(this, state)
                          : state[val]
    } 

  })
  return ret
}
```
#14. mapMutations
---

```
function mapMutations(mutations){
  const ret = {}
  mutations.forEach((key)=>{
    ret[key] = function(){
      const commit = this.$store.commit
      commit(key)
    } 

  })
  return ret
}
```