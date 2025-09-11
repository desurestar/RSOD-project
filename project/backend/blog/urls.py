from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import AdminPostViewSet, CommentViewSet, IngredientSyncView, IngredientViewSet, PostIngredientCreateView, PostViewSet, RecipeStepCreateView, RecipeStepSyncView, TagViewSet

router = DefaultRouter()
router.register(r'posts', PostViewSet, basename='post')
router.register(r'admin/posts', AdminPostViewSet, basename='admin-post')
router.register(r'tags', TagViewSet, basename='tag')
router.register(r'ingredients', IngredientViewSet, basename='ingredient')
router.register(r'comments', CommentViewSet, basename='comment')

custom_urlpatterns = [
    path(
        'posts/<int:post_pk>/comments/',
        CommentViewSet.as_view({'get': 'list', 'post': 'create'}),
        name='post-comments'
    ),
    path('posts/<int:pk>/likes/',
         PostViewSet.as_view({'post': 'like'}),
         name='post-like'),
    path('admin/posts/<int:pk>/status/',
         AdminPostViewSet.as_view({'patch': 'status'}),
         name='admin-post-status'),
    path('posts/<int:post_id>/ingredients/', PostIngredientCreateView.as_view(), name='post-add-ingredient'),
    path('posts/<int:post_id>/steps/', RecipeStepCreateView.as_view(), name='post-add-steps-bulk'),
    path('posts/<int:post_id>/ingredients/sync/', IngredientSyncView.as_view(), name='post-ingredients-sync'),
    path('posts/<int:post_id>/steps/sync/', RecipeStepSyncView.as_view(), name='post-steps-sync'),
]

urlpatterns = [
    path('', include(router.urls)),
    path('', include(custom_urlpatterns)),
]
