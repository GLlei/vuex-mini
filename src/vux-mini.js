
let Vue

class Store {
  constructor(options={}) {  
    this._vm = new Vue({
      data: {
        state: options.state
      }
    })   
    this.root = null;
    this.mutations = {};
    this.actions = {};
    this.getters = {};
    const store = this;
    const { dispatch, commit } = this

    // 改变this指向
    this.commit = function boundCommit (type, arg) {
      return commit.call(store, type, arg);
    }
    this.dispatch = function boundDispatch (type, arg){
      return dispatch.call(store, type, arg);
    }
    this.register([],options);
    this.installModules(options.state, [], this.root)
  }
  get state() {
    return this._vm._data.state;
  }
  register(path, module) {
    const newModule = {
      children: {},
      module: module,
      state: module.state
    }
    if ( path.length ) {      
        const parent = path.slice(0, -1).reduce((module, key)=>{          
          return module.children[key];
        }, this.root)
        parent.children[path[path.length-1]] = newModule;
    } else {
      this.root = newModule;
    }

    if ( module.modules ) {
      this.forEachObj(module.modules,(name,mod)=>{          
        this.register([...path,name],mod)
      })
    }
  }
  forEachObj(obj={},fn) {
    Object.keys(obj).forEach(key=>{
      fn(key, obj[key])
    })
  }
  commit(type,arg) {      
    if ( !this.mutations[type]) {
      console.log('不合法的mutation')
      return      
    }
    this.mutations[type](this.state,arg);
  }
  dispatch(type, arg) {
    if ( !this.actions[type]) {
      console.log('不合法的action')
      return      
    }
        
    this.actions[type]({
      commit: this.commit,
      state: this.state,
      mutations: this.mutations
    }, arg)
  }
  last(arr) {
    return arr[arr.length - 1]
  }
  installModules(state, path, module) {    
    if ( path.length>0) {
      const moduleName = this.last(path);
      Vue.set(state, moduleName, module.state)
    }

    const context = {
      dispatch: this.dispatch,
      commit: this.commit
    }
    Object.defineProperties(context,{
      getters: {
        get:()=> this.getters
      },
      state:{
        get:()=> {
          let state = this.state;
          return path.length ? path.reduce((state,key)=>state[key], state) : state
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
  handleGetters(getters){
    Object.keys(getters).forEach(key=>{
      Object.defineProperty(this.getters,key,{
        get:()=>{
          return getters[key](this.state)
        }
      })
    })
  }
  registerGetters(getters, context){
    this.forEachObj(getters,(key,getter)=>{
      Object.defineProperty(this.getters,key,{
        get:()=>{
          return getter(
            // module的state
            context.state,
            context.getters,
            // 最外层的store
            this.state
          )
        }
      })
    })
  }
  registerMutations(mutations, context){
    if(mutations){
      this.forEachObj(mutations, (key,mutation)=>{        
        this.mutations[key] = (state, arg)=>{          
          mutation.call(this, context.state, arg)
        }
      })      
    }
  }
  registerActions(actions,context){
    if(actions){
      this.forEachObj(actions, (key,action)=>{
        this.actions[key] = (context,val)=>{
          action.call(this, context, val)
        }
      })
    }
  }
}

function install(_Vue) {  
  Vue = _Vue;
  _Vue.mixin({
    beforeCreate() {      
      if ( this.$options.store) {
        _Vue.prototype.$store = this.$options.store;        
      }
    }
  })  
}

export default { Store, install }