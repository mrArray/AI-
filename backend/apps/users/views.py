from django.core.cache import cache
from rest_framework import status, generics, permissions, serializers
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth import get_user_model
from django.utils import timezone
from drf_spectacular.utils import extend_schema,extend_schema_view, OpenApiResponse
from drf_spectacular.types import OpenApiTypes
from django.core.mail import send_mail
from django.conf import settings

from .models import UserProfile
from .serializers import (
    LoginSerializer, UserSerializer, UserProfileSerializer, UserStatsSerializer,
    RegisterSerializer, PasswordChangeSerializer, EmailVerificationSerializer,
    PasswordResetRequestSerializer, PasswordResetConfirmSerializer, 
    PreRegisterEmailSerializer , LogoutSerializer,
    PreferencesUpdateSerializer,
    PreRegisterCodeVerifySerializer
)

from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

User = get_user_model()



class PreRegisterEmailVerificationView(APIView):
    """
    Verify email before registration: check if email is available and send a verification code.
    """
    permission_classes = [permissions.AllowAny]
    serializer_class = PreRegisterEmailSerializer

    @extend_schema(
        summary="Pre-register email verification",
        description="Check if email is available and send a verification code before registration"
    )
    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']

        if User.objects.filter(email=email).exists():
            return Response({'error': 'Email is already registered.'}, status=status.HTTP_400_BAD_REQUEST)

        # Create verification code and store in cache
        import random
        code = str(random.randint(100000, 999999))
        cache.set(f"pre_register_code_{email}", code, timeout=10 * 60)  # 10 minutes

        # Bilingual HTML email template
        html_message = f"""
        <div style="font-family: 'Microsoft YaHei', Arial, sans-serif; max-width: 500px; margin: auto; border: 1px solid #eee; border-radius: 8px; padding: 24px; background: #fafcff;">
            <h2 style="color: #2d8cf0; margin-bottom: 16px;">学术论文生成器</h2>
            <p style="font-size: 16px; color: #222;">
                <b>您的验证码：</b>
                <span style="font-size: 28px; color: #2d8cf0; letter-spacing: 4px; font-weight: bold;">{code}</span>
            </p>
            <p style="color: #555; margin-top: 24px; font-size: 15px;">
                请输入此验证码以验证您的邮箱。验证码有效期为 <b>10分钟</b>。
            </p>
            <div style="margin-top: 32px; border-top: 1px dashed #e0e0e0; padding-top: 18px;">
                <p style="font-size: 12px; color: #aaa;">
                    如果不是您本人操作，请忽略此邮件。<br>
                    感谢您使用学术论文生成器！
                </p>
            </div>
        </div>
        """

        plain_message = (
            f"您的验证码是: {code}\n\n"
            "请输入此验证码以验证您的邮箱。验证码有效期为10分钟。\n"
            "如果不是您本人操作，请忽略此邮件。"
        )

        send_mail(
            subject="Your Verification Code | 验证码",
            message=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email],
            html_message=html_message,
        )

        return Response({'message': 'Verification code sent to your email.'})


class PreRegisterCodeVerifyView(APIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = PreRegisterCodeVerifySerializer

    @extend_schema(
        summary="Verify pre-registration code",
        description="Verify the code sent to email before registration"
    )
    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']
        code = serializer.validated_data['code']

        cached_code = cache.get(f"pre_register_code_{email}")
        if cached_code and cached_code == code:
            cache.delete(f"pre_register_code_{email}")
            cache.set(f"pre_register_verified_{email}", True, timeout=10 * 60)
            return Response({'message': 'Email verified. You can now register.'})
        return Response({'error': 'Invalid or expired verification code.'}, status=status.HTTP_400_BAD_REQUEST)


class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterSerializer

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            # Check if email was verified
            if not cache.get(f"pre_register_verified_{email}"):
                return Response({'error': 'Please verify your email before registering.'}, status=400)
            
            # Save user without username
            user = serializer.save()
            user.is_verified = True  # Mark as verified since already checked
            user.save()

            cache.delete(f"pre_register_verified_{email}")  # Clean up
            user_data = UserSerializer(user).data
            return Response({"message": "Registration successful.", "user": user_data}, status=201)
        return Response(serializer.errors, status=400)


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = LoginSerializer

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=400)

        email = serializer.validated_data["email"]
        password = serializer.validated_data["password"]

        user = User.objects.filter(email=email).first()
        if user and user.check_password(password):
            if not user.is_verified:
                return Response(
                    {"detail": "Please verify your email before logging in."},
                    status=403
                )
            refresh = RefreshToken.for_user(user)
            user_data = UserSerializer(user).data  # Serialize user info (includes profile and credits)
            return Response({
                "refresh": str(refresh),
                "access": str(refresh.access_token),
                "user": user_data
            })
        return Response({"detail": "Invalid credentials"}, status=401)


