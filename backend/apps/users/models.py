from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models
from django.utils import timezone
from django.db.models.signals import post_save
from django.dispatch import receiver
from datetime import timedelta
from apps.core.models import TimeStampedModel


class UserManager(BaseUserManager):
    """Custom manager for User model with email as username."""

    use_in_migrations = True

    def create_user(self, email, password=None, **extra_fields):
        """Create and save a regular user with the given email and password."""
        if not email:
            raise ValueError("The Email field must be set")
        email = self.normalize_email(email)
        extra_fields.setdefault("is_active", True)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        """Create and save a superuser with the given email and password."""
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)

        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")

        return self.create_user(email, password, **extra_fields)


class User(AbstractUser):
    """Custom User model with email as the unique identifier."""
    
    username = None  # Remove username completely
    email = models.EmailField(unique=True)

    # Basic fields
    credits = models.PositiveIntegerField(default=15)
    is_verified = models.BooleanField(default=False)

    # Email verification
    email_code = models.CharField(max_length=6, blank=True, null=True)
    code_expires_at = models.DateTimeField(null=True, blank=True)

    # Security fields
    failed_login_attempts = models.PositiveIntegerField(default=0)
    account_locked_until = models.DateTimeField(null=True, blank=True)
    last_login_ip = models.GenericIPAddressField(null=True, blank=True)

    # User preferences
    language = models.CharField(max_length=10, default='en')
    email_notifications = models.BooleanField(default=True)
    marketing_emails = models.BooleanField(default=False)

    # Statistics
    total_papers_generated = models.PositiveIntegerField(default=0)
    total_credits_used = models.PositiveIntegerField(default=0)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []  # No username

    objects = UserManager()  # Attach custom manager

    def is_account_locked(self):
        """Check if account is currently locked."""
        return self.account_locked_until and timezone.now() < self.account_locked_until

    def lock_account(self, duration_minutes=30):
        """Lock account for a specific duration."""
        self.account_locked_until = timezone.now() + timedelta(minutes=duration_minutes)
        self.save()

    def unlock_account(self):
        """Unlock account."""
        self.failed_login_attempts = 0
        self.account_locked_until = None
        self.save()

    def generate_verification_code(self):
        """Generate a 6-digit email verification code."""
        import random
        self.email_code = str(random.randint(100000, 999999))
        self.code_expires_at = timezone.now() + timedelta(minutes=10)
        self.save()
        return self.email_code

    def verify_code(self, code):
        """Verify the email verification code."""
        if (
            self.email_code == code and
            self.code_expires_at and
            timezone.now() < self.code_expires_at
        ):
            self.is_verified = True
            self.email_code = None
            self.code_expires_at = None
            self.save()
            return True
        return False

    def __str__(self):
        return self.email


class UserProfile(TimeStampedModel):
    """Extended user profile information."""

    GENDER_CHOICES = [
        ("male", "Male"),
        ("female", "Female"),
        ("other", "Other"),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    avatar = models.ImageField(upload_to="avatars/", blank=True, null=True)
    nickname = models.CharField(max_length=50, blank=True)
    phone = models.CharField(max_length=20, blank=True)
    bio = models.TextField(blank=True)
    birth_date = models.DateField(blank=True, null=True)
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES, blank=True)
    location = models.CharField(max_length=100, blank=True)
    website = models.URLField(blank=True)
    institution = models.CharField(max_length=200, blank=True)
    field_of_study = models.CharField(max_length=100, blank=True)

    def __str__(self):
        return f"{self.user.email} Profile"


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    """Automatically create a UserProfile when a User is created."""
    if created:
        UserProfile.objects.create(user=instance)
