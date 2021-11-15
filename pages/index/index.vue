<template>
	<view class="bg-img">
		<canvas type="webgl" id="webgl" style="width: 100%; height: 90vh;"></canvas>
		<button @click="openBox">试试效果</button>
	</view>
</template>

<script>
	import {
		createScopedThreejs
	} from '@/common/threejs'

	import {
		renderCube
	} from '@/common/test-cases/cube'
	import {
		renderCubes
	} from '@/common/test-cases/cubes'
	import {
		renderSphere
	} from '@/common/test-cases/sphere'
	import {
		renderModel
	} from '@/common/test-cases/model'
	
	import {
		renderBox
	} from '@/common/test-cases/box_ex'

	export default {
		data(){
			return {
				box: null
			}
		},
		onLoad: function() {
			uni.createSelectorQuery()
				.select('#webgl')
				.node()
				.exec((res) => {
					const canvas = res[0].node
					const THREE = createScopedThreejs(canvas)

					// renderSphere(canvas, THREE)
					// renderCube(canvas, THREE)
					// renderCubes(canvas, THREE)
					this.box = renderBox(canvas, THREE)
				})
		},
		methods:{
			openBox(){
				this.box.open()
			}
		}
	}
</script>

<style>
	.content {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		
	}
	.bg-img {
		width: 100%;
		height: 100%;
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		background: url('https://wxapi.qtwo.online/minipro/img/auction_bg.png');
		background-size: 100% 100%;
	}

	.logo {
		height: 200rpx;
		width: 200rpx;
		margin-top: 200rpx;
		margin-left: auto;
		margin-right: auto;
		margin-bottom: 50rpx;
	}

	.text-area {
		display: flex;
		justify-content: center;
	}

	.title {
		font-size: 36rpx;
		color: #8f8f94;
	}
</style>
