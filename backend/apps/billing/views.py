from django.core.cache import cache
from rest_framework import generics, permissions, status, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from django.db.models import Sum, Count
from django.shortcuts import get_object_or_404
from django.utils import timezone
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiResponse
from drf_spectacular.types import OpenApiTypes

from .models import Package, CreditTransaction, Subscription, PaymentMethod
from .serializers import (
    PackageSerializer, CreditTransactionSerializer, SubscriptionSerializer,
    PaymentMethodSerializer, PackagePurchaseSerializer, CreditAdjustmentSerializer,
    BillingStatsSerializer, UserBillingInfoSerializer
)


class PackageListView(generics.ListAPIView):
    """List available credit packages"""
    serializer_class = PackageSerializer
    permission_classes = [AllowAny]
    queryset = Package.objects.filter(is_active=True, is_deleted=False).order_by('order', 'price')
    
    @extend_schema(
        summary="Get credit packages",
        description="Retrieve all available credit packages for purchase"
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)


class UserTransactionListView(generics.ListAPIView):
    """List user's credit transactions"""
    serializer_class = CreditTransactionSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return CreditTransaction.objects.filter(
            user=self.request.user,
            is_deleted=False
        ).order_by('-created_at')
    
    @extend_schema(
        summary="Get user transactions",
        description="Retrieve current user's credit transaction history"
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)


class UserSubscriptionListView(generics.ListAPIView):
    """List user's subscriptions"""
    serializer_class = SubscriptionSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Subscription.objects.filter(
            user=self.request.user,
            is_deleted=False
        ).order_by('-created_at')
    
    @extend_schema(
        summary="Get user subscriptions",
        description="Retrieve current user's subscription history"
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)


class PaymentMethodViewSet(viewsets.ModelViewSet):
    """ViewSet for payment methods"""
    serializer_class = PaymentMethodSerializer
    permission_classes = [IsAuthenticated]
    queryset = PaymentMethod.objects.none()  # Fixes schema warning
    
    def get_queryset(self):
        return PaymentMethod.objects.filter(
            user=self.request.user,
            is_deleted=False
        ).order_by('-is_default', '-created_at')
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    # Explicitly define parameter types for schema generation
    @extend_schema(
        parameters=[
            OpenApiParameter(
                name='id', 
                type=OpenApiTypes.INT,
                location=OpenApiParameter.PATH,
                description='Payment method ID'
            )
        ]
    )
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)
    
    @extend_schema(
        parameters=[
            OpenApiParameter(
                name='id', 
                type=OpenApiTypes.INT,
                location=OpenApiParameter.PATH,
                description='Payment method ID'
            )
        ]
    )
    def update(self, request, *args, **kwargs):
        return super().update(request, *args, **kwargs)
    
    @extend_schema(
        parameters=[
            OpenApiParameter(
                name='id', 
                type=OpenApiTypes.INT,
                location=OpenApiParameter.PATH,
                description='Payment method ID'
            )
        ]
    )
    def partial_update(self, request, *args, **kwargs):
        return super().partial_update(request, *args, **kwargs)
    
    @extend_schema(
        parameters=[
            OpenApiParameter(
                name='id', 
                type=OpenApiTypes.INT,
                location=OpenApiParameter.PATH,
                description='Payment method ID'
            )
        ]
    )
    def destroy(self, request, *args, **kwargs):
        return super().destroy(request, *args, **kwargs)


class PurchasePackageView(APIView):
    """Purchase a credit package"""
    permission_classes = [IsAuthenticated]
    serializer_class = PackagePurchaseSerializer
    
    @extend_schema(
        summary="Purchase credit package",
        description="Purchase a credit package using a payment method",
        request=PackagePurchaseSerializer,
        responses={201: CreditTransactionSerializer}
    )
    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        package_id = serializer.validated_data['package_id']
        payment_method_id = serializer.validated_data.get('payment_method_id')
        
        try:
            # Get package
            package = get_object_or_404(
                Package,
                id=package_id,
                is_active=True,
                is_deleted=False
            )
            
            # Get payment method if provided
            payment_method = None
            if payment_method_id:
                payment_method = get_object_or_404(
                    PaymentMethod,
                    id=payment_method_id,
                    user=request.user,
                    is_active=True,
                    is_deleted=False
                )
            
            # TODO: Implement actual payment processing
            # For now, simulate successful payment
            
            # Create credit transaction
            transaction = CreditTransaction.objects.create(
                user=request.user,
                transaction_type='purchase',
                status='completed',
                credits=package.credits,
                amount=package.price,
                currency=package.currency,
                package=package,
                payment_method=payment_method.get_method_type_display() if payment_method else 'manual',
                description=f"Purchase of {package.name}",
                balance_before=request.user.credits,
                balance_after=request.user.credits + package.credits
            )
            
            # Update user credits
            request.user.credits += package.credits
            request.user.save()
            
            serializer = CreditTransactionSerializer(transaction)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)


