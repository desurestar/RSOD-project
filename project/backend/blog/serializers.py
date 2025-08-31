import json

from rest_framework import serializers

from users.serializers import UserSerializer  # <-- добавили импорт

from .models import Comment, Ingredient, Post, PostIngredient, RecipeStep, Tag


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = '__all__'

class IngredientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ingredient
        fields = '__all__'

class RecipeStepSerializer(serializers.ModelSerializer):
    class Meta:
        model = RecipeStep
        fields = '__all__'
        read_only_fields = ('post',)

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
    ingredients = PostIngredientSerializer(source='postingredient_set', many=True, read_only=True)
    steps = RecipeStepSerializer(many=True, read_only=True)
    is_liked = serializers.SerializerMethodField()

    tag_ids = serializers.PrimaryKeyRelatedField(
        queryset=Tag.objects.all(),
        source='tags',
        many=True,
        write_only=True,
        required=False
    )
    ingredient_data = IngredientDataSerializer(many=True, write_only=True, required=False)
    step_data = StepDataSerializer(many=True, write_only=True, required=False)

    class Meta:
        model = Post
        fields = [
            'id', 'post_type', 'status', 'title', 'excerpt', 'content', 'cover_image',
            'created_at', 'updated_at', 'author', 'tags', 'ingredients',
            'steps', 'likes_count', 'comments_count', 'views_count',
            'calories', 'cooking_time', 'is_liked',
            'tag_ids', 'ingredient_data', 'step_data'
        ]
        read_only_fields = [
            'id', 'created_at', 'updated_at', 'author',
            'likes_count', 'comments_count', 'views_count', 'is_liked'
        ]

    def get_is_liked(self, obj):
        request = self.context.get('request')
        user = getattr(request, 'user', None)
        if user and user.is_authenticated:
            return obj.liked_by.filter(id=user.id).exists()
        return False

    def create(self, validated_data):
        request = self.context.get('request')
        ingredients_data = validated_data.pop('ingredient_data', [])
        steps_data = validated_data.pop('step_data', [])

        post = super().create(validated_data)

        # Создание ингредиентов
        for item in ingredients_data:
            PostIngredient.objects.create(
                post=post,
                ingredient_id=item['ingredient_id'],
                quantity=item['quantity']
            )

        # Создание шагов
        for index, step in enumerate(steps_data):
            step_image = request.FILES.get(f'step_images_{index}')
            RecipeStep.objects.create(
                post=post,
                order=step['order'],
                description=step['description'],
                image=step_image
            )

        return post

    def update(self, instance, validated_data):
        request = self.context.get('request')
        ingredients_data = validated_data.pop('ingredient_data', None)
        steps_data = validated_data.pop('step_data', None)

        instance = super().update(instance, validated_data)

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
                step_image = request.FILES.get(f'step_images_{index}')
                RecipeStep.objects.create(
                    post=instance,
                    order=step.get('order'),
                    description=step.get('description'),
                    image=step_image
                )

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
