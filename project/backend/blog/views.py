import hashlib
import json

from django.conf import settings
from django.core.cache import cache
from django.db import transaction
from django.db.models import Count, Exists, F, IntegerField, OuterRef, Q, Value
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.filters import SearchFilter
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.authentication import JWTAuthentication

from core.permissions import IsAdminUserOrReadOnly

from .models import Comment, Ingredient, Post, PostIngredient, RecipeStep, Tag
from .pagination import AdminPageNumberPagination, SmallPageNumberPagination
from .serializers import CommentSerializer, IngredientSerializer, PostIngredientCreateSerializer, PostSerializer, RecipeStepCreateSerializer, RecipeStepSerializer, TagSerializer
from .utils import send_new_post_notification


class PostViewSet(viewsets.ModelViewSet):
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    authentication_classes = [JWTAuthentication]
    pagination_class = SmallPageNumberPagination  # <-- добавлено
    filter_backends = [SearchFilter]
    search_fields = ['title', 'author__username', 'tags__name']

    def get_queryset(self):
        user = self.request.user
        qp = self.request.query_params
        queryset = (Post.objects.all()
                    .select_related('author')
                    .prefetch_related(
                        'tags',
                        'steps',
                        'postingredient_set__ingredient'
                    ))

        # Тип поста
        post_type = qp.get('post_type')
        if post_type in dict(Post.POST_TYPE_CHOICES):
            queryset = queryset.filter(post_type=post_type)

        # Фильтрация по времени / калориям
        max_time = qp.get('max_time')
        if max_time:
            queryset = queryset.filter(cooking_time__lte=max_time)

        max_cal = qp.get('max_calories')
        if max_cal:
            queryset = queryset.filter(calories__lte=max_cal)

        # Теги
        tags_raw = qp.get('tags')
        tag_slugs = []
        if tags_raw:
            tag_slugs = [t.strip() for t in tags_raw.split(',') if t.strip()]
            if tag_slugs:
                queryset = queryset.filter(tags__slug__in=tag_slugs).distinct()

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

        # Аннотация релевантности (число совпавших тегов)
        if tag_slugs:
            queryset = queryset.annotate(
                matched_tags=Count('tags', filter=Q(tags__slug__in=tag_slugs), distinct=True)
            )
        else:
            queryset = queryset.annotate(
                matched_tags=Value(0, output_field=IntegerField())
            )

        # Статус (неадмин видит только опубликованные)
        if not user.is_staff:
            queryset = queryset.filter(status='published')

        # Сортировка
        ordering = qp.get('ordering')  # likes|-likes|views|-views|relevance|-relevance
        mapping = {
            'likes': 'likes_count',
            '-likes': '-likes_count',
            'views': 'views_count',
            '-views': '-views_count',
            'relevance': '-matched_tags',
            '-relevance': 'matched_tags',
        }
        if ordering in mapping:
            queryset = queryset.order_by(mapping[ordering], '-created_at')
        else:
            queryset = queryset.order_by('-created_at')

        return queryset

    def perform_create(self, serializer):
        post = serializer.save(author=self.request.user)
        if post.status == 'published':
            send_new_post_notification(post)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        old_status = instance.status

        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        new_instance = serializer.instance
        if old_status != 'published' and new_instance.status == 'published':
            send_new_post_notification(new_instance)

        return Response(serializer.data)

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
    pagination_class = AdminPageNumberPagination
    filter_backends = [SearchFilter]
    search_fields = ['title', 'author__username', 'tags__name']

    @action(detail=True, methods=['patch'])
    def status(self, request, pk=None):
        post = self.get_object()
        old_status = post.status
        new_status = request.data.get('status')
        if new_status not in dict(Post.STATUS_CHOICES):
            return Response({'detail': 'Invalid status'}, status=400)
        post.status = new_status
        post.save(update_fields=['status'])
        if old_status != 'published' and new_status == 'published':
            send_new_post_notification(post)
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
                if image:
                    if image.size > 5 * 1024 * 1024:
                        return Response({'error': 'Step image too large (>5MB)'}, status=400)
                    if not image.content_type.startswith('image/'):
                        return Response({'error': 'Invalid step image type'}, status=400)
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

class IngredientViewSet(viewsets.ModelViewSet):
    queryset = Ingredient.objects.all().order_by('name')
    serializer_class = IngredientSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAdminUserOrReadOnly]
    filter_backends = [SearchFilter]
    search_fields = ['name']

class TagViewSet(viewsets.ModelViewSet):
    queryset = Tag.objects.all().order_by('name')
    serializer_class = TagSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAdminUserOrReadOnly]
    filter_backends = [SearchFilter]
    search_fields = ['name']

