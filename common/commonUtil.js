/**
 * commonUtil.js
 * commonUtil核心js文件
 * build by rwson @2015-05-26
 * @update by rwson 完善解除事件绑定
 **/

!function(win,dom,undefined){
    var commonUtil = {};
//  命名空间

    /**
     *
     * @param name      接口名,字符串
     * @param methods   需要实现的方法,接收方法的集合、数组
     * @constructor
     * Class Interface
     * 接口类
     */
    commonUtil.Interface = function(name, methods) {
        //  判断接口的参数个数
        if (arguments.length != 2) {
            throw new Error("this instance interface constructor required 2 arguments!");
        }
        this.name = name;
        this.methods = [];
        //  定义一个空数组,等待接收methods里面的方法名
        for (var i = 0, len = methods.length; i < len; i++) {
            if (typeof methods[i] !== "string") {
                throw new Error("the Instance method name is error!");
            }
            this.methods.push(methods[i]);
        }
    };

    /**
     * @param object
     * Interface Static method
     * 检验方法,如果通过,不做任何操作,否则抛出异常
     */
    commonUtil.Interface.ensureImplement = function (object) {
        //  至少得实现一个接口
        if (arguments.length < 2) {
            throw new Error("Interface.ensureImplement constructor arguments must be 2 or more arguments!");
        }
        //  获得接口实例对象
        for (var i = 1, len = arguments.length; i < len; i++) {
            var instanceInterface = arguments[i];
            //  判断参数是否为接口类的
            if (!(instanceInterface instanceof commonUtil.Interface)) {
                throw new Error("the arguments" + instanceInterface + "is not an instance of Interface Class");
            }
            //  循环接口实例对象里面的每个方法
            for (var j = 0; j < instanceInterface.methods.length; j++) {
                var methodName = instanceInterface.methods[j];
                //  接收每个方法的名字(字符串)
                if (!arguments[0][methodName] || typeof arguments[0][methodName] !== "function") {
                    throw new Error("the method " + methodName + " is not found");
                }
                //  不存在或者不是方法类型
            }
        }
    };

    /**
     * @param sub 子类
     * @param sup 父类
     * 实现子类对父类原型的继承
     */
    commonUtil.extend = function(sub,sup){
        //  目的:只继承父类的原型对象

        //  用一个空函数进行中转
        var F = new Function();
        //  空函数的原型对象和超类的原型对象转换
        F.prototype = sup.prototype;
        //  原型继承
        sub.prototype = new F();
        //  还原构造器
        sub.prototype.constructor = sub;    //  指定子类构造方法
        //  保存父类的原型对象 1.解耦方便,降低耦合性 2.方便获得父类的原型对象
        sub.superClass = sup.prototype; //  自定义子类的静态属性,接收父类的原型对象
        //  判断父类原型对象的构造器是否为父类本身,如果不是,手动还原构造器
        if(sup.prototype.constructor == Object.prototype.constructor){
            sup.prototype.constructor = sup;
        }
    };


    /**
     * @param obj
     * @param val
     * 实现对象的拓展
     */
    commonUtil.wrap = function(obj,val){
        for(var i in val){
            val[i] && (obj[i] = val[i]);
        }
    };

//  跨浏览器的事件处理程序
    commonUtil.EventUtil = {
        /**
         * @param el        HTML DOM Object
         * @param type      事件类型
         * @param callback  处理函数
         * 绑定事件
         */
        "addHandle":function(el,type,callback){
            if(el.addEventListener){
                el.addEventListener(type,function(ev){
                    var oEv = ev || event;
                    callback && typeof callback === "function" && callback(true,oEv);
                },false);
            }else if(el.attachEvent){
                el.attachEvent(type,function(ev){
                    var oEv = ev || event;
                    callback && typeof callback === "function" && callback(true,oEv);
                });
            }
        },

        /**
         * @param el        HTML DOM Object
         * @param type      事件类型
         * @param callback  处理函数
         * 移除事件
         */
        "removeHandle":function(el,type,callback){
            if(el.addEventListener){
                el.removeEventListener(type,function(ev){
                    var oEv = ev || event;
                    callback && typeof callback === "function" && callback.call(true,oEv);
                },false);
            }else if(el.detachEvent){
                el.detachEvent("on" + type,function(ev){
                    var oEv = ev || event;
                    callback && typeof callback === "function" && callback.call(true,oEv);
                });
            }else{
                el["on" + type] = null;
                callback && typeof callback === "function" && callback.call(true,oEv);
            }
        }
    };

    commonUtil.dataUtil = {
        /**
         * @param arg
         * @returns {string}
         * 判断具体的类型,比typeof靠谱,且返回值类型和typeof一样都为小写
         */
        "getType":function(arg){
            var type = "",
                _getFn = Object.prototype.toString;
            if(typeof arg === typeof undefined){
                type = "undefined";
            }else if(!arg && typeof arg !== typeof undefined && arg != 0){
                type = "null";
            }
            type = _getFn.call(arg).toLocaleLowerCase().replace(/\[|\s|object|\]/g,"");
            return type;
        }
    };

    /**
     * 实现便利
     * @param fn
     * @returns {Array}
     */
    Array.prototype.each = function(fn){
        try{
            this.index || (this.index = 0);
            //计数器存储当前遍历位置
            (this.length > 0 && fn.constructor == Function) && function(i,l,a){
                while(i < l){
                    var item = a[i];
                    //  获取数组的每一项
                    (item && item.constructor == Array) && function(){
                        item.each(fn);
                    }();

                    //  如果当前数组是个数组,继续递归操作
                    !(item && item.constructor == Array) && function(){
                        //  fn.apply(true,[a,i,e]);
                        /**
                         *  @param item 当前的这一项
                         *  @param i    当前这一项的下标
                         *  @param e    当前数组
                         */
                        fn.call(true,item,i,a);
                        //  数组的当前元素传递给fn,并执行fn
                        item = null;
                    }();

                    i ++;
                }
                //  遍历数组
            }(this.index,this.length,this);
            //  当数组长度大于0,再进入主方法体

        }catch (e){}

        return this;
        //  返回当前调用方法对象,方便后面继续跟方法,执行链式操作
    };

    win.commonUtil = commonUtil;

}(window,document);