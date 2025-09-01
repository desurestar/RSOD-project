import hashlib
import json

from django.conf import settings
from django.core.cache import cache
from django.db import transaction
from django.db.models import Exists, F, OuterRef
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.authentication import JWTAuthentication

from core.permissions import IsAdminUserOrReadOnly

from .models import Comment, Ingredient, Post, PostIngredient, RecipeStep, Tag
from .serializers import CommentSerializer, IngredientSerializer, PostIngredientCreateSerializer, PostSerializer, RecipeStepCreateSerializer, RecipeStepSerializer, TagSerializer


class TagViewSet(viewsets.ModelViewSet):
    queryset = Tag.objects.all()
    serializer_class = TagSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    authentication_classes = [JWTAuthentication]
    http_method_names = ['get', 'post', 'delete']

class IngredientViewSet(viewsets.ModelViewSet):
    queryset = Ingredient.objects.all()
    serializer_class = IngredientSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    authentication_classes = [JWTAuthentication]
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
    authentication_classes = [JWTAuthentication]

    def get_queryset(self):
        user = self.request.user
        queryset = (Post.objects.all()
                    .select_related('author')
                    .prefetch_related(
                        'tags',
                        'steps',
                        'postingredient_set__ingredient'  # <-- исправлено
                    ))

        # Фильтр по типу поста (?post_type=article|recipe)
        post_type = self.request.query_params.get('post_type')
        if post_type in dict(Post.POST_TYPE_CHOICES):
            queryset = queryset.filter(post_type=post_type)

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

    @action(
        detail=True,
        methods=['post'],
        permission_classes=[IsAuthenticated],
        url_path='likes'
    )
    def like(self, request, pk=None):
        post = self.get_object()
        user = request.user
        with transaction.atomic():
            if post.liked_by.filter(id=user.id).exists():
                post.liked_by.remove(user)
                # безопасно уменьшаем (не даём < 0)
                Post.objects.filter(id=post.id, likes_count__gt=0).update(
                    likes_count=F('likes_count') - 1
                )
                is_liked = False
            else:
                post.liked_by.add(user)
                Post.objects.filter(id=post.id).update(
                    likes_count=F('likes_count') + 1
                )
                is_liked = True
            post.refresh_from_db(fields=['likes_count'])
        return Response({'likes': post.likes_count, 'is_liked': is_liked})

    @action(
        detail=True,
        methods=['post'],
        permission_classes=[permissions.AllowAny],
        # ВАЖНО: не отключаем authentication_classes, чтобы JWT распознался
        url_path='views'
    )
    def view(self, request, pk=None):
        post = self.get_object()
        ttl = getattr(settings, 'POST_VIEW_UNIQUE_TTL', 21600)
        if request.user.is_authenticated:
            viewer_id = f'u{request.user.id}'
        else:
            ip = (request.META.get('HTTP_X_FORWARDED_FOR','').split(',')[0].strip()
                  or request.META.get('REMOTE_ADDR',''))
            ua = request.META.get('HTTP_USER_AGENT', '')
            fp_raw = f'{ip}:{ua}'
            viewer_id = 'a' + hashlib.sha256(fp_raw.encode()).hexdigest()[:32]
        cache_key = f'pv:{post.id}:{viewer_id}'
        if cache.add(cache_key, 1, timeout=ttl):
            Post.objects.filter(id=post.id).update(views_count=F('views_count') + 1)
            post.refresh_from_db(fields=['views_count'])
        return Response({'views': post.views_count})

class AdminPostViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAdminUserOrReadOnly]
    authentication_classes = [JWTAuthentication]
    queryset = Post.objects.all()
    serializer_class = PostSerializer

    @action(detail=True, methods=['patch'])
    def status(self, request, pk=None):
        post = self.get_object()
        new_status = request.data.get('status')
        if new_status not in dict(Post.STATUS_CHOICES):
            return Response({'detail': 'Invalid status'}, status=400)
        post.status = new_status
        post.save(update_fields=['status'])
        return Response(PostSerializer(post, context={'request': request}).data)

class CommentViewSet(viewsets.ModelViewSet):
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    queryset = Comment.objects.all().select_related('author', 'post')

    def get_queryset(self):
        post_id = self.kwargs.get('post_pk')
        qs = super().get_queryset()
        if post_id:
            qs = qs.filter(post_id=post_id)
        return qs.order_by('created_at')

    def perform_create(self, serializer):
        # Берём post из nested URL или из тела запроса
        post_pk = self.kwargs.get('post_pk') or self.request.data.get('post')
        if not post_pk:
            raise ValueError('post id required')
        serializer.save(author=self.request.user, post_id=post_pk)

class PostIngredientCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, post_id):
        print('DEBUG PostIngredientCreateView request.data:', request.data)
        post = Post.objects.get(pk=post_id)
        serializer = PostIngredientCreateSerializer(data=request.data, many=isinstance(request.data, list))
        if not serializer.is_valid():
            print('DEBUG serializer.errors:', serializer.errors)
            return Response(serializer.errors, status=400)
        created = []
        for item in serializer.validated_data:
            ingredient_id = item['ingredient_id']
            quantity = item['quantity']
            obj = PostIngredient.objects.create(
                post=post,
                ingredient_id=ingredient_id,
                quantity=quantity
            )
            created.append(obj.id)
        return Response({'created': created}, status=status.HTTP_201_CREATED)

class RecipeStepCreateView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, post_id):
        print('DEBUG steps bulk request.data keys:', list(request.data.keys()))
        print('DEBUG FILES:', request.FILES)
        post = Post.objects.get(pk=post_id)

        raw = request.data.get('step_data')
        if not raw:
            return Response({'error': 'No step_data provided'}, status=400)

        # Если фронт случайно отправил несколько step_data — собрать их
        if isinstance(raw, list):
            # может быть список JSON-строк
            combined = []
            for part in raw:
                if isinstance(part, str):
                    try:
                        parsed = json.loads(part)
                        if isinstance(parsed, list):
                            combined.extend(parsed)
                        elif isinstance(parsed, dict):
                            combined.append(parsed)
                    except Exception as e:
                        return Response({'error': f'Invalid step_data chunk: {e}'}, status=400)
                elif isinstance(part, dict):
                    combined.append(part)
            steps_payload = combined
        elif isinstance(raw, str):
            try:
                parsed = json.loads(raw)
                steps_payload = parsed if isinstance(parsed, list) else [parsed]
            except Exception as e:
                return Response({'error': f'Invalid JSON: {e}'}, status=400)
        elif isinstance(raw, dict):
            steps_payload = [raw]
        else:
            return Response({'error': 'Unsupported step_data type'}, status=400)

        if not steps_payload:
            return Response({'error': 'Empty steps list'}, status=400)

        # Валидация без image (файлы отдельные)
        serializer = RecipeStepCreateSerializer(data=steps_payload, many=True)
        if not serializer.is_valid():
            print('DEBUG step serializer errors:', serializer.errors)
            return Response(serializer.errors, status=400)

        created_objs = []
        with transaction.atomic():
            for idx, item in enumerate(serializer.validated_data):
                image = request.FILES.get(f'step_images_{idx}')
                obj = RecipeStep.objects.create(
                    post=post,
                    order=item['order'],
                    description=item['description'],
                    image=image
                )
                created_objs.append(obj)

        return Response(
            {'steps': RecipeStepSerializer(created_objs, many=True).data},
            status=status.HTTP_201_CREATED
        )

