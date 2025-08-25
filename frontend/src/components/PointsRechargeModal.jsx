import { useState } from 'react'
import Modal from './Modal'

function PointsRechargeModal({ isOpen, onClose }) {
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [paymentMethod, setPaymentMethod] = useState('alipay')
  
  // 充值套餐选项
  const rechargePlans = [
    { id: 1, name: '基础套餐', points: 500.00, price: 50, popular: false },
    { id: 2, name: '标准套餐', points: 1200.00, price: 100, popular: true },
    { id: 3, name: '高级套餐', points: 3000.00, price: 200, popular: false },
    { id: 4, name: '专业套餐', points: 10000.00, price: 500, popular: false }
  ]
  
  // 支付方式选项
  const paymentMethods = [
    { id: 'alipay', name: '支付宝', icon: 'alipay-icon' },
    { id: 'wechat', name: '微信支付', icon: 'wechat-icon' },
    { id: 'card', name: '银行卡', icon: 'card-icon' }
  ]
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="积分充值"
      closeButtonLabel="关闭"
      maxWidth="sm:max-w-lg"
      actions={
        <>
          <button
            type="button"
            className={`
              w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white focus:outline-none sm:ml-3 sm:w-auto sm:text-sm
              ${selectedPlan ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-gray-300 cursor-not-allowed'}
            `}
            disabled={!selectedPlan}
            onClick={() => {
              // 这里可以添加支付逻辑
              alert(`正在跳转到${paymentMethod === 'alipay' ? '支付宝' : paymentMethod === 'wechat' ? '微信支付' : '银行卡'}支付页面...`);
              onClose();
            }}
          >
            确认支付
          </button>
          <button
            type="button"
            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            onClick={onClose}
          >
            取消
          </button>
        </>
      }
    >
      <p className="text-sm text-gray-500">
        选择适合您需求的充值套餐，获取更多积分以使用我们的服务。
      </p>
      
      {/* 充值套餐选择 */}
      <div className="mt-6 space-y-4">
        <h4 className="text-sm font-medium text-gray-700">选择充值套餐</h4>
        <div className="grid grid-cols-2 gap-4">
          {rechargePlans.map((plan) => (
            <div
              key={plan.id}
              className={`
                border rounded-lg p-4 cursor-pointer relative
                ${selectedPlan?.id === plan.id ? 'border-indigo-600 bg-indigo-50' : 'border-gray-300 hover:border-indigo-300'}
              `}
              onClick={() => setSelectedPlan(plan)}
            >
              {plan.popular && (
                <span className="absolute top-0 right-0 transform translate-x-1/3 -translate-y-1/3 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                  热门
                </span>
              )}
              <div className="font-medium text-gray-900">{plan.name}</div>
              <div className="mt-1 text-xl font-bold text-indigo-600">{plan.points.toFixed(2)} <span className="text-sm font-normal">积分</span></div>
              <div className="mt-1 text-gray-500">¥{plan.price}</div>
            </div>
          ))}
        </div>
      </div>
      
      {/* 支付方式选择 */}
      {selectedPlan && (
        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-700">选择支付方式</h4>
          <div className="mt-2 space-y-2">
            {paymentMethods.map((method) => (
              <div
                key={method.id}
                className={`
                  flex items-center p-3 border rounded-md cursor-pointer
                  ${paymentMethod === method.id ? 'border-indigo-600 bg-indigo-50' : 'border-gray-300 hover:border-indigo-300'}
                `}
                onClick={() => setPaymentMethod(method.id)}
              >
                <div className="h-8 w-8 bg-gray-200 rounded flex items-center justify-center">
                  <span className="text-xs text-gray-500">{method.icon}</span>
                </div>
                <span className="ml-3 font-medium text-gray-900">{method.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* 订单摘要 */}
      {selectedPlan && (
        <div className="mt-6 bg-gray-50 p-4 rounded-md">
          <h4 className="text-sm font-medium text-gray-700">订单摘要</h4>
          <div className="mt-2 flex justify-between">
            <span className="text-sm text-gray-500">套餐名称</span>
            <span className="text-sm font-medium text-gray-900">{selectedPlan.name}</span>
          </div>
          <div className="mt-1 flex justify-between">
            <span className="text-sm text-gray-500">获得积分</span>
            <span className="text-sm font-medium text-gray-900">{selectedPlan.points.toFixed(2)} 积分</span>
          </div>
          <div className="mt-1 pt-1 border-t border-gray-200 flex justify-between">
            <span className="text-sm font-medium text-gray-700">应付金额</span>
            <span className="text-sm font-bold text-indigo-600">¥{selectedPlan.price}</span>
          </div>
        </div>
      )}
    </Modal>
  )
}

export default PointsRechargeModal
