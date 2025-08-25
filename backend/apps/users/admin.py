from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.html import format_html
from .models import User, UserProfile


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Enhanced User admin with additional fields"""
    
    list_display = [
        'email', 'username', 'first_name', 'last_name', 
        'credits', 'is_verified', 'total_papers_generated', 
        'is_active', 'date_joined'
    ]
    list_filter = [
        'is_active', 'is_verified', 'is_staff', 'is_superuser',
        'language', 'email_notifications', 'date_joined'
    ]
    search_fields = ['email', 'username', 'first_name', 'last_name']
    ordering = ['-date_joined']
    
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Credits & Verification', {
            'fields': ('credits', 'is_verified', 'email_code', 'code_expires_at')
        }),
        ('Security', {
            'fields': ('failed_login_attempts', 'account_locked_until', 'last_login_ip')
        }),
        ('Preferences', {
            'fields': ('language', 'email_notifications', 'marketing_emails')
        }),
        ('Statistics', {
            'fields': ('total_papers_generated', 'total_credits_used')
        }),
    )
    
    readonly_fields = ['last_login_ip', 'total_papers_generated', 'total_credits_used']
    
    actions = ['unlock_accounts', 'verify_users', 'add_credits']
    
    def unlock_accounts(self, request, queryset):
        """Unlock selected user accounts"""
        count = 0
        for user in queryset:
            if user.is_account_locked():
                user.unlock_account()
                count += 1
        self.message_user(request, f"Unlocked {count} accounts.")
    unlock_accounts.short_description = "Unlock selected accounts"
    
    def verify_users(self, request, queryset):
        """Verify selected users"""
        count = queryset.update(is_verified=True)
        self.message_user(request, f"Verified {count} users.")
    verify_users.short_description = "Verify selected users"
    
    def add_credits(self, request, queryset):
        """Add 10 credits to selected users"""
        for user in queryset:
            user.credits += 10
            user.save()
        self.message_user(request, f"Added 10 credits to {queryset.count()} users.")
    add_credits.short_description = "Add 10 credits to selected users"


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    """User Profile admin"""
    
    list_display = [
        'user', 'nickname', 'institution', 'field_of_study', 
        'location', 'created_at'
    ]
    list_filter = ['gender', 'created_at', 'updated_at']
    search_fields = [
        'user__email', 'user__username', 'nickname', 
        'institution', 'field_of_study', 'location'
    ]
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('user', 'nickname', 'avatar', 'bio')
        }),
        ('Personal Details', {
            'fields': ('birth_date', 'gender', 'phone', 'location', 'website')
        }),
        ('Academic Information', {
            'fields': ('institution', 'field_of_study')
        }),
    )
    
    readonly_fields = ['created_at', 'updated_at']
    
    def avatar_tag(self, obj):
        if obj.avatar:
            return format_html('<img src="{}" width="40" height="40" />', obj.avatar.url)
        return "-"
    avatar_tag.short_description = 'Avatar'

    list_display = ['user', 'avatar_tag', 'nickname', 'institution', 'field_of_study', 'location', 'created_at']

