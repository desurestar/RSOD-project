from django.contrib.auth import get_user_model
from django.core.validators import EmailValidator
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['username'] = user.username
        token['avatar_url'] = user.avatar_url
        token['role'] = user.role
        token['is_admin'] = user.is_admin
        return token

class UserRegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'display_name']
        extra_kwargs = {
            'password': {'write_only': True},
            'email': {'required': True}
        }

    def validate(self, data):
        if len(data['password']) < 8:
            raise serializers.ValidationError('Password must be at least 8 characters long.')
        return data

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            display_name=validated_data.get('display_name', '')
        )
        return user

class UserSerializer(serializers.ModelSerializer):
    avatar_url = serializers.SerializerMethodField()
    is_admin = serializers.BooleanField(read_only=True)
    subscribers_count = serializers.IntegerField(read_only=True)
    subscriptions_count = serializers.IntegerField(read_only=True)
    posts_count = serializers.IntegerField(read_only=True)
    liked_posts_count = serializers.IntegerField(read_only=True)
    is_subscribed = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id','username','email','display_name','avatar_url','role',
            'is_admin','subscribers_count','subscriptions_count',
            'posts_count','liked_posts_count','is_subscribed'
        ]

    def get_avatar_url(self, obj):
        request = self.context.get('request')
        if obj.avatar and request:
            return request.build_absolute_uri(obj.avatar.url)
        return None

    def get_is_subscribed(self, obj):
        request = self.context.get('request')
        user = getattr(request, 'user', None)
        if not user or not user.is_authenticated or user.id == obj.id:
            return False
        return obj.subscribers.filter(pk=user.pk).exists()

class UserUpdateSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(
        validators=[EmailValidator()],
        required=True
    )

    class Meta:
        model = User
        fields = ['display_name', 'email', 'role']
        extra_kwargs = {
            'display_name': {'required': False, 'allow_blank': True},
            'email': {'required': True},
            'role': {'required': False}
        }

    def validate_role(self, value):
        request = self.context.get('request')
        if request and not request.user.is_admin:
            raise serializers.ValidationError('Only admin can change roles.')
        return value

    def validate_email(self, value):
        if User.objects.filter(email=value).exclude(pk=self.instance.pk).exists():
            raise serializers.ValidationError('Email already in use.')
        return value