class GoogleLoginView(APIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = serializers.Serializer  # Dummy serializer for schema

    def post(self, request):
        token = request.data.get("token")

        if not token:
            return Response({"error": "Missing Google token"}, status=400)

        try:
            idinfo = id_token.verify_oauth2_token(token, google_requests.Request())
            email = idinfo["email"]
            name = idinfo.get("name", "")
            picture = idinfo.get("picture", "")

            # Now we create/get user without username
            first_name = name.split(" ")[0] if name else ""
            last_name = " ".join(name.split(" ")[1:]) if name and len(name.split(" ")) > 1 else ""

            user, created = User.objects.get_or_create(
                email=email,
                defaults={
                    "first_name": first_name,
                    "last_name": last_name,
                    "is_verified": True
                }
            )

            refresh = RefreshToken.for_user(user)

            return Response({
                "refresh": str(refresh),
                "access": str(refresh.access_token),
                "user": {
                    "id": user.id,
                    "name": f"{user.first_name} {user.last_name}".strip(),
                    "email": user.email,
                    "avatar": picture
                }
            })

        except ValueError:
            return Response({"error": "Invalid Google token"}, status=400)
        except Exception as e:
            return Response({"error": f"Login failed: {str(e)}"}, status=500)

@extend_schema_view(
    put=extend_schema(exclude=True),  
)
class UserProfileView(generics.RetrieveUpdateAPIView):
    """User profile management"""
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        return self.request.user

    @extend_schema(
        summary="Get user profile",
        description="Retrieve current user's profile information"
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    @extend_schema(
        summary="Update user profile",
        description="Update current user's profile information"
    )
    def patch(self, request, *args, **kwargs):
        return super().patch(request, *args, **kwargs)

class UserStatsView(generics.RetrieveAPIView):
    """User statistics endpoint"""
    serializer_class = UserStatsSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        return self.request.user
    
    @extend_schema(
        summary="Get user statistics",
        description="Retrieve current user's usage statistics"
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)


class EmailVerificationView(APIView):
    """Email verification endpoint"""
    permission_classes = [IsAuthenticated]
    serializer_class = EmailVerificationSerializer
    
    @extend_schema(
        summary="Verify email address",
        description="Verify user's email address with verification code"
    )
    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        code = serializer.validated_data['code']
        user = request.user
        
        if user.verify_code(code):
            return Response({
                'message': 'Email verified successfully'
            })
        else:
            return Response({
                'error': 'Invalid or expired verification code'
            }, status=status.HTTP_400_BAD_REQUEST)


class PasswordChangeView(APIView):
    """Password change endpoint"""
    permission_classes = [IsAuthenticated]
    serializer_class = PasswordChangeSerializer
    
    @extend_schema(
        summary="Change password",
        description="Change user's password"
    )
    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = request.user
        old_password = serializer.validated_data['old_password']
        new_password = serializer.validated_data['new_password']
        
        # Verify old password
        if not user.check_password(old_password):
            return Response({
                'error': 'Current password is incorrect'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Set new password
        user.set_password(new_password)
        user.save()
        
        return Response({
            'message': 'Password changed successfully'
        })


class PasswordResetRequestView(APIView):
    """Password reset request endpoint"""
    permission_classes = [AllowAny]
    serializer_class = PasswordResetRequestSerializer

    @extend_schema(
        summary="Request password reset",
        description="Request a password reset code via email"
    )
    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data['email']

        try:
            user = User.objects.get(email=email)
            # Generate a 6-digit code
            import random
            code = str(random.randint(100000, 999999))
            cache.set(f"password_reset_code_{email}", code, timeout=10 * 60)  # 10 minutes

            # Bilingual HTML email template
            html_message = f"""
            <div style="font-family: 'Microsoft YaHei', Arial, sans-serif; max-width: 500px; margin: auto; border: 1px solid #eee; border-radius: 8px; padding: 24px; background: #fafcff;">
                <h2 style="color: #2d8cf0; margin-bottom: 16px;">学术论文生成器</h2>
                <p style="font-size: 16px; color: #222;">
                    <b>您的重置验证码：</b>
                    <span style="font-size: 28px; color: #2d8cf0; letter-spacing: 4px; font-weight: bold;">{code}</span>
                </p>
                <p style="color: #555; margin-top: 24px; font-size: 15px;">
                    请输入此验证码以重置您的密码。验证码有效期为 <b>10分钟</b>。
                </p>
                <div style="margin-top: 32px; border-top: 1px dashed #e0e0e0; padding-top: 18px;">
                    <p style="font-size: 12px; color: #aaa;">
                        如果不是您本人操作，请忽略此邮件。<br>
                        感谢您使用学术论文生成器！
                    </p>
                </div>
            </div>
            """

            plain_message = (
                f"您的重置验证码是: {code}\n\n"
                "请输入此验证码以重置您的密码。验证码有效期为10分钟。\n"
                "如果不是您本人操作，请忽略此邮件。"
            )

            send_mail(
                subject="Password Reset Code | 重置验证码",
                message=plain_message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[email],
                html_message=html_message,
            )

            return Response({
                'message': 'Password reset code sent to your email'
            })
        except User.DoesNotExist:
            # Don't reveal if email exists
            return Response({
                'message': 'If the email exists, a reset code has been sent'
            })


class PasswordResetConfirmView(APIView):
    """Password reset confirmation endpoint"""
    permission_classes = [AllowAny]
    serializer_class = PasswordResetConfirmSerializer

    @extend_schema(
        summary="Confirm password reset",
        description="Reset password using verification code"
    )
    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data['email']
        code = serializer.validated_data['code']
        new_password = serializer.validated_data['new_password']

        cached_code = cache.get(f"password_reset_code_{email}")
        if cached_code and cached_code == code:
            try:
                user = User.objects.get(email=email)
                user.set_password(new_password)
                if hasattr(user, "unlock_account"):
                    user.unlock_account()  # Unlock account if it was locked
                user.save()
                cache.delete(f"password_reset_code_{email}")
                return Response({'message': 'Password reset successfully'})
            except User.DoesNotExist:
                # Don't reveal if email exists
                pass
        return Response({'error': 'Invalid or expired reset code'}, status=status.HTTP_400_BAD_REQUEST)


class LogoutView(APIView):
    """Logout endpoint"""
    permission_classes = [IsAuthenticated]
    serializer_class = LogoutSerializer
    
    @extend_schema(
        summary="User logout",
        description="Logout user and blacklist refresh token"
    )
    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
            
            return Response({
                'message': 'Logged out successfully'
            })
        except Exception:
            return Response({
                'message': 'Logged out successfully'
            })


class DeleteAccountView(APIView):
    """Delete user account"""
    permission_classes = [IsAuthenticated]

    def delete(self, request):
        user = request.user
        user.is_active = False
        user.email = f"deleted_{user.id}_{user.email}"
        user.save()
        return Response({"message": "Account deleted successfully"})


class UserPreferencesView(APIView):
    """User preferences endpoint"""
    permission_classes = [IsAuthenticated]

    @extend_schema(
        summary="Get user preferences",
        description="Retrieve user's application preferences",
        responses={200: OpenApiResponse(description="User preferences")}
    )
    def get(self, request):
        """Get user preferences"""
        user = request.user
        
        preferences = {
            'language': user.language,
            'email_notifications': user.email_notifications,
            'marketing_emails': user.marketing_emails,
        }
        
        return Response(preferences)

    @extend_schema(
        summary="Update user preferences",
        description="Update user's application preferences",
        request=PreferencesUpdateSerializer,
        responses={200: OpenApiResponse(description="Preferences updated")}
    )
    def patch(self, request):
        """Update user preferences"""
        serializer = PreferencesUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        
        user = request.user
        for field in ['language', 'email_notifications', 'marketing_emails']:
            if field in data:
                setattr(user, field, data[field])
        
        user.save()
        
        return Response({
            'message': 'Preferences updated successfully'
        })

