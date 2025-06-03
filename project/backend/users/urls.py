from django.urls import path
from .views import user_profile, CustomTokenObtainPairView, RegisterView

urlpatterns = [
    path('profile/', user_profile, name='user-profile'),
    path('token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('register/', RegisterView.as_view(), name='register'),
]