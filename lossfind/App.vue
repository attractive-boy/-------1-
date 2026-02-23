<script>
	export default {
		onLaunch: function() {
			console.log('App Launch')
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		}
	}
</script>

<style>
	/* 全局公共样式 */
	page {
		background-color: #F5F7FA;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
	}

	.container {
		padding: 20rpx;
	}

	/* 通用卡片 */
	.card {
		background: #ffffff;
		border-radius: 16rpx;
		padding: 24rpx;
		margin-bottom: 20rpx;
		box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
	}

	/* 通用按钮 */
	.btn-primary {
		background: #4A90D9;
		color: #ffffff;
		border-radius: 12rpx;
		border: none;
		font-size: 28rpx;
	}
	.btn-primary::after {
		border: none;
	}
	.btn-default {
		background: #f0f0f0;
		color: #333333;
		border-radius: 12rpx;
		border: none;
		font-size: 28rpx;
	}
	.btn-default::after {
		border: none;
	}
	.btn-danger {
		background: #F56C6C;
		color: #ffffff;
		border-radius: 12rpx;
		border: none;
		font-size: 28rpx;
	}
	.btn-danger::after {
		border: none;
	}

	/* 状态标签 */
	.tag {
		display: inline-block;
		padding: 4rpx 16rpx;
		border-radius: 20rpx;
		font-size: 22rpx;
	}
	.tag-info  { background: #ECF5FF; color: #409EFF; }
	.tag-success { background: #F0F9EB; color: #67C23A; }
	.tag-danger { background: #FEF0F0; color: #F56C6C; }
	.tag-warning { background: #FDF6EC; color: #E6A23C; }

	/* 空状态 */
	.empty-wrap {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 100rpx 0;
		color: #999999;
	}
	.empty-wrap image {
		width: 160rpx;
		height: 160rpx;
		margin-bottom: 20rpx;
	}

	/* 输入框通用 */
	.input-item {
		background: #f8f8f8;
		border-radius: 12rpx;
		padding: 20rpx 24rpx;
		font-size: 28rpx;
		color: #333333;
		width: 100%;
		box-sizing: border-box;
	}

	/* 分割线 */
	.divider {
		height: 1rpx;
		background: #eeeeee;
		margin: 20rpx 0;
	}
</style>
