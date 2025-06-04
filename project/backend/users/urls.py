from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import (
    CustomTokenObtainPairView,
    RegisterView,
    UserProfileView,
    UserAvatarUpdateView,
    UserFollowersView,
    UserFollowingView,
    UserUnsubscribeView
)

router = DefaultRouter()

urlpatterns = [
    path('token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('register/', RegisterView.as_view(), name='register'),
    path('profile/', UserProfileView.as_view(), name='user-profile'),
    path('profile/avatar/', UserAvatarUpdateView.as_view(), name='user-avatar-update'),
    path('users/<int:user_id>/followers/', UserFollowersView.as_view(), name='user-followers'),
    path('users/<int:user_id>/following/', UserFollowingView.as_view(), name='user-following'),
    path('users/<int:user_id>/unsubscribe/', UserUnsubscribeView.as_view(), name='user-unsubscribe'),
] + router.urls