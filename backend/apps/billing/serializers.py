from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Package, CreditTransaction, Subscription, PaymentMethod
from drf_spectacular.utils import extend_schema_field
from drf_spectacular.types import OpenApiTypes

User = get_user_model()


class PackageSerializer(serializers.ModelSerializer):
    """Serializer for credit packages"""
    price_per_credit = serializers.SerializerMethodField()
    
    class Meta:
        model = Package
        fields = [
            'id', 'name', 'description', 'credits', 'price', 'currency',
            'features', 'bonus_credits', 'badge', 'color', 'limitation',
            'is_popular', 'is_active', 'order',
            'discount_percentage', 'original_price', 'price_per_credit',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'price_per_credit', 'created_at', 'updated_at']
    
    @extend_schema_field(OpenApiTypes.FLOAT)
    def get_price_per_credit(self, obj):
        return obj.price_per_credit


class CreditTransactionSerializer(serializers.ModelSerializer):
    """Serializer for credit transactions"""
    user_email = serializers.CharField(source='user.email', read_only=True)
    package_name = serializers.CharField(source='package.name', read_only=True)
    paper_title = serializers.CharField(source='paper.title', read_only=True)
    
    class Meta:
        model = CreditTransaction
        fields = [
            'id', 'user_email', 'transaction_type', 'status', 'credits',
            'amount', 'currency', 'package', 'package_name', 'paper',
            'paper_title', 'payment_method', 'payment_id', 'description',
            'balance_before', 'balance_after', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'user_email', 'package_name', 'paper_title',
            'balance_before', 'balance_after', 'created_at', 'updated_at'
        ]


class SubscriptionSerializer(serializers.ModelSerializer):
    """Serializer for subscriptions"""
    user_email = serializers.CharField(source='user.email', read_only=True)
    is_currently_active = serializers.SerializerMethodField()
    
    class Meta:
        model = Subscription
        fields = [
            'id', 'user_email', 'plan_type', 'status', 'monthly_credits',
            'monthly_price', 'currency', 'start_date', 'end_date',
            'next_billing_date', 'payment_method', 'subscription_id',
            'features', 'is_currently_active', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'user_email', 'is_currently_active', 'created_at', 'updated_at'
        ]
    
    @extend_schema_field(OpenApiTypes.BOOL)
    def get_is_currently_active(self, obj):
        return obj.is_active


class PaymentMethodSerializer(serializers.ModelSerializer):
    """Serializer for payment methods"""
    user_email = serializers.CharField(source='user.email', read_only=True)
    card_display = serializers.SerializerMethodField()
    
    class Meta:
        model = PaymentMethod
        fields = [
            'id', 'user_email', 'method_type', 'last_four_digits',
            'card_brand', 'expiry_month', 'expiry_year', 'is_default',
            'is_active', 'card_display', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'user_email', 'card_display', 'created_at', 'updated_at'
        ]
    
    @extend_schema_field(OpenApiTypes.STR)
    def get_card_display(self, obj):
        if obj.last_four_digits and obj.card_brand:
            return f"{obj.card_brand} ending in {obj.last_four_digits}"
        return obj.get_method_type_display()


class PackagePurchaseSerializer(serializers.Serializer):
    """Serializer for package purchase requests"""
    package_id = serializers.IntegerField()
    payment_method_id = serializers.IntegerField(required=False, allow_null=True)
    
    def validate_package_id(self, value):
        try:
            package = Package.objects.get(
                id=value,
                is_active=True,
                is_deleted=False
            )
            return value
        except Package.DoesNotExist:
            raise serializers.ValidationError("Invalid package ID")
    
    def validate_payment_method_id(self, value):
        if value is not None:
            try:
                # Payment method validation will be done in the view
                # to check if it belongs to the current user
                return value
            except PaymentMethod.DoesNotExist:
                raise serializers.ValidationError("Invalid payment method ID")
        return value


class CreditAdjustmentSerializer(serializers.Serializer):
    """Serializer for admin credit adjustments"""
    user_id = serializers.IntegerField()
    credits = serializers.IntegerField()
    description = serializers.CharField(max_length=500)
    
    def validate_user_id(self, value):
        try:
            User.objects.get(id=value)
            return value
        except User.DoesNotExist:
            raise serializers.ValidationError("Invalid user ID")
    
    def validate_credits(self, value):
        if value == 0:
            raise serializers.ValidationError("Credit adjustment cannot be zero")
        return value


class BillingStatsSerializer(serializers.Serializer):
    """Serializer for billing statistics"""
    total_revenue = serializers.DecimalField(max_digits=10, decimal_places=2)
    total_transactions = serializers.IntegerField()
    total_credits_sold = serializers.IntegerField()
    total_credits_used = serializers.IntegerField()
    active_subscriptions = serializers.IntegerField()
    popular_packages = serializers.ListField(child=serializers.DictField())


class UserBillingInfoSerializer(serializers.Serializer):
    """Serializer for user billing information"""
    current_credits = serializers.IntegerField()
    total_spent = serializers.DecimalField(max_digits=10, decimal_places=2)
    total_credits_purchased = serializers.IntegerField()
    total_credits_used = serializers.IntegerField()
    active_subscription = SubscriptionSerializer(required=False, allow_null=True)
    recent_transactions = CreditTransactionSerializer(many=True)
    payment_methods = PaymentMethodSerializer(many=True)