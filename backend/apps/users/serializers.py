from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from .models import UserProfile

User = get_user_model()


class PreRegisterEmailSerializer(serializers.Serializer):
    email = serializers.EmailField()


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for user profile"""

    class Meta:
        model = UserProfile
        fields = [
            'avatar', 'nickname', 'phone', 'bio', 'birth_date',
            'gender', 'location', 'website', 'institution', 'field_of_study'
        ]


class UserSerializer(serializers.ModelSerializer):
    """Serializer for user information"""
    profile = UserProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'last_name',
            'credits', 'is_verified', 'language', 'email_notifications',
            'marketing_emails', 'total_papers_generated', 'total_credits_used',
            'date_joined', 'profile'
        ]
        read_only_fields = [
            'id', 'total_papers_generated', 'total_credits_used', 'date_joined'
        ]


class UserStatsSerializer(serializers.ModelSerializer):
    """Serializer for user statistics"""

    class Meta:
        model = User
        fields = [
            'total_papers_generated', 'total_credits_used', 'credits',
            'date_joined'
        ]


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)
    full_name = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ['full_name', 'password', 'password2', 'email']

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Passwords don't match."})
        return attrs

    def create(self, validated_data):
        full_name = validated_data.pop('full_name')
        email = validated_data['email']
        password = validated_data['password']

        first_name, *last_name = full_name.strip().split(' ', 1)

        user = User.objects.create_user(
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name[0] if last_name else ''
        )
        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()


class PasswordChangeSerializer(serializers.Serializer):
    """Serializer for password change"""
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, min_length=8)
    new_password_confirm = serializers.CharField(required=True)

    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError("New passwords don't match")
        return attrs


class EmailVerificationSerializer(serializers.Serializer):
    """Serializer for email verification"""
    code = serializers.CharField(max_length=6, min_length=6)


class PasswordResetRequestSerializer(serializers.Serializer):
    """Serializer for password reset request"""
    email = serializers.EmailField()


class PasswordResetConfirmSerializer(serializers.Serializer):
    """Serializer for password reset confirmation"""
    email = serializers.EmailField()
    code = serializers.CharField(max_length=6, min_length=6)
    new_password = serializers.CharField(min_length=8)
    new_password_confirm = serializers.CharField(min_length=8)

    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError("Passwords don't match")
        return attrs


class LogoutSerializer(serializers.Serializer):
    refresh = serializers.CharField()


class PreferencesUpdateSerializer(serializers.Serializer):
    language = serializers.CharField(required=False)
    email_notifications = serializers.BooleanField(required=False)
    marketing_emails = serializers.BooleanField(required=False)


class PreRegisterCodeVerifySerializer(serializers.Serializer):
    email = serializers.EmailField()
    code = serializers.CharField(max_length=10)


class EmptySerializer(serializers.Serializer):
    pass
