window.onload = function(){
	var cvs = document.getElementById('cvs');
	// 新建一个Slider构造函数
	function Slider(opts){
		// window对象
		this.zWin = window;
		// li长度
		this.totalNum = 7;
		// 当前li索引
		this.curIndex = 0;

		this.dom = opts.dom;

		// 初始化和绑定事件
		this.init();
		this.addEvent();
	}

	// 初始化
	Slider.prototype.init = function(){
		// window对象
		var zWin = this.zWin;

		// cvs
		var cvs = this.dom;

		cvs.style.width = zWin.innerWidth + 'px';
		cvs.style.height = zWin.innerHeight + 'px';

		var ul = document.createElement('ul');
		ul.classList.add('picList');
		ul.style.width = zWin.innerWidth + 'px';
		render(this,ul);
		cvs.appendChild(ul);
		
	};

	// 渲染dom
	function render(slider,dom){
		var zWin = slider.zWin;
		var radio = zWin.innerHeight/zWin.innerWidth;
		var template = '';
		for(var i = 1; i <= slider.totalNum; i++){
			(function(i){
				var imgObj = new Image();
				imgObj.src = 'img/'+i+'.jpg';
				imgObj.onload = function(){
					var translateX = (i-1)*100 + '%';
					if(this.height/this.width > radio){
						template += '<li style="transform: translateX('+ translateX +');" class="item"><img src="img/'+i+'.jpg" style="height: '+zWin.innerHeight+'px" /></li>';
					}else{
						template += '<li style="transform: translateX('+ translateX +');" class="item"><img src="img/'+i+'.jpg" style="width: '+zWin.innerWidth+'px" /></li>';
					}
					if(i >= slider.totalNum){
						dom.innerHTML = template;
					}
				}
			})(i);
		}
	};

	// 跳转到制定索引
	Slider.prototype.goIndex = function(index){
		// 当前索引
		var curIndex = this.curIndex;
		// 临时索引
		var tempIndex;

		// 获取li列表
		var lis = document.getElementsByTagName('li');
		var len = lis.length;

		// 如果index为数字，则直接滑动到该索引
		if(typeof index == 'number'){
			tempIndex = index;
		}else if(typeof index == 'string'){
			tempIndex = curIndex + index * 1;
		}

		// 判断索引右超出
		if(tempIndex > len - 1){
			tempIndex = len - 1;
		}else if(tempIndex < 0){ // 判断索引左超出
			tempIndex = 0;
		}

		// 保存当前索引
		this.curIndex = tempIndex;

		// 改变动画方式，实现动画过程
		lis[tempIndex].style.webkitTransition = '-webkit-transform 0.2s ease-out';
		lis[tempIndex - 1]&&(lis[tempIndex - 1].style.webkitTransition = '-webkit-transform 0.2s ease-out');
		lis[tempIndex + 1]&&(lis[tempIndex + 1].style.webkitTransition = '-webkit-transform 0.2s ease-out');

		// 改变动画后所应该的移动值
		lis[tempIndex].style.webkitTransform = 'translateX(0px)';
		lis[tempIndex - 1]&&(lis[tempIndex - 1].style.webkitTransform = 'translateX('+(-this.width)+'px)');
		lis[tempIndex + 1]&&(lis[tempIndex + 1].style.webkitTransform = 'translateX('+this.width+'px)');
	}

	// 绑定事件
	Slider.prototype.addEvent = function(){
		var handle = this;
		var zWin =handle.zWin;
		handle.width = zWin.innerWidth; 

		// 手指按下的处理事件
		var start = function(e){
			// 记录按下时间
			handle.startTime = new Date() * 1;

			// 记录按下的x、y坐标
			handle.startX = e.touches[0].pageX;
			handle.startY = e.touches[0].pageY;

			// 事件对象
			// var target = e.target
			// if(target.nodeName === 'IMG'){
			// 	target = target.parentNode;
			// }
			// handle.target = target;
		};

		// 手指滑动的处理事件
		var move = function(e){
			// 兼容android，阻止浏览器默认行为
			e.preventDefault();

			// 计算滑动偏移量
			handle.offsetX = e.touches[0].pageX - handle.startX;
			handle.offsetY = e.touches[0].pageY - handle.startY;
			
			// 当水平偏移量大于竖直偏移量时才发生左右滑动
			if(Math.abs(handle.offsetX) > Math.abs(handle.offsetY)){
				// 上一个索引
				var i = handle.curIndex - 1;
				// 下一个索引
				var nextIndex = handle.curIndex + 1;

				// 滑动动画
				// 获取li节点
				var li = document.getElementsByTagName('li');
				for(i; i <= nextIndex; i++){
					li[i]&&(li[i].style.webkitTransition = '-webkit-transform 0s ease-out');
					li[i]&&(li[i].style.webkitTransform = 'translateX('+(handle.width*(i - handle.curIndex)+handle.offsetX)+'px)');
				}
			}
		};

		// 手指松开的处理事件
		var end = function(e){
			// 兼容android，阻止浏览器默认行为
			e.preventDefault();

			// 获取手指松开时间
			handle.endTime = new Date() * 1;

			// 获取li列表
			var lis = document.getElementsByTagName('li');

			// 当手指移动时间超过300ms时，按位移计算
			if(handle.endTime - handle.startTime > 300){
				if(Math.abs(handle.offsetX) > Math.abs(handle.offsetY)){
					if(handle.offsetX >= handle.width/6){
						handle.goIndex('-1');
					}else if(handle.offsetX < 0 && handle.offsetX < -handle.width/6){
						handle.goIndex('+1');
					}else{
						handle.goIndex('0');
					}
				}else{
					handle.goIndex('0');
				}
			}else{
				// 优化
				// 快速移动翻页
				if(Math.abs(handle.offsetX) > Math.abs(handle.offsetY)){
					if(handle.offsetX > 50){
						handle.goIndex('-1');
					}else if(handle.offsetX < -50){
						handle.goIndex('+1');
					}else{
						handle.goIndex('0');
					}
				}else{
					handle.goIndex('0');
				}
			}
		};

		// 事件绑定
		cvs.addEventListener('touchstart',start);
		cvs.addEventListener('touchmove',move);
		cvs.addEventListener('touchend',end);
	};

	new Slider({
		dom: cvs
	});
};