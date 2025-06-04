from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.core.validators import EmailValidator
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['username'] = user.username
        token['avatar_url'] = user.avatar_url
        return token

class UserRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'display_name']
        extra_kwargs = {
            'password': {'write_only': True},
            'email': {'required': True}
        }

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
    subscribers_count = serializers.IntegerField(read_only=True)
    subscriptions_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'display_name',
            'avatar_url', 'subscribers_count', 'subscriptions_count'
        ]
        read_only_fields = ['id', 'username']

    def get_avatar_url(self, obj):
        if obj.avatar:
            return self.context['request'].build_absolute_uri(obj.avatar.url)
        return None

class UserUpdateSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(
        validators=[EmailValidator()],
        required=True
    )

    class Meta:
        model = User
        fields = ['display_name', 'email']
        extra_kwargs = {
            'display_name': {'required': False, 'allow_blank': True},
            'email': {'required': True}
        }

    def validate_email(self, value):
        if User.objects.filter(email=value).exclude(pk=self.instance.pk).exists():
            raise serializers.ValidationError("Email already in use.")
        return value