from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from django.shortcuts import get_object_or_404
from django.core.files.images import get_image_dimensions
from .models import CustomUser
from .serializers import (
    UserSerializer,
    UserRegisterSerializer,
    CustomTokenObtainPairSerializer,
    UserUpdateSerializer
)

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class RegisterView(generics.CreateAPIView):
    serializer_class = UserRegisterSerializer
    permission_classes = [permissions.AllowAny]

class UserProfileView(generics.RetrieveUpdateAPIView):
    queryset = CustomUser.objects.all()
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return UserUpdateSerializer
        return UserSerializer

    def get_object(self):
        return self.request.user

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

class UserAvatarUpdateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, *args, **kwargs):
        user = request.user
        avatar_file = request.FILES.get('avatar')

        if not avatar_file:
            return Response(
                {'error': 'No avatar file provided'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # Валидация файла
            if avatar_file.size > 5 * 1024 * 1024:
                return Response(
                    {'error': 'File size too large. Maximum 5MB allowed.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            width, height = get_image_dimensions(avatar_file)
            if width < 100 or height < 100:
                return Response(
                    {'error': 'Image dimensions too small. Minimum 100x100 pixels.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Удаляем старый аватар
            if user.avatar:
                try:
                    user.avatar.delete()
                except Exception as e:
                    print(f"Error deleting old avatar: {e}")

            # Сохраняем новый аватар
            user.avatar.save(avatar_file.name, avatar_file)
            user.save()

            # Принудительно обновляем аватар
            user.refresh_from_db()

            serializer = UserSerializer(user, context={'request': request})
            return Response(serializer.data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {'error': f'Error saving avatar: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class UserFollowersView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, user_id):
        user = get_object_or_404(CustomUser, pk=user_id)
        followers = user.subscribers.all()
        serializer = UserSerializer(followers, many=True, context={'request': request})
        return Response(serializer.data)

class UserFollowingView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, user_id):
        user = get_object_or_404(CustomUser, pk=user_id)
        following = user.subscriptions.all()
        serializer = UserSerializer(following, many=True, context={'request': request})
        return Response(serializer.data)

class UserUnsubscribeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, user_id):
        user_to_unsubscribe = get_object_or_404(CustomUser, pk=user_id)
        request.user.subscriptions.remove(user_to_unsubscribe)
        return Response(
            {'status': 'unsubscribed'},
            status=status.HTTP_200_OK
        )