from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Count 
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from django.shortcuts import get_object_or_404
from django.core.files.images import get_image_dimensions
from rest_framework.parsers import MultiPartParser, JSONParser
from core.permissions import IsAdminUserOrReadOnly
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

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Генерация токенов
        refresh = RefreshToken.for_user(user)
        tokens = {
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        }
        
        # Сериализация пользователя
        user_serializer = UserSerializer(user, context={'request': request})
        
        return Response({
            'tokens': tokens,
            'user': user_serializer.data
        }, status=status.HTTP_201_CREATED)

class UserProfileView(generics.RetrieveUpdateAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, JSONParser]

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return UserUpdateSerializer
        return UserSerializer
    
    def perform_update(self, serializer):
        if 'avatar' in self.request.data and self.request.data['avatar'] is None:
            self.request.user.avatar.delete()
        serializer.save()

    def get_object(self):
        # Исправленный метод с аннотацией счетчиков
        user = self.request.user
        return CustomUser.objects.filter(pk=user.pk).annotate(
            subscribers_count=Count('subscribers'),
            subscriptions_count=Count('subscriptions'),
            posts_count=Count('posts'),
            liked_posts_count=Count('liked_posts')
        ).first()

    def update(self, request, *args, **kwargs):
        if not request.user.is_admin and 'role' in request.data:
            request.data.pop('role')
        return super().update(request, *args, **kwargs)

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

            if user.avatar:
                try:
                    user.avatar.delete()
                except Exception as e:
                    print(f"Error deleting old avatar: {e}")

            user.avatar.save(avatar_file.name, avatar_file)
            user.save()
            user.refresh_from_db()

            serializer = UserSerializer(user, context={'request': request})
            return Response(serializer.data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {'error': f'Error saving avatar: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class UserFollowersView(generics.ListAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = get_object_or_404(CustomUser, pk=self.kwargs['user_id'])
        return user.subscribers.all()

class UserFollowingView(generics.ListAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = get_object_or_404(CustomUser, pk=self.kwargs['user_id'])
        return user.subscriptions.all()

class UserUnsubscribeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, user_id):
        user_to_unsubscribe = get_object_or_404(CustomUser, pk=user_id)
        request.user.subscriptions.remove(user_to_unsubscribe)
        return Response(
            {'status': 'unsubscribed'},
            status=status.HTTP_200_OK
        )

class UserListView(generics.ListAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdminUserOrReadOnly]

class UserRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdminUserOrReadOnly]