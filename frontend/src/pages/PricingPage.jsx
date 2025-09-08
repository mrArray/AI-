import React, { useState } from 'react';
import { useModal } from '../contexts/ModalContext';
import { useTranslation } from 'react-i18next';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Modal from '../components/Modal';
import { useToast, TOAST_TYPES } from '../contexts/ToastContext';
import { billingAPI } from '../api/billing';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../api/auth';


const PricingPage = () => {
  const { t } = useTranslation('pricing');
  const { showToast } = useToast();
  const { openLoginModal, openRegisterModal } = useModal();
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('alipay');
  const [loadingPurchase, setLoadingPurchase] = useState(false);
  const { isAuthenticated, token, refreshProfile } = useAuth();

  // 主要套餐数据 (API驱动)
  const [mainPlans, setMainPlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(true);

  React.useEffect(() => {
    async function fetchPackages() {
      setLoadingPlans(true);
      try {
        const data = await billingAPI.getPackages({ is_active: true });
        const results = Array.isArray(data.data) ? data.data : [];
        const plans = results.map(plan => ({
          ...plan,
          bonusCredits: plan.bonus_credits || 0,
          color: plan.color || 'blue',
          badge: plan.badge,
          originalPrice: plan.original_price ? Number(plan.original_price) : Number(plan.price),
          popular: plan.is_popular || false,
          features: Array.isArray(plan.features) ? plan.features : [],
        }));
        setMainPlans(plans);
      } catch (e) {
        setMainPlans([]);
      }
      setLoadingPlans(false);
    }
    fetchPackages();
  }, []);



  // 支付方式配置
  const paymentMethods = [
    {
      id: 'alipay',
      name: t('payment.methods.alipay.name'),
      icon: '💳',
      available: true,
      description: t('payment.methods.alipay.description')
    },
    {
      id: 'wechat',
      name: t('payment.methods.wechat.name'),
      icon: '💚',
      available: false,
      description: t('payment.methods.wechat.description')
    },
    {
      id: 'visa',
      name: t('payment.methods.visa.name'),
      icon: '💎',
      available: false,
      description: t('payment.methods.visa.description')
    }
  ];

  const handleSelectPlan = (plan) => {
    if (!isAuthenticated) {
      openLoginModal();
      return;
    }
    setSelectedPlan(plan);
    setShowPaymentModal(true);
  };

  const handlePayment = async () => {
    if (!selectedPlan) return;
    setLoadingPurchase(true);
    try {
      // Call backend purchase API
      try {
        const data = await billingAPI.purchasePackage(selectedPlan.id, token);
        showToast({ type: TOAST_TYPES.SUCCESS, message: t('payment.success', 'Purchase successful!') });
        setShowPaymentModal(false);
        // Refresh user profile after successful purchase
        await refreshProfile();
      } catch (e) {
        showToast({ type: TOAST_TYPES.ERROR, message: e?.response?.data?.error || t('payment.error', 'Purchase failed!') });
      }
    } catch (e) {
      showToast({ type: TOAST_TYPES.ERROR, message: t('payment.error', 'Purchase failed!') });
    }
    setLoadingPurchase(false);
  };

  const getColorClasses = (color, popular = false) => {
    const colors = {
      blue: popular ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 shadow-lg' : 'border-blue-200 hover:border-blue-300 bg-white',
      green: popular ? 'border-green-500 bg-gradient-to-br from-green-50 to-green-100 shadow-lg' : 'border-green-200 hover:border-green-300 bg-white',
      purple: popular ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-purple-100 shadow-xl ring-2 ring-purple-200' : 'border-purple-200 hover:border-purple-300 bg-white',
      orange: popular ? 'border-orange-500 bg-gradient-to-br from-orange-50 to-orange-100 shadow-lg' : 'border-orange-200 hover:border-orange-300 bg-white',
      red: popular ? 'border-red-500 bg-gradient-to-br from-red-50 to-red-100 shadow-lg' : 'border-red-200 hover:border-red-300 bg-white'
    };
    return colors[color] || colors.blue;
  };

  const getButtonClasses = (color) => {
    const colors = {
      blue: 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
      green: 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700',
      purple: 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700',
      orange: 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700',
      red: 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <Header activePage="pricing" />
{/*       
      <div className="bg-gradient-to-r from-indigo-600 to-purple-700 py-16 md:py-24 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-purple-400"></div>
          <div className="absolute bottom-10 right-10 w-80 h-80 rounded-full bg-indigo-400"></div>
        </div>
        
                 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
           <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 animate-fade-in-down">
             {t('header.title')}
           </h1>
           <p className="text-xl text-indigo-100 max-w-2xl mx-auto mb-8">
             {t('header.subtitle')}
           </p>
         </div>
      </div> */}

      {/* 套餐展示区 */}
      <div className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
                     <div className="text-center mb-16">
             <h2 className="text-3xl font-bold text-gray-900 mb-4">{t('plans.sectionTitle')}</h2>
             <p className="text-lg text-gray-600 max-w-2xl mx-auto">
               {t('plans.sectionSubtitle')}
             </p>
           </div>
          
                     {/* 主要套餐 - 第一行 */}
                     {loadingPlans ? (
                       <div className="text-center py-8 text-gray-500">Loading packages...</div>
                     ) : mainPlans.length === 0 ? (
                       <div className="text-center py-8 text-gray-500">No packages available.</div>
                     ) : (
                       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center max-w-5xl mx-auto">
                         {mainPlans.map((plan) => (
                           <div
                             key={plan.id}
                             className={`relative rounded-2xl border-2 transition-all duration-300 transform hover:scale-[1.02] w-full max-w-sm ${
                               getColorClasses(plan.color, plan.popular)
                             }`}
                           >
                             {/* 推荐标签 */}
                             {plan.popular && (
                               <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                                 <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg">
                                   🔥 {t('common.recommended')}
                                 </span>
                               </div>
                             )}

                             {/* 特殊标签 */}
                             {plan.badge && (
                               <div className="absolute top-4 right-4">
                                 <span className="bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow">
                                   {plan.badge}
                                 </span>
                               </div>
                             )}

                             <div className="p-6">
                               {/* 套餐名称 */}
                               <h3 className={`text-lg font-bold mb-2 text-center ${
                                 plan.popular ? 'text-purple-700' : 'text-gray-900'
                               }`}>
                                 {plan.name}
                               </h3>

                               {/* 价格 */}
                               <div className="mb-6">
                                 <div className="flex items-baseline justify-center">
                                   <span className="text-3xl font-bold text-gray-900">
                                     ¥{plan.price}
                                   </span>
                                   <span className="ml-2 text-lg text-gray-500 line-through">
                                     ¥{plan.originalPrice}
                                   </span>
                                 </div>
                                 <div className="mt-2 text-center">
                                   <span className="inline-block bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full">
                                     {t('common.save')} ¥{(plan.originalPrice - plan.price).toFixed(1)}
                                   </span>
                                 </div>
                               </div>

                               {/* 积分 */}
                               <div className="mb-6 p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
                                 <div className="flex flex-col items-center">
                                   <div className="text-center">
                                     <div className="text-3xl font-bold text-indigo-600">
                                       {Number(plan.credits).toFixed(2)}
                                       {plan.bonusCredits > 0 && (
                                         <span className="text-lg text-green-600"> + {Number(plan.bonusCredits).toFixed(2)}</span>
                                       )}
                                     </div>
                                     <div className="text-sm text-gray-600 mt-1">
                                       {plan.bonusCredits > 0 ? t('common.creditsWithBonus') : t('common.baseCredits')}
                                     </div>
                                   </div>
                                 </div>
                               </div>

                               {/* 描述 */}
                               <p className="text-sm text-gray-600 mb-6 text-center min-h-[3rem]">
                                 {plan.description}
                               </p>

                               {/* 功能列表 */}
                               <ul className="space-y-3 mb-8">
                                 {plan.features.map((feature, index) => (
                                   <li key={index} className="flex items-start">
                                     <svg className="w-5 h-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                       <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                     </svg>
                                     <span className="text-sm text-gray-700">{feature}</span>
                                   </li>
                                 ))}
                               </ul>

                               {/* 购买按钮 */}
                               <button
                                 onClick={() => handleSelectPlan(plan)}
                                 className={`w-full py-3 px-4 rounded-lg font-bold text-white transition-all duration-200 transform hover:scale-[1.03] shadow-lg ${
                                   getButtonClasses(plan.color)
                                 }`}
                               >
                                 {t('common.selectPlan')}
                               </button>
                             </div>
                           </div>
                         ))}
                       </div>
                     )}

        </div>
      </div>

      {/* <div className="bg-gradient-to-r from-blue-50 to-purple-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                     <div className="text-center mb-12">
             <h2 className="text-3xl font-bold text-gray-900 mb-4">{t('whyChooseUs.title')}</h2>
             <p className="text-lg text-gray-600 max-w-2xl mx-auto">
               {t('whyChooseUs.subtitle')}
             </p>
           </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                </svg>
              </div>
                             <h3 className="text-xl font-bold text-gray-900 mb-2">{t('whyChooseUs.features.security.title')}</h3>
               <p className="text-gray-600">{t('whyChooseUs.features.security.description')}</p>
            </div>
            
            <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
              </div>
                             <h3 className="text-xl font-bold text-gray-900 mb-2">{t('whyChooseUs.features.speed.title')}</h3>
               <p className="text-gray-600">{t('whyChooseUs.features.speed.description')}</p>
            </div>
            
            <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
                </svg>
              </div>
                             <h3 className="text-xl font-bold text-gray-900 mb-2">{t('whyChooseUs.features.support.title')}</h3>
               <p className="text-gray-600">{t('whyChooseUs.features.support.description')}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                     <div className="text-center mb-16">
             <h2 className="text-3xl font-bold text-gray-900 mb-4">{t('faq.title')}</h2>
             <p className="text-lg text-gray-600">{t('faq.subtitle')}</p>
           </div>
          
          <div className="space-y-6">
                         {[1, 2, 3, 4].map((index) => (
               <div key={index} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                 <h3 className="font-bold text-lg text-gray-900 mb-2">
                   {t(`faq.questions.${index}.question`)}
                 </h3>
                 <p className="text-gray-600">
                   {t(`faq.questions.${index}.answer`)}
                 </p>
               </div>
             ))}
          </div>
        </div>
      </div> */}

      {/* 支付弹窗 */}
      <Modal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        title={t('payment.title')}
        closeButtonLabel={t('common.close')}
        maxWidth="sm:max-w-md"
        actions={
          <>
            <button
              onClick={handlePayment}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 px-4 rounded-xl font-bold text-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg sm:ml-3 sm:w-auto sm:text-sm"
            >
              {t('payment.confirmPayment')} ¥{selectedPlan?.price}
            </button>
          </>
        }
      >
        {/* 选中套餐信息 */}
        {selectedPlan && (
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-5 mb-6 border border-indigo-100">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-bold text-lg text-gray-900 mb-1">
                  {selectedPlan.name}
                </h4>
                <p className="text-sm text-gray-600">{selectedPlan.description}</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-purple-600">
                  ¥{selectedPlan.price}
                </div>
                <div className="text-sm text-gray-500 line-through">
                  ¥{selectedPlan.originalPrice}
                </div>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-indigo-100">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">{t('payment.totalCredits')}</span>
                <span className="text-indigo-600 font-bold">
                  {(selectedPlan.credits + selectedPlan.bonusCredits).toFixed(2)}
                  <span className="text-gray-500 font-normal ml-1">{t('payment.creditsUnit')}</span>
                </span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-gray-600">{t('payment.validity')}</span>
                <span className="text-gray-900 font-medium">
                  {selectedPlan.id === 'trial' ? t('payment.validityDays.trial') : 
                   selectedPlan.id === 'basic' ? t('payment.validityDays.basic') : 
                   selectedPlan.id === 'final' ? t('payment.validityDays.final') : 
                   selectedPlan.id === 'research' ? t('payment.validityDays.research') : t('payment.validityDays.basic')}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 支付方式选择 */}
        <div className="mb-8">
          <h4 className="font-bold text-gray-900 mb-4">
            {t('payment.selectMethod')}
          </h4>
          <div className="space-y-3">
            {paymentMethods.map((method) => (
              <div
                key={method.id}
                className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
                  selectedPaymentMethod === method.id
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300'
                } ${!method.available ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={() => method.available && setSelectedPaymentMethod(method.id)}
              >
                <div className="flex items-center">
                  <span className="text-3xl mr-4">{method.icon}</span>
                  <div className="flex-1">
                    <div className="font-bold text-gray-900 flex items-center">
                      {method.name}
                      {!method.available && (
                        <span className="ml-2 text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full">
                          {t('payment.comingSoon')}
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      {method.description}
                    </div>
                  </div>
                  {selectedPaymentMethod === method.id && (
                    <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 安全提示 */}
        <div className="text-center">
          <p className="text-xs text-gray-500 flex items-center justify-center">
            <svg className="w-4 h-4 mr-1 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            {t('payment.securityNote')}
          </p>
        </div>
      </Modal>

       {/* Footer */}
       <Footer />
     </div>
   );
 };
 
 export default PricingPage;