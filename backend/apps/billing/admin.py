from django.contrib import admin
from django.utils.html import format_html
from django.db.models import Sum
from .models import (
    Package, CreditTransaction, Subscription, PaymentMethod
)


@admin.register(Package)
class PackageAdmin(admin.ModelAdmin):
    """Package admin"""
    
    list_display = [
        'name', 'credits', 'price', 'currency', 
        'price_per_credit_display', 'is_popular', 'is_active', 
        'purchase_count', 'order'
    ]
    list_filter = ['currency', 'is_popular', 'is_active', 'created_at']
    search_fields = ['name', 'description']
    ordering = ['order', 'price']
    
    fieldsets = (
        ('Package Information', {
            'fields': ('name', 'description', 'credits', 'price', 'currency')
        }),
        ('Features', {
            'fields': ('features',),
            'description': 'JSON list of package features'
        }),
        ('Pricing Strategy', {
            'fields': ('discount_percentage', 'original_price')
        }),
        ('Display Settings', {
            'fields': ('is_popular', 'is_active', 'order')
        }),
    )
    
    def price_per_credit_display(self, obj):
        """Display price per credit"""
        return f"{obj.price_per_credit:.3f} {obj.currency}"
    price_per_credit_display.short_description = "Price/Credit"
    
    def purchase_count(self, obj):
        """Count of purchases for this package"""
        return obj.credittransaction_set.filter(
            transaction_type='purchase', 
            status='completed'
        ).count()
    purchase_count.short_description = "Purchases"
    
    def get_queryset(self, request):
        return super().get_queryset(request).filter(is_deleted=False)
    
    actions = ['mark_as_popular', 'unmark_as_popular']
    
    def mark_as_popular(self, request, queryset):
        count = queryset.update(is_popular=True)
        self.message_user(request, f"Marked {count} packages as popular.")
    mark_as_popular.short_description = "Mark as popular"
    
    def unmark_as_popular(self, request, queryset):
        count = queryset.update(is_popular=False)
        self.message_user(request, f"Unmarked {count} packages as popular.")
    unmark_as_popular.short_description = "Unmark as popular"


@admin.register(CreditTransaction)
class CreditTransactionAdmin(admin.ModelAdmin):
    """Credit Transaction admin"""
    
    list_display = [
        'user', 'transaction_type', 'credits', 'amount', 
        'currency', 'status', 'balance_after', 'created_at'
    ]
    list_filter = [
        'transaction_type', 'status', 'currency', 
        'payment_method', 'created_at'
    ]
    search_fields = [
        'user__email', 'description', 'payment_id', 'admin_notes'
    ]
    ordering = ['-created_at']
    
    fieldsets = (
        ('Transaction Information', {
            'fields': ('user', 'transaction_type', 'status', 'credits', 'amount', 'currency')
        }),
        ('Related Objects', {
            'fields': ('package', 'paper')
        }),
        ('Payment Details', {
            'fields': ('payment_method', 'payment_id')
        }),
        ('Balance Tracking', {
            'fields': ('balance_before', 'balance_after')
        }),
        ('Additional Information', {
            'fields': ('description', 'admin_notes')
        }),
    )
    
    readonly_fields = ['balance_before', 'balance_after']
    
    def get_queryset(self, request):
        return super().get_queryset(request).filter(is_deleted=False)
    
    actions = ['mark_as_completed', 'mark_as_failed']
    
    def mark_as_completed(self, request, queryset):
        count = queryset.update(status='completed')
        self.message_user(request, f"Marked {count} transactions as completed.")
    mark_as_completed.short_description = "Mark as completed"
    
    def mark_as_failed(self, request, queryset):
        count = queryset.update(status='failed')
        self.message_user(request, f"Marked {count} transactions as failed.")
    mark_as_failed.short_description = "Mark as failed"


@admin.register(Subscription)
class SubscriptionAdmin(admin.ModelAdmin):
    """Subscription admin"""
    
    list_display = [
        'user', 'plan_type', 'status', 'monthly_credits', 
        'monthly_price', 'currency', 'start_date', 'end_date', 
        'is_active_display'
    ]
    list_filter = [
        'plan_type', 'status', 'currency', 
        'start_date', 'end_date', 'created_at'
    ]
    search_fields = ['user__email', 'subscription_id']
    ordering = ['-created_at']
    
    fieldsets = (
        ('Subscription Information', {
            'fields': ('user', 'plan_type', 'status')
        }),
        ('Plan Details', {
            'fields': ('monthly_credits', 'monthly_price', 'currency', 'features')
        }),
        ('Dates', {
            'fields': ('start_date', 'end_date', 'next_billing_date')
        }),
        ('Payment Details', {
            'fields': ('payment_method', 'subscription_id')
        }),
    )
    
    def is_active_display(self, obj):
        """Display if subscription is currently active"""
        if obj.is_active:
            return format_html('<span style="color: green;">✓ Active</span>')
        return format_html('<span style="color: red;">✗ Inactive</span>')
    is_active_display.short_description = "Currently Active"
    
    def get_queryset(self, request):
        return super().get_queryset(request).filter(is_deleted=False)
    
    actions = ['activate_subscriptions', 'cancel_subscriptions']
    
    def activate_subscriptions(self, request, queryset):
        count = queryset.update(status='active')
        self.message_user(request, f"Activated {count} subscriptions.")
    activate_subscriptions.short_description = "Activate subscriptions"
    
    def cancel_subscriptions(self, request, queryset):
        count = queryset.update(status='cancelled')
        self.message_user(request, f"Cancelled {count} subscriptions.")
    cancel_subscriptions.short_description = "Cancel subscriptions"


@admin.register(PaymentMethod)
class PaymentMethodAdmin(admin.ModelAdmin):
    """Payment Method admin"""
    
    list_display = [
        'user', 'method_type', 'card_display', 
        'is_default', 'is_active', 'created_at'
    ]
    list_filter = ['method_type', 'card_brand', 'is_default', 'is_active', 'created_at']
    search_fields = ['user__email', 'last_four_digits', 'processor_customer_id']
    ordering = ['-created_at']
    
    fieldsets = (
        ('Payment Method Information', {
            'fields': ('user', 'method_type', 'is_default', 'is_active')
        }),
        ('Card Details', {
            'fields': ('last_four_digits', 'card_brand', 'expiry_month', 'expiry_year')
        }),
        ('Processor Details', {
            'fields': ('processor_token', 'processor_customer_id')
        }),
    )
    
    def card_display(self, obj):
        """Display card information"""
        if obj.last_four_digits and obj.card_brand:
            return f"{obj.card_brand} ending in {obj.last_four_digits}"
        return obj.get_method_type_display()
    card_display.short_description = "Card Info"
    
    def get_queryset(self, request):
        return super().get_queryset(request).filter(is_deleted=False)

