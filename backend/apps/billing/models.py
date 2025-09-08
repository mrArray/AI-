from django.db import models
from django.contrib.auth import get_user_model
from apps.core.models import BaseModel

User = get_user_model()


class Package(BaseModel):
    """Credit packages for purchase"""
    
    name = models.CharField(max_length=100)
    description = models.TextField()
    credits = models.PositiveIntegerField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default='USD')
    
    # Package features
    features = models.JSONField(blank=True, null=True, default=list, help_text="List of package features")
    bonus_credits = models.PositiveIntegerField(default=0, help_text="Bonus credits included in package")
    badge = models.CharField(max_length=50, blank=True, null=True, help_text="Badge label for package")
    color = models.CharField(max_length=20, blank=True, null=True, help_text="Color for frontend display")
    limitation = models.CharField(max_length=200, blank=True, null=True, help_text="Limitation or note for package")
    
    # Display settings
    is_popular = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    order = models.PositiveIntegerField(default=0)
    
    # Pricing strategy
    discount_percentage = models.PositiveIntegerField(default=0)
    original_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    
    class Meta:
        ordering = ['order', 'price']
    
    def __str__(self):
        return f"{self.name} - {self.credits} credits"
    
    @property
    def price_per_credit(self):
        """Calculate price per credit"""
        if self.credits > 0:
            return float(self.price) / self.credits
        return 0


class CreditTransaction(BaseModel):
    """Credit purchase and usage transactions"""
    
    TRANSACTION_TYPES = [
        ('purchase', 'Purchase'),
        ('usage', 'Usage'),
        ('refund', 'Refund'),
        ('bonus', 'Bonus'),
        ('admin_adjustment', 'Admin Adjustment'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('cancelled', 'Cancelled'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='credit_transactions')
    transaction_type = models.CharField(max_length=20, choices=TRANSACTION_TYPES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    is_active = models.BooleanField(default=True)
    # Transaction details
    credits = models.IntegerField(help_text="Positive for credit, negative for debit")
    amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    currency = models.CharField(max_length=3, default='USD')
    
    # Related objects
    package = models.ForeignKey(Package, on_delete=models.SET_NULL, null=True, blank=True)
    paper = models.ForeignKey('papers.GeneratedPaper', on_delete=models.SET_NULL, null=True, blank=True)
    
    # Payment details
    payment_method = models.CharField(max_length=50, blank=True)
    payment_id = models.CharField(max_length=100, blank=True)
    
    # Additional info
    description = models.TextField(blank=True)
    admin_notes = models.TextField(blank=True)
    
    # Balance tracking
    balance_before = models.PositiveIntegerField(default=0)
    balance_after = models.PositiveIntegerField(default=0)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.email} - {self.get_transaction_type_display()} - {self.credits} credits"


class Subscription(BaseModel):
    """User subscriptions for premium features"""
    
    PLAN_TYPES = [
        ('basic', 'Basic'),
        ('premium', 'Premium'),
        ('enterprise', 'Enterprise'),
    ]
    
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('cancelled', 'Cancelled'),
        ('expired', 'Expired'),
        ('suspended', 'Suspended'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='subscriptions')
    plan_type = models.CharField(max_length=20, choices=PLAN_TYPES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    
    # Subscription details
    monthly_credits = models.PositiveIntegerField(default=0)
    monthly_price = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default='USD')
    
    # Dates
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    next_billing_date = models.DateTimeField(null=True, blank=True)
    
    # Payment details
    payment_method = models.CharField(max_length=50, blank=True)
    subscription_id = models.CharField(max_length=100, blank=True)
    
    # Features
    features = models.JSONField(default=list)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.email} - {self.get_plan_type_display()}"
    
    @property
    def is_active(self):
        """Check if subscription is currently active"""
        from django.utils import timezone
        return (self.status == 'active' and 
                self.start_date <= timezone.now() <= self.end_date)


class PaymentMethod(BaseModel):
    """User payment methods"""
    
    METHOD_TYPES = [
        ('credit_card', 'Credit Card'),
        ('paypal', 'PayPal'),
        ('stripe', 'Stripe'),
        ('bank_transfer', 'Bank Transfer'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='payment_methods')
    method_type = models.CharField(max_length=20, choices=METHOD_TYPES)
    
    # Card details (encrypted/tokenized)
    last_four_digits = models.CharField(max_length=4, blank=True)
    card_brand = models.CharField(max_length=20, blank=True)
    expiry_month = models.PositiveIntegerField(null=True, blank=True)
    expiry_year = models.PositiveIntegerField(null=True, blank=True)
    
    # Payment processor details
    processor_token = models.CharField(max_length=200, blank=True)
    processor_customer_id = models.CharField(max_length=100, blank=True)
    
    # Settings
    is_default = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        ordering = ['-is_default', '-created_at']
    
    def __str__(self):
        if self.last_four_digits:
            return f"{self.get_method_type_display()} ending in {self.last_four_digits}"
        return f"{self.get_method_type_display()}"

