from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import CustomTokenObtainPairView, RegisterView, UserAvatarUpdateView, UserByUsernameView, UserFollowersView, UserFollowingView, UserLikedPostsView, UserListView, UserPostsView, UserProfileView, UserPublicDetailView, UserRetrieveUpdateDestroyView, UserSubscribeView, UserUnsubscribeView

router = DefaultRouter()

urlpatterns = [
    path('token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('register/', RegisterView.as_view(), name='register'),
    path('profile/', UserProfileView.as_view(), name='user-profile'),
    path('profile/avatar/', UserAvatarUpdateView.as_view(), name='user-avatar-update'),

    path('users/by-username/<str:username>/', UserByUsernameView.as_view(), name='user-by-username'),
    path('users/<int:user_id>/', UserPublicDetailView.as_view(), name='user-public-detail'),

    path('users/<int:user_id>/followers/', UserFollowersView.as_view(), name='user-followers'),
    path('users/<int:user_id>/following/', UserFollowingView.as_view(), name='user-following'),

    path('users/<int:user_id>/subscribe/', UserSubscribeView.as_view(), name='user-subscribe'),
    path('users/<int:user_id>/unsubscribe/', UserUnsubscribeView.as_view(), name='user-unsubscribe'),

    path('users/<int:user_id>/posts/', UserPostsView.as_view(), name='user-posts'),
    path('users/<int:user_id>/liked/', UserLikedPostsView.as_view(), name='user-liked-posts'),

    path('admin/users/', UserListView.as_view(), name='user-list'),
    path('admin/users/<int:pk>/', UserRetrieveUpdateDestroyView.as_view(), name='user-detail'),
] + router.urls
