from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'payment-methods', views.PaymentMethodViewSet, basename='payment-methods')

urlpatterns = [
    # Packages and pricing
    path('packages/', views.PackageListView.as_view(), name='packages'),
    path('pricing/', views.PricingInfoView.as_view(), name='pricing_info'),
    
    # Transactions
    path('transactions/', views.UserTransactionListView.as_view(), name='user_transactions'),
    path('purchase/', views.PurchasePackageView.as_view(), name='purchase_package'),
    
    # Subscriptions
    path('subscriptions/', views.UserSubscriptionListView.as_view(), name='user_subscriptions'),
    
    # User billing info
    path('info/', views.UserBillingInfoView.as_view(), name='user_billing_info'),
    
    # Admin endpoints
    path('admin/adjust-credits/', views.AdjustUserCreditsView.as_view(), name='adjust_credits'),
    path('admin/stats/', views.BillingStatsView.as_view(), name='billing_stats'),
    
    # Router URLs
    path('', include(router.urls)),
]