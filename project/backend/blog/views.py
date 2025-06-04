from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Exists, OuterRef
from core.permissions import IsAdminUserOrReadOnly
from .models import Post, Comment, Tag, Ingredient, RecipeStep
from .serializers import PostSerializer, CommentSerializer, TagSerializer, IngredientSerializer, RecipeStepSerializer

class TagViewSet(viewsets.ModelViewSet):
    queryset = Tag.objects.all()
    serializer_class = TagSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    http_method_names = ['get', 'post', 'delete']

class IngredientViewSet(viewsets.ModelViewSet):
    queryset = Ingredient.objects.all()
    serializer_class = IngredientSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    http_method_names = ['get', 'post', 'delete']

class RecipeStepViewSet(viewsets.ModelViewSet):
    serializer_class = RecipeStepSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        return RecipeStep.objects.filter(post_id=self.kwargs.get('post_pk'))
    
    def perform_create(self, serializer):
        post = Post.objects.get(pk=self.kwargs.get('post_pk'))
        serializer.save(post=post)

class PostViewSet(viewsets.ModelViewSet):
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        user = self.request.user
        queryset = Post.objects.all()
        
        # Аннотация is_liked
        if user.is_authenticated:
            queryset = queryset.annotate(
                is_liked=Exists(
                    Post.liked_by.through.objects.filter(
                        post_id=OuterRef('pk'),
                        customuser_id=user.id
                    )
                )
            )
        
        if not user.is_staff:
            queryset = queryset.filter(status='published')
            
        return queryset

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    @action(detail=True, methods=['post'])
    def like(self, request, pk=None):
        post = self.get_object()
        user = request.user
        
        if user in post.liked_by.all():
            post.liked_by.remove(user)
        else:
            post.liked_by.add(user)
        
        # Атомарное обновление счетчика
        post.likes_count = post.liked_by.count()
        post.save(update_fields=['likes_count'])
        
        return Response({'status': 'success', 'likes': post.likes_count})

class AdminPostViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAdminUserOrReadOnly]
    queryset = Post.objects.all()
    serializer_class = PostSerializer

    @action(detail=True, methods=['patch'])
    def status(self, request, pk=None):
        post = self.get_object()
        new_status = request.data.get('status')
        if new_status in dict(Post.STATUS_CHOICES).keys():
            post.status = new_status
            post.save()
            return Response({'status': 'updated'})
        return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)

class CommentViewSet(viewsets.ModelViewSet):
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    queryset = Comment.objects.all()
    
    def get_queryset(self):
        post_id = self.kwargs.get('post_pk')
        if post_id:
            return Comment.objects.filter(post_id=post_id)
        return Comment.objects.all()

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)