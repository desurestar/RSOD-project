from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PostViewSet, AdminPostViewSet, CommentViewSet, TagViewSet, IngredientViewSet, RecipeStepViewSet

router = DefaultRouter()
router.register(r'posts', PostViewSet, basename='post')
router.register(r'admin/posts', AdminPostViewSet, basename='admin-post')
router.register(r'tags', TagViewSet, basename='tag')
router.register(r'ingredients', IngredientViewSet, basename='ingredient')
router.register(r'comments', CommentViewSet, basename='comment')

custom_urlpatterns = [
    path('posts/<int:post_pk>/comments/', 
         CommentViewSet.as_view({'get': 'list', 'post': 'create'}),
         name='post-comments'),
    path('posts/<int:post_pk>/likes/',
         PostViewSet.as_view({'post': 'like'}),
         name='post-like'),
    path('admin/posts/<int:pk>/status/',
         AdminPostViewSet.as_view({'patch': 'status'}),
         name='admin-post-status'),
    path('posts/<int:post_pk>/steps/', 
         RecipeStepViewSet.as_view({'get': 'list', 'post': 'create'}),
         name='post-steps'),
    path('posts/<int:post_pk>/steps/<int:pk>/', 
         RecipeStepViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}),
         name='post-step-detail'),
]

urlpatterns = [
    path('', include(router.urls)),
    path('', include(custom_urlpatterns)),
]