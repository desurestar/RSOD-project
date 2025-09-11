import json

from rest_framework import serializers

from users.serializers import UserSerializer  # <-- добавили импорт

from .models import Comment, Ingredient, Post, PostIngredient, RecipeStep, Tag


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ['id', 'name', 'slug', 'color']
        read_only_fields = ['id', 'slug']

class IngredientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ingredient
        fields = ['id', 'name']

class RecipeStepSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = RecipeStep
        fields = ['id','post','order','description','image','image_url']
        read_only_fields = ('post',)

    def get_image_url(self, obj):
        request = self.context.get('request')
        if obj.image and request:
            return request.build_absolute_uri(obj.image.url)
        return None

class PostIngredientSerializer(serializers.ModelSerializer):
    ingredient = IngredientSerializer(read_only=True)
    class Meta:
        model = PostIngredient
        fields = ['ingredient', 'quantity']

class IngredientDataSerializer(serializers.Serializer):
    ingredient_id = serializers.IntegerField()
    quantity = serializers.CharField()

    def to_internal_value(self, data):
        if isinstance(data, str):
            data = json.loads(data)
        return super().to_internal_value(data)


class StepDataSerializer(serializers.Serializer):
    order = serializers.IntegerField()
    description = serializers.CharField()
    image = serializers.ImageField(required=False, allow_null=True)

    def to_internal_value(self, data):
        if isinstance(data, str):
            data = json.loads(data)
        return super().to_internal_value(data)

class PostSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    tags = TagSerializer(many=True, read_only=True)
    tag_ids = serializers.PrimaryKeyRelatedField(
        queryset=Tag.objects.all(),
        many=True,
        write_only=True,
        required=False
    )
    is_liked = serializers.SerializerMethodField()
    likes_count = serializers.IntegerField(read_only=True)
    steps = RecipeStepSerializer(many=True, read_only=True)
    ingredients = PostIngredientSerializer(source='postingredient_set', many=True, read_only=True)  # <-- исправлено
    cover_image_url = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = [
            'id','post_type','status','title','excerpt','content','cover_image',
            'cover_image_url','created_at','updated_at','author','tags','tag_ids',
            'likes_count','comments_count','views_count','calories','cooking_time',
            'is_liked','steps','ingredients'
        ]
        read_only_fields = [
            'id','created_at','updated_at','author','likes_count',
            'comments_count','views_count','is_liked','tags','steps','ingredients'
        ]

    def get_is_liked(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        return obj.liked_by.filter(pk=request.user.pk).exists()

    def get_cover_image_url(self, obj):
        request = self.context.get('request')
        if obj.cover_image and request:
            return request.build_absolute_uri(obj.cover_image.url)
        return None

    def create(self, validated_data):
        tag_ids = validated_data.pop('tag_ids', [])
        ingredients_data = validated_data.pop('ingredient_data', [])
        steps_data = validated_data.pop('step_data', [])
        request = self.context.get('request')

        post = super().create(validated_data)
        if tag_ids:
            post.tags.set(tag_ids)

        for item in ingredients_data:
            PostIngredient.objects.create(
                post=post,
                ingredient_id=item['ingredient_id'],
                quantity=item['quantity']
            )

        for index, step in enumerate(steps_data):
            step_image = request.FILES.get(f'step_images_{index}') if request else None
            RecipeStep.objects.create(
                post=post,
                order=step['order'],
                description=step['description'],
                image=step_image
            )
        return post

    def update(self, instance, validated_data):
        tag_ids = validated_data.pop('tag_ids', None)
        ingredients_data = validated_data.pop('ingredient_data', None)
        steps_data = validated_data.pop('step_data', None)
        request = self.context.get('request')

        instance = super().update(instance, validated_data)

        if tag_ids is not None:
            instance.tags.set(tag_ids)

        if ingredients_data is not None:
            PostIngredient.objects.filter(post=instance).delete()
            for item in ingredients_data:
                PostIngredient.objects.create(
                    post=instance,
                    ingredient_id=item['ingredient_id'],
                    quantity=item['quantity']
                )

        if steps_data is not None:
            instance.steps.all().delete()
            for index, step in enumerate(steps_data):
                step_image = request.FILES.get(f'step_images_{index}') if request else None
                RecipeStep.objects.create(  # <-- исправлено
                    post=instance,
                    order=step.get('order'),
                    description=step.get('description'),
                    image=step_image
                )
        # Удаление обложки
        request = self.context.get('request')
        if request:
            # если фронт прислал явный флаг remove_cover = true
            remove_cover = request.data.get('remove_cover')
            if remove_cover in ('true', '1', True):
                if instance.cover_image:
                    instance.cover_image.delete(save=False)
                instance.cover_image = None
                instance.save(update_fields=['cover_image'])
        return instance

class CommentSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    post = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Comment
        fields = ['id', 'post', 'author', 'content', 'created_at', 'parent_comment']
        read_only_fields = ['id', 'created_at', 'author', 'post']

class PostIngredientCreateSerializer(serializers.ModelSerializer):
    ingredient_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = PostIngredient
        fields = ['ingredient_id', 'quantity']

    def create(self, validated_data):
        ingredient_id = validated_data.pop('ingredient_id')
        return PostIngredient.objects.create(
            ingredient_id=ingredient_id,
            **validated_data
        )

class RecipeStepCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = RecipeStep
        fields = ['order', 'description', 'image']