class UserBillingInfoView(APIView):
    """Get user billing information"""
    permission_classes = [IsAuthenticated]
    
    @extend_schema(
        summary="Get user billing info",
        description="Get comprehensive billing information for the current user",
        responses={200: UserBillingInfoSerializer}
    )
    def get(self, request):
        user = request.user
        
        # Calculate statistics
        transactions = CreditTransaction.objects.filter(user=user, is_deleted=False)
        
        total_spent = transactions.filter(
            transaction_type='purchase',
            status='completed'
        ).aggregate(total=Sum('amount'))['total'] or 0
        
        total_credits_purchased = transactions.filter(
            transaction_type='purchase',
            status='completed'
        ).aggregate(total=Sum('credits'))['total'] or 0
        
        total_credits_used = abs(transactions.filter(
            transaction_type='usage',
            status='completed'
        ).aggregate(total=Sum('credits'))['total'] or 0)
        
        # Get active subscription
        active_subscription = Subscription.objects.filter(
            user=user,
            status='active',
            is_deleted=False
        ).first()
        
        # Get recent transactions
        recent_transactions = transactions.order_by('-created_at')[:10]
        
        # Get payment methods
        payment_methods = PaymentMethod.objects.filter(
            user=user,
            is_deleted=False
        ).order_by('-is_default', '-created_at')
        
        data = {
            'current_credits': user.credits,
            'total_spent': total_spent,
            'total_credits_purchased': total_credits_purchased,
            'total_credits_used': total_credits_used,
            'active_subscription': SubscriptionSerializer(active_subscription).data if active_subscription else None,
            'recent_transactions': CreditTransactionSerializer(recent_transactions, many=True).data,
            'payment_methods': PaymentMethodSerializer(payment_methods, many=True).data
        }
        
        return Response(data)


class AdjustUserCreditsView(APIView):
    """Adjust user credits (admin only)"""
    permission_classes = [IsAdminUser]
    serializer_class = CreditAdjustmentSerializer
    
    @extend_schema(
        summary="Adjust user credits (Admin)",
        description="Manually adjust user credits (admin only)",
        request=CreditAdjustmentSerializer,
        responses={201: CreditTransactionSerializer}
    )
    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user_id = serializer.validated_data['user_id']
        credits = serializer.validated_data['credits']
        description = serializer.validated_data['description']
        
        try:
            from django.contrib.auth import get_user_model
            User = get_user_model()
            user = get_object_or_404(User, id=user_id)
            
            # Create transaction
            transaction = CreditTransaction.objects.create(
                user=user,
                transaction_type='admin_adjustment',
                status='completed',
                credits=credits,
                amount=0,
                description=description,
                admin_notes=f"Adjusted by admin: {request.user.email}",
                balance_before=user.credits,
                balance_after=user.credits + credits
            )
            
            # Update user credits
            user.credits = max(0, user.credits + credits)  # Ensure credits don't go negative
            user.save()
            
            serializer = CreditTransactionSerializer(transaction)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)


class BillingStatsView(APIView):
    """Get billing statistics (admin only)"""
    permission_classes = [IsAdminUser]
    
    @extend_schema(
        summary="Get billing statistics (Admin)",
        description="Get comprehensive billing statistics (admin only)",
        responses={200: BillingStatsSerializer}
    )
    def get(self, request):
        # Calculate revenue
        total_revenue = CreditTransaction.objects.filter(
            transaction_type='purchase',
            status='completed',
            is_deleted=False
        ).aggregate(total=Sum('amount'))['total'] or 0
        
        # Count transactions
        total_transactions = CreditTransaction.objects.filter(
            is_deleted=False
        ).count()
        
        # Credits statistics
        total_credits_sold = CreditTransaction.objects.filter(
            transaction_type='purchase',
            status='completed',
            is_deleted=False
        ).aggregate(total=Sum('credits'))['total'] or 0
        
        total_credits_used = abs(CreditTransaction.objects.filter(
            transaction_type='usage',
            status='completed',
            is_deleted=False
        ).aggregate(total=Sum('credits'))['total'] or 0)
        
        # Active subscriptions
        active_subscriptions = Subscription.objects.filter(
            status='active',
            is_deleted=False
        ).count()
        
        # Popular packages
        popular_packages = Package.objects.filter(
            is_active=True,
            is_deleted=False
        ).annotate(
            purchase_count=Count('credittransaction')
        ).order_by('-purchase_count')[:5]
        
        popular_packages_data = [
            {
                'name': pkg.name,
                'purchase_count': pkg.purchase_count,
                'revenue': pkg.credittransaction_set.filter(
                    status='completed'
                ).aggregate(total=Sum('amount'))['total'] or 0
            }
            for pkg in popular_packages
        ]
        
        data = {
            'total_revenue': total_revenue,
            'total_transactions': total_transactions,
            'total_credits_sold': total_credits_sold,
            'total_credits_used': total_credits_used,
            'active_subscriptions': active_subscriptions,
            'popular_packages': popular_packages_data
        }
        
        return Response(data)


class PricingInfoView(APIView):
    """Get pricing information"""
    permission_classes = [AllowAny]
    
    @extend_schema(
        summary="Get pricing information",
        description="Get pricing information for the pricing page",
        responses={200: None}  # Let DRF Spectacular infer the response schema

        )
    def get(self, request):
        # Get packages
        packages = Package.objects.filter(
            is_active=True,
            is_deleted=False
        ).order_by('order', 'price')
        
        # Get subscription plans (if any)
        subscription_plans = [
            {
                'name': 'Basic',
                'price': 9.99,
                'currency': 'USD',
                'monthly_credits': 50,
                'features': [
                    '50 credits per month',
                    'Basic templates',
                    'Email support'
                ]
            },
            {
                'name': 'Premium',
                'price': 19.99,
                'currency': 'USD',
                'monthly_credits': 120,
                'features': [
                    '120 credits per month',
                    'All templates',
                    'Priority support',
                    'Advanced features'
                ]
            },
            {
                'name': 'Enterprise',
                'price': 49.99,
                'currency': 'USD',
                'monthly_credits': 300,
                'features': [
                    '300 credits per month',
                    'All templates',
                    'Dedicated support',
                    'Custom templates',
                    'API access'
                ]
            }
        ]
        
        data = {
            'packages': PackageSerializer(packages, many=True).data,
            'subscription_plans': subscription_plans
        }
        
        return Response(data)